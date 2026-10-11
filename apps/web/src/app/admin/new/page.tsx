import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { savePost, logout } from '../actions';
import { getTags } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { BodyEditor } from '@/components/body-editor';
import { Autosave } from '@/components/autosave';
import { TagInput } from '@/components/tag-input';

export const metadata: Metadata = { title: 'New post' };

const field = 'rounded-md border border-border bg-background px-3 py-2';

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!(await isAuthed())) redirect('/admin/login');
  const [{ error }, tags] = await Promise.all([searchParams, getTags()]);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">New post</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/admin" className="text-muted hover:underline">
            ← Back
          </Link>
          <form action={logout}>
            <button className="text-muted hover:underline">Log out</button>
          </form>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600">
          Save failed. Please check your input.
        </p>
      ) : null}

      <form id="post-form" action={savePost} className="mt-8 flex flex-col gap-4">
        {/* Empty until autosave creates a draft; then it holds the draft id so a
            manual Save updates that draft instead of creating a duplicate. */}
        <input type="hidden" name="id" defaultValue="" />
        <input name="title" placeholder="Title" required className={field} />
        <input name="excerpt" placeholder="Excerpt (optional)" className={field} />

        <TagInput suggestions={tags.map((tag) => tag.name)} />

        <BodyEditor />

        <select name="status" defaultValue="DRAFT" className={field}>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="PRIVATE">Private</option>
        </select>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-strong px-3 py-2 text-strong-foreground hover:opacity-90"
          >
            Save
          </button>
          <Autosave formId="post-form" published={false} />
        </div>
      </form>
    </main>
  );
}
