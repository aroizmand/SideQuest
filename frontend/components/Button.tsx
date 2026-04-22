import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, type ViewStyle, type TextStyle } from 'react-native';
import { Colors, Radius, FontSize, Spacing } from '@/constants/theme';

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
      style={[styles.base, isPrimary ? styles.primary : styles.ghost, (disabled || loading) && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
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
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  labelGhost: {
    color: Colors.textSecondary,
  },
});
