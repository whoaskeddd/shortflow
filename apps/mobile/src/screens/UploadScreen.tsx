import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { apiRequest } from "@/api/client";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAuthStore } from "@/store/auth";
import { useAppTheme } from "@/theme/ThemeProvider";

export function UploadScreen() {
  const token = useAuthStore((state) => state.accessToken);
  const { colors, spacing, radius } = useAppTheme();
  const [title, setTitle] = useState("Morning city run");
  const [description, setDescription] = useState("Fast-cut vertical story from downtown.");
  const [videoUrl, setVideoUrl] = useState("https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
  const [hashtags, setHashtags] = useState("running,city,motion");

  const submit = async () => {
    if (!token) {
      return;
    }
    try {
      await apiRequest(
        "/videos",
        {
          method: "POST",
          body: JSON.stringify({
            title,
            description,
            video_url: videoUrl,
            hashtags: hashtags.split(",").map((item) => item.trim()).filter(Boolean),
            duration_seconds: 24
          })
        },
        token
      );
      Alert.alert("Ролик опубликован", "Метаданные видео отправлены в API и готовы для ленты.");
    } catch (error) {
      Alert.alert("Ошибка публикации", error instanceof Error ? error.message : "Попробуйте еще раз");
    }
  };

  return (
    <Screen>
      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
        <Text style={[styles.heading, { color: colors.text }]}>Опубликовать новый ролик</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Название"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: radius.md }]}
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Описание"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: radius.md }]}
        />
        <TextInput
          value={videoUrl}
          onChangeText={setVideoUrl}
          placeholder="Ссылка на видео"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: radius.md }]}
        />
        <TextInput
          value={hashtags}
          onChangeText={setHashtags}
          placeholder="хэштег1,хэштег2"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: radius.md }]}
        />
        <PrimaryButton title="Опубликовать" onPress={submit} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 30,
    fontWeight: "800"
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14
  }
});
