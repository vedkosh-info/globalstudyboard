/** Small shared copy only; safe for the search client and its static shell. */
export const SEARCH_UI = {
  loading: 'Loading search…',
  loadingNote: 'Your destination’s results will be ready shortly.',
  failed: 'Search could not load. Please try again.',
  retry: 'Try again',
  submit: 'Search',
  showMore: 'Show more results',
  noScript: 'Search needs JavaScript. You can still browse destinations, topics and guides using the site links.',
  browseDestinations: 'Browse destinations',
  browseTopics: 'Browse topics',
  shown: (visible: number, total: number) => `Showing ${visible} of ${total} matching results`,
} as const;
