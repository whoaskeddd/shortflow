import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ApiVideo, normalizeApiAssetUrl } from "@/api/client";
import { useAppTheme } from "@/theme/ThemeProvider";

export function VideoCard({
  video,
  onLike,
  onComment,
  onSave,
  onRepost,
  liked,
  saved,
  reposted,
  bottomInset,
  cardHeight,
  isActive
}: {
  video: ApiVideo;
  onLike: () => void;
  onComment: () => void;
  onSave: () => void;
  onRepost: () => void;
  liked: boolean;
  saved: boolean;
  reposted: boolean;
  bottomInset: number;
  cardHeight: number;
  isActive: boolean;
}) {
  const { colors, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();
  const likeScale = useRef(new Animated.Value(1)).current;
  const videoUrl = normalizeApiAssetUrl(video.video_url);
  const avatarUrl = normalizeApiAssetUrl(video.author.avatar_url);
  const contentBottomInset = bottomInset + 44;

  useEffect(() => {
    if (!liked) {
      likeScale.setValue(1);
      return;
    }
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1.08,
        useNativeDriver: true,
        speed: 14,
        bounciness: 6
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 5
      })
    ]).start();
  }, [liked, likeScale]);

  return (
    <View style={[styles.container, { height: cardHeight }]}>
      <Video
        source={videoUrl ? { uri: videoUrl } : undefined}
        style={StyleSheet.absoluteFill}
        isLooping
        shouldPlay={isActive}
        isMuted={!isActive}
        resizeMode={ResizeMode.COVER}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.28)", "transparent", "rgba(0,0,0,0.88)"]}
        locations={[0, 0.32, 1]}
        style={[
          styles.overlay,
          {
            paddingTop: insets.top + 20,
            paddingBottom: contentBottomInset
          }
        ]}
      >
        <View style={[styles.meta, { padding: spacing.md, paddingBottom: spacing.xl }]}>
          <Text style={styles.author}>@{video.author.username}</Text>
          <Text style={styles.title}>{video.title}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {video.description}
          </Text>
          <Text style={styles.tags}>
            {video.hashtags.map((tag) => `#${tag}`).join(" ")}
          </Text>
        </View>
        <View style={[styles.actions, { padding: spacing.md, paddingBottom: spacing.xl + 10 }]}>
          <AvatarRail username={video.author.username} avatarUrl={avatarUrl} />
          <LikeAction
            count={video.likes_count}
            onPress={onLike}
            active={liked}
            scale={likeScale}
          />
          <Action
            icon="chatbubble-outline"
            count={video.comments_count}
            onPress={onComment}
          />
          <Action
            icon={saved ? "bookmark" : "bookmark-outline"}
            count={video.saves_count}
            onPress={onSave}
            active={saved}
          />
          <Action
            icon={reposted ? "repeat" : "repeat-outline"}
            count={video.reposts_count}
            onPress={onRepost}
            active={reposted}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

function Action({
  icon,
  count,
  onPress,
  active = false
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  count: number;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.action, active && styles.actionActive]}>
      <Ionicons name={icon} size={24} color="#FFFFFF" />
      <Text style={styles.actionCount}>{count}</Text>
    </Pressable>
  );
}

function LikeAction({
  count,
  onPress,
  active,
  scale
}: {
  count: number;
  onPress: () => void;
  active: boolean;
  scale: Animated.Value;
}) {
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPress={onPress} style={[styles.action, active && styles.actionActive]}>
        <Ionicons name={active ? "heart" : "heart-outline"} size={24} color="#FFFFFF" />
        <Text style={styles.actionCount}>{count}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-end",
    backgroundColor: "#000000"
  },
  overlay: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end"
  },
  meta: {
    flex: 1,
    gap: 10,
    paddingRight: 16
  },
  author: {
    color: "#FFFFFF",
    fontSize: 18,
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
  actions: {
    gap: 14,
    alignItems: "center"
  },
  avatarWrap: {
    marginBottom: 2,
    alignItems: "center"
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  avatarLetter: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900"
  },
  action: {
    minWidth: 56,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 4
  },
  actionCount: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700"
  },
  actionActive: {
    opacity: 1
  }
});
