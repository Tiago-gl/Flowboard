import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme";

type IconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: "primary" | "ghost";
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
};

export function IconButton({
  icon,
  onPress,
  variant = "ghost",
  disabled = false,
  size = "md",
}: IconButtonProps) {
  const { colors } = useTheme();
  
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
  };
  
  const iconColor = disabled ? colors.muted : (variant === "primary" ? colors.surface : colors.text);
  
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { width: sizeMap[size] + 12, height: sizeMap[size] + 12 },
        variant === "primary"
          ? { backgroundColor: colors.accent }
          : { borderColor: colors.border, borderWidth: 1 },
        ...(pressed && !disabled ? [styles.pressed] : []),
        ...(disabled ? [styles.disabled] : []),
      ]}
    >
      <Ionicons name={icon} size={sizeMap[size]} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});
