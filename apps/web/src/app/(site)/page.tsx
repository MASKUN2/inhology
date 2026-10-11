import { CollectionList } from '@/components/collection-list';
import { TagBar } from '@/components/tag-bar';
import { getCollections, getTags } from '@/lib/api';
import { isAuthed } from '@/lib/auth';

// The home page lists collections and tags, not posts: posts are reached through
// a collection (a rule-less one such as "All" lists every post) or a tag.
export default async function Home() {
  const [tags, collections, authed] = await Promise.all([
    getTags(),
    getCollections(),
    isAuthed(),
  ]);
  // A collection with nothing a reader may read (e.g. all its posts are private)
  // is left out for readers; the signed-in author still sees it.
  const shown = authed
    ? collections
    : collections.filter((c) => c.postCount > 0);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">inhology</h1>
        <p className="mt-2 text-muted">Notes from a developer and a person.</p>
      </header>

      <CollectionList collections={shown} />
      <TagBar tags={tags} />
    </main>
  );
}
