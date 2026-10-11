import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { savePost } from '../../../actions';
import { getAdminPost, getTags } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { isAuthed } from '@/lib/auth';
import { BodyEditor } from '@/components/body-editor';
import { DeletePostButton } from '@/components/delete-post-button';
import { Autosave } from '@/components/autosave';
import { TagInput } from '@/components/tag-input';

export const metadata: Metadata = { title: 'Edit post' };

const field = 'rounded-md border border-border bg-background px-3 py-2';

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
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit post</h1>
        <Link href="/admin" className="text-sm text-muted hover:underline">
          ← Back
        </Link>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600">
          Save failed. Please check your input.
        </p>
      ) : null}

      <form id="post-form" action={savePost} className="mt-8 flex flex-col gap-4">
        <input type="hidden" name="id" value={post.id} />
        <input
          name="title"
          placeholder="Title"
          required
          defaultValue={post.title}
          className={field}
        />
        <input
          name="excerpt"
          placeholder="Excerpt (optional)"
          defaultValue={post.excerpt ?? ''}
          className={field}
        />

        <TagInput
          defaultValue={post.tags.map((tag) => tag.name)}
          suggestions={tags.map((tag) => tag.name)}
        />

        <BodyEditor defaultValue={post.content} />

        <div className="flex gap-3">
          <select
            name="status"
            defaultValue={post.status}
            className={`${field} flex-1`}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="PRIVATE">Private</option>
          </select>
          <input
            name="publishedDate"
            type="text"
            inputMode="numeric"
            pattern="\d{4}-\d{2}-\d{2}"
            placeholder="YYYY-MM-DD"
            aria-label="Publication date"
            title="Publication date (YYYY-MM-DD)"
            defaultValue={formatDate(post.publishedAt)}
            className={`${field} w-40`}
          />
          <input
            type="hidden"
            name="publishedAtOriginal"
            value={post.publishedAt ?? ''}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-strong px-3 py-2 text-strong-foreground hover:opacity-90"
          >
            Save
          </button>
          <Autosave
            formId="post-form"
            initialId={post.id}
            published={post.status === 'PUBLISHED'}
          />
        </div>
      </form>

      <div className="mt-4 border-t border-border pt-4">
        <DeletePostButton
          id={post.id}
          label="Delete this post"
          triggerClassName="text-sm text-red-600 hover:underline"
        />
      </div>
    </main>
  );
}
