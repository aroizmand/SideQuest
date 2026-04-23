import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { StyleSheet, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: Edge[];
};

export function Screen({ children, style, edges }: Props) {
  return (
    <SafeAreaView edges={edges} style={[styles.screen, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
