import { PropsWithChildren } from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { useTheme } from "../theme";

type CardProps = PropsWithChildren<ViewProps>;

export function Card({ style, children, ...props }: CardProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
});

