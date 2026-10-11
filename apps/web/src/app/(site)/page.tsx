import { CollectionList } from '@/components/collection-list';
import { TagBar } from '@/components/tag-bar';
import { getCollections, getTags } from '@/lib/api';

// The home page lists collections and tags, not posts: posts are reached through
// a collection (a rule-less one such as "All" lists every post) or a tag.
export default async function Home() {
  const [tags, collections] = await Promise.all([getTags(), getCollections()]);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      {/* No banner here: the site header already carries the wordmark. */}
      <CollectionList collections={collections} />
      <TagBar tags={tags} />
    </main>
  );
}
