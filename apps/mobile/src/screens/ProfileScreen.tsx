import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ApiVideo, deleteOwnVideo, fetchMyVideos } from "@/api/client";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { getScreenBottomPadding } from "@/navigation/tabBarLayout";
import { useAuthStore } from "@/store/auth";
import { useAppTheme } from "@/theme/ThemeProvider";

export function ProfileScreen() {
  const token = useAuthStore((state) => state.accessToken);
  const { colors, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();
  const me = useAuthStore((state) => state.me);
  const signOut = useAuthStore((state) => state.signOut);
  const [videos, setVideos] = useState<ApiVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const totalLikes = useMemo(
    () => videos.reduce((sum, video) => sum + video.likes_count, 0).toString(),
    [videos]
  );

  const loadVideos = useCallback(async () => {
    if (!token) {
      setVideos([]);
      setLoading(false);
      return;
    }

    try {
      setVideos(await fetchMyVideos(token));
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadVideos();
    }, [loadVideos])
  );

  const confirmDelete = useCallback(
    (video: ApiVideo) => {
      Alert.alert(
        "Удалить видео?",
        "Видео исчезнет из профиля и ленты вместе со связанными комментариями и реакциями.",
        [
          { text: "Отмена", style: "cancel" },
          {
            text: "Удалить",
            style: "destructive",
            onPress: () => {
              if (!token) {
                return;
              }

              setDeletingId(video.id);
              void deleteOwnVideo(video.id, token)
                .then(() => {
                  setVideos((current) => current.filter((item) => item.id !== video.id));
                })
                .catch((error) => {
                  Alert.alert(
                    "Не удалось удалить видео",
                    error instanceof Error ? error.message : "Попробуйте еще раз"
                  );
                })
                .finally(() => setDeletingId(null));
            }
          }
        ]
      );
    },
    [token]
  );

  return (
    <Screen edges={["top", "left", "right", "bottom"]}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: getScreenBottomPadding(insets.bottom, spacing.lg)
        }}
        ListHeaderComponent={
          <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
            <View style={[styles.hero, { backgroundColor: colors.surface }]}>
              <Text style={[styles.name, { color: colors.text }]}>{me?.full_name ?? "Гость"}</Text>
              <Text style={{ color: colors.textSecondary }}>@{me?.username ?? "anonymous"}</Text>
              <Text style={{ color: colors.textSecondary }}>
                {me?.bio || "Биография пока пустая. Добавьте описание автора позже."}
              </Text>
            </View>
            <View style={[styles.statsRow, { gap: spacing.sm }]}>
              <StatCard title="Видео" value={videos.length.toString()} />
              <StatCard title="Лайки" value={totalLikes} />
              <StatCard title="Статус" value={me?.is_active === false ? "Оффлайн" : "Онлайн"} />
            </View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Мои публикации</Text>
              <Text style={{ color: colors.textSecondary }}>
                {loading ? "Обновляем список..." : `${videos.length} ролик(ов)`}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.videoCard, { backgroundColor: colors.surface }]}>
            <View style={styles.videoHeader}>
              <View style={styles.videoMeta}>
                <Text style={[styles.videoTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={{ color: colors.textSecondary }}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>
              </View>
              <Pressable
                onPress={() => confirmDelete(item)}
                disabled={deletingId === item.id}
                style={[
                  styles.deleteButton,
                  { backgroundColor: colors.danger, opacity: deletingId === item.id ? 0.6 : 1 }
                ]}
              >
                <Text style={styles.deleteLabel}>
                  {deletingId === item.id ? "Удаляем..." : "Удалить"}
                </Text>
              </Pressable>
            </View>
            <Text style={{ color: colors.textSecondary }}>
              {item.description || "Описание не добавлено."}
            </Text>
            <View style={styles.metricsRow}>
              <Text style={{ color: colors.textSecondary }}>{item.views_count} просмотров</Text>
              <Text style={{ color: colors.textSecondary }}>{item.likes_count} лайков</Text>
              <Text style={{ color: colors.textSecondary }}>{item.comments_count} комментариев</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {loading ? "Загружаем публикации" : "Публикаций пока нет"}
            </Text>
            <Text style={{ color: colors.textSecondary, textAlign: "center" }}>
              {loading
                ? "Подтягиваем ваши ролики из профиля."
                : "После публикации ролики появятся здесь и их можно будет удалить из профиля."}
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={{ marginTop: spacing.md }}>
            <PrimaryButton title="Выйти" onPress={signOut} />
          </View>
        }
      />
    </Screen>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={{ color: colors.textSecondary }}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: 20,
    borderRadius: 28,
    gap: 8
  },
  name: {
    fontSize: 28,
    fontWeight: "800"
  },
  statsRow: {
    flexDirection: "row"
  },
  sectionHeader: {
    gap: 4
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800"
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800"
  },
  videoCard: {
    padding: 16,
    borderRadius: 22,
    gap: 10
  },
  videoHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start"
  },
  videoMeta: {
    flex: 1,
    gap: 4
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: "800"
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14
  },
  deleteLabel: {
    color: "#FFFFFF",
    fontWeight: "700"
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 32,
    paddingHorizontal: 24
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800"
  }
});
