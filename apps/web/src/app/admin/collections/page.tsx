import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { deleteCollection, saveCollection } from '../actions';
import { getCollections, getTags } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { CollectionOrder } from '@/components/collection-order';
import { TagInput } from '@/components/tag-input';

export const metadata: Metadata = { title: 'Manage collections' };

const field = 'rounded-md border border-border bg-background px-3 py-2';
const RULES_PLACEHOLDER = 'Rules: tags a post must have (comma-separated)';

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
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Manage collections</h1>
        <Link href="/admin" className="text-sm text-muted hover:underline">
          ← Manage posts
        </Link>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600">
          Save failed. A collection needs a title that no other collection uses.
        </p>
      ) : null}

      {/* Create: same fields as the edit forms below, with no id. */}
      <form action={saveCollection} className="mt-8 flex flex-col gap-3">
        <input
          name="title"
          placeholder="Collection title"
          required
          className={field}
        />
        <input
          name="description"
          placeholder="Description (optional)"
          className={field}
        />
        <TagInput
          name="rules"
          suggestions={suggestions}
          placeholder={RULES_PLACEHOLDER}
        />
        <button
          type="submit"
          className="self-end rounded-md bg-strong px-4 py-2 text-sm text-strong-foreground hover:opacity-90"
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
                  {c.postCount} {c.postCount === 1 ? 'post' : 'posts'}
                </span>
              </div>

              <form
                id={`collection-${c.id}`}
                action={saveCollection}
                className="mt-3 flex flex-col gap-3"
              >
                <input type="hidden" name="id" value={c.id} />
                <input
                  name="title"
                  placeholder="Collection title"
                  required
                  defaultValue={c.title}
                  className={field}
                />
                <input
                  name="description"
                  placeholder="Description (optional)"
                  defaultValue={c.description ?? ''}
                  className={field}
                />
                <TagInput
                  name="rules"
                  defaultValue={c.tags.map((tag) => tag.name)}
                  suggestions={suggestions}
                  placeholder={RULES_PLACEHOLDER}
                />
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
                  className="rounded-md bg-strong px-4 py-2 text-strong-foreground hover:opacity-90"
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
    </main>
  );
}
