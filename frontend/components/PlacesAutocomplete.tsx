import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, Spacing, Radius } from "@/constants/theme";

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? "";
const CALGARY_BIAS = "location=51.0447,-114.0719&radius=50000";

if (__DEV__ && !API_KEY) {
  console.warn(
    "[PlacesAutocomplete] EXPO_PUBLIC_GOOGLE_PLACES_API_KEY is not set — autocomplete will not work.",
  );
}

type Prediction = {
  place_id: string;
  structured_formatting: { main_text: string; secondary_text: string };
};

export type PlaceResult = {
  name: string;
  address: string;
  lat: number;
  lng: number;
};

type DropdownLayout = { top: number; left: number; width: number };

type Props = {
  onSelect: (place: PlaceResult) => void;
  onClear: () => void;
};

export function PlacesAutocomplete({ onSelect, onClear }: Props) {
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(false);
  const [layout, setLayout] = useState<DropdownLayout>({
    top: 0,
    left: 0,
    width: 0,
  });
  const containerRef = useRef<View>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function measureContainer() {
    containerRef.current?.measureInWindow((x, y, width, height) => {
      setLayout({ top: y + height + 4, left: x, width });
    });
  }

  function scheduleRemeasure() {
    // Keyboard animation takes ~300ms; remeasure after it settles
    setTimeout(measureContainer, 350);
  }

  async function fetchPredictions(text: string) {
    if (!API_KEY || text.length < 2) {
      setPredictions([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${API_KEY}&${CALGARY_BIAS}&language=en&types=establishment|geocode`,
      );
      const json = await res.json();
      if (json.status === "OK") setPredictions(json.predictions.slice(0, 5));
      else setPredictions([]);
    } catch {
      setPredictions([]);
    } finally {
      setSearching(false);
    }
  }

  function handleChange(text: string) {
    setQuery(text);
    setSelected(false);
    onClear();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(text), 350);
  }

  async function handleSelect(prediction: Prediction) {
    setPredictions([]);
    setQuery(prediction.structured_formatting.main_text);
    setSearching(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&fields=name,formatted_address,geometry&key=${API_KEY}`,
      );
      const json = await res.json();
      const r = json.result;
      setSelected(true);
      onSelect({
        name: r.name,
        address: r.formatted_address,
        lat: r.geometry.location.lat,
        lng: r.geometry.location.lng,
      });
    } catch {
      // validation in the form will catch the unset location
    } finally {
      setSearching(false);
    }
  }

  function handleClear() {
    setQuery("");
    setPredictions([]);
    setSelected(false);
    onClear();
  }

  return (
    <View ref={containerRef} onLayout={measureContainer} collapsable={false}>
      <View style={[styles.inputBox, selected && styles.inputBoxSet]}>
        <Ionicons
          name={selected ? "location" : "search"}
          size={16}
          color={selected ? Colors.primary : Colors.textMuted}
        />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleChange}
          onFocus={scheduleRemeasure}
          placeholder="Search for a place…"
          placeholderTextColor={Colors.textMuted}
          returnKeyType="search"
          autoCorrect={false}
        />
        {searching ? (
          <ActivityIndicator size="small" color={Colors.textMuted} />
        ) : query.length > 0 ? (
          <TouchableOpacity onPress={handleClear} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Modal renders above the keyboard on all platforms */}
      <Modal
        visible={predictions.length > 0}
        transparent
        animationType="none"
        onRequestClose={() => setPredictions([])}
      >
        {/* Backdrop — tap anywhere outside to dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={() => setPredictions([])}
        />
        {/* Dropdown anchored below the input */}
        <View
          style={[
            styles.dropdown,
            { top: layout.top, left: layout.left, width: layout.width },
          ]}
        >
          {predictions.map((p, i) => (
            <TouchableOpacity
              key={p.place_id}
              style={[
                styles.row,
                i < predictions.length - 1 && styles.rowBorder,
              ]}
              onPress={() => handleSelect(p)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="location-outline"
                size={14}
                color={Colors.primary}
                style={styles.rowIcon}
              />
              <View style={styles.rowText}>
                <Text style={styles.rowMain}>
                  {p.structured_formatting.main_text}
                </Text>
                {p.structured_formatting.secondary_text ? (
                  <Text style={styles.rowSub} numberOfLines={1}>
                    {p.structured_formatting.secondary_text}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {selected && (
        <Text style={styles.hint}>
          Exact address revealed to members when they join.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  inputBoxSet: {
    borderColor: Colors.primary,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: "600",
    padding: 0,
  },
  // Rendered inside Modal — position: absolute anchors it on screen
  dropdown: {
    position: "absolute",
    backgroundColor: Colors.surface,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowIcon: { marginRight: Spacing.sm },
  rowText: { flex: 1 },
  rowMain: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
  rowSub: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: "500",
    marginTop: 1,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: "600",
    marginTop: Spacing.xs,
  },
});
