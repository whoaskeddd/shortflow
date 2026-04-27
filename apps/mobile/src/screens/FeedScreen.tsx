import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ApiComment, ApiVideo, apiRequest } from "@/api/client";
import { FeedSkeleton } from "@/components/FeedSkeleton";
import { Screen } from "@/components/Screen";
import { VideoCard } from "@/components/VideoCard";
import { getTabBarHeight } from "@/navigation/tabBarLayout";
import { useAuthStore } from "@/store/auth";
import { useAppTheme } from "@/theme/ThemeProvider";

type ReactionKind = "like" | "save" | "repost";

export function FeedScreen() {
  const token = useAuthStore((state) => state.accessToken);
  const { colors, spacing, radius } = useAppTheme();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { height } = useWindowDimensions();
  const flatListRef = useRef<FlatList<ApiVideo>>(null);
  const lastEndRefreshAt = useRef(0);
  const [videos, setVideos] = useState<ApiVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<ApiVideo | null>(null);
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [likedIds, setLikedIds] = useState<Record<number, boolean>>({});
  const [savedIds, setSavedIds] = useState<Record<number, boolean>>({});
  const [repostedIds, setRepostedIds] = useState<Record<number, boolean>>({});
  const [visibleVideoId, setVisibleVideoId] = useState<number | null>(null);
  const [listHeight, setListHeight] = useState(height);

  const tabBarHeight = getTabBarHeight(insets.bottom);

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

  const loadFeed = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await apiRequest<ApiVideo[]>("/videos/feed", {}, token);
        setVideos(response);
        setVisibleVideoId((current) => {
          if (response.length === 0) {
            return null;
          }

          if (current && response.some((video) => video.id === current)) {
            return current;
          }

          return response[0]?.id ?? null;
        });
      } catch {
        setVideos([]);
        setVisibleVideoId(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (isFocused) {
      void loadFeed();
    } else {
      setVisibleVideoId(null);
    }
  }, [isFocused, loadFeed]);

  const applyReactionState = (
    videoId: number,
    nextActive: boolean,
    currentMap: Record<number, boolean>,
    setMap: React.Dispatch<React.SetStateAction<Record<number, boolean>>>,
    counterField: "likes_count" | "saves_count" | "reposts_count"
  ) => {
    const previousActive = currentMap[videoId] ?? !nextActive;
    const delta = nextActive === previousActive ? 0 : nextActive ? 1 : -1;

    setMap((current) => ({ ...current, [videoId]: nextActive }));
    updateVideoCounters(videoId, (video) => ({
      ...video,
      [counterField]: Math.max(0, video[counterField] + delta)
    }));
  };

  const toggleReaction = async (
    videoId: number,
    kind: ReactionKind,
    currentMap: Record<number, boolean>,
    setMap: React.Dispatch<React.SetStateAction<Record<number, boolean>>>,
    counterField: "likes_count" | "saves_count" | "reposts_count"
  ) => {
    if (!token) {
      return;
    }

    try {
      const response = await apiRequest<{ active: boolean }>(
        `/videos/${videoId}/${kind}`,
        { method: "POST" },
        token
      );
      applyReactionState(videoId, response.active, currentMap, setMap, counterField);
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

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 80
    }),
    []
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ item: ApiVideo; isViewable: boolean }> }) => {
      const firstVisible = viewableItems.find((item) => item.isViewable)?.item;
      setVisibleVideoId(firstVisible?.id ?? null);
    }
  ).current;

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (videos.length === 0) {
      return;
    }

    const nextIndex = Math.round(event.nativeEvent.contentOffset.y / Math.max(listHeight, 1));
    const boundedIndex = Math.min(Math.max(nextIndex, 0), videos.length - 1);
    const nextVideo = videos[boundedIndex];
    if (nextVideo) {
      setVisibleVideoId(nextVideo.id);
    }

    if (boundedIndex === videos.length - 1) {
      const now = Date.now();
      if (now - lastEndRefreshAt.current > 1500) {
        lastEndRefreshAt.current = now;
        void loadFeed({ silent: true });
      }
    }
  };

  const getItemLayout = (_data: ArrayLike<ApiVideo> | null | undefined, index: number) => ({
    length: listHeight,
    offset: listHeight * index,
    index
  });

  return (
    <Screen edges={["left", "right"]}>
      <View
        style={[
          styles.header,
          { paddingHorizontal: spacing.md, paddingTop: insets.top + spacing.sm }
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>Лента</Text>
      </View>
      {loading ? (
        <FeedSkeleton />
      ) : videos.length === 0 ? (
        <View style={[styles.emptyState, { padding: spacing.lg }]}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Лента пока пустая</Text>
          <Text style={{ color: colors.textSecondary, textAlign: "center" }}>
            Опубликуйте первый ролик, и он сразу появится здесь.
          </Text>
        </View>
      ) : (
        <View
          style={styles.listContainer}
          onLayout={(event) => {
            const nextHeight = Math.round(event.nativeEvent.layout.height);
            if (nextHeight > 0 && nextHeight !== listHeight) {
              setListHeight(nextHeight);
            }
          }}
        >
          <FlatList
            ref={flatListRef}
            data={videos}
            pagingEnabled
            decelerationRate="fast"
            disableIntervalMomentum
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <VideoCard
                video={item}
                liked={Boolean(likedIds[item.id])}
                saved={Boolean(savedIds[item.id])}
                reposted={Boolean(repostedIds[item.id])}
                bottomInset={tabBarHeight}
                cardHeight={listHeight}
                isActive={isFocused && visibleVideoId === item.id}
                onLike={() =>
                  void toggleReaction(
                    item.id,
                    "like",
                    likedIds,
                    setLikedIds,
                    "likes_count"
                  )
                }
                onComment={() => void openComments(item)}
                onSave={() =>
                  void toggleReaction(
                    item.id,
                    "save",
                    savedIds,
                    setSavedIds,
                    "saves_count"
                  )
                }
                onRepost={() =>
                  void toggleReaction(
                    item.id,
                    "repost",
                    repostedIds,
                    setRepostedIds,
                    "reposts_count"
                  )
                }
              />
            )}
            initialNumToRender={1}
            maxToRenderPerBatch={1}
            windowSize={2}
            removeClippedSubviews
            getItemLayout={getItemLayout}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            onMomentumScrollEnd={onMomentumScrollEnd}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void loadFeed({ silent: true })}
                tintColor={colors.primary}
                progressViewOffset={insets.top + 48}
              />
            }
          />
        </View>
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
                borderTopRightRadius: radius.lg,
                paddingBottom: Math.max(insets.bottom, 18)
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
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: "center"
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800"
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  listContainer: {
    flex: 1
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
