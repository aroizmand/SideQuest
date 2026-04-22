import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function Screen({ children, style }: Props) {
  return <SafeAreaView style={[styles.screen, style]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
