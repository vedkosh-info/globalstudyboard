# GlobalStudyBoard Google Analytics

The [GlobalStudyBoard GA4 property](https://analytics.google.com/analytics/web/#/a414701285p565130604/reports/intelligenthome) is in Bcode8 AI Labs under the Google account the owner selected. The web stream is `GlobalStudyBoard Web` for `https://www.globalstudyboard.com`, with stream ID `16374456460` and measurement ID `G-H5Q85XF812`.

Enhanced Measurement is off. Keep it off so Analytics does not collect form, search or URL history events automatically. User and event data retention are set to two months, with reset on activity off. The site disables ad personalisation and Google signals in the tag and does not send a user ID.

1. Obtain the approval required by `AGENTS.md` to add `https://*.google-analytics.com` to `connect-src` in `next.config.js`. Set this entry only when the GA measurement ID is configured. The existing policy already permits the Google tag script and HTTPS images. See [Google's CSP guidance for Analytics without Ads features](https://developers.google.com/tag-platform/security/guides/csp#google_analytics).
2. Set the production build variable `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-H5Q85XF812` in the GlobalStudyBoard Vercel project on release. The variable is public by design. The integration is dormant without it and sends no GA data from localhost or preview hosts.
3. After an authorised deploy, use a fresh browser on the canonical site. Verify that the tag does not load before consent or after decline. Allow analytics, view a public guide, and confirm page views in the property's Realtime report. Inspect the network payload for clean page URLs and no student input. Verify that private routes and withdrawal stop collection, and that the preference survives a reload.

The site uses basic consent mode with an adult opt-in. Reports describe visitors who allow measurement in a compatible browser. Keep the privacy and cookie disclosures in sync if the integration changes. [Google consent mode](https://support.google.com/analytics/answer/10000067)

In GA4's Pages and screens report, select **Page path and screen class** to see individual guides and pages. The integration sends public paths and simple section titles.
