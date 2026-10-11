import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { deleteCollection, saveCollection } from '../actions';
import { getCollections, getTags, type Collection } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { countPosts } from '@/lib/format';
import { field, primaryButton } from '@/lib/styles';
import { CollectionOrder } from '@/components/collection-order';
import { AdminBackLink, AdminHeader, PageShell } from '@/components/page';
import { TagInput } from '@/components/tag-input';

export const metadata: Metadata = { title: 'Manage collections' };

/** The inputs of a collection form: blank to create, filled from `collection` to edit. */
function CollectionFields({
  collection,
  suggestions,
}: {
  collection?: Collection;
  suggestions: string[];
}) {
  return (
    <>
      <input
        name="title"
        placeholder="Collection title"
        required
        defaultValue={collection?.title}
        className={field}
      />
      <input
        name="description"
        placeholder="Description (optional)"
        defaultValue={collection?.description ?? ''}
        className={field}
      />
      <TagInput
        name="rules"
        defaultValue={collection?.tags.map((tag) => tag.name)}
        suggestions={suggestions}
        placeholder="Rules: tags a post must have (comma-separated)"
      />
    </>
  );
}

export default async function AdminCollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!(await isAuthed())) redirect('/admin/login');
  const [{ error }, collections, tags] = await Promise.all([
    searchParams,
    getCollections(),
    getTags(),
  ]);
  const suggestions = tags.map((tag) => tag.name);

  return (
    <PageShell>
      <AdminHeader title="Manage collections">
        <AdminBackLink>← Manage posts</AdminBackLink>
      </AdminHeader>

      {error ? (
        <p className="mt-4 text-sm text-red-600">
          Save failed. A collection needs a title that no other collection uses.
        </p>
      ) : null}

      {/* Create: same fields as the edit forms below, with no id. */}
      <form action={saveCollection} className="mt-8 flex flex-col gap-3">
        <CollectionFields suggestions={suggestions} />
        <button
          type="submit"
          className={`self-end ${primaryButton} px-4 py-2 text-sm`}
        >
          Add collection
        </button>
      </form>

      <CollectionOrder
        collections={collections.map((c) => ({ id: c.id, title: c.title }))}
      />

      {collections.length === 0 ? (
        <p className="mt-10 text-muted">No collections yet.</p>
      ) : (
        <ul className="mt-10 flex flex-col divide-y divide-border">
          {collections.map((c) => (
            <li key={c.id} className="py-6">
              <div className="text-sm">
                <Link
                  href={`/collections/${c.slug}`}
                  className="font-medium hover:underline"
                >
                  {c.title}
                </Link>
                <span className="ml-2 text-xs text-muted">
                  {countPosts(c.postCount)}
                </span>
              </div>

              <form
                id={`collection-${c.id}`}
                action={saveCollection}
                className="mt-3 flex flex-col gap-3"
              >
                <input type="hidden" name="id" value={c.id} />
                <CollectionFields collection={c} suggestions={suggestions} />
              </form>

              {/* Save and Delete sit side by side but belong to different forms. */}
              <div className="mt-3 flex items-center justify-end gap-4 text-sm">
                <form action={deleteCollection}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-red-600 hover:underline">Delete</button>
                </form>
                <button
                  type="submit"
                  form={`collection-${c.id}`}
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
        A collection stores no posts. It shows every published post that carries
        all of its rule tags; with no rules it shows every post. Deleting a
        collection deletes no post and no tag.
      </p>
    </PageShell>
  );
}
