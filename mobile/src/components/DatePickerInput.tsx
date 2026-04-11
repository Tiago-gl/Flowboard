import { Pressable, StyleSheet, Text, View, Alert } from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import Svg, { Path, Rect } from "react-native-svg";
import { useTheme } from "../theme";

type DatePickerInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  allowPastDates?: boolean;
};

const formatDateToBR = (date: Date): string => {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const parseBRDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    // YYYY-MM-DD format
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  return new Date();
};

const CalendarIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth={2} />
    <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export function DatePickerInput({
  value,
  onChangeText,
  placeholder = "Selecione uma data",
  allowPastDates = false,
}: DatePickerInputProps) {
  const { colors } = useTheme();

  const displayDate = value
    ? formatDateToBR(parseBRDate(value))
    : placeholder;

  const handlePress = () => {
    try {
      const currentDate = value ? parseBRDate(value) : new Date();
      
      DateTimePickerAndroid.open({
        value: currentDate,
        onChange: (event, date) => {
          if (event.type === "set" && date) {
            // Validar se data é no passado
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            date.setHours(0, 0, 0, 0);

            if (!allowPastDates && date < today) {
              Alert.alert(
                "Data inválida",
                "Não é possível selecionar datas no passado.",
                [{ text: "OK" }]
              );
              return;
            }

            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const monthStr = String(month).padStart(2, "0");
            const dayStr = String(day).padStart(2, "0");
            onChangeText(`${dayStr}-${monthStr}-${year}`);
          }
        },
        mode: "date",
      });
    } catch (error) {
      console.warn(`Error in DatePickerAndroid: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.container,
        {
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.text,
            {
              color: value ? colors.text : colors.muted,
            },
          ]}
        >
          {displayDate}
        </Text>
        <CalendarIcon color={colors.accent} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    fontSize: 14,
    flex: 1,
  },
});
