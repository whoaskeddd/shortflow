export type ApiUser = {
  id: number;
  email: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string | null;
};

export type ApiVideo = {
  id: number;
  author_id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string | null;
  hashtags: string[];
  likes_count: number;
  comments_count: number;
  saves_count: number;
  reposts_count: number;
  views_count: number;
  duration_seconds: number;
  created_at: string;
  content_status: "approved" | "needs_review" | "rejected";
  author: ApiUser;
};

export type ApiComment = {
  id: number;
  video_id: number;
  author_id: number;
  parent_id: number | null;
  body: string;
  created_at: string;
  content_status: "approved" | "needs_review" | "rejected";
};

export type ApiNotification = {
  id: number;
  user_id: number;
  actor_id: number;
  type: "like" | "comment" | "follow" | "repost";
  entity_id: number | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

const API_URL = "http://10.0.2.2:8000";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
