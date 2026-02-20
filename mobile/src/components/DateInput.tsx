import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { useTheme } from "../theme";

type DateInputProps = TextInputProps & {
  hasError?: boolean;
};

export function DateInput({ hasError = false, style, ...props }: DateInputProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          {
            borderColor: hasError ? colors.danger : colors.border,
            color: colors.text,
            backgroundColor: colors.surface,
            paddingRight: 40,
          },
          style,
        ]}
        {...props}
      />
      <View
        style={[
          styles.iconContainer,
          { borderColor: hasError ? colors.danger : colors.border },
        ]}
      >
        <Text style={[styles.icon, { color: colors.accent }]}>📅</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  iconContainer: {
    position: "absolute",
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    borderLeftWidth: 1,
    paddingLeft: 8,
  },
  icon: {
    fontSize: 18,
    fontWeight: "600",
  },
});
