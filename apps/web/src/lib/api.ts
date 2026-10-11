import { isAuthed } from '@/lib/auth';

// Server-side base URL for the Nest API. Override with API_URL in .env.local.
export const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export interface Tag {
  id: string;
  slug: string;
  name: string;
  /** Listed (published or private) posts carrying the tag; present on tag endpoints. */
  _count?: { posts: number };
}

/** A titled view over the posts. `tags` are its rules: a post must carry every one. */
export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  tags: Tag[];
  /** Listed (published or private) posts currently satisfying the rules. */
  postCount: number;
  /** Present on the detail endpoint only. */
  posts?: Post[];
}

/** Public, approved comment as returned on a post detail. */
export interface PostComment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  parentId: string | null;
}

/** Full comment shape for the admin moderation list. */
export interface AdminComment {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string | null;
  status: 'PENDING' | 'APPROVED' | 'SPAM';
  createdAt: string;
  postId: string;
  parentId: string | null;
  post: { title: string; slug: string };
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  status: 'DRAFT' | 'PUBLISHED' | 'PRIVATE';
  publishedAt: string | null;
  readingTime: number | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  comments?: PostComment[];
}

type AuthHeaders = Record<string, string>;

// Server-only: the admin token unlocks drafts on the API's read endpoints.
// Never import this into a Client Component — it would ship the token.
function adminHeaders(): AuthHeaders {
  const token = process.env.ADMIN_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Headers for the public site's reads. A signed-in author's requests carry the
 * admin token, so the API returns private posts in full; a reader's requests
 * carry nothing and get a private post's header only (no body or excerpt).
 */
async function siteHeaders(): Promise<AuthHeaders> {
  return (await isAuthed()) ? adminHeaders() : {};
}

/** GET a JSON resource from the API, or null when it does not exist (404). */
async function find<T>(
  path: string,
  what: string,
  headers: AuthHeaders = {},
): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, { cache: 'no-store', headers });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load ${what} (${res.status})`);
  return res.json();
}

/** GET a JSON resource that must exist: a 404 is an error like any other. */
async function load<T>(
  path: string,
  what: string,
  headers?: AuthHeaders,
): Promise<T> {
  const found = await find<T>(path, what, headers);
  if (found === null) throw new Error(`Failed to load ${what} (404)`);
  return found;
}

export async function getPostsByTag(slug: string): Promise<Post[]> {
  // visible=true: the posts shown on the site (published and private, no drafts).
  const qs = new URLSearchParams({ visible: 'true', tag: slug });
  return load(`/posts?${qs}`, 'posts', await siteHeaders());
}

/**
 * Every post regardless of status (drafts included), newest first.
 * Admin dashboard only — sends the admin token so the API returns drafts.
 */
export function getAllPosts(): Promise<Post[]> {
  return load('/posts', 'posts', adminHeaders());
}

/** A single post by id or slug, drafts included. Admin pages only. */
export function getAdminPost(idOrSlug: string): Promise<Post | null> {
  return find(`/posts/${encodeURIComponent(idOrSlug)}`, 'post', adminHeaders());
}

/** Comments for moderation, optionally filtered by status. Admin only. */
export function getComments(status?: string): Promise<AdminComment[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return load(`/comments${qs}`, 'comments', adminHeaders());
}

/** Every tag with its published-post count, highest count first. */
export function getTags(): Promise<Tag[]> {
  return load('/tags', 'tags');
}

/** Every collection, in the author-defined order, with its rules and post count. */
export function getCollections(): Promise<Collection[]> {
  return load('/collections', 'collections');
}

/** One collection with the published posts that satisfy its rules. */
export async function getCollection(slug: string): Promise<Collection | null> {
  return find(
    `/collections/${encodeURIComponent(slug)}`,
    'collection',
    await siteHeaders(),
  );
}

export function getTag(slug: string): Promise<Tag | null> {
  return find(`/tags/${encodeURIComponent(slug)}`, 'tag');
}

/** A post by slug as this viewer may read it: a private post comes without its body unless the author is signed in. */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  return find(`/posts/${encodeURIComponent(slug)}`, 'post', await siteHeaders());
}
