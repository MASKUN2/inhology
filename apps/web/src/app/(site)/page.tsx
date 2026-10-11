import { HomeTagList } from '@/components/home-tag-list';
import { PageShell } from '@/components/page';
import { TagBar } from '@/components/tag-bar';
import { getPosts, getTags } from '@/lib/api';

// The home page lists tags, not posts: the tags the author put on the home
// page with their descriptions, then every tag as a badge. Posts are reached
// through a tag or through "All".
export default async function Home() {
  const [tags, posts] = await Promise.all([getTags(), getPosts()]);

  return (
    <PageShell>
      {/* No banner here: the site header already carries the wordmark. */}
      <HomeTagList tags={tags} postCount={posts.length} />
      <TagBar tags={tags} />
    </PageShell>
  );
}
