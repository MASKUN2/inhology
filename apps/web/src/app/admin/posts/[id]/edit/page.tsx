import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getAdminPost, getTags } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { DeletePostButton } from '@/components/delete-post-button';
import { AdminBackLink, AdminHeader, PageShell } from '@/components/page';
import { PostForm } from '@/components/post-form';

export const metadata: Metadata = { title: 'Edit post' };

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  if (!(await isAuthed())) redirect('/admin/login');
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const [post, tags] = await Promise.all([getAdminPost(id), getTags()]);
  if (!post) notFound();

  return (
    <PageShell>
      <AdminHeader title="Edit post">
        <AdminBackLink>← Back</AdminBackLink>
      </AdminHeader>

      <PostForm post={post} tags={tags} failed={!!error} />

      <div className="mt-4 border-t border-border pt-4">
        <DeletePostButton
          id={post.id}
          label="Delete this post"
          triggerClassName="text-sm text-red-600 hover:underline"
        />
      </div>
    </PageShell>
  );
}
