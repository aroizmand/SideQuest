import { useRef, useState } from "react";
import { View, Text, PanResponder, StyleSheet } from "react-native";
import { Colors, FontSize, Spacing } from "@/constants/theme";

const MIN = 5;
const MAX = 100;
const STEP = 5;
const TRACK_H = 18;
const THUMB_W = 40;
const THUMB_H = 40;
// Ticks at these km values
const TICK_VALUES = [5, 25, 50, 75, 100];

type Props = {
  value: number;
  onChange: (v: number) => void;
};

export function RadiusSlider({ value, onChange }: Props) {
  const [trackWidth, setTrackWidth] = useState(1);
  // Use a mutable ref so PanResponder callbacks never go stale
  const live = useRef({ tw: 1, onChange });
  live.current.tw = trackWidth;
  live.current.onChange = onChange;

  function snap(x: number): number {
    // x is locationX relative to the wrap, which spans the full width.
    // We subtract the half-thumb offset so value=MIN puts thumb flush left
    // and value=MAX puts thumb flush right.
    const usable = live.current.tw - THUMB_W;
    const ratio = Math.max(0, Math.min(1, (x - THUMB_W / 2) / usable));
    const raw = MIN + ratio * (MAX - MIN);
    return Math.max(MIN, Math.min(MAX, Math.round(raw / STEP) * STEP));
  }

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) =>
        live.current.onChange(snap(e.nativeEvent.locationX)),
      onPanResponderMove: (e) =>
        live.current.onChange(snap(e.nativeEvent.locationX)),
    })
  ).current;

  const pct = (value - MIN) / (MAX - MIN); // 0..1
  // Thumb left edge: maps pct to [0, trackWidth - THUMB_W]
  const thumbLeft = pct * (trackWidth - THUMB_W);
  // Fill width: covers from left edge to thumb center
  const fillWidth = thumbLeft + THUMB_W / 2;

  function tickLeft(km: number): number {
    const p = (km - MIN) / (MAX - MIN);
    return p * (trackWidth - THUMB_W) + THUMB_W / 2;
  }

  return (
    <View style={styles.root}>
      {/* Touch surface + layout measurement */}
      <View
        {...pan.panHandlers}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          setTrackWidth(w);
          live.current.tw = w;
        }}
        style={styles.wrap}
      >
        {/* Track rail — absolutely centered vertically in wrap */}
        <View style={styles.track} pointerEvents="none">
          {/* Filled portion */}
          <View style={[styles.fill, { width: fillWidth }]} />
          {/* Tick notches */}
          {TICK_VALUES.map((km) => (
            <View
              key={km}
              pointerEvents="none"
              style={[styles.tick, { left: tickLeft(km) - 1 }]}
            />
          ))}
        </View>

        {/* Thumb — the "bird" */}
        <View style={[styles.thumb, { left: thumbLeft }]} pointerEvents="none">
          <Text style={styles.grip}>{"▐▌"}</Text>
        </View>
      </View>

      {/* Tick labels */}
      <View style={styles.labels} pointerEvents="none">
        {TICK_VALUES.map((km) => (
          <View
            key={km}
            style={[styles.labelWrap, { left: tickLeft(km) - 14 }]}
          >
            <Text style={styles.labelText}>
              {km === MAX ? "ANY" : `${km}`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  wrap: {
    height: THUMB_H,
    justifyContent: "center",
  },
  track: {
    position: "absolute",
    left: 0,
    right: 0,
    height: TRACK_H,
    top: (THUMB_H - TRACK_H) / 2,
    backgroundColor: Colors.surface,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.border,
    overflow: "visible",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primaryDark,
  },
  tick: {
    position: "absolute",
    top: -3,
    bottom: -3,
    width: 2,
    backgroundColor: Colors.border,
  },
  thumb: {
    position: "absolute",
    width: THUMB_W,
    height: THUMB_H,
    backgroundColor: Colors.primaryDark,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  grip: {
    color: Colors.border,
    fontSize: FontSize.sm,
    fontWeight: "900",
    letterSpacing: -2,
  },
  labels: {
    position: "relative",
    height: 18,
    marginTop: 6,
  },
  labelWrap: {
    position: "absolute",
    width: 28,
    alignItems: "center",
  },
  labelText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs - 1,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
