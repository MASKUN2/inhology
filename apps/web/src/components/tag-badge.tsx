import Link from 'next/link';
import type { Tag } from '@/lib/api';

/** The one visual for a tag: a pill linking to the tag's page. */
export function TagBadge({
  tag,
  count,
  active = false,
}: {
  tag: Pick<Tag, 'slug' | 'name'>;
  count?: number;
  active?: boolean;
}) {
  return (
    <Link
      href={`/tags/${tag.slug}`}
      aria-current={active ? 'page' : undefined}
      className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs hover:opacity-80 ${
        active ? 'bg-strong text-strong-foreground' : 'bg-subtle text-muted'
      }`}
    >
      {tag.name}
      {count !== undefined ? (
        <span className="ml-1 opacity-60">{count}</span>
      ) : null}
    </Link>
  );
}
