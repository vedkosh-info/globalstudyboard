// Shared image-policy copy. ContentImage remains a server component, so source
// records and policy text do not add a catalogue to the client bundle.
export const IMAGE_COPY = {
  photo: 'Photo',
  cropped: 'cropped',
  cc0: 'CC0 1.0',
  publicDomain: 'Public domain',
  policyTitle: 'Photographs and illustrations',
  policyAnchor: 'images',
  policyHref: '/disclaimer#images',
  policyLinkLabel: ' — read about our photographs and illustrations',
  policyUpdated: '24 October 2026',
  editorialTitle: '5. Images and Ask GSB',
  editorialSummary: 'Pages are checked against the official source in the pass above, whether a draft was prepared by hand or with software. Our images include photographs with source, creator and license credits. Some images are computer-generated illustrations, used where a suitable photograph is unavailable and labelled accordingly. The disclaimer explains how we use both. Answers from Ask GSB are general guidance and can be wrong. They never replace the official source.',
  policyParagraphs: [
    'GlobalStudyBoard uses photographs and computer-generated illustrations. We prefer relevant photographs whose individual source records identify them as CC0 or public domain. A photo caption links to its source, credits its creator and identifies its license. We crop and compress images to keep pages clear and fast. A photograph illustrates the subject or destination; it does not establish any admission, facility or course detail, and does not imply endorsement.',
    'Some images are computer-generated illustrations, used where a suitable photograph is unavailable. The circular “i” mark on an illustration reveals “Illustration · not a photo”, or “Illustration · not this institution” on a university page. These illustrations are generic scenes, not depictions of real universities, campuses, buildings or cities. We review them to avoid depicting real people.',
    'University profile images remain representative illustrations unless a photograph is verified as showing that exact institution. We do not place a photograph of one university on another university’s profile.',
    'Images provide context. The guidance and facts come from the official sources we cite and link. A photograph’s reuse status applies to that image, not to the rest of this site or to third-party trademarks or other rights.',
  ],
} as const;
