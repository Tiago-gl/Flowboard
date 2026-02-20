import { PropsWithChildren } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function Screen({ scroll = true, contentStyle, children }: ScreenProps) {
  const { colors, isDark } = useTheme();
  const gradientColors = isDark
    ? [colors.bg, colors.bgAlt]
    : [colors.bgAlt, colors.bg];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.container, contentStyle]}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.container, contentStyle]}>{children}</View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
    gap: 16,
  },
});

