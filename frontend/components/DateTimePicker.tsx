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
  if (date.getTime() === today.getTime()) return 'TODAY';
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date.getTime() === tomorrow.getTime()) return 'TOMORROW';
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
}

function formatDisplay(date: Date | null): string {
  if (!date) return 'Pick a date & time';
  return date.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase();
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
    if (result <= now) result.setDate(result.getDate() + 1);
    onChange(result);
    setVisible(false);
  }

  return (
    <>
      <TouchableOpacity style={s.trigger} onPress={() => setVisible(true)} activeOpacity={0.75}>
        <Text style={value ? s.triggerText : s.triggerPlaceholder}>
          {formatDisplay(value)}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setVisible(false)} />
        <View style={s.sheet}>

          {/* Sheet header */}
          <View style={s.sheetHeader}>
            <View style={s.sheetTitleRow}>
              <View style={s.titleBar} />
              <Text style={s.sheetTitle}>DEPART AT</Text>
            </View>
            <TouchableOpacity style={s.cancelBtn} onPress={() => setVisible(false)}>
              <Text style={s.cancelText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Day */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>— DAY —</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
              {days.map((d) => {
                const active = selectedDay.getTime() === d.getTime();
                return (
                  <TouchableOpacity
                    key={d.toISOString()}
                    style={[s.chip, active && s.chipActive]}
                    onPress={() => setSelectedDay(d)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.chipText, active && s.chipTextActive]}>
                      {formatDayLabel(d)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Hour */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>— HOUR —</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
              {HOURS.map((h) => {
                const active = hour === h;
                return (
                  <TouchableOpacity
                    key={h}
                    style={[s.chip, active && s.chipActive]}
                    onPress={() => setHour(h)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.chipText, active && s.chipTextActive]}>
                      {String(h).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Minute */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>— MINUTE —</Text>
            <View style={s.minuteRow}>
              {MINUTES.map((m) => {
                const active = minute === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[s.minuteChip, active && s.chipActive]}
                    onPress={() => setMinute(m)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.chipText, active && s.chipTextActive]}>
                      :{String(m).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Confirm */}
          <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm} activeOpacity={0.75}>
            <Text style={s.confirmText}>CONFIRM</Text>
          </TouchableOpacity>

        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  // Trigger button — matches Input pixel-shadow style
  trigger: {
    height: 52,
    backgroundColor: Colors.surface,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border, borderRadius: Radius.sm,
    justifyContent: 'center', paddingHorizontal: Spacing.md,
  },
  triggerText: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  triggerPlaceholder: { color: Colors.textMuted, fontSize: FontSize.md, fontWeight: '600' },

  overlay: { flex: 1, backgroundColor: '#00000099' },

  // Bottom sheet
  sheet: {
    backgroundColor: Colors.surface,
    borderTopWidth: 4, borderTopColor: Colors.border,
    borderLeftWidth: 0, borderRightWidth: 0,
    padding: Spacing.lg, gap: Spacing.md,
  },

  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.xs,
  },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  titleBar: { width: 4, height: 18, backgroundColor: Colors.primaryDark },
  sheetTitle: {
    color: Colors.text, fontSize: FontSize.lg,
    fontWeight: '900', letterSpacing: 2,
  },
  cancelBtn: {
    width: 32, height: 32,
    backgroundColor: Colors.background,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderBottomWidth: 3, borderRightWidth: 3,
    borderColor: Colors.border, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelText: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '800' },

  section: { gap: Spacing.xs },
  sectionLabel: {
    color: Colors.textMuted, fontSize: FontSize.xs,
    fontWeight: '900', letterSpacing: 2, textAlign: 'center',
  },

  row: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 2 },

  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border, borderRadius: Radius.sm,
    minWidth: 52, alignItems: 'center',
  },
  chipActive: { backgroundColor: Colors.primaryDark },
  chipText: {
    color: Colors.textSecondary, fontSize: FontSize.sm,
    fontWeight: '800', letterSpacing: 0.5,
  },
  chipTextActive: { color: Colors.text },

  minuteRow: { flexDirection: 'row', gap: Spacing.sm },
  minuteChip: {
    flex: 1, paddingVertical: Spacing.sm, alignItems: 'center',
    backgroundColor: Colors.background,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border, borderRadius: Radius.sm,
  },

  confirmBtn: {
    height: 52, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primaryDark,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderBottomWidth: 5, borderRightWidth: 5,
    borderColor: Colors.border, borderRadius: Radius.sm,
    marginTop: Spacing.xs,
  },
  confirmText: { color: Colors.text, fontSize: FontSize.md, fontWeight: '900', letterSpacing: 1.5 },
});
