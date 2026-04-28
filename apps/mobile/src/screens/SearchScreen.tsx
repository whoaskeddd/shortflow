import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ApiUser, ApiVideo, apiRequest } from "@/api/client";
import { Screen } from "@/components/Screen";
import { getScreenBottomPadding } from "@/navigation/tabBarLayout";
import { useAppTheme } from "@/theme/ThemeProvider";

type SearchResponse = {
  users: ApiUser[];
  videos: ApiVideo[];
};

export function SearchScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse>({ users: [], videos: [] });

  const submit = async (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults({ users: [], videos: [] });
      return;
    }
    const response = await apiRequest<SearchResponse>(`/search?q=${encodeURIComponent(text)}`);
    setResults(response);
  };

  return (
    <Screen edges={["top", "left", "right", "bottom"]}>
      <View
        style={{
          flex: 1,
          padding: spacing.lg,
          gap: spacing.md,
          paddingBottom: getScreenBottomPadding(insets.bottom)
        }}
      >
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>Discover</Text>
          <Text style={[styles.heading, { color: colors.text }]}>Поиск</Text>
        </View>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.surfaceGlass,
              borderColor: colors.border,
              borderRadius: radius.lg
            }
          ]}
        >
          <Ionicons name="search" size={20} color={colors.accent} />
          <TextInput
            value={query}
            onChangeText={submit}
            placeholder="Авторы, ролики, хэштеги"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text }]}
          />
        </View>
        <FlatList
          data={[...results.users, ...results.videos]}
          contentContainerStyle={{ paddingBottom: spacing.md }}
          keyExtractor={(item) => `${"email" in item ? "user" : "video"}-${item.id}`}
          renderItem={({ item }) =>
            "email" in item ? (
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
                <Text style={[styles.title, { color: colors.text }]}>{item.full_name}</Text>
                <Text style={{ color: colors.textSecondary }}>@{item.username}</Text>
              </View>
            ) : (
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
                <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                <Text numberOfLines={2} style={{ color: colors.textSecondary, lineHeight: 21 }}>
                  {item.description}
                </Text>
              </View>
            )
          }
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.textSecondary }]}>
              Результаты поиска появятся здесь.
            </Text>
          }
        />
      </View>
    </Screen>
  );
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
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 15,
    gap: 10
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16
  },
  card: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 5
  },
  title: {
    fontSize: 17,
    fontWeight: "800"
  },
  empty: {
    lineHeight: 22
  }
});
