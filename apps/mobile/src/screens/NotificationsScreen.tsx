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
  const { colors, spacing } = useAppTheme();
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
          padding: spacing.md,
          paddingBottom: getScreenBottomPadding(insets.bottom)
        }}
      >
        <Text style={[styles.heading, { color: colors.text }]}>Активность</Text>
        <FlatList
          data={items}
          contentContainerStyle={{
            paddingBottom: spacing.md,
            flexGrow: items.length === 0 ? 1 : 0
          }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={styles.metaRow}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: getNotificationTint(item.type, colors.primary) }
                  ]}
                >
                  <Text style={styles.badgeLabel}>{getNotificationLabel(item.type)}</Text>
                </View>
                <Text style={{ color: colors.textSecondary }}>
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
              <Text style={{ color: colors.textSecondary, textAlign: "center" }}>
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

  return "rgba(110,110,115,0.16)";
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 16
  },
  card: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 12
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 10
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999
  },
  badgeLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700"
  },
  message: {
    fontSize: 16,
    fontWeight: "600"
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
