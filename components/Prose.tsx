import { readableParagraphs } from '@/lib/readable';

/**
 * Renders a text block as short paragraphs (at most two sentences, about three
 * lines each — see lib/readable.ts). Use it wherever stored prose reaches the
 * page, so no page shows a wall of text however the content was written.
 */
export default function Prose({
  text,
  className,
  firstClassName,
}: {
  text: string | undefined | null;
  /** Classes for every paragraph. */
  className?: string;
  /** Optional classes for the first paragraph only (a lede), replacing `className`. */
  firstClassName?: string;
}) {
  const paragraphs = readableParagraphs(text);
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} className={i === 0 && firstClassName ? firstClassName : className}>
          {p}
        </p>
      ))}
    </>
  );
}
