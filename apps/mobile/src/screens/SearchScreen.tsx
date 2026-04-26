import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";

import { ApiUser, ApiVideo, apiRequest } from "@/api/client";
import { Screen } from "@/components/Screen";
import { useAppTheme } from "@/theme/ThemeProvider";

type SearchResponse = {
  users: ApiUser[];
  videos: ApiVideo[];
};

export function SearchScreen() {
  const { colors, spacing, radius } = useAppTheme();
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
    <Screen>
      <View style={{ padding: spacing.md, gap: spacing.md }}>
        <Text style={[styles.heading, { color: colors.text }]}>Поиск авторов, роликов и хэштегов</Text>
        <TextInput
          value={query}
          onChangeText={submit}
          placeholder="Например: танцы, travel, @creator"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderRadius: radius.md, borderColor: colors.border }]}
        />
        <FlatList
          data={[...results.users, ...results.videos]}
          keyExtractor={(item) => `${"email" in item ? "user" : "video"}-${item.id}`}
          renderItem={({ item }) =>
            "email" in item ? (
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.title, { color: colors.text }]}>{item.full_name}</Text>
                <Text style={{ color: colors.textSecondary }}>@{item.username}</Text>
              </View>
            ) : (
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                <Text style={{ color: colors.textSecondary }}>{item.description}</Text>
              </View>
            )
          }
          ListEmptyComponent={<Text style={{ color: colors.textSecondary }}>Результаты поиска появятся здесь.</Text>}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontWeight: "800"
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  card: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 12
  },
  title: {
    fontSize: 17,
    fontWeight: "700"
  }
});
