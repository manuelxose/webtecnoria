export type AuthUser = {
  id: string;
  email: string;
  displayName?: string | null;
  role?: "admin" | "editor" | "viewer";
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  content: string;
  image?: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
};

export type ContactMessage = {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service1?: string;
  service2?: string;
  message: string;
  createdAt?: string;
};

export type ScraperJob = {
  id: string;
  status: "queued" | "running" | "done" | "failed";
  query: string;
  resultUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
