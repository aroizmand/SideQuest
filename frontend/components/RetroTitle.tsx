import { View, Text, StyleSheet } from "react-native";
import { Colors, FontSize } from "@/constants/theme";

const DEPTH = 4;
const LAYERS = Array.from({ length: DEPTH }, (_, i) => DEPTH - i); // [4, 3, 2, 1]

type Props = {
  children: string;
  size?: number;
};

export function RetroTitle({ children, size = FontSize.xxl }: Props) {
  return (
    <View style={styles.wrap}>
      {/* Shadow layers rendered first (behind main text) */}
      {LAYERS.map((n) => (
        <Text
          key={n}
          style={[
            styles.base,
            { fontSize: size, top: n, left: n, color: Colors.border },
          ]}
          aria-hidden
        >
          {children}
        </Text>
      ))}
      {/* Main text on top — also gives the container its natural height */}
      <Text style={[styles.base, styles.main, { fontSize: size }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    // Extra padding so the deepest shadow layer isn't clipped
    paddingBottom: DEPTH + 2,
    paddingRight: DEPTH + 2,
  },
  base: {
    position: "absolute",
    fontWeight: "900",
    letterSpacing: 3,
  },
  main: {
    position: "relative",
    color: Colors.cream,
    fontWeight: "900",
    letterSpacing: 3,
  },
});
