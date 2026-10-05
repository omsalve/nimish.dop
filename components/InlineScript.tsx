/**
 * A script that runs while the HTML is parsed, before first paint. On the
 * client the tag is rendered inert so React neither re-runs nor warns about it.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
