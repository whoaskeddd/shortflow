import Ionicons from "@expo/vector-icons/Ionicons";
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
  const { colors, spacing, radius } = useAppTheme();
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
            <View
              style={[
                styles.hero,
                {
                  backgroundColor: colors.surfaceGlass,
                  borderColor: colors.border,
                  borderRadius: radius.xl
                }
              ]}
            >
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarLetter}>
                  {(me?.username ?? "S").slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={styles.heroText}>
                <Text style={[styles.name, { color: colors.text }]}>{me?.full_name ?? "Гость"}</Text>
                <Text style={{ color: colors.accent, fontWeight: "700" }}>
                  @{me?.username ?? "anonymous"}
                </Text>
                <Text style={[styles.bio, { color: colors.textSecondary }]}>
                  {me?.bio || "Биография пока пустая. Добавьте описание автора позже."}
                </Text>
              </View>
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
          <View
            style={[
              styles.videoCard,
              {
                backgroundColor: colors.surfaceGlass,
                borderColor: colors.border,
                borderRadius: radius.lg
              }
            ]}
          >
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
                style={({ pressed }) => [
                  styles.deleteButton,
                  {
                    backgroundColor: "rgba(214,111,103,0.14)",
                    borderColor: "rgba(214,111,103,0.34)",
                    opacity: deletingId === item.id || pressed ? 0.64 : 1
                  }
                ]}
              >
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            </View>
            <Text style={{ color: colors.textSecondary, lineHeight: 21 }}>
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
            <Text style={{ color: colors.textSecondary, textAlign: "center", lineHeight: 22 }}>
              {loading
                ? "Подтягиваем ваши ролики из профиля."
                : "После публикации ролики появятся здесь."}
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={{ marginTop: spacing.md }}>
            <PrimaryButton title="Выйти" onPress={signOut} muted />
          </View>
        }
      />
    </Screen>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  const { colors, radius } = useAppTheme();

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: colors.surfaceGlass,
          borderColor: colors.border,
          borderRadius: radius.lg
        }
      ]}
    >
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={{ color: colors.textSecondary }}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 18,
    gap: 14
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarLetter: {
    color: "#11100B",
    fontSize: 24,
    fontWeight: "900"
  },
  heroText: {
    flex: 1,
    gap: 5
  },
  name: {
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: 0
  },
  bio: {
    lineHeight: 21
  },
  statsRow: {
    flexDirection: "row"
  },
  sectionHeader: {
    gap: 4
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: "900"
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    padding: 15
  },
  statValue: {
    fontSize: 21,
    fontWeight: "900"
  },
  videoCard: {
    borderWidth: 1,
    padding: 16,
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
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 14
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
