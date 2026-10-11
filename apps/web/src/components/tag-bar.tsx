import Link from 'next/link';
import type { Tag } from '@/lib/api';
import { TagBadge } from '@/components/tag-badge';

/**
 * Every tag that has published posts, as a badge with its post count. The API
 * returns them ordered by count, highest first. On a tag page `activeSlug` marks
 * the selected tag and an "All" badge leads back to the full list.
 */
export function TagBar({
  tags,
  activeSlug,
}: {
  tags: Tag[];
  activeSlug?: string;
}) {
  const shown = tags.filter((tag) => (tag._count?.posts ?? 0) > 0);
  if (shown.length === 0) return null;

  return (
    <nav aria-label="Tags" className="mb-10 flex flex-wrap gap-2">
      {activeSlug ? (
        <Link
          href="/"
          className="whitespace-nowrap rounded-full bg-subtle px-2 py-0.5 text-xs text-muted hover:opacity-80"
        >
          All
        </Link>
      ) : null}
      {shown.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          count={tag._count?.posts ?? 0}
          active={tag.slug === activeSlug}
        />
      ))}
    </nav>
  );
}
