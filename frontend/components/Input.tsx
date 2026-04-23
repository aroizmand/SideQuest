import { TextInput, View, Text, StyleSheet, type TextInputProps } from 'react-native';
import { Colors, FontSize, Spacing } from '@/constants/theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, style, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={Colors.placeholder}
        selectionColor={Colors.primary}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.xs },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 52,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  inputError: {
    borderColor: Colors.error,
  },
  error: {
    color: Colors.error,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
