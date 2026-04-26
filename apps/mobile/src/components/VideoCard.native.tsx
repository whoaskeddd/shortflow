import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ResizeMode, Video } from "expo-av";

import { ApiVideo } from "@/api/client";
import { useAppTheme } from "@/theme/ThemeProvider";

const { height } = Dimensions.get("window");

export function VideoCard({
  video,
  onLike,
  onComment,
  onSave,
  onRepost,
  liked
}: {
  video: ApiVideo;
  onLike: () => void;
  onComment: () => void;
  onSave: () => void;
  onRepost: () => void;
  liked: boolean;
}) {
  const { colors, spacing } = useAppTheme();
  const likeScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!liked) {
      likeScale.setValue(1);
      return;
    }
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1.16,
        useNativeDriver: true,
        speed: 18,
        bounciness: 10
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 18,
        bounciness: 8
      })
    ]).start();
  }, [liked, likeScale]);

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: video.video_url }}
        style={StyleSheet.absoluteFill}
        isLooping
        shouldPlay
        resizeMode={ResizeMode.COVER}
      />
      <LinearGradient colors={["rgba(0,0,0,0.28)", "transparent", "rgba(0,0,0,0.88)"]} locations={[0, 0.32, 1]} style={styles.overlay}>
        <View style={[styles.meta, { padding: spacing.md }]}>
          <View style={styles.liveChip}>
            <Text style={styles.liveChipText}>Для вас</Text>
          </View>
          <Text style={styles.author}>@{video.author.username}</Text>
          <Text style={styles.title}>{video.title}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>{video.description}</Text>
          <Text style={styles.tags}>{video.hashtags.map((tag) => `#${tag}`).join(" ")}</Text>
          <Text style={styles.caption}>Листайте вверх, чтобы перейти к следующему ролику</Text>
        </View>
        <View style={[styles.actions, { padding: spacing.md }]}>
          <AvatarRail username={video.author.username} avatarUrl={video.author.avatar_url} />
          <LikeAction label={`${video.likes_count}`} title="Лайк" onPress={onLike} active={liked} scale={likeScale} />
          <Action label={`${video.comments_count}`} title="Комменты" onPress={onComment} />
          <Action label={`${video.saves_count}`} title="Сохранить" onPress={onSave} />
          <Action label={`${video.reposts_count}`} title="Репост" onPress={onRepost} />
        </View>
      </LinearGradient>
    </View>
  );
}

function Action({ title, label, onPress }: { title: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.action}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function LikeAction({
  title,
  label,
  onPress,
  active,
  scale
}: {
  title: string;
  label: string;
  onPress: () => void;
  active: boolean;
  scale: Animated.Value;
}) {
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPress={onPress} style={[styles.action, active && styles.actionActive]}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionLabel}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function AvatarRail({ username, avatarUrl }: { username: string; avatarUrl: string | null }) {
  return (
    <View style={styles.avatarWrap}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
      ) : (
        <LinearGradient colors={["#0A84FF", "#7C6CFF"]} style={styles.avatarFallback}>
          <Text style={styles.avatarLetter}>{username.slice(0, 1).toUpperCase()}</Text>
        </LinearGradient>
      )}
      <View style={styles.avatarPlus}>
        <Text style={styles.avatarPlusLabel}>+</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height,
    justifyContent: "flex-end",
    backgroundColor: "#000000"
  },
  overlay: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 72
  },
  meta: {
    flex: 1,
    gap: 10,
    paddingRight: 16
  },
  liveChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: 6
  },
  liveChipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1
  },
  author: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800"
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 34
  },
  description: {
    fontSize: 16,
    lineHeight: 23,
    maxWidth: 280
  },
  tags: {
    color: "#C7D2FE",
    fontSize: 15,
    fontWeight: "700"
  },
  caption: {
    color: "#E2E8F0",
    fontSize: 13,
    opacity: 0.9
  },
  actions: {
    gap: 14,
    alignItems: "center"
  },
  avatarWrap: {
    marginBottom: 4,
    alignItems: "center"
  },
  avatarImage: {
    width: 62,
    height: 62,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  avatarFallback: {
    width: 62,
    height: 62,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  avatarLetter: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900"
  },
  avatarPlus: {
    position: "absolute",
    bottom: -6,
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarPlusLabel: {
    color: "#0A84FF",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 18
  },
  action: {
    minWidth: 82,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.18)"
  },
  actionTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800"
  },
  actionLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 2
  },
  actionActive: {
    backgroundColor: "rgba(10,132,255,0.36)"
  }
});
