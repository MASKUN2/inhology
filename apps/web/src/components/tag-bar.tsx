import type { Tag } from '@/lib/api';
import { TagBadge } from '@/components/tag-badge';

/**
 * Every tag that has published posts, as a badge with its post count. The API
 * returns them ordered by count, highest first. On a tag page `activeSlug` marks
 * the selected tag.
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
