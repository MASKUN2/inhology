// Server-side base URL for the Nest API. Override with API_URL in .env.local.
const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  readingTime: number | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  category: Category;
  tags: Tag[];
}

async function getPosts(params: Record<string, string>): Promise<Post[]> {
  const qs = new URLSearchParams({ status: 'PUBLISHED', ...params });
  const res = await fetch(`${API_URL}/posts?${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load posts (${res.status})`);
  return res.json();
}

export function getPublishedPosts(): Promise<Post[]> {
  return getPosts({});
}

export function getPostsByCategory(slug: string): Promise<Post[]> {
  return getPosts({ category: slug });
}

export function getPostsByTag(slug: string): Promise<Post[]> {
  return getPosts({ tag: slug });
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load categories (${res.status})`);
  return res.json();
}

export async function getCategory(slug: string): Promise<Category | null> {
  const res = await fetch(`${API_URL}/categories/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load category (${res.status})`);
  return res.json();
}

export async function getTag(slug: string): Promise<Tag | null> {
  const res = await fetch(`${API_URL}/tags/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load tag (${res.status})`);
  return res.json();
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const res = await fetch(`${API_URL}/posts/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load post (${res.status})`);
  return res.json();
}
