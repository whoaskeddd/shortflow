import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAuthStore } from "@/store/auth";
import { useAppTheme } from "@/theme/ThemeProvider";

export function ProfileScreen() {
  const { colors, spacing } = useAppTheme();
  const me = useAuthStore((state) => state.me);
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <Screen>
      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
        <View style={[styles.hero, { backgroundColor: colors.surface }]}>
          <Text style={[styles.name, { color: colors.text }]}>{me?.full_name ?? "Гость"}</Text>
          <Text style={{ color: colors.textSecondary }}>@{me?.username ?? "anonymous"}</Text>
          <Text style={{ color: colors.textSecondary }}>{me?.bio || "Биография пока пустая. Добавьте описание автора позже."}</Text>
        </View>
        <View style={[styles.statsRow, { gap: spacing.sm }]}>
          <StatCard title="Статус" value="Онлайн" />
          <StatCard title="Лента" value="Готова" />
          <StatCard title="Публикация" value="Готова" />
        </View>
        <PrimaryButton title="Выйти" onPress={signOut} />
      </View>
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
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800"
  }
});
