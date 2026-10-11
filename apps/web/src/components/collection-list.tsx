import Link from 'next/link';
import type { Collection } from '@/lib/api';

/** The home page's list of collections: title, post count, description. */
export function CollectionList({ collections }: { collections: Collection[] }) {
  if (collections.length === 0) return null;

  return (
    <section aria-label="Collections" className="mb-10">
      <ul className="flex flex-col divide-y divide-border border-y border-border">
        {collections.map((c) => (
          <li key={c.id} className="py-3">
            <Link
              href={`/collections/${c.slug}`}
              className="font-semibold hover:underline underline-offset-4"
            >
              {c.title}
            </Link>
            <span className="ml-2 text-sm text-muted">
              {c.postCount} {c.postCount === 1 ? 'post' : 'posts'}
            </span>
            {c.description ? (
              <p className="mt-0.5 text-sm text-muted">{c.description}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
