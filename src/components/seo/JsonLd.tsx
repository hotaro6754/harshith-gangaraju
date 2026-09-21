/**
 * Structured data, rendered as a JSON-LD script.
 *
 * `<` is escaped so no string in the data can close the script tag early;
 * everything here comes from the content files, but the escape costs nothing.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
