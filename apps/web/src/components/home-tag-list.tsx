import Link from 'next/link';
import type { Tag } from '@/lib/api';
import { countPosts } from '@/lib/format';

const title = 'font-semibold hover:underline underline-offset-4';

/**
 * The home page's main list: the tags the author chose to show there, in the
 * author's order, each with its post count and description, then a fixed last
 * row leading to every post.
 */
export function HomeTagList({ tags }: { tags: Tag[] }) {
  const shown = tags
    .filter((tag) => tag.homePosition !== null)
    .sort((a, b) => (a.homePosition ?? 0) - (b.homePosition ?? 0));

  return (
    <section aria-label="Home tags" className="mb-10">
      <ul className="flex flex-col divide-y divide-border border-y border-border">
        {shown.map((tag) => (
          <li key={tag.id} className="py-3">
            <Link href={`/tags/${tag.slug}`} className={title}>
              {tag.name}
            </Link>
            <span className="ml-2 text-sm text-muted">
              {countPosts(tag._count?.posts ?? 0)}
            </span>
            {tag.description ? (
              <p className="mt-0.5 text-sm text-muted">{tag.description}</p>
            ) : null}
          </li>
        ))}
        <li className="py-3">
          <Link href="/posts" className={title}>
            All
          </Link>
          <p className="mt-0.5 text-sm text-muted">Every post, newest first.</p>
        </li>
      </ul>
    </section>
  );
}
