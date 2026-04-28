import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { apiRequest } from "@/api/client";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { getScreenBottomPadding } from "@/navigation/tabBarLayout";
import { useAuthStore } from "@/store/auth";
import { useAppTheme } from "@/theme/ThemeProvider";

export function UploadScreen() {
  const token = useAuthStore((state) => state.accessToken);
  const { colors, spacing, radius } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [selectedVideo, setSelectedVideo] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "video/*",
      copyToCacheDirectory: true,
      multiple: false
    });

    if (result.canceled) {
      return;
    }

    setSelectedVideo(result.assets[0] ?? null);
  };

  const submit = async () => {
    if (!token) {
      return;
    }

    if (!selectedVideo?.uri) {
      Alert.alert("Выберите видео", "Сначала выберите ролик из файлов на устройстве.");
      return;
    }

    try {
      setUploading(true);
      const formData = new globalThis.FormData();
      formData.append("file", {
        uri: selectedVideo.uri,
        name: selectedVideo.name ?? "upload.mp4",
        type: selectedVideo.mimeType ?? "video/mp4"
      } as never);

      const upload = await apiRequest<{ video_url: string }>("/videos/upload", {
        method: "POST",
        body: formData
      });

      await apiRequest(
        "/videos",
        {
          method: "POST",
          body: JSON.stringify({
            title,
            description,
            video_url: upload.video_url,
            hashtags: hashtags
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            duration_seconds: 24
          })
        },
        token
      );

      setTitle("");
      setDescription("");
      setHashtags("");
      setSelectedVideo(null);
      Alert.alert("Ролик опубликован", "Видео прошло проверку и уже доступно в ленте.");
    } catch (error) {
      Alert.alert(
        "Ошибка публикации",
        error instanceof Error ? error.message : "Попробуйте еще раз"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Screen edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          gap: spacing.md,
          paddingBottom: getScreenBottomPadding(insets.bottom, spacing.xl)
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.heading, { color: colors.text }]}>Опубликовать новый ролик</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Название"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
              borderRadius: radius.md
            }
          ]}
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Описание"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
              borderRadius: radius.md
            }
          ]}
        />
        <PrimaryButton
          title={selectedVideo ? "Выбрать другой файл" : "Выбрать видео из файлов"}
          onPress={() => void pickVideo()}
        />
        <View
          style={[
            styles.fileCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.md
            }
          ]}
        >
          <Text style={[styles.fileLabel, { color: colors.text }]}>
            {selectedVideo?.name ?? "Файл пока не выбран"}
          </Text>
          <Text style={{ color: colors.textSecondary }}>
            {selectedVideo?.mimeType ?? "Откроется системный выбор файлов на телефоне или ПК"}
          </Text>
        </View>
        <TextInput
          value={hashtags}
          onChangeText={setHashtags}
          placeholder="хэштег1,хэштег2"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
              borderRadius: radius.md
            }
          ]}
        />
        <PrimaryButton
          title={uploading ? "Загружаем..." : "Опубликовать"}
          onPress={() => void submit()}
        />
      </ScrollView>
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
  },
  fileCard: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6
  },
  fileLabel: {
    fontSize: 16,
    fontWeight: "700"
  }
});
