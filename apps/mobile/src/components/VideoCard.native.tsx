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
  const contentBottomInset = bottomInset + 30;

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
        bounciness: 5
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 4
      })
    ]).start();
  }, [liked, likeScale]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, height: cardHeight }]}>
      <Video
        source={videoUrl ? { uri: videoUrl } : undefined}
        style={StyleSheet.absoluteFill}
        isLooping
        shouldPlay={isActive}
        isMuted={!isActive}
        resizeMode={ResizeMode.COVER}
      />
      <LinearGradient
        colors={[
          "rgba(8,8,7,0.66)",
          "rgba(8,8,7,0.08)",
          "rgba(8,8,7,0.44)",
          "rgba(8,8,7,0.94)"
        ]}
        locations={[0, 0.34, 0.66, 1]}
        style={[
          styles.overlay,
          {
            paddingTop: insets.top + 18,
            paddingBottom: contentBottomInset
          }
        ]}
      >
        <View style={[styles.meta, { padding: spacing.md, paddingBottom: spacing.lg }]}>
          <View
            style={[
              styles.copyPanel,
              {
                backgroundColor: colors.surfaceGlass,
                borderColor: colors.border
              }
            ]}
          >
            <Text style={[styles.author, { color: colors.accent }]}>@{video.author.username}</Text>
            <Text numberOfLines={2} style={[styles.title, { color: colors.text }]}>
              {video.title}
            </Text>
            {!!video.description && (
              <Text numberOfLines={3} style={[styles.description, { color: colors.textSecondary }]}>
                {video.description}
              </Text>
            )}
            {video.hashtags.length > 0 && (
              <View style={styles.tagsRow}>
                {video.hashtags.slice(0, 5).map((tag) => (
                  <View
                    key={tag}
                    style={[
                      styles.tagChip,
                      {
                        backgroundColor: "rgba(208,180,118,0.10)",
                        borderColor: colors.border
                      }
                    ]}
                  >
                    <Text style={[styles.tagText, { color: colors.accent }]}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        <View style={[styles.actions, { padding: spacing.md, paddingBottom: spacing.lg + 4 }]}>
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
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: active ? "rgba(208,180,118,0.18)" : "rgba(20,18,15,0.58)",
          borderColor: active ? "rgba(208,180,118,0.36)" : "rgba(245,240,231,0.12)",
          transform: [{ scale: pressed ? 0.96 : 1 }]
        }
      ]}
    >
      <Ionicons name={icon} size={23} color={active ? colors.accent : colors.text} />
      <Text style={[styles.actionCount, { color: active ? colors.accent : colors.textSecondary }]}>
        {count}
      </Text>
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
      <Action icon={active ? "heart" : "heart-outline"} count={count} onPress={onPress} active={active} />
    </Animated.View>
  );
}

function AvatarRail({ username, avatarUrl }: { username: string; avatarUrl: string | null }) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.avatarWrap, { borderColor: colors.border, backgroundColor: colors.surfaceGlass }]}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
      ) : (
        <LinearGradient colors={[colors.accent, colors.primary, colors.mutedGold]} style={styles.avatarFallback}>
          <Text style={styles.avatarLetter}>{username.slice(0, 1).toUpperCase()}</Text>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-end"
  },
  overlay: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end"
  },
  meta: {
    flex: 1,
    paddingRight: 10
  },
  copyPanel: {
    maxWidth: 360,
    gap: 9,
    borderWidth: 1,
    borderRadius: 26,
    padding: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 }
  },
  author: {
    fontSize: 14,
    fontWeight: "800"
  },
  title: {
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 30
  },
  description: {
    fontSize: 15,
    lineHeight: 22
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 2
  },
  tagChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  tagText: {
    fontSize: 12,
    fontWeight: "800"
  },
  actions: {
    gap: 13,
    alignItems: "center"
  },
  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 999,
    borderWidth: 1,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 999
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarLetter: {
    color: "#11100B",
    fontSize: 20,
    fontWeight: "900"
  },
  action: {
    width: 54,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 21,
    paddingVertical: 7,
    gap: 3
  },
  actionCount: {
    fontSize: 12,
    fontWeight: "800"
  }
});
