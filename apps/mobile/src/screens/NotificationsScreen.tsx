import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ApiNotification, apiRequest } from "@/api/client";
import { Screen } from "@/components/Screen";
import { getScreenBottomPadding } from "@/navigation/tabBarLayout";
import { useAuthStore } from "@/store/auth";
import { useAppTheme } from "@/theme/ThemeProvider";

export function NotificationsScreen() {
  const token = useAuthStore((state) => state.accessToken);
  const { colors, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<ApiNotification[]>([]);

  useEffect(() => {
    if (!token) {
      return;
    }
    apiRequest<ApiNotification[]>("/notifications", {}, token)
      .then(setItems)
      .catch(() => setItems([]));
  }, [token]);

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
          contentContainerStyle={{ paddingBottom: spacing.md }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.message, { color: colors.text }]}>{item.message}</Text>
              <Text style={{ color: colors.textSecondary }}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.textSecondary }}>Пока нет новых уведомлений.</Text>
          }
        />
      </View>
    </Screen>
  );
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
  message: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6
  }
});
