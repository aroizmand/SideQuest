import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { DateTimePicker } from "@/components/DateTimePicker";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useCreateQuest } from "@/hooks/useCreateQuest";
import { useCategories } from "@/hooks/useCategories";
import { useProfileStore } from "@/stores/profileStore";
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
  startsAt: null as Date | null,
  maxParticipants: "6",
  categoryId: null as number | null,
  myGenderOnly: false,
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
    setError(EMPTY_FORM.error);
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
        <Text style={styles.headerEyebrow}>— QUEST DETAILS —</Text>
        <Text style={styles.headerTitle}>CREATE YOUR OWN</Text>
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

        {/* Neighborhood */}
        <View style={styles.section}>
          <SectionLabel>RALLY POINT</SectionLabel>
          <Input
            value={neighborhood}
            onChangeText={setNeighborhood}
            placeholder="Kensington"
          />
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
  headerEyebrow: {
    color: Colors.text,
    fontSize: FontSize.xs,
    fontWeight: "800",
    letterSpacing: 2,
    opacity: 0.7,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: "900",
    letterSpacing: 2,
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
