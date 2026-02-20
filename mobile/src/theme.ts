import { useColorScheme } from "react-native";
import { useThemeStore } from "./store/themeStore";

const lightColors = {
  bg: "rgb(246, 241, 232)",
  bgAlt: "rgb(255, 253, 248)",
  surface: "rgb(255, 255, 255)",
  surfaceElevated: "rgb(255, 255, 255)",
  text: "rgb(24, 29, 33)",
  muted: "rgb(102, 112, 126)",
  border: "rgb(229, 221, 209)",
  accent: "rgb(18, 120, 104)",
  accentStrong: "rgb(12, 88, 76)",
  accentSoft: "rgb(218, 245, 236)",
  warning: "rgb(242, 153, 74)",
  danger: "rgb(207, 76, 76)",
  chart1: "rgb(18, 120, 104)",
  chart2: "rgb(61, 151, 178)",
  chart3: "rgb(242, 153, 74)",
};

const darkColors = {
  bg: "rgb(13, 17, 20)",
  bgAlt: "rgb(18, 23, 28)",
  surface: "rgb(22, 27, 32)",
  surfaceElevated: "rgb(26, 33, 39)",
  text: "rgb(236, 240, 244)",
  muted: "rgb(151, 162, 173)",
  border: "rgb(41, 50, 59)",
  accent: "rgb(88, 214, 186)",
  accentStrong: "rgb(58, 164, 144)",
  accentSoft: "rgb(20, 52, 47)",
  warning: "rgb(242, 153, 74)",
  danger: "rgb(231, 105, 105)",
  chart1: "rgb(88, 214, 186)",
  chart2: "rgb(111, 183, 214)",
  chart3: "rgb(242, 153, 74)",
};

export type ThemeColors = typeof lightColors;

export const themes = {
  light: lightColors,
  dark: darkColors,
};

export const useTheme = () => {
  const systemScheme = useColorScheme() === "dark" ? "dark" : "light";
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const resolvedMode = mode === "system" ? systemScheme : mode;
  const colors = resolvedMode === "dark" ? darkColors : lightColors;

  return {
    colors,
    mode,
    setMode,
    resolvedMode,
    isDark: resolvedMode === "dark",
  };
};

export const withAlpha = (rgbColor: string, alpha: number) => {
  if (!rgbColor.startsWith("rgb(")) return rgbColor;
  return rgbColor.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
};
