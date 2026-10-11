import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { logout } from './actions';
import { getAllPosts, type Post } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { primaryButton } from '@/lib/styles';
import { DeletePostButton } from '@/components/delete-post-button';
import { AdminHeader, PageShell } from '@/components/page';

export const metadata: Metadata = { title: 'Manage posts' };

const STATUS_BADGE: Record<Post['status'], { label: string; color: string }> = {
  PUBLISHED: {
    label: 'Published',
    color:
      'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  },
  PRIVATE: { label: 'Private', color: 'bg-subtle text-muted' },
  DRAFT: {
    label: 'Draft',
    color:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  },
};

export default async function AdminPage() {
  if (!(await isAuthed())) redirect('/admin/login');
  const posts = await getAllPosts();

  return (
    <PageShell>
      <AdminHeader title="Manage posts">
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-muted hover:underline">
            View site
          </Link>
          <Link href="/admin/tags" className="text-muted hover:underline">
            Tags
          </Link>
          <Link href="/admin/comments" className="text-muted hover:underline">
            Comments
          </Link>
          <Link href="/admin/new" className={`${primaryButton} px-3 py-1.5`}>
            New post
          </Link>
          <form action={logout}>
            <button className="text-muted hover:underline">Log out</button>
          </form>
        </div>
      </AdminHeader>

      {posts.length === 0 ? (
        <p className="mt-8 text-muted">No posts yet.</p>
      ) : (
        <ul className="mt-8 flex flex-col divide-y divide-border">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 ${STATUS_BADGE[post.status].color}`}
                  >
                    {STATUS_BADGE[post.status].label}
                  </span>
                  {post.publishedAt ? (
                    <time className="text-muted">
                      {formatDate(post.publishedAt)}
                    </time>
                  ) : null}
                  {post.tags.length > 0 ? (
                    <span className="truncate text-muted">
                      {post.tags.map((tag) => tag.name).join(' · ')}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate font-medium">{post.title}</p>
              </div>

              <div className="flex shrink-0 items-center gap-3 text-sm">
                {/* A draft has no page (it 404s); published and private posts get View. */}
                {post.status !== 'DRAFT' ? (
                  <Link
                    href={`/posts/${post.slug}`}
                    className="text-muted hover:underline"
                  >
                    View
                  </Link>
                ) : null}
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="text-muted hover:underline"
                >
                  Edit
                </Link>
                <DeletePostButton id={post.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
