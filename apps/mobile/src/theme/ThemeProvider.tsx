import React, { createContext, useContext } from "react";
import { Appearance, ColorSchemeName } from "react-native";

import { palette, radius, spacing } from "./tokens";

type ThemeValue = {
  colorScheme: NonNullable<ColorSchemeName>;
  colors: typeof palette.light;
  spacing: typeof spacing;
  radius: typeof radius;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = Appearance.getColorScheme() ?? "light";
  const value: ThemeValue = {
    colorScheme,
    colors: palette[colorScheme],
    spacing,
    radius
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used inside ThemeProvider");
  }
  return context;
}
