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

export async function getPublishedPosts(): Promise<Post[]> {
  const res = await fetch(`${API_URL}/posts?status=PUBLISHED`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to load posts (${res.status})`);
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
