'use server';

import { redirect } from 'next/navigation';
import { signIn, signOut } from '@/auth';
import { API_URL } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { publishedAtFromDate, splitTags } from '@/lib/format';

const text = (formData: FormData, name: string) =>
  String(formData.get(name) ?? '');

/**
 * The edit form's publication date (`publishedDate`, YYYY-MM-DD) as the ISO
 * date-time to send, or undefined (omitted → date left as is) when blank.
 */
function publishedAtOf(formData: FormData): string | undefined {
  return publishedAtFromDate(
    text(formData, 'publishedDate').trim(),
    text(formData, 'publishedAtOriginal').trim() || null,
  );
}

/** The post fields every save sends, manual or automatic. */
function postFields(formData: FormData) {
  return {
    title: text(formData, 'title'),
    content: text(formData, 'content'),
    excerpt: text(formData, 'excerpt').trim() || undefined,
    tags: splitTags(text(formData, 'tags')),
  };
}

/**
 * 관리자 세션(Authentik OIDC) 확인 후 API 호출용 토큰을 반환.
 * web→api 는 클러스터 내부 전용이라 공유 ADMIN_TOKEN(서버 환경변수)을 그대로 사용한다.
 */
async function adminToken(): Promise<string> {
  if (!(await isAuthed())) redirect('/admin/login');
  return process.env.ADMIN_TOKEN ?? '';
}

/** A write to the API with the admin token; `body`, when given, is sent as JSON. */
function apiRequest(
  token: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<Response> {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
}

export async function login() {
  await signIn('authentik', { redirectTo: '/admin' });
}

export async function logout() {
  await signOut({ redirectTo: '/admin/login' });
}

/**
 * Explicit "Save" for both the new-post and edit-post forms. Branches on a
 * hidden `id`: present → PATCH an existing post, absent → POST a new one.
 * Unifying the two matters for autosave: once autosave has created a draft it
 * fills the form's hidden `id`, so a later manual Save updates that same draft
 * instead of creating a duplicate (which would also collide on the unique slug).
 */
export async function savePost(formData: FormData) {
  const token = await adminToken();

  const id = text(formData, 'id').trim();
  const payload = {
    ...postFields(formData),
    status: String(formData.get('status') ?? 'DRAFT'),
  };

  const res = id
    ? await apiRequest(token, 'PATCH', `/posts/${id}`, {
        ...payload,
        publishedAt: publishedAtOf(formData),
      })
    : await apiRequest(token, 'POST', '/posts', payload);

  if (!res.ok) {
    redirect(id ? `/admin/posts/${id}/edit?error=1` : '/admin/new?error=1');
  }
  const post = await res.json();
  // A draft has no public page (it 404s), so land on the dashboard instead.
  // Encode the slug: Hangul slugs are non-Latin1 and would otherwise crash the
  // server-action redirect (Next sets it as the x-action-redirect header).
  redirect(
    post.status !== 'DRAFT'
      ? `/posts/${encodeURIComponent(post.slug)}`
      : '/admin',
  );
}

/**
 * Autosave, called periodically from the client editor (not a form submit) —
 * returns a result instead of redirecting. It never changes a post's
 * publication state: on create it forces status=DRAFT; on update it omits
 * `status` entirely. Runs for drafts and published posts alike — for a
 * published post the content edit is saved to the live post immediately.
 */
export async function autosavePost(formData: FormData): Promise<{
  ok: boolean;
  id?: string;
  slug?: string;
  reason?: string;
}> {
  const token = await adminToken();

  const id = text(formData, 'id').trim();
  const fields = postFields(formData);

  try {
    let res: Response;
    if (id) {
      // No `status` → publication state is left untouched.
      res = await apiRequest(token, 'PATCH', `/posts/${id}`, {
        ...fields,
        publishedAt: publishedAtOf(formData),
      });
    } else {
      // Create needs a title and content — until both exist there is nothing
      // valid to persist yet.
      if (!fields.title.trim() || !fields.content.trim()) {
        return { ok: false, reason: 'incomplete' };
      }
      res = await apiRequest(token, 'POST', '/posts', {
        ...fields,
        status: 'DRAFT',
      });
    }

    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
    const post = await res.json();
    return { ok: true, id: post.id, slug: post.slug };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

export async function deletePost(formData: FormData) {
  const token = await adminToken();

  const id = text(formData, 'id');
  if (!id) redirect('/admin');

  await apiRequest(token, 'DELETE', `/posts/${id}`);

  redirect('/admin');
}

/**
 * Create or update a collection. Branches on a hidden `id` like savePost:
 * present → PATCH, absent → POST. `rules` replaces the whole rule set.
 */
export async function saveCollection(formData: FormData) {
  const token = await adminToken();

  const id = text(formData, 'id').trim();
  const description = text(formData, 'description').trim();
  const payload: Record<string, unknown> = {
    title: text(formData, 'title').trim(),
    rules: splitTags(text(formData, 'rules')),
  };
  // On update an empty description clears it (null); on create it is just omitted.
  if (id) payload.description = description || null;
  else if (description) payload.description = description;

  const res = id
    ? await apiRequest(token, 'PATCH', `/collections/${id}`, payload)
    : await apiRequest(token, 'POST', '/collections', payload);

  redirect(res.ok ? '/admin/collections' : '/admin/collections?error=1');
}

/**
 * Save the collections' order. Called from the drag-and-drop list (not a form
 * submit), so it returns a result instead of redirecting.
 */
export async function reorderCollections(ids: string[]): Promise<boolean> {
  const token = await adminToken();

  try {
    const res = await apiRequest(token, 'PATCH', '/collections/order', { ids });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteCollection(formData: FormData) {
  const token = await adminToken();

  const id = text(formData, 'id');
  if (!id) redirect('/admin/collections');

  await apiRequest(token, 'DELETE', `/collections/${id}`);

  redirect('/admin/collections');
}

export async function moderateComment(formData: FormData) {
  const token = await adminToken();

  const id = text(formData, 'id');
  const status = text(formData, 'status');
  if (!id || !status) redirect('/admin/comments');

  await apiRequest(token, 'PATCH', `/comments/${id}`, { status });

  redirect('/admin/comments');
}

export async function deleteComment(formData: FormData) {
  const token = await adminToken();

  const id = text(formData, 'id');
  if (!id) redirect('/admin/comments');

  await apiRequest(token, 'DELETE', `/comments/${id}`);

  redirect('/admin/comments');
}
