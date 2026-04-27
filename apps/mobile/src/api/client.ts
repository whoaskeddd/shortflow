import Constants from "expo-constants";
import { Platform } from "react-native";

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

function getExpoHostApiUrl() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    return null;
  }

  const hostname = hostUri.split(":")[0]?.trim();
  if (!hostname) {
    return null;
  }

  return `http://${hostname}:8000`;
}

function resolveApiUrl() {
  const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/$/, "");
  }

  const expoHostApiUrl = getExpoHostApiUrl();
  if (expoHostApiUrl) {
    return expoHostApiUrl;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }

  return "http://127.0.0.1:8000";
}

const API_URL = resolveApiUrl();

function toResolvedUrl(pathname: string, search: string) {
  return `${API_URL}${pathname}${search}`.replace(/([^:]\/)\/+/g, "$1");
}

export function normalizeApiAssetUrl(rawUrl: string | null | undefined) {
  if (!rawUrl) {
    return null;
  }

  try {
    const parsed = new globalThis.URL(rawUrl);
    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "10.0.2.2" ||
      hostname === "::1"
    ) {
      return toResolvedUrl(parsed.pathname, parsed.search);
    }

    return rawUrl;
  } catch {
    if (rawUrl.startsWith("/")) {
      return toResolvedUrl(rawUrl, "");
    }

    return rawUrl;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const isFormData =
    typeof globalThis.FormData !== "undefined" && options.body instanceof globalThis.FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const rawMessage = await response.text();
    let message = rawMessage;

    try {
      const parsed = JSON.parse(rawMessage) as { detail?: string };
      if (parsed.detail) {
        message = parsed.detail;
      }
    } catch {
      // Keep the raw response body when it isn't JSON.
    }

    throw new Error(message || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
