import { StyleSheet, TextInput, TextInputProps } from "react-native";
import { useTheme } from "../theme";

type InputProps = TextInputProps & {
  hasError?: boolean;
};

export function Input({ hasError = false, style, ...props }: InputProps) {
  const { colors } = useTheme();
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      style={[
        styles.input,
        {
          borderColor: hasError ? colors.danger : colors.border,
          color: colors.text,
          backgroundColor: colors.surface,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
});

