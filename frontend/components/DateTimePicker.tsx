import { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

type Props = {
  value: Date | null;
  onChange: (date: Date) => void;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

function getNext7Days(): Date[] {
  const days: Date[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

function formatDayLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date.getTime() === today.getTime()) return 'Today';
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDisplay(date: Date | null): string {
  if (!date) return 'Pick a date and time';
  return date.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function DateTimePicker({ value, onChange }: Props) {
  const [visible, setVisible] = useState(false);
  const days = getNext7Days();

  const now = new Date();
  const [selectedDay, setSelectedDay] = useState<Date>(days[0]);
  const [hour, setHour] = useState(Math.min(now.getHours() + 1, 23));
  const [minute, setMinute] = useState(0);

  function handleConfirm() {
    const result = new Date(selectedDay);
    result.setHours(hour, minute, 0, 0);
    // Ensure it's in the future
    if (result <= now) {
      result.setDate(result.getDate() + 1);
    }
    onChange(result);
    setVisible(false);
  }

  return (
    <>
      <TouchableOpacity style={s.trigger} onPress={() => setVisible(true)}>
        <Text style={value ? s.triggerText : s.triggerPlaceholder}>
          {formatDisplay(value)}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setVisible(false)} />
        <View style={s.sheet}>
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>Pick date & time</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={s.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.sectionLabel}>Day</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
            {days.map((d) => (
              <TouchableOpacity
                key={d.toISOString()}
                style={[s.chip, selectedDay.getTime() === d.getTime() && s.chipActive]}
                onPress={() => setSelectedDay(d)}
              >
                <Text style={[s.chipText, selectedDay.getTime() === d.getTime() && s.chipTextActive]}>
                  {formatDayLabel(d)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={s.sectionLabel}>Hour</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
            {HOURS.map((h) => (
              <TouchableOpacity
                key={h}
                style={[s.chip, hour === h && s.chipActive]}
                onPress={() => setHour(h)}
              >
                <Text style={[s.chipText, hour === h && s.chipTextActive]}>
                  {String(h).padStart(2, '0')}:00
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={s.sectionLabel}>Minute</Text>
          <View style={s.row}>
            {MINUTES.map((m) => (
              <TouchableOpacity
                key={m}
                style={[s.chip, minute === m && s.chipActive]}
                onPress={() => setMinute(m)}
              >
                <Text style={[s.chipText, minute === m && s.chipTextActive]}>
                  :{String(m).padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm}>
            <Text style={s.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  trigger: {
    height: 52, backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', paddingHorizontal: Spacing.md,
  },
  triggerText: { color: Colors.text, fontSize: FontSize.md },
  triggerPlaceholder: { color: Colors.textMuted, fontSize: FontSize.md },
  overlay: { flex: 1, backgroundColor: '#00000088' },
  sheet: {
    backgroundColor: Colors.surface, borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.sm,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sheetTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  cancel: { color: Colors.textSecondary, fontSize: FontSize.md },
  sectionLabel: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  row: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'nowrap' },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  chipTextActive: { color: Colors.text, fontWeight: '600' },
  confirmBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    height: 52, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm,
  },
  confirmText: { color: Colors.text, fontSize: FontSize.md, fontWeight: '600' },
});
