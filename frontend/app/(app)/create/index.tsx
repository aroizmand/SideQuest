import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { DateTimePicker } from "@/components/DateTimePicker";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useCreateQuest } from "@/hooks/useCreateQuest";
import { useCategories } from "@/hooks/useCategories";
import { useProfileStore } from "@/stores/profileStore";
import { PlacesAutocomplete } from "@/components/PlacesAutocomplete";
import { RetroTitle } from "@/components/RetroTitle";
import { fuzzeCoords } from "@/lib/locationUtils";
import { Colors, FontSize, Spacing, Radius } from "@/constants/theme";
import type { Gender } from "@/types/user";

const GENDER_LABELS: Record<Gender, string> = {
  man: "Men",
  woman: "Women",
  non_binary: "Non-binary",
  prefer_not_to_say: "My gender",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  neighborhood: "",
  addressText: "",
  startsAt: null as Date | null,
  maxParticipants: "6",
  categoryId: null as number | null,
  myGenderOnly: false,
  latExact: null as number | null,
  lngExact: null as number | null,
  latArea: null as number | null,
  lngArea: null as number | null,
  error: "",
};

function SectionLabel({ children }: { children: string }) {
  return (
    <View style={sec.row}>
      <View style={sec.bar} />
      <Text style={sec.text}>{children}</Text>
    </View>
  );
}

export default function CreateScreen() {
  const router = useRouter();
  const { createQuest, loading, error: createError } = useCreateQuest();
  const { categories } = useCategories();
  const myGender =
    useProfileStore((s) => s.profile?.gender as Gender | undefined) ?? null;

  const [title, setTitle] = useState(EMPTY_FORM.title);
  const [description, setDescription] = useState(EMPTY_FORM.description);
  const [neighborhood, setNeighborhood] = useState(EMPTY_FORM.neighborhood);
  const [startsAt, setStartsAt] = useState<Date | null>(EMPTY_FORM.startsAt);
  const [maxParticipants, setMaxParticipants] = useState(
    EMPTY_FORM.maxParticipants,
  );
  const [categoryId, setCategoryId] = useState<number | null>(
    EMPTY_FORM.categoryId,
  );
  const [myGenderOnly, setMyGenderOnly] = useState(EMPTY_FORM.myGenderOnly);
  const [latExact, setLatExact] = useState(EMPTY_FORM.latExact);
  const [lngExact, setLngExact] = useState(EMPTY_FORM.lngExact);
  const [latArea, setLatArea] = useState(EMPTY_FORM.latArea);
  const [lngArea, setLngArea] = useState(EMPTY_FORM.lngArea);
  const [addressText, setAddressText] = useState(EMPTY_FORM.addressText);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [error, setError] = useState(EMPTY_FORM.error);

  const maxCount = parseInt(maxParticipants, 10) || 6;

  function resetForm() {
    setTitle(EMPTY_FORM.title);
    setDescription(EMPTY_FORM.description);
    setNeighborhood(EMPTY_FORM.neighborhood);
    setStartsAt(EMPTY_FORM.startsAt);
    setMaxParticipants(EMPTY_FORM.maxParticipants);
    setCategoryId(EMPTY_FORM.categoryId);
    setMyGenderOnly(EMPTY_FORM.myGenderOnly);
    setLatExact(EMPTY_FORM.latExact);
    setLngExact(EMPTY_FORM.lngExact);
    setLatArea(EMPTY_FORM.latArea);
    setLngArea(EMPTY_FORM.lngArea);
    setAddressText(EMPTY_FORM.addressText);
    setLocationError("");
    setError(EMPTY_FORM.error);
  }

  function handlePlaceSelect(place: { name: string; address: string; lat: number; lng: number }) {
    const { lat_area, lng_area } = fuzzeCoords(place.lat, place.lng);
    setNeighborhood(place.name);
    setAddressText(place.address);
    setLatExact(place.lat);
    setLngExact(place.lng);
    setLatArea(lat_area);
    setLngArea(lng_area);
    setLocationError("");
  }

  function handlePlaceClear() {
    setLatExact(null);
    setLngExact(null);
    setLatArea(null);
    setLngArea(null);
    setAddressText("");
  }

  async function handleSetLocation() {
    setLocating(true);
    setLocationError("");
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationError("Location permission denied. Enable it in settings.");
      setLocating(false);
      return;
    }
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { lat_area, lng_area } = fuzzeCoords(
      pos.coords.latitude,
      pos.coords.longitude
    );
    setLatExact(pos.coords.latitude);
    setLngExact(pos.coords.longitude);
    setLatArea(lat_area);
    setLngArea(lng_area);
    setAddressText("");
    setLocating(false);
  }

  async function handleCreate() {
    if (
      !title.trim() ||
      !description.trim() ||
      !neighborhood.trim() ||
      !startsAt ||
      !categoryId
    ) {
      setError("Fill in all fields and pick a category.");
      return;
    }
    if (!latExact || !lngExact || !latArea || !lngArea) {
      setError("Search for a place or tap USE MY LOCATION.");
      return;
    }
    if (title.trim().length < 5) {
      setError("Title must be at least 5 characters.");
      return;
    }
    if (description.trim().length < 20) {
      setError(
        `Description needs ${20 - description.trim().length} more characters.`,
      );
      return;
    }
    if (description.trim().length > 500) {
      setError("Description must be under 500 characters.");
      return;
    }
    if (startsAt <= new Date()) {
      setError("Choose a future date and time.");
      return;
    }
    if (maxCount < 2 || maxCount > 6) {
      setError("Participants must be between 2 and 6.");
      return;
    }
    setError("");

    const quest = await createQuest({
      title: title.trim(),
      description: description.trim(),
      neighborhood: neighborhood.trim(),
      address_text: addressText || undefined,
      lat_exact: latExact,
      lng_exact: lngExact,
      lat_area: latArea,
      lng_area: lngArea,
      starts_at: startsAt.toISOString(),
      max_participants: maxCount,
      category_id: categoryId,
      gender_restriction: myGenderOnly && myGender
        ? ({ man: 'men_only', woman: 'women_only', non_binary: 'non_binary_welcome' } as Record<string, string>)[myGender] ?? 'all'
        : 'all',
    });

    if (quest) {
      resetForm();
      router.push("/(app)/my-quests");
    }
  }

  const genderLabel = myGender ? GENDER_LABELS[myGender] : "My gender";

  return (
    <Screen edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <RetroTitle>CREATE YOUR OWN</RetroTitle>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.section}>
          <SectionLabel>MISSION TITLE</SectionLabel>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="Saturday hike at Nose Hill"
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <SectionLabel>BRIEFING</SectionLabel>
          <Input
            value={description}
            onChangeText={(t) => setDescription(t.slice(0, 500))}
            placeholder="What's the plan? What should people bring?"
            multiline
            numberOfLines={4}
          />
          <Text style={styles.charCount}>
            {description.length}/500
            {description.length < 20 && description.length > 0
              ? `  (${20 - description.length} more to go)`
              : ""}
          </Text>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <SectionLabel>RALLY POINT</SectionLabel>
          <PlacesAutocomplete
            onSelect={handlePlaceSelect}
            onClear={handlePlaceClear}
          />
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>
          <TouchableOpacity
            style={[styles.locationBtn, !!latExact && !addressText && styles.locationBtnSet]}
            onPress={handleSetLocation}
            activeOpacity={0.7}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator size="small" color={Colors.text} />
            ) : (
              <>
                <Ionicons
                  name={latExact && !addressText ? "location" : "location-outline"}
                  size={15}
                  color={latExact && !addressText ? Colors.text : Colors.textMuted}
                />
                <Text style={[styles.locationBtnText, !!latExact && !addressText && styles.locationBtnTextSet]}>
                  {latExact && !addressText ? "LOCATION SET ✓" : "USE MY LOCATION"}
                </Text>
              </>
            )}
          </TouchableOpacity>
          {latExact && !addressText && (
            <Input
              value={neighborhood}
              onChangeText={setNeighborhood}
              placeholder="Area name (e.g. Kensington)"
            />
          )}
          {locationError ? (
            <Text style={styles.locationErr}>{locationError}</Text>
          ) : null}
        </View>

        {/* Date */}
        <View style={styles.section}>
          <SectionLabel>DEPART AT</SectionLabel>
          <DateTimePicker value={startsAt} onChange={setStartsAt} />
        </View>

        {/* Max participants */}
        <View style={styles.section}>
          <SectionLabel>CREW SIZE (2 – 6)</SectionLabel>
          <View style={styles.countRow}>
            {[2, 3, 4, 5, 6].map((n) => (
              <TouchableOpacity
                key={n}
                style={[
                  styles.countBtn,
                  maxCount === n && styles.countBtnActive,
                ]}
                onPress={() => setMaxParticipants(String(n))}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.countText,
                    maxCount === n && styles.countTextActive,
                  ]}
                >
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <SectionLabel>QUEST TYPE</SectionLabel>
          <View style={styles.chipGrid}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c.category_id}
                style={[
                  styles.chip,
                  categoryId === c.category_id && styles.chipActive,
                ]}
                onPress={() => setCategoryId(c.category_id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    categoryId === c.category_id && styles.chipTextActive,
                  ]}
                >
                  {c.name.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Visibility */}
        <View style={styles.section}>
          <SectionLabel>OPEN TO</SectionLabel>
          <View style={styles.visRow}>
            <TouchableOpacity
              style={[styles.visBtn, !myGenderOnly && styles.visBtnActive]}
              onPress={() => setMyGenderOnly(false)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.visText, !myGenderOnly && styles.visTextActive]}
              >
                EVERYONE
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.visBtn, myGenderOnly && styles.visBtnActive]}
              onPress={() => setMyGenderOnly(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.visText, myGenderOnly && styles.visTextActive]}
              >
                {genderLabel.toUpperCase()} ONLY
              </Text>
            </TouchableOpacity>
          </View>
          {myGenderOnly && (
            <Text style={styles.visHint}>
              Only {genderLabel.toLowerCase()} will see this quest in their
              feed.
            </Text>
          )}
        </View>

        {(error || createError) && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error || createError}</Text>
          </View>
        )}

        <Button
          label="POST QUEST"
          onPress={handleCreate}
          loading={loading}
          disabled={
            !title || !description || !neighborhood || !startsAt || !categoryId
          }
        />

        <View style={{ height: Spacing.lg }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 4,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.primaryDark,
    alignItems: "center",
    gap: 2,
  },
  content: { padding: Spacing.lg, gap: Spacing.lg },

  section: { gap: Spacing.sm },

  charCount: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: "700",
    textAlign: "right",
    marginTop: 2,
  },

  // Participant count buttons
  countRow: { flexDirection: "row", gap: Spacing.sm },
  countBtn: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.surface,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  countBtnActive: { backgroundColor: Colors.primaryDark },
  countText: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    fontWeight: "800",
  },
  countTextActive: { color: Colors.text },

  // Category chips
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
  },
  chipActive: { backgroundColor: Colors.primaryDark },
  chipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  chipTextActive: { color: Colors.text },

  // Visibility toggle
  visRow: { flexDirection: "row", gap: Spacing.sm },
  visBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
  },
  visBtnActive: { backgroundColor: Colors.primaryDark },
  visText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: "800",
    letterSpacing: 1,
  },
  visTextActive: { color: Colors.text },
  visHint: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: "600",
    marginTop: 2,
  },

  // "or" divider
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  orLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
  },
  orText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: "800",
    letterSpacing: 1,
  },

  // Location button
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
  },
  locationBtnSet: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  locationBtnText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: "800",
    letterSpacing: 1,
  },
  locationBtnTextSet: {
    color: Colors.text,
  },
  locationErr: {
    color: Colors.error,
    fontSize: FontSize.xs,
    fontWeight: "600",
  },

  // Error
  errorBox: {
    backgroundColor: `${Colors.error}22`,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.error,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  errorText: { color: Colors.error, fontSize: FontSize.sm, fontWeight: "700" },
});

const sec = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: 2,
  },
  bar: {
    width: 4,
    height: 14,
    backgroundColor: Colors.primaryDark,
    borderRadius: 0,
  },
  text: {
    color: Colors.text,
    fontSize: FontSize.xs,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
