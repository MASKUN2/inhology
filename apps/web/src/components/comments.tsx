import type { PostComment } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { createComment } from '@/app/(site)/posts/actions';

const field = 'rounded-md border border-border bg-background px-3 py-2';

export function Comments({
  postId,
  slug,
  comments,
  flash,
}: {
  postId: string;
  slug: string;
  comments: PostComment[];
  flash?: 'ok' | 'error';
}) {
  return (
    <section id="comments" className="mt-16 border-t border-border pt-10">
      <h2 className="text-lg font-semibold">댓글 {comments.length}</h2>

      {flash === 'ok' ? (
        <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
          댓글이 등록되었습니다. 검토 후 공개됩니다.
        </p>
      ) : null}
      {flash === 'error' ? (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          등록에 실패했습니다. 입력값을 확인해 주세요.
        </p>
      ) : null}

      {comments.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-6">
          {comments.map((c) => (
            <li
              key={c.id}
              className={c.parentId ? 'border-l-2 border-border pl-4' : ''}
            >
              <div className="flex items-baseline gap-2 text-sm">
                <span className="font-medium">{c.authorName}</span>
                <time className="text-xs text-muted">
                  {formatDate(c.createdAt)}
                </time>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-foreground">
                {c.content}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-muted">첫 댓글을 남겨보세요.</p>
      )}

      <form action={createComment} className="mt-10 flex flex-col gap-3">
        <input type="hidden" name="postId" value={postId} />
        <input type="hidden" name="slug" value={slug} />
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            name="authorName"
            placeholder="이름"
            required
            maxLength={50}
            className={`${field} sm:w-40`}
          />
          <input
            type="email"
            name="authorEmail"
            placeholder="이메일 (선택, 비공개)"
            className={`${field} flex-1`}
          />
        </div>
        <textarea
          name="content"
          placeholder="댓글을 입력하세요"
          required
          maxLength={5000}
          rows={4}
          className={field}
        />
        <button
          type="submit"
          className="self-end rounded-md bg-strong px-4 py-2 text-sm text-strong-foreground hover:opacity-90"
        >
          댓글 등록
        </button>
      </form>
    </section>
  );
}
