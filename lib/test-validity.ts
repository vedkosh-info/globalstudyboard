/**
 * Official score/result VALIDITY rules per exam — facts, not per-student data.
 *
 * Every rule here must be traceable to the exam body's OWN page that states it
 * (Rule A, §3): `source.url` is that page, `note` is the rule in our own words
 * and never claims more than the page says, `lastVerified` is when we read it.
 * A homepage that states no rule is never the source of a rule. Where no
 * official page or document says anything about how long a result is used,
 * or for which admission year or recruitment, the kind is `unstated`: the
 * link goes to where to confirm, and the tool says plainly that no rule was
 * found. It never fills the gap with what is "commonly known".
 *
 * Kinds, and what the tool prints for each:
 *   - months              the body states the result IS valid for N months from
 *                         the TEST DATE → a computed end date "on or about"
 *                         (bodies count the last day differently), a countdown,
 *                         and "Expired" once past it — or "No longer
 *                         reportable" where the body's own word is
 *                         "reportable" (`term`, GRE). The only kind whose
 *                         rows a report counts as expiring or expired.
 *   - recommended-months  the body RECOMMENDS a maximum age to receiving
 *                         institutions but does not itself expire the result
 *                         (IELTS) → a date we count from the test date (the
 *                         body names no anchor, so the sentence says so),
 *                         never the word "Expired"; past it the tone is
 *                         `advisory`, and each university decides
 *   - period              a rule in the body's own terms that we do not turn
 *                         into a date: a period counted from another anchor
 *                         (results announcement, testing years, provisional
 *                         allotment), a span whose anchor the page does not
 *                         state, or "until" a stated event (AP: starting
 *                         college; KEAM: the close of admissions) → the rule
 *                         in words; no date of ours
 *   - cycle               the body states the result is used for one admission
 *                         year or recruitment ("JAM 2027 scores will be used
 *                         for admission … for the academic year 2027-28") →
 *                         the rule in words, in the body's own verb — never
 *                         upgraded to "valid for" (e.g. NATA's conditional
 *                         carry-over)
 *   - none                the body states there is no expiry
 *   - not-applicable      a qualification, not a dated score
 *   - varies              the body states it depends on the use/institution
 *   - unstated            no official statement found — link to the official
 *                         site, say so, nudge to confirm
 *
 * A rule may also carry a `label` (the small heading printed above it) where
 * the kind's generic label would say something the source does not — AP is
 * "until you start college", an event, not a fixed period — and an `edition`
 * where the note names one year's edition (see EXAM_VALIDITY below), with
 * `satYear` when that edition is sat in the calendar year before its name
 * (CLAT 2027 and AILET 2027 are sat in December 2026), plus `alsoCovers` for
 * any other edition the note itself speaks for (NATA 2026's note sets the rule
 * for an unused 2025 score).
 *
 * `scripts/check-tools.ts` fails the build if any catalogue exam lacks an
 * entry, a (recommended-)months rule lacks a positive month count, another
 * kind carries one, or any link is not https. Pure data + date arithmetic:
 * safe in any client chunk.
 */

export type ValidityKind = 'months' | 'recommended-months' | 'period' | 'cycle' | 'none' | 'not-applicable' | 'varies' | 'unstated';

export interface ExamValidity {
  kind: ValidityKind;
  /** Only for `months` and `recommended-months`. */
  months?: number;
  /**
   * `months` only: the body's own word. ETS says a GRE score is "reportable"
   * for five years, not "valid" — the tool repeats the body's word rather than
   * upgrading it.
   */
  term?: 'valid' | 'reportable';
  /** The conducting body, as a student would name it (a label: "IIMs", not "the IIMs"). */
  body: string;
  /** The body takes "the" inside a sentence ("confirm with the IIMs"). */
  the?: boolean;
  /** The page (or official document) that states the rule — or, for `unstated`, where to confirm it. */
  source: { label: string; url: string };
  /**
   * A second official document, when the rule has parts published in two
   * places (UGC-NET: the Assistant Professor part on UGC's FAQ, the PhD and JRF
   * parts in NTA's bulletin). Every part of the note must be traceable to one
   * of the two.
   */
  also?: { label: string; url: string };
  /** One line, our own words, never more than the source says (≤ 32 words). */
  note: string;
  /**
   * The heading printed above the rule, when the kind's generic label would
   * misdescribe it (AP: "until you start college" is an event, not a period).
   * Omitted = the kind's label (or the body's own term, GRE).
   */
  label?: string;
  /**
   * `period` / `cycle` only: the year in the name of the one edition the note
   * speaks for ("a CAT 2026 score is valid only until…", "CLAT 2027…"). It is
   * the year the tool prints ("The rule on file is for CLAT 2027"). An attempt
   * whose test date falls in any other year than the one this edition is sat
   * in (`satYear`, else this year) is told the rule on file is that edition's,
   * never shown it as if it were its own.
   */
  edition?: number;
  /**
   * With `edition` only, and only when the edition is sat in a DIFFERENT
   * calendar year from the one in its name: CLAT 2027 and AILET 2027 are sat
   * in December 2026. Attempts are matched on their test date, so this is the
   * year an attempt at this edition is dated. Omitted = `edition` (true of every
   * other edition-bound rule on file). It must be named in the note, so the
   * reader sees why a 2026 test date reads as the 2027 edition.
   */
  satYear?: number;
  /**
   * With `edition` only: other test-date years whose attempts the note ITSELF
   * speaks for — NATA 2026's note states when an unused NATA 2025 score still
   * counts — so an attempt from one of these years is shown the rule plainly,
   * never told it is reading another edition's rule. Every year listed must be
   * named in the note.
   */
  alsoCovers?: readonly number[];
  /** ISO date the source page was last read. */
  lastVerified: string;
}

export const VALIDITY_KIND_LABEL: Record<ValidityKind, string> = {
  months: 'Fixed validity period',
  'recommended-months': 'Recommended maximum age',
  period: 'Fixed period, counted by the test body',
  cycle: 'One admission or recruitment cycle',
  none: 'No expiry set by the test body',
  'not-applicable': 'A qualification, not a dated score',
  varies: 'Depends on the institution or use',
  unstated: 'No published rule found',
};

/**
 * The label for one rule: its own `label` where the generic one would
 * misdescribe it, else the body's own word where it has one (GRE:
 * "reportable", not "valid"), else the kind's label.
 */
export const validityKindLabel = (v: ExamValidity): string => v.label ?? (v.kind === 'months' && v.term === 'reportable' ? 'Fixed reporting period' : VALIDITY_KIND_LABEL[v.kind]);

/** Kinds that carry a month count (and get a computed date). */
export const DATED_KINDS: ReadonlySet<ValidityKind> = new Set(['months', 'recommended-months']);

/**
 * Every rule below was re-read from its source on this date, in a rule-by-rule
 * research pass and an independent verification pass (30 September 2026). A
 * rule re-read on a later date carries its own `lastVerified`.
 */
const CHECKED = '2026-09-30';
type Extra = Partial<Pick<ExamValidity, 'months' | 'term' | 'the' | 'also' | 'label' | 'edition' | 'satYear' | 'alsoCovers' | 'lastVerified'>>;
const v = (kind: ValidityKind, body: string, sourceLabel: string, url: string, note: string, extra: Extra = {}): ExamValidity => ({
  kind,
  ...extra,
  body,
  source: { label: sourceLabel, url },
  note,
  lastVerified: extra.lastVerified ?? CHECKED,
});

/**
 * Keyed by exam slug (lib/admission-guides.ts). Re-verified 26 September 2026
 * and again, rule by rule, on 30 September 2026: a research pass found, for
 * each exam, the LATEST official page or document that states the rule and
 * quoted it word for word; an independent verification pass re-opened every
 * citation and tried to find a rule wherever none was reported. A bulletin
 * that ties a result to one admission year or recruitment is a `cycle` rule,
 * worded in the body's own verb. `unstated` is kept for tests whose official
 * documents say nothing about how long, or for which year, a result is used
 * (SAT, ACT, IB, SBI PO, RBI Grade B). The "valid for one year" claims widely
 * repeated about Indian entrance exams appear in no official document and are
 * never used.
 *
 * Most Indian rules live only in that year's information bulletin, brochure,
 * prospectus or notification: those links are per-cycle (and some unversioned
 * URLs — GUJCET's booklet, VIT's prospectus, the ACT handbook — silently switch
 * to the next edition). The old bulletin usually stays online after the next
 * one is published, and the Consortium of NLUs rebuilds its site under a new
 * /clat-YYYY/ path each year, so `npm run links:check` will NOT flag a stale
 * cycle — each new cycle needs a manual re-read: re-read the rule from the new
 * document, never carry the old one forward. A note that names one edition's
 * year sets `edition`, so an attempt from any other year is told whose rule
 * it is reading (validityStatus) rather than shown it as its own.
 */
export const EXAM_VALIDITY: Record<string, ExamValidity> = {
  // ── Worldwide tests ──
  sat: v('unstated', 'College Board', 'College Board — sending archived SAT scores (“Using older scores”)', 'https://satsuite.collegeboard.org/scores/sending-sat-scores/additional/sending-archived-scores', 'No expiry is stated. College Board cautions that scores sent five or more years after the test date may be less valid predictors of college performance.'),
  act: v('unstated', 'ACT', 'ACT — The ACT Test User Handbook for Educators (“Scores of Older Students”)', 'https://www.act.org/content/dam/act/unsecured/documents/ACT-UserHandbook.pdf', 'No expiry is stated. ACT’s handbook for educators reminds colleges that scores obtained more than five years earlier almost certainly do not reflect a student’s current level of educational development.'),
  'ap-exams': v('period', 'College Board (AP)', 'College Board — how long does my AP score remain valid?', 'https://international.collegeboard.org/help-center/how-long-does-my-ap-score-remain-valid', 'An AP score remains valid until you start college; some colleges won’t accept AP scores after you have arrived on campus.', { label: 'Valid until you start college', also: { label: 'AP Students — sending scores (“When should I send scores to colleges?”)', url: 'https://apstudents.collegeboard.org/sending-scores' } }),
  gre: v('months', 'ETS', 'ETS — getting your GRE General Test scores', 'https://www.ets.org/gre/test-takers/general-test/scores/get-scores.html', 'GRE scores are reportable for five years following the test date.', { months: 60, term: 'reportable' }),
  gmat: v('months', 'GMAC', 'mba.com — GMAT exam FAQs (“How long will scores from the current GMAT exam be valid?”)', 'https://www.mba.com/exams/gmat-exam/faqs', 'GMAT scores are valid for five years from the test date. With no GMAT in the last five years, an expired score can be requested until it is ten years old.', { months: 60, also: { label: 'mba.com — can I send scores from an older exam?', url: 'https://support.mba.com/hc/en-us/articles/50883078876955-GMAT-Can-I-Send-Scores-From-an-Older-Exam' } }),
  mcat: v('varies', 'AAMC', 'AAMC — how long are MCAT scores valid?', 'https://students-residents.aamc.org/mcat-scores/how-long-are-mcat-scores-valid', 'Medical schools generally accept scores dating back two or three years; the AAMC points applicants to each school’s own policy.'),
  lsat: v('period', 'LSAC', 'LSAC — LSAT scoring', 'https://www.lsac.org/lsat/lsat-scoring', 'Reportable for up to five testing years after the testing year in which it was earned — LSAC counts testing years, not a period from the test date.'),
  'a-levels': v('not-applicable', 'Cambridge International', 'Cambridge International — are qualifications valid for a set number of years?', 'https://help.cambridgeinternational.org/hc/en-gb/articles/203545131-Are-our-qualifications-only-valid-for-a-set-number-of-years', 'Cambridge International states its qualifications remain valid indefinitely once awarded; for AQA, OCR, Pearson Edexcel or WJEC, ask your board.'),
  'international-baccalaureate': v('unstated', 'International Baccalaureate', 'IB — official site', 'https://www.ibo.org/', 'We found no validity or expiry statement on the IB’s results, transcripts or recognition pages.'),
  ucat: v('cycle', 'UCAT Consortium', 'UCAT — results (UK results for entry to UK universities)', 'https://www.ucat.ac.uk/results/ucat-results/', 'For UK entry, UCAT 2026 results are only valid for the 2027 UCAS cycle (medical or dental entry in 2027, or deferred entry to 2028); partner universities publish their own rules.', { the: true, label: 'One UCAS cycle, for UK entry', edition: 2026 }),
  testas: v('none', 'TestAS', 'TestAS — FAQ on results and certificates', 'https://www.testas.de/en/participants/my-testas/faq/faq-results-and-certificates', 'The TestAS certificate has no expiry date.'),
  testdaf: v('none', 'TestDaF-Institut', 'TestDaF — FAQ on results and the certificate (German)', 'https://www.testdaf.de/de/teilnehmende/mein-testdaf/faq/faq-ergebnisse-und-zertifikat/', 'The TestDaF certificate is valid indefinitely (“unbegrenzt gültig”); the TestDaF-Institut adds that some universities accept only recent proof.', { the: true }),
  ielts: v('recommended-months', 'IELTS partners', 'IELTS — verifying IELTS results (validity period)', 'https://ielts.org/organisations/ielts-for-organisations/verifying-ielts-results', 'The IELTS partners recommend accepting a result for a maximum of two years, and an older one only with proof the test taker has actively maintained or tried to improve their English.', { months: 24, the: true }),
  toefl: v('months', 'ETS', 'ETS — TOEFL iBT score reports FAQ', 'https://www.ets.org/toefl/test-takers/ibt/faq/score-reports.html', 'TOEFL iBT scores are valid for two years from the test date; ETS does not report or send them after that.', { months: 24 }),
  'duolingo-english-test': v('months', 'Duolingo', 'Duolingo English Test — Terms of Service (test results expiration)', 'https://englishtest.duolingo.com/terms_of_service', 'The DET Certificate is valid for two years from the test date; after that it is marked expired and can no longer be shared.', { months: 24 }),
  'pte-academic': v('months', 'Pearson', 'Pearson PTE — help centre, scoring', 'https://www.pearsonpte.com/help-center/scoring/', 'The Score Report is valid for two years from the test date; after that you can no longer access the result.', { months: 24 }),

  // ── India: entrance exams ──
  'jee-main': v('cycle', 'National Testing Agency', 'NTA — JEE (Main) 2026 Information Bulletin, §1.3', 'https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2025/11/202511021649722475.pdf', 'The National Testing Agency conducted JEE (Main) 2026 for admissions in the 2026–27 academic session (the bulletin: “the next academic session”).', { the: true, edition: 2026, also: { label: 'NTA — JEE (Main) 2026 Paper 1 result press release (20 April 2026)', url: 'https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/20260420809492136.pdf' } }),
  'jee-advanced': v('cycle', 'IITs (JEE Advanced)', 'JEE (Advanced) 2026 Information Brochure, §8 and §28', 'https://jeeadv.ac.in/documents/IBEnglish_2026.pdf', 'Performance in JEE (Advanced) 2026 forms the basis for IIT admission in the 2026–27 academic year; SC, ST and PwD preparatory-course candidates who pass are offered 2027–28 admission.', { the: true, edition: 2026 }),
  'neet-ug': v('varies', 'National Medical Commission', 'NMC — information for students to study abroad', 'https://www.nmc.org.in/page/information-desk-for-students-to-study-abroad', 'Admission in India for an academic year needs the minimum percentile in the NEET held for that year; for MBBS abroad, the NMC treats a result as valid three years from declaration.', { the: true, also: { label: 'NTA — NEET (UG) 2026 Information Bulletin, Chapter 8 §1 (qualifying criteria)', url: 'https://cdnbbsr.s3waas.gov.in/s37bc1ec1d9c3426357e69acd5bf320061/uploads/2026/02/202602231394640855.pdf' } }),
  cat: v('period', 'IIMs', 'IIMs — CAT 2026 Information Bulletin', 'https://cdn.digialm.com/per/g06/pub/32842/EForms/image/CAT2026/CAT2026InformationBulletin_26-07-2026_V2.pdf', 'Per the CAT 2026 bulletin, a CAT 2026 score is valid only until 31 December 2027.', { the: true, edition: 2026, label: 'Valid until a stated date' }),
  // CLAT 2027 and AILET 2027 are sat in December 2026 (`satYear`), so a real attempt at either is dated 2026. Both URLs are per-cycle: re-read when the 2028 editions are notified (the Consortium deletes its old /clat-YYYY/ tree).
  clat: v('cycle', 'Consortium of NLUs', 'Consortium of NLUs — CLAT 2027 FAQs (“When will the academic session start?”)', 'https://consortiumofnlus.ac.in/clat-2027/FAQs.html', 'CLAT 2027, scheduled for 6 December 2026, is for all admissions to the five-year integrated LL.B. and LL.M. programmes at participating universities that commence in the 2027–28 academic year.', { the: true, edition: 2027, satYear: 2026 }),
  ailet: v('cycle', 'National Law University Delhi', 'NLU Delhi — AILET 2027 notification (23 July 2026)', 'https://nationallawuniversitydelhi.in/notification/AILET_2027.pdf', 'NLU Delhi conducts AILET 2027, scheduled for 13 December 2026, for admission to its B.A.LL.B. (Hons.) and LL.M. programmes for the 2027–28 academic year.', { edition: 2027, satYear: 2026 }),
  gate: v('period', 'GATE (IISc and the IITs)', 'GATE 2027 Information Brochure (IIT Madras), §5 and §8.2', 'https://gate2027ib.iitm.ac.in/GATE2027-IB.pdf', 'Valid for three years from the date the results are announced — not from the test date; no information on the score is available after that.'),
  'cuet-ug': v('cycle', 'National Testing Agency', 'NTA — CUET (UG) 2026 Information Bulletin, §12.2', 'https://cdnbbsr.s3waas.gov.in/s3d1a21da7bca4abff8b0b61b87597de73/uploads/2026/01/202601031633478370.pdf', 'The CUET (UG) 2026 score is valid for admission to the 2026–27 academic year only.', { the: true, edition: 2026 }),
  'cuet-pg': v('cycle', 'National Testing Agency', 'NTA — CUET (PG) 2026 Information Bulletin, §10.1', 'https://cdnbbsr.s3waas.gov.in/s388a839f2f6f1427879fc33ee4acf4f66/uploads/2025/12/202512161583029269.pdf', 'The CUET (PG) 2026 score is valid for admission to the 2026–27 academic year only.', { the: true, edition: 2026 }),
  'mht-cet': v('cycle', 'State CET Cell (Maharashtra)', 'MHT-CET 2026 information brochure (technical courses, updated 11 Apr 2026), §1.2 and §10', 'https://cetcell.mahacet.org/wp-content/uploads/2023/12/MHT-CET-2026-Information-Brochure-Updated-on-11.04.2026.pdf', 'MHT-CET 2026 is conducted to select candidates for first-year engineering, pharmacy and planning courses in 2026–27; if you sat both 2026 attempts, your better total percentile is considered.', { the: true, edition: 2026 }),
  kcet: v('cycle', 'Karnataka Examinations Authority', 'KEA — UGCET 2026 Information Bulletin 1 (English, 17 Jan 2026), chapter 1', 'https://cetonline.karnataka.gov.in/keawebentry456/ugcet2026/information_bulletin_1_ugcet_2026_17012026english.pdf', 'KCET 2026 is conducted to determine eligibility and merit for the government share of seats in first-year engineering, farm-science, pharmacy and other listed courses in Karnataka, for the 2026–27 academic year.', { the: true, edition: 2026 }),
  wbjee: v('cycle', 'West Bengal Joint Entrance Examinations Board', 'WBJEEB — Information Bulletin WBJEE-2026, §2.0', 'https://cdnbbsr.s3waas.gov.in/s3d2a27e83d429f0dcae6b937cf440aeb1/uploads/2026/03/202603101506582412.pdf', 'WBJEEB conducts WBJEE 2026 for admission to undergraduate engineering, technology, pharmacy and architecture courses in West Bengal for the 2026–27 academic session.', { the: true, edition: 2026 }),
  'ap-eapcet': v('cycle', 'APSCHE', 'AP EAPCET 2026 instruction booklet (engineering), §10.2(b)', 'https://cets.apsche.ap.gov.in/EAPCET/PDF/APEAPCET2026_Instruction_Booklet_Engineering_V4.pdf', 'The AP EAPCET 2026 rank is valid for admission in the 2026–27 academic year only.', { edition: 2026 }),
  'ts-eamcet': v('cycle', 'TGCHE', 'TG EAPCET 2026 instruction booklet (engineering), §XII(b)', 'https://eapcet.tgche.ac.in/TGEAPCET/Doc2026/05%20I%20Booklet%20-%20E%20-%202026.pdf', 'The TG EAPCET 2026 rank is valid for admission in the 2026–27 academic year only.', { edition: 2026 }),
  keam: v('period', 'Commissioner for Entrance Examinations (Kerala)', 'KEAM 2026 prospectus, §9.7.10(a)', 'https://cee.kerala.gov.in/keam2026/pdf/Prospectus.pdf', 'Per the KEAM 2026 prospectus, KEAM rank lists are valid until the closing date of admission prescribed by the Supreme Court, central councils or universities concerned.', { the: true, edition: 2026, label: 'Valid until admissions close' }),
  gujcet: v('cycle', 'GSEB', 'GSEB — GUJCET booklet (English), §2.17', 'https://gseb.org/GUJCETBooklet(English).pdf', 'A GUJCET score counts for the merit list of its own academic year only; admission in a later year needs a fresh GUJCET.'),
  // Read directly in brochure V2.0 §3.0 (30 Sep 2026): the 2025 score survives ONE Phase-1 attempt in 2026 (the better of the two counts); two Phase-1 attempts, a Phase-2 attempt or admission on it make it invalid. The 29 Sep note ("only if the candidate does not sit NATA 2026 at all") was wrong.
  nata: v('cycle', 'Council of Architecture', 'NATA 2026 information brochure (V2.0, 10 Apr 2026), §3.0 and §10.2', 'https://www.nata.in/assets/pdf/Final-NATA-BROCHURE-2026.pdf', '2026 scores are valid for 2026–27. An unused qualifying 2025 score also counts: after one 2026 Phase-1 attempt the better score is used; two Phase-1 attempts or a Phase-2 attempt void it.', { the: true, edition: 2026, alsoCovers: [2025] }),
  'iit-jam': v('cycle', 'IITs (JAM)', 'JAM 2027 Information Brochure (IIT Kharagpur, v2) — Highlights and §1.1.1', 'https://jam.iitkgp.ac.in/docs/Info_Brochure_v2.pdf', 'JAM 2027 scores will be used for admission to the IITs and other institutes for the 2027–28 academic year.', { the: true, edition: 2027 }),
  'nchm-jee': v('cycle', 'NTA / NCHMCT', 'NTA — NCHM JEE 2026 Information Bulletin, §9(a)', 'https://cdnbbsr.s3waas.gov.in/s388a839f2f6f1427879fc33ee4acf4f66/uploads/2025/12/20260102470139941.pdf', 'NCHM JEE 2026 is an examination for admission to the B.Sc. in Hospitality and Hotel Administration for the 2026–27 academic session.', { edition: 2026 }),
  ipmat: v('cycle', 'IIM Indore and IIM Rohtak', 'IIM Indore — Admission Procedure, IPM 2026–31 Batch (Domestic Applicants), §3', 'https://iimidr.ac.in/wp-content/uploads/2026/01/AdmissionProcedure_IPM-2026-31_-Domestic-Applicants.pdf', 'For the 2026–31 batch, IIM Indore selects domestic applicants on its IPM AT 2026 plus an interview; IIM Rohtak’s merit list combines its IPMAT 2026 score, an interview and school marks.', { edition: 2026, also: { label: 'IIM Rohtak — IPM Batch 08 (Session 2026–31) FAQ, Q5', url: 'https://www.iimrohtak.ac.in/panel/assets/IPM%2008_FAQ_2026.pdf' } }),
  'neet-pg': v('cycle', 'NBEMS', 'NBEMS — NEET-PG 2026 Information Bulletin, §10.8.1 (linked from the NBEMS NEET-PG page)', 'https://drive.google.com/file/d/1WmFcaFZhEAaRFrBBgTGUENX81cQwQkVT/view', 'The NEET-PG 2026 result is valid only for the 2026–27 admission session for MD/MS/PG Diploma courses and cannot be carried forward to the next session.', { edition: 2026 }),

  // ── India: private-university entrance ──
  bitsat: v('cycle', 'BITS Pilani', 'BITS Pilani — BITSAT-2026 brochure (opening page and §3)', 'https://admissions.bits-pilani.ac.in/FD/downloads/BITSAT-2026_Brochure.pdf', 'Per the BITSAT-2026 brochure, admissions to BITS Pilani’s integrated first degree programmes for the 2026–27 academic year will be made based on BITSAT-2026, with merit based on its score.', { edition: 2026 }),
  viteee: v('cycle', 'VIT', 'VIT — VITEEE 2026 prospectus, §3(c)–(d) and §10', 'https://vit.ac.in/files/VITEEE/VITEEE_Prospectus.pdf', 'For B.Tech admission in 2026, VIT’s prospectus makes attending VITEEE 2026 mandatory for Indian nationals and bases selection on the VITEEE 2026 rank.', { edition: 2026 }),
  'comedk-uget': v('cycle', 'COMEDK', 'COMEDK — UGET 2026 information brochure, §7', 'https://www.comedk.org/uploads/Information-brochure-2026-version-1.0.pdf', 'COMEDK’s 2026 brochure states UGET-2026 scores are valid only for admissions in the 2026–27 academic year.', { edition: 2026 }),

  // ── India: eligibility and research tests ──
  ctet: v('none', 'CBSE', 'CBSE — CTET frequently asked questions (certificate validity)', 'https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2025/08/2025080565.pdf', 'CBSE’s CTET FAQ: a TET qualifying certificate remains valid for life for appointment, unless the appropriate government notifies otherwise. For a state TET, confirm with that state.'),
  'ugc-net': v('varies', 'UGC', 'UGC — frequently asked questions (NET, Q4: validity of the UGC-NET certificate)', 'https://www.ugc.gov.in/Home/faq', 'Assistant Professor eligibility never expires; NET marks for PhD admission (categories 2–3) are valid one year from the result’s declaration; a JRF offer, three years from the JRF Award Letter’s issue.', { also: { label: 'NTA — UGC-NET June 2026 bulletin, §1.3(a) and §3.2(iii) (PhD and JRF)', url: 'https://cdnbbsr.s3waas.gov.in/s301eee509ee2f68dc6014898c309e86bf/uploads/2026/04/202604301078678748.pdf' } }),
  'csir-net': v('varies', 'CSIR', 'NTA — Joint CSIR-UGC NET June 2026 bulletin, §1.2 (Assistant Professor and PhD)', 'https://cdnbbsr.s3waas.gov.in/s3efdf562ce2fb0ad460fd8e9d33e57f57/uploads/2026/05/202605271224945892.pdf', 'Assistant Professor eligibility never expires; NET marks for PhD admission (categories 2–3) are valid one year from the result’s declaration; a JRF-NET certificate, two years from the fellowship’s effective date on it.', { also: { label: 'CSIR-HRDG — revised JRF-NET guidelines (w.e.f. 1 March 2023), §7(a) and §9(a)', url: 'https://www.csirhrdg.res.in/Home/Index/1/Default/3384/60' } }),

  // ── India: recruitment exams ──
  // SSC: "SSC does not maintain the waiting list/reserve list in respect of multi factor examinations" is a standing Commission policy (the 2025 and 2026 CGL and CHSL notices and the 2025 MTS notice all state it), so these notes name no year and carry no `edition`.
  'ssc-chsl': v('cycle', 'Staff Selection Commission', 'SSC — CHSL 2026 notice (opening paragraph and §16.3)', 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_chsl_2026.pdf', 'SSC’s CHSL notice lists the posts to be filled up through that examination; SSC keeps no waiting or reserve list for multi-factor examinations but has adopted a sliding mechanism.', { the: true, label: 'No waiting or reserve list' }),
  'ssc-mts': v('cycle', 'Staff Selection Commission', 'SSC — Notice of MTS (Non-Technical) and Havaldar Examination, 2025, §16.3', 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_mts_2025.pdf', 'SSC’s MTS notice states no validity period; it says SSC does not maintain a waiting or reserve list for its multi-factor examinations.', { the: true, label: 'No waiting or reserve list' }),
  'ssc-cgl': v('cycle', 'Staff Selection Commission', 'SSC — Notice of Combined Graduate Level Examination, 2026, §15.3', 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2026.pdf', 'SSC’s CGL notice states no validity period; it says SSC does not maintain a waiting or reserve list for its multi-factor examinations, though it has adopted a sliding mechanism.', { the: true, label: 'No waiting or reserve list' }),
  'ibps-po': v('period', 'IBPS', 'IBPS — CRP PO/MT-XVI detailed notification', 'https://www.ibps.in/wp-content/uploads/Detailed-Notification_CRP-PO-XVI_Final_V1_30.06.2026.pdf', 'Per the CRP PO/MT-XVI notification, the process expires one year after the date of provisional allotment, or when a fresh allotment is made, whichever is earlier.', { label: 'Ends a year after allotment, or sooner' }),
  'ibps-clerk': v('period', 'IBPS', 'IBPS — CRP CSA-XVI (clerks) detailed notification', 'https://www.ibps.in/wp-content/uploads/Notification_CRP_CSA_XVI-Final.pdf', 'Per the CRP CSA-XVI notification, the process expires one year after the date of provisional allotment, or when a fresh allotment is made, whichever is earlier.', { label: 'Ends a year after allotment, or sooner' }),
  'sbi-po': v('unstated', 'State Bank of India', 'SBI — Probationary Officers advertisement CRPD/PO/2026-27/09', 'https://sbi.bank.in/documents/77530/57941/18062026_1_Detailed_Adv.2026.pdf/1f1a9532-8a2f-6e59-08a0-616d62a497b1', 'SBI’s PO advertisement CRPD/PO/2026-27/09 and its corrigendum state no validity period for a result or the final merit list.', { the: true }),
  'rbi-grade-b': v('unstated', 'Reserve Bank of India', 'RBI — Grade B (DR) Panel Year 2026 advertisement (RBISB/DA/01/2026-27)', 'https://opportunities.rbi.org.in/Scripts/bs_viewcontent.aspx?Id=4997', 'RBI’s Grade B (DR) Panel Year 2026 advertisement and its schemes of selection state no validity period for a result or the merit list.', { the: true }),
  // CDS and AFCAT hold two sittings a year under one `edition`, so each note speaks for both of that year's sittings.
  cds: v('cycle', 'UPSC', 'UPSC — CDS (II) 2026 examination notice (No. 11/2026-CDS-II), opening paragraph', 'https://www.upsc.gov.in/sites/default/files/Notif-CDS-II-2026-Engl-200526.pdf', 'Each CDS sitting is for admission to the courses its notice names: CDS (I) 2026 to courses commencing January and April 2027; CDS (II) 2026, July and October 2027.', { also: { label: 'UPSC — CDS (I) 2026 examination notice (No. 4/2026-CDS-I), opening paragraph', url: 'https://www.upsc.gov.in/sites/default/files/Notif-CDSE-I-2026-Engl-101225.pdf' }, edition: 2026 }),
  afcat: v('cycle', 'Indian Air Force', 'Indian Air Force — AFCAT 02/2026 notification (courses commencing July 2027), title and para 10', 'https://afcat.edcil.co.in/assets/images/news/AFCAT_02_2026/Notification%20for%20AFCAT%20Cycle%2002-2026.pdf', 'AFCAT 01/2026 is for courses commencing in January 2027 and AFCAT 02/2026 for courses commencing in July 2027; the final merit list adds AFSB marks to written marks.', { the: true, edition: 2026, also: { label: 'Indian Air Force — AFCAT 01/2026 notification (courses commencing January 2027), title and para 10', url: 'https://afcat.edcil.co.in/assets/images/news/AFCAT_02_2025/Notification_AFCAT_01-2026.pdf' } }),
  'capf-ac': v('cycle', 'UPSC', 'UPSC — CAPF (ACs) Examination 2026 notice (No. 08/2026-CAPF), page 4 (vacancies) and Appendix-I (A)(v)', 'https://www.upsc.gov.in/sites/default/files/ExamNotifi_CAPF_AC_Exam_2026_Eng_20022026.pdf', 'UPSC’s CAPF (ACs) Examination 2026 notice lists the tentative vacancies to be filled on the basis of that examination’s results; the final merit list is drawn on written and interview marks.', { edition: 2026 }),
};

export const validityFor = (slug: string): ExamValidity | undefined => (Object.hasOwn(EXAM_VALIDITY, slug) ? EXAM_VALIDITY[slug] : undefined);

/** YYYY-MM-DD + N calendar months (day clamped to the target month's length), or null when no dated period applies. */
export function validUntil(testDate: string, v: ExamValidity | undefined): string | null {
  if (!v || !DATED_KINDS.has(v.kind) || !v.months || !/^\d{4}-\d{2}-\d{2}$/.test(testDate)) return null;
  const y = Number(testDate.slice(0, 4));
  const m = Number(testDate.slice(5, 7)) - 1;
  const d = Number(testDate.slice(8, 10));
  const total = m + v.months;
  const ty = y + Math.floor(total / 12);
  const tm = total % 12;
  const daysInTarget = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
  const td = Math.min(d, daysInTarget);
  return `${ty}-${String(tm + 1).padStart(2, '0')}-${String(td).padStart(2, '0')}`;
}

/**
 * `soon` = within 90 days of a computed date — the end of a published period
 * (`months`) OR of a recommended age (`recommended-months`); anything that
 * counts "expiring" results must also check the kind (the report does).
 * `advisory` = older than a RECOMMENDED age (IELTS): flagged, but never
 * "expired" and never counted as "expiring".
 */
export type ValidityTone = 'ok' | 'soon' | 'expired' | 'advisory' | 'info';

export interface ValidityStatus {
  /** One sentence for the row. The tone is always ALSO conveyed in the words. */
  text: string;
  tone: ValidityTone;
  /** The computed date, when there is one. */
  until: string | null;
}

const fmt = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
};

/** Whole days from `today` (YYYY-MM-DD) to `iso`; negative = past. */
const daysBetween = (today: string, iso: string): number => {
  const a = Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1, Number(today.slice(8, 10)));
  const b = Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
  return Math.round((b - a) / 86_400_000);
};

const WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
/** 24 → "two years", 18 → "18 months". */
export function spanWords(months: number | undefined): string {
  if (!months) return 'the published period';
  if (months % 12 === 0 && months / 12 <= 10) return `${WORDS[months / 12]} ${months === 12 ? 'year' : 'years'}`;
  return `${months} months`;
}

/** The body inside a sentence: "the IIMs", "ETS". */
export function bodyInSentence(v: ExamValidity): string {
  return v.the ? `the ${v.body}` : v.body;
}

const daysLeft = (n: number) => (n === 0 ? 'today is the last day' : `about ${n} ${n === 1 ? 'day' : 'days'} left`);

/**
 * A test date after the viewer's today. The form refuses future dates, so this
 * arises only through the database's one-day time-zone slack, a wrong device
 * clock, or a score recorded in a time zone ahead of the one it is read in —
 * where the student really did sit the test. Hence no claim that there is "no
 * result yet": only what is true on every one of those paths.
 */
const FUTURE_TEXT = 'This test date is after today on this device — confirm the date; no validity period is shown until it has passed.';
const isFutureDate = (testDate: string, today: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(testDate) && testDate > today;

/** 'none' (a result with no expiry): a university or an employer (CTET is used for teacher appointment) can still want a newer one. */
const NONE_CAVEAT = 'A university or employer may still ask for a more recent result — confirm with each one.';
/** 'not-applicable' (a qualification, not a dated score): nothing to retake, but a university can set its own limit on its age. */
const NOT_APPLICABLE_CAVEAT = 'A university may still set its own limit on how long ago a qualification was gained — confirm with each one.';

/**
 * The confirm nudge that follows a rule stated in words — ONE wording for the
 * tool's rule box (printed once per test) and for validityStatus() (which the
 * report and the CSV print on every row). null for the dated kinds: each
 * attempt carries its own "on or about" date instead. For `unstated`, the
 * nudge beside a "no published rule" note (validityStatus words that case as
 * one sentence of its own).
 */
export function validityNudge(v: ExamValidity): string | null {
  switch (v.kind) {
    case 'period':
    case 'cycle':
      return `Confirm with ${bodyInSentence(v)} before relying on it.`;
    case 'none':
      return NONE_CAVEAT;
    case 'not-applicable':
      return NOT_APPLICABLE_CAVEAT;
    case 'varies':
      return `Confirm with ${bodyInSentence(v)} and each institution you apply to.`;
    case 'unstated':
      return 'Confirm on the official site before relying on an older result.';
    default:
      return null;
  }
}

/**
 * The attempt's year when the rule on file was written for ANOTHER edition (a
 * CAT 2026 note under a 2025 attempt), else null. The edition's own year is
 * the year it is sat in (`satYear`: a CLAT 2027 attempt is dated 2026); a year
 * the note itself speaks for (`alsoCovers`) is not another edition either; and
 * a rule with no `edition` is never edition-bound.
 */
export function otherEditionYear(v: ExamValidity, testDate: string): number | null {
  if (v.edition === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(testDate)) return null;
  const year = Number(testDate.slice(0, 4));
  return year === (v.satYear ?? v.edition) || v.alsoCovers?.includes(year) ? null : year;
}

/**
 * The sentence the tool prints under a recorded score. A date appears only for
 * the two dated kinds, always "on or about" (test bodies count the final day
 * in their own way); every other kind states the rule in words with the nudge
 * to confirm. Nothing here says a score is good enough for anything.
 */
export function validityStatus(v: ExamValidity | undefined, testDate: string, today: string, shortName: string): ValidityStatus {
  if (!v) return { text: 'No validity rule on file for this test — confirm with the official body.', tone: 'info', until: null };
  if (isFutureDate(testDate, today)) return { text: FUTURE_TEXT, tone: 'info', until: null };
  switch (v.kind) {
    case 'months': {
      const until = validUntil(testDate, v);
      if (!until) return { text: `${shortName}: ${v.note}`, tone: 'info', until: null };
      const n = daysBetween(today, until);
      const span = spanWords(v.months);
      if (v.term === 'reportable') {
        if (n < 0) return { text: `No longer reportable since on or about ${fmt(until)} — ${bodyInSentence(v)} reports ${shortName} scores for ${span} from the test date.`, tone: 'expired', until };
        if (n <= 90) return { text: `Reportable until on or about ${fmt(until)} — ${daysLeft(n)} of the ${span} ${bodyInSentence(v)} reports it for.`, tone: 'soon', until };
        return { text: `Reportable until on or about ${fmt(until)} — ${span} from the test date, as ${bodyInSentence(v)} publishes.`, tone: 'ok', until };
      }
      if (n < 0) return { text: `Expired on or about ${fmt(until)} — ${bodyInSentence(v)} publishes a validity of ${span} from the test date.`, tone: 'expired', until };
      if (n <= 90) return { text: `Valid until on or about ${fmt(until)} — ${daysLeft(n)} of the ${span} ${bodyInSentence(v)} publishes.`, tone: 'soon', until };
      return { text: `Valid until on or about ${fmt(until)} — ${span} from the test date, as ${bodyInSentence(v)} publishes.`, tone: 'ok', until };
    }
    case 'recommended-months': {
      // The body recommends a maximum AGE but names no anchor for it, so the
      // sentence says the date is counted from the test date (by us).
      const until = validUntil(testDate, v);
      if (!until) return { text: `${shortName}: ${v.note}`, tone: 'info', until: null };
      const n = daysBetween(today, until);
      const span = spanWords(v.months);
      if (n < 0) return { text: `Older than the ${span} ${bodyInSentence(v)} recommend, counted from the test date (since on or about ${fmt(until)}). Each university decides whether it still accepts it.`, tone: 'advisory', until };
      if (n <= 90) return { text: `Within the ${span} ${bodyInSentence(v)} recommend, counted from the test date, until on or about ${fmt(until)} — ${daysLeft(n)}. Each university sets its own rule.`, tone: 'soon', until };
      return { text: `Within the ${span} ${bodyInSentence(v)} recommend, counted from the test date, until on or about ${fmt(until)}. Each university sets its own rule.`, tone: 'ok', until };
    }
    // Every other kind prints the rule in the body's terms (the note) plus a
    // nudge to confirm — never a date of ours.
    case 'period':
    case 'cycle': {
      // A note written for one edition ("a CAT 2026 score…") is still shown
      // under an attempt from another year — the only statement on file — but
      // says whose rule it is, so it is never read as that attempt's own.
      const year = otherEditionYear(v, testDate);
      if (year !== null) {
        return { text: `${v.note} That is the ${v.edition} edition’s rule — for a ${year} attempt, confirm the rule that applies with ${bodyInSentence(v)}.`, tone: 'info', until: null };
      }
      return { text: `${v.note} ${validityNudge(v)}`, tone: 'info', until: null };
    }
    case 'none':
    case 'not-applicable':
    case 'varies':
      return { text: `${v.note} ${validityNudge(v)}`, tone: 'info', until: null };
    case 'unstated':
    default:
      return { text: `We found no validity rule published by ${bodyInSentence(v)} for this result — confirm on the official site before relying on an older one.`, tone: 'info', until: null };
  }
}

/**
 * The readiness view's line for one recorded attempt — SHORT, because the full
 * rule is printed once with the student's scores (the tool's rule box above
 * the readiness view; the report's scores table above its readiness table),
 * and one test is often named by several shortlisted universities. It spells
 * out only what is specific to this attempt: its computed date (the dated
 * kinds), a date after today, or a rule written for another edition; every
 * other kind is named by its label and points to the full rule. It never
 * claims anything the full sentence (validityStatus) does not.
 */
export function validityBrief(v: ExamValidity | undefined, testDate: string, today: string, shortName: string): ValidityStatus {
  if (!v) return { text: 'No validity rule on file for this test — confirm with the official body.', tone: 'info', until: null };
  if (isFutureDate(testDate, today)) return { text: FUTURE_TEXT, tone: 'info', until: null };
  const pointer = `details with your ${shortName} scores above.`;
  const until = validUntil(testDate, v);
  if (until && v.kind === 'months') {
    const n = daysBetween(today, until);
    const left = n >= 0 && n <= 90 ? ` — ${daysLeft(n)}` : '';
    const tone: ValidityTone = n < 0 ? 'expired' : n <= 90 ? 'soon' : 'ok';
    if (v.term === 'reportable') return { text: n < 0 ? `No longer reportable since on or about ${fmt(until)}.` : `Reportable until on or about ${fmt(until)}${left}.`, tone, until };
    return { text: n < 0 ? `Expired on or about ${fmt(until)}.` : `Valid until on or about ${fmt(until)}${left}.`, tone, until };
  }
  if (until && v.kind === 'recommended-months') {
    const n = daysBetween(today, until);
    const span = spanWords(v.months);
    if (n < 0) return { text: `Older than the ${span} ${bodyInSentence(v)} recommend, counted from the test date (since on or about ${fmt(until)}) — each university decides.`, tone: 'advisory', until };
    return { text: `Within the ${span} ${bodyInSentence(v)} recommend, counted from the test date, until on or about ${fmt(until)}${n <= 90 ? ` — ${daysLeft(n)}` : ''}.`, tone: n <= 90 ? 'soon' : 'ok', until };
  }
  if (otherEditionYear(v, testDate) !== null) return { text: `The rule on file is for ${shortName} ${v.edition} — ${pointer}`, tone: 'info', until: null };
  return { text: `${validityKindLabel(v)} — ${pointer}`, tone: 'info', until: null };
}
