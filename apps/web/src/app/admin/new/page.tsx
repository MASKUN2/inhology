import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { logout } from '../actions';
import { getTags } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { AdminBackLink, AdminHeader, PageShell } from '@/components/page';
import { PostForm } from '@/components/post-form';

export const metadata: Metadata = { title: 'New post' };

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!(await isAuthed())) redirect('/admin/login');
  const [{ error }, tags] = await Promise.all([searchParams, getTags()]);

  return (
    <PageShell>
      <AdminHeader title="New post">
        <div className="flex items-center gap-4 text-sm">
          <AdminBackLink>← Back</AdminBackLink>
          <form action={logout}>
            <button className="text-muted hover:underline">Log out</button>
          </form>
        </div>
      </AdminHeader>

      <PostForm tags={tags} failed={!!error} />
    </PageShell>
  );
}
