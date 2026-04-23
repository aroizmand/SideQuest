import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Colors, FontSize, Spacing, Radius } from "@/constants/theme";

function PixelRow() {
  const blocks = [
    "#4EA82A",
    "#F5C300",
    "#4EA82A",
    "#F5C300",
    "#4EA82A",
    "#F5C300",
    "#4EA82A",
    "#F5C300",
  ];
  return (
    <View style={px.row}>
      {blocks.map((color, i) => (
        <View key={i} style={[px.block, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();

  function goTo(mode: "signup" | "login") {
    router.push({ pathname: "/(auth)/phone-entry", params: { mode } } as any);
  }

  return (
    <Screen style={styles.screen}>
      <PixelRow />

      <View style={styles.hero}>
        <View style={styles.logoCard}>
          <Text style={styles.logoEyebrow}>— A NEW ADVENTURE AWAITS —</Text>
          <Text style={styles.logoLine1}>SIDE</Text>
          <Text style={styles.logoLine2}>QUEST</Text>
          <View style={styles.logoDivider} />
          <Text style={styles.tagline}>Real life.{"\n"}Real people.</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button label="Create Account" onPress={() => goTo("signup")} />
        <Button label="Log In" variant="ghost" onPress={() => goTo("login")} />
        <Text style={styles.fine}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>

      <PixelRow />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: "space-between", paddingVertical: Spacing.md },

  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  logoCard: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.xs,
  },
  logoEyebrow: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  logoLine1: {
    color: Colors.accent,
    fontSize: 72,
    fontWeight: "900",
    lineHeight: 72,
    letterSpacing: -2,
  },
  logoLine2: {
    color: Colors.text,
    fontSize: 72,
    fontWeight: "900",
    lineHeight: 72,
    letterSpacing: -2,
  },
  logoDivider: {
    width: "60%",
    height: 4,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  tagline: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 24,
  },

  actions: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  fine: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
});

const px = StyleSheet.create({
  row: { flexDirection: "row", height: 10 },
  block: { flex: 1 },
});
