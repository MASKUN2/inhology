import { savePost } from '@/app/admin/actions';
import type { Post, Tag } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { field, primaryButton } from '@/lib/styles';
import { Autosave } from '@/components/autosave';
import { BodyEditor } from '@/components/body-editor';
import { TagInput } from '@/components/tag-input';

const FORM_ID = 'post-form';

/**
 * The post editor form, for a new post (no `post`) or an existing one. Both
 * submit to savePost, which tells them apart by the hidden `id`.
 */
export function PostForm({
  post,
  tags,
  failed,
}: {
  post?: Post;
  tags: Tag[];
  /** The previous save was rejected. */
  failed: boolean;
}) {
  const status = (
    <select
      name="status"
      defaultValue={post?.status ?? 'DRAFT'}
      className={post ? `${field} flex-1` : field}
    >
      <option value="DRAFT">Draft</option>
      <option value="PUBLISHED">Published</option>
      <option value="PRIVATE">Private</option>
    </select>
  );

  return (
    <>
      {failed ? (
        <p className="mt-4 text-sm text-red-600">
          Save failed. Please check your input.
        </p>
      ) : null}

      <form id={FORM_ID} action={savePost} className="mt-8 flex flex-col gap-4">
        {/* Empty on a new post until autosave creates a draft; then it holds the
            draft id so a manual Save updates that draft instead of creating a
            duplicate. */}
        <input type="hidden" name="id" defaultValue={post?.id ?? ''} />
        <input
          name="title"
          placeholder="Title"
          required
          defaultValue={post?.title}
          className={field}
        />
        <input
          name="excerpt"
          placeholder="Excerpt (optional)"
          defaultValue={post?.excerpt ?? ''}
          className={field}
        />

        <TagInput
          defaultValue={post?.tags.map((tag) => tag.name)}
          suggestions={tags.map((tag) => tag.name)}
        />

        <BodyEditor defaultValue={post?.content} />

        {/* Only an existing post has a publication date to edit. */}
        {post ? (
          <div className="flex gap-3">
            {status}
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
        ) : (
          status
        )}

        <div className="flex items-center gap-3">
          <button type="submit" className={`${primaryButton} px-3 py-2`}>
            Save
          </button>
          <Autosave
            formId={FORM_ID}
            initialId={post?.id}
            published={post?.status === 'PUBLISHED'}
          />
        </div>
      </form>
    </>
  );
}
