import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ApiNotification, fetchNotifications } from "@/api/client";
import { Screen } from "@/components/Screen";
import { getScreenBottomPadding } from "@/navigation/tabBarLayout";
import { useAuthStore } from "@/store/auth";
import { useAppTheme } from "@/theme/ThemeProvider";

export function NotificationsScreen() {
  const token = useAuthStore((state) => state.accessToken);
  const { colors, spacing, radius } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<ApiNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }

    setRefreshing(true);
    try {
      setItems(await fetchNotifications(token));
    } catch {
      setItems([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadNotifications();
    }, [loadNotifications])
  );

  return (
    <Screen edges={["top", "left", "right", "bottom"]}>
      <View
        style={{
          flex: 1,
          padding: spacing.lg,
          paddingBottom: getScreenBottomPadding(insets.bottom)
        }}
      >
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>Signals</Text>
          <Text style={[styles.heading, { color: colors.text }]}>Активность</Text>
        </View>
        <FlatList
          data={items}
          contentContainerStyle={{
            paddingTop: spacing.md,
            paddingBottom: spacing.md,
            flexGrow: items.length === 0 ? 1 : 0
          }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceGlass,
                  borderColor: colors.border,
                  borderRadius: radius.lg
                }
              ]}
            >
              <View style={styles.metaRow}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: getNotificationTint(item.type, colors.primary),
                      borderColor: colors.border
                    }
                  ]}
                >
                  <Text style={styles.badgeLabel}>{getNotificationLabel(item.type)}</Text>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>
              </View>
              <Text style={[styles.message, { color: colors.text }]}>{item.message}</Text>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadNotifications()}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {loading ? "Загружаем активность" : "Пока нет событий"}
              </Text>
              <Text style={{ color: colors.textSecondary, textAlign: "center", lineHeight: 22 }}>
                {loading
                  ? "Подтягиваем лайки, комментарии и другие уведомления."
                  : "Новые лайки и комментарии появятся здесь."}
              </Text>
            </View>
          }
        />
      </View>
    </Screen>
  );
}

function getNotificationLabel(type: ApiNotification["type"]) {
  switch (type) {
    case "like":
      return "Лайк";
    case "comment":
      return "Комментарий";
    case "follow":
      return "Подписка";
    case "repost":
      return "Репост";
    default:
      return "Событие";
  }
}

function getNotificationTint(type: ApiNotification["type"], primary: string) {
  if (type === "like" || type === "comment") {
    return primary;
  }

  return "rgba(185,155,88,0.72)";
}

const styles = StyleSheet.create({
  header: {
    gap: 4
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0
  },
  heading: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 0
  },
  card: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 10
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999
  },
  badgeLabel: {
    color: "#11100B",
    fontSize: 12,
    fontWeight: "800"
  },
  message: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 24
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800"
  }
});
