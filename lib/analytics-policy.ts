/** Public disclosures shared by the privacy and cookie pages. */
export const ANALYTICS_POLICY = {
  disabled: 'Google Analytics is currently off on GlobalStudyBoard.',
  summary:
    'Google Analytics is optional and is offered only to visitors aged 18 or over. It starts only after you choose to allow it. Declining does not change the content or tools available to you.',
  data:
    'When allowed, Google Analytics uses first-party cookies with pseudonymous identifiers to measure visits to public content, device and browser information, and approximate location. Google processes network information, including your IP address, to provide the service. Google states that Analytics does not log or store IP addresses.',
  limits:
    'We do not send your account identity, email address, saved applications, scores, budgets, scholarship records, questions, search text or form entries to Google Analytics. We remove query strings and fragments from the page information we send. Account, sign-in, admin, search, Ask GSB and individual tool pages are excluded from this measurement.',
  advertising:
    'We do not enable Google signals, advertising personalisation or User-ID for this analytics integration. Analytics consent is separate from account sign-in consent and from any advertising choices.',
  choices:
    'Use Analytics preferences in the footer to allow or decline Google Analytics. You can withdraw permission at any time. Withdrawal stops future collection and removes the Google Analytics cookies this site can access; it does not erase information Google has already received. The choice applies to this browser, so other devices need their own choice.',
  transfers:
    'Google may process analytics information on servers outside your country. Its privacy information explains the safeguards it uses for international transfers. You can use GlobalStudyBoard without allowing Google Analytics.',
} as const;
