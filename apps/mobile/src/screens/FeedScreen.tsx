import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { ApiComment, ApiVideo, apiRequest } from "@/api/client";
import { FeedSkeleton } from "@/components/FeedSkeleton";
import { Screen } from "@/components/Screen";
import { VideoCard } from "@/components/VideoCard";
import { useAuthStore } from "@/store/auth";
import { useAppTheme } from "@/theme/ThemeProvider";

type FeedMode = "for_you" | "following";

export function FeedScreen() {
  const token = useAuthStore((state) => state.accessToken);
  const { colors, spacing, radius } = useAppTheme();
  const [mode, setMode] = useState<FeedMode>("for_you");
  const [videos, setVideos] = useState<ApiVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<ApiVideo | null>(null);
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [likedIds, setLikedIds] = useState<Record<number, boolean>>({});

  const updateVideoCounters = (
    videoId: number,
    updater: (video: ApiVideo) => ApiVideo
  ) => {
    setVideos((current) =>
      current.map((video) => (video.id === videoId ? updater(video) : video))
    );
    setActiveVideo((current) =>
      current && current.id === videoId ? updater(current) : current
    );
  };

  const loadFeed = async (nextMode: FeedMode = mode) => {
    setLoading(true);
    try {
      const path = nextMode === "for_you" ? "/videos/feed" : "/videos/following";
      const response = await apiRequest<ApiVideo[]>(path, {}, token);
      setVideos(response);
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFeed(mode);
  }, [mode]);

  const toggle = async (path: string) => {
    if (!token || videos.length === 0) {
      return;
    }
    try {
      await apiRequest(path, { method: "POST" }, token);
      await loadFeed(mode);
    } catch (error) {
      Alert.alert(
        "Не удалось выполнить действие",
        error instanceof Error ? error.message : "Попробуйте еще раз"
      );
    }
  };

  const openComments = async (video: ApiVideo) => {
    setActiveVideo(video);
    setCommentsOpen(true);
    try {
      const response = await apiRequest<ApiComment[]>(`/videos/${video.id}/comments`);
      setComments(response);
    } catch {
      setComments([]);
    }
  };

  const sendComment = async () => {
    if (!token || !activeVideo || !commentText.trim()) {
      return;
    }
    try {
      await apiRequest(
        `/videos/${activeVideo.id}/comments`,
        {
          method: "POST",
          body: JSON.stringify({ body: commentText.trim() })
        },
        token
      );
      updateVideoCounters(activeVideo.id, (video) => ({
        ...video,
        comments_count: video.comments_count + 1
      }));
      setCommentText("");
      await openComments(activeVideo);
    } catch (error) {
      Alert.alert(
        "Не удалось отправить комментарий",
        error instanceof Error ? error.message : "Попробуйте еще раз"
      );
    }
  };

  return (
    <Screen>
      <View style={[styles.header, { paddingHorizontal: spacing.md, paddingTop: spacing.md }]}>
        <Pressable
          onPress={() => setMode("for_you")}
          style={[
            styles.modeButton,
            {
              backgroundColor: mode === "for_you" ? colors.primary : "rgba(255,255,255,0.14)",
              borderRadius: radius.md
            }
          ]}
        >
          <Text style={[styles.modeLabel, { color: mode === "for_you" ? "#FFFFFF" : colors.text }]}>
            Для вас
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode("following")}
          style={[
            styles.modeButton,
            {
              backgroundColor: mode === "following" ? colors.primary : "rgba(255,255,255,0.14)",
              borderRadius: radius.md
            }
          ]}
        >
          <Text
            style={[styles.modeLabel, { color: mode === "following" ? "#FFFFFF" : colors.text }]}
          >
            Подписки
          </Text>
        </Pressable>
      </View>
      {loading ? (
        <FeedSkeleton />
      ) : videos.length === 0 ? (
        <View style={[styles.emptyState, { padding: spacing.lg }]}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Лента пока пустая</Text>
          <Text style={{ color: colors.textSecondary, textAlign: "center" }}>
            Опубликуйте первый ролик или подпишитесь на авторов, чтобы собрать ленту как в TikTok.
          </Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          pagingEnabled
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <VideoCard
              video={item}
              liked={Boolean(likedIds[item.id])}
              onLike={async () => {
                const nextLiked = !likedIds[item.id];
                setLikedIds((current) => ({ ...current, [item.id]: nextLiked }));
                updateVideoCounters(item.id, (video) => ({
                  ...video,
                  likes_count: Math.max(0, video.likes_count + (nextLiked ? 1 : -1))
                }));
                await toggle(`/videos/${item.id}/like`);
              }}
              onComment={() => void openComments(item)}
              onSave={async () => {
                updateVideoCounters(item.id, (video) => ({
                  ...video,
                  saves_count: video.saves_count + 1
                }));
                await toggle(`/videos/${item.id}/save`);
              }}
              onRepost={async () => {
                updateVideoCounters(item.id, (video) => ({
                  ...video,
                  reposts_count: video.reposts_count + 1
                }));
                await toggle(`/videos/${item.id}/repost`);
              }}
            />
          )}
        />
      )}
      <Modal
        visible={commentsOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setCommentsOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: radius.lg,
                borderTopRightRadius: radius.lg
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Комментарии</Text>
              <Pressable onPress={() => setCommentsOpen(false)}>
                <Text style={{ color: colors.primary, fontWeight: "700" }}>Закрыть</Text>
              </Pressable>
            </View>
            <Text style={{ color: colors.textSecondary, marginBottom: 14 }}>
              {activeVideo?.title ?? "Обсуждение ролика"}
            </Text>
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={[styles.commentCard, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.commentBody, { color: colors.text }]}>{item.body}</Text>
                  <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={{ color: colors.textSecondary }}>Комментариев пока нет.</Text>
              }
            />
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Напишите комментарий"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.commentInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                  borderRadius: radius.md
                }
              ]}
            />
            <Pressable
              onPress={() => void sendComment()}
              style={[
                styles.sendButton,
                { backgroundColor: colors.primary, borderRadius: radius.md }
              ]}
            >
              <Text style={styles.sendButtonLabel}>Отправить</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10
  },
  modeButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    minWidth: 108,
    alignItems: "center"
  },
  modeLabel: {
    fontWeight: "800",
    fontSize: 15
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "800"
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)"
  },
  modalCard: {
    minHeight: "58%",
    maxHeight: "82%",
    padding: 20
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800"
  },
  commentCard: {
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  commentBody: {
    fontSize: 16,
    lineHeight: 22
  },
  commentInput: {
    marginTop: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  sendButton: {
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14
  },
  sendButtonLabel: {
    color: "#FFFFFF",
    fontWeight: "800"
  }
});
