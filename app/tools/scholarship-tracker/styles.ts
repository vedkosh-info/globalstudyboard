/** Established tool design tokens; 44px controls and 16px inputs throughout. */
export const CARD = 'rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6';
export const INPUT = 'min-h-11 w-full min-w-0 rounded-xl border border-stone-450 bg-white px-3 py-2 text-base text-ink placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-1 aria-[invalid=true]:border-red-500';
export const LABEL = 'mb-1.5 block text-sm font-semibold text-stone-700';
export const BUTTON = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:opacity-60';
export const PRIMARY = `${BUTTON} bg-forest-700 text-cream-50 hover:bg-forest-800`;
export const SECONDARY = `${BUTTON} border border-stone-300 bg-white text-forest-800 hover:bg-forest-50`;
export const DANGER = `${BUTTON} border border-red-300 bg-white text-red-700 hover:bg-red-50`;
export const LINK = 'text-forest-700 underline underline-offset-2 hover:text-forest-800';
