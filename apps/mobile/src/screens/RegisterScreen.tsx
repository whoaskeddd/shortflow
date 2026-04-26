import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAuthStore } from "@/store/auth";
import { useAppTheme } from "@/theme/ThemeProvider";

export function RegisterScreen({ onLoginPress }: { onLoginPress: () => void }) {
  const { colors, spacing, radius } = useAppTheme();
  const signUp = useAuthStore((state) => state.signUp);
  const loading = useAuthStore((state) => state.loading);
  const [fullName, setFullName] = useState("ShortFlow Creator");
  const [username, setUsername] = useState("creator");
  const [email, setEmail] = useState("creator@shortflow.app");
  const [password, setPassword] = useState("password123");

  const submit = async () => {
    try {
      await signUp({
        full_name: fullName,
        username,
        email,
        password
      });
    } catch (error) {
      Alert.alert("Ошибка регистрации", error instanceof Error ? error.message : "Попробуйте еще раз");
    }
  };

  return (
    <Screen>
      <View style={[styles.container, { padding: spacing.lg }]}>
        <Text style={[styles.title, { color: colors.text }]}>Создайте аккаунт ShortFlow</Text>
        <TextInput
          placeholder="Ваше имя"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: radius.md }]}
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          autoCapitalize="none"
          placeholder="Имя пользователя"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: radius.md }]}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          autoCapitalize="none"
          placeholder="Почта"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: radius.md }]}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          secureTextEntry
          placeholder="Пароль"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: radius.md }]}
          value={password}
          onChangeText={setPassword}
        />
        <PrimaryButton title={loading ? "Создаем..." : "Создать аккаунт"} onPress={submit} />
        <Text onPress={onLoginPress} style={[styles.link, { color: colors.accent }]}>
          Уже есть аккаунт? Войти
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: 16
  },
  title: {
    fontSize: 32,
    fontWeight: "800"
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  link: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600"
  }
});
