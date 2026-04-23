import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, type ViewStyle, type TextStyle } from 'react-native';
import { Colors, FontSize, Spacing } from '@/constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
};

export function Button({ label, onPress, variant = 'primary', loading = false, disabled = false, style, labelStyle }: Props) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading
        ? <ActivityIndicator color={isPrimary ? Colors.text : Colors.primary} />
        : <Text style={[styles.label, !isPrimary && styles.labelGhost, labelStyle]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    // Pixel-shadow: thick bottom + right border gives the raised block look
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: Colors.border,
    borderRadius: 2,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  ghost: {
    backgroundColor: Colors.surface,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  labelGhost: {
    color: Colors.textSecondary,
  },
});
