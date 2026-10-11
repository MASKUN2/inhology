import { HomeTagList } from '@/components/home-tag-list';
import { PageShell } from '@/components/page';
import { TagBar } from '@/components/tag-bar';
import { getPosts, getTags } from '@/lib/api';

// The home page lists tags, not posts: every tag as a badge (the same tag bar
// that tops every list page), then the tags the author put on the home page
// with their descriptions. Posts are reached
// through a tag or through "All".
export default async function Home() {
  const [tags, posts] = await Promise.all([getTags(), getPosts()]);

  return (
    <PageShell>
      <TagBar tags={tags} />
      <HomeTagList tags={tags} postCount={posts.length} />
    </PageShell>
  );
}
