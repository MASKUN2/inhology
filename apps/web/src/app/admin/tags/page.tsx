import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { deleteTag, saveTag } from '../actions';
import { getTags } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { countPosts } from '@/lib/format';
import { field, primaryButton } from '@/lib/styles';
import { ConfirmDeleteButton } from '@/components/confirm-delete-button';
import { HomeTagOrder } from '@/components/home-tag-order';
import { AdminBackLink, AdminHeader, PageShell } from '@/components/page';

export const metadata: Metadata = { title: 'Manage tags' };

export default async function AdminTagsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!(await isAuthed())) redirect('/admin/login');
  const [{ error }, tags] = await Promise.all([searchParams, getTags()]);
  const home = tags
    .filter((tag) => tag.homePosition !== null)
    .sort((a, b) => (a.homePosition ?? 0) - (b.homePosition ?? 0));

  return (
    <PageShell>
      <AdminHeader title="Manage tags">
        <AdminBackLink>← Manage posts</AdminBackLink>
      </AdminHeader>

      {error ? (
        <p className="mt-4 text-sm text-red-600">
          Save failed. A tag needs a name.
        </p>
      ) : null}

      <HomeTagOrder tags={home.map((tag) => ({ id: tag.id, title: tag.name }))} />

      {tags.length === 0 ? (
        <p className="mt-10 text-muted">
          No tags yet. A tag is created the first time a post uses it.
        </p>
      ) : (
        <ul className="mt-10 flex flex-col divide-y divide-border">
          {tags.map((tag) => (
            <li key={tag.id} className="py-6">
              <div className="text-sm">
                <Link
                  href={`/tags/${tag.slug}`}
                  className="font-medium hover:underline"
                >
                  {tag.name}
                </Link>
                <span className="ml-2 text-xs text-muted">
                  {countPosts(tag._count?.posts ?? 0)}
                </span>
              </div>

              <form
                id={`tag-${tag.id}`}
                action={saveTag}
                className="mt-3 flex flex-col gap-3"
              >
                <input type="hidden" name="id" value={tag.id} />
                <input
                  name="name"
                  placeholder="Tag name"
                  required
                  defaultValue={tag.name}
                  className={field}
                />
                <input
                  name="description"
                  placeholder="Description (optional)"
                  defaultValue={tag.description ?? ''}
                  className={field}
                />
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input
                    type="checkbox"
                    name="home"
                    defaultChecked={tag.homePosition !== null}
                  />
                  Show on the home page
                </label>
              </form>

              {/* Save submits the form above; Delete asks first. */}
              <div className="mt-3 flex items-center justify-end gap-4 text-sm">
                <ConfirmDeleteButton
                  action={deleteTag}
                  id={tag.id}
                  title={`Delete the tag "${tag.name}"?`}
                  message="It comes off every post that carries it. No post is deleted. This can't be undone."
                />
                <button
                  type="submit"
                  form={`tag-${tag.id}`}
                  className={`${primaryButton} px-4 py-2`}
                >
                  Save
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-xs text-muted">
        A tag is created the first time a post uses it. Renaming a tag keeps
        its address. Deleting a tag takes it off its posts; no post is deleted.
      </p>
    </PageShell>
  );
}
