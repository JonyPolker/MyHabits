import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Modal,
  TextInput,
  Platform,
} from "react-native";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const INITIAL_HABITS = [
  { id: "1", title: "Пробежать 10 км", done: false, progress: 32 },
  { id: "2", title: "Прочесть главу книги", done: true, progress: 32 },
];

const pad = (n) => String(n).padStart(2, "0");

export default function App() {
  const [displayDate, setDisplayDate] = useState(new Date(2025, 8, 1));
  const [selectedDate, setSelectedDate] = useState("2025-09-10");
  const [habits, setHabits] = useState(INITIAL_HABITS);
  const [streak, setStreak] = useState(17);
  const [daysRemaining, setDaysRemaining] = useState(17);

  const [modalVisible, setModalVisible] = useState(false);
  const [newHabit, setNewHabit] = useState("");

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  const dateKey = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - firstDay + 1;

      if (dayNumber < 1) {
        const day = previousMonthDays + dayNumber;
        return { day, date: new Date(year, month - 1, day), currentMonth: false };
      }

      if (dayNumber > daysInMonth) {
        const day = dayNumber - daysInMonth;
        return { day, date: new Date(year, month + 1, day), currentMonth: false };
      }

      return { day: dayNumber, date: new Date(year, month, dayNumber), currentMonth: true };
    });
  }, [year, month]);

  const completedCount = habits.filter((habit) => habit.done).length;

  const overallProgress = habits.length
    ? Math.round(habits.reduce((sum, habit) => sum + habit.progress, 0) / habits.length)
    : 0;

  const changeMonth = (offset) => {
    setDisplayDate(new Date(year, month + offset, 1));
  };

  const toggleHabit = (id) => {
    setHabits((current) =>
      current.map((habit) =>
        habit.id === id ? { ...habit, done: !habit.done } : habit
      )
    );
  };

  const addHabit = () => {
    const title = newHabit.trim();
    if (!title) return;

    setHabits((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random()}`,
        title,
        done: false,
        progress: 0,
      },
    ]);

    setNewHabit("");
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#D0CFD5" />

      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* КАЛЕНДАРЬ */}
          <View style={styles.calendar}>
            <View style={styles.monthNavigation}>
              <Pressable onPress={() => changeMonth(-1)} hitSlop={10} style={styles.arrowButton}>
                <Text style={styles.arrow}>‹</Text>
              </Pressable>

              <Pressable style={styles.dropdown} onPress={() => changeMonth(1)}>
                <Text style={styles.dropdownText}>{MONTHS[month]}</Text>
                <Text style={styles.dropdownArrow}>⌄</Text>
              </Pressable>

              <Pressable
                style={styles.dropdown}
                onPress={() => setDisplayDate(new Date(year + 1, month, 1))}
              >
                <Text style={styles.dropdownText}>{year}</Text>
                <Text style={styles.dropdownArrow}>⌄</Text>
              </Pressable>

              <Pressable onPress={() => changeMonth(1)} hitSlop={10} style={styles.arrowButton}>
                <Text style={styles.arrow}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((day) => (
                <Text key={day} style={styles.weekday}>{day}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {calendarDays.map((item, index) => {
                const key = dateKey(item.date);
                const selected = key === selectedDate;

                return (
                  <Pressable
                    key={`${key}-${index}`}
                    style={styles.dayCell}
                    onPress={() => {
                      setSelectedDate(key);
                      if (!item.currentMonth) {
                        setDisplayDate(
                          new Date(item.date.getFullYear(), item.date.getMonth(), 1)
                        );
                      }
                    }}
                  >
                    <View style={[styles.dayInner, selected && styles.selectedDay]}>
                      <Text
                        style={[
                          styles.dayText,
                          !item.currentMonth && styles.otherMonthDay,
                          selected && styles.selectedDayText,
                        ]}
                      >
                        {item.day}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* РАЗДЕЛИТЕЛЬ */}
          <View style={styles.separator} />

          {/* СПИСОК ПРИВЫЧЕК */}
          <View style={styles.habitsList}>
            {habits.map((habit) => (
              <View key={habit.id} style={styles.habitCard}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${habit.progress}%` }]} />
                </View>

                <Pressable onPress={() => toggleHabit(habit.id)} style={styles.habitButton}>
                  <Text
                    numberOfLines={2}
                    style={[styles.habitTitle, habit.done && styles.completedTitle]}
                  >
                    {habit.title}
                  </Text>

                  <View style={[styles.checkbox, habit.done && styles.checkboxChecked]}>
                    {habit.done && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </Pressable>
              </View>
            ))}
          </View>

          {/* СТАТИСТИКА */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Общий прогресс</Text>
              <Text style={styles.statValue}>{overallProgress} %</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Выполнение</Text>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statFootnote}>Подряд</Text>
            </View>
          </View>

          {/* ОСТАВШИЕСЯ ДНИ */}
          <View style={styles.remainingCard}>
            <Text style={styles.remainingLabel}>
              Дней до выработки{"\n"}всех привычек
            </Text>

            <View style={styles.remainingValueContainer}>
              <Text style={styles.remainingValue}>{daysRemaining}</Text>
              <Text style={styles.remainingFootnote}>Дней</Text>
            </View>
          </View>
        </ScrollView>

        {/* ДОБАВИТЬ ПРИВЫЧКУ */}
        <Pressable
          onPress={() => setModalVisible(true)}
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
        >
          <Text style={styles.plus}>+</Text>
        </Pressable>

        {/* МОДАЛЬНОЕ ОКНО */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Новая привычка</Text>

              <TextInput
                value={newHabit}
                onChangeText={setNewHabit}
                placeholder="Например, читать 20 минут"
                placeholderTextColor="#85848B"
                style={styles.input}
                autoFocus
                maxLength={100}
                onSubmitEditing={addHabit}
                returnKeyType="done"
              />

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => {
                    setModalVisible(false);
                    setNewHabit("");
                  }}
                  style={styles.modalButton}
                >
                  <Text style={styles.modalButtonText}>Отмена</Text>
                </Pressable>

                <Pressable onPress={addHabit} style={[styles.modalButton, styles.primaryModalButton]}>
                  <Text style={styles.primaryModalButtonText}>Добавить</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#D0CFD5",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  screen: { flex: 1, backgroundColor: "#D0CFD5" },
  scrollContent: { paddingHorizontal: 29, paddingTop: 14, paddingBottom: 110 },

  calendar: {
    backgroundColor: "#D0CFD5",
    borderWidth: 1,
    borderColor: "#B9B8C0",
    borderRadius: 17,
    paddingHorizontal: 8,
    paddingTop: 9,
    paddingBottom: 4,
  },
  monthNavigation: {
    height: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 23,
    gap: 7,
  },
  arrowButton: { width: 20, height: 32, alignItems: "center", justifyContent: "center" },
  arrow: { color: "#27262D", fontSize: 27, lineHeight: 30, fontWeight: "300" },
  dropdown: {
    flex: 1,
    height: 27,
    borderWidth: 1,
    borderColor: "#B7B6BE",
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  dropdownText: { color: "#25242A", fontSize: 13 },
  dropdownArrow: { fontSize: 16, color: "#34333A", marginTop: -4 },
  weekRow: { flexDirection: "row", marginTop: 14, marginBottom: 5 },
  weekday: { width: `${100 / 7}%`, textAlign: "center", fontSize: 10, color: "#686770" },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: `${100 / 7}%`, height: 37, alignItems: "center", justifyContent: "center" },
  dayInner: { width: 35, height: 35, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  dayText: { fontSize: 14, color: "#242329" },
  otherMonthDay: { color: "#898891" },
  selectedDay: { backgroundColor: "#414047" },
  selectedDayText: { color: "#FFFFFF" },
  separator: { height: 1, backgroundColor: "#B5B4BC", marginTop: 12, marginBottom: 19 },

  habitsList: { gap: 15 },
  habitCard: {
    height: 67,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#C1C0C7",
    paddingHorizontal: 3,
    paddingTop: 4,
    backgroundColor: "#BDBCC4",
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#8C8B94",
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#168DE0", borderRadius: 3 },
  habitButton: {
    flex: 1,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#85848D",
    borderRadius: 19,
    paddingLeft: 13,
    paddingRight: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  habitTitle: { flex: 1, fontSize: 15, color: "#1F1E25" },
  completedTitle: { color: "#242329" },
  checkbox: {
    width: 26,
    height: 26,
    borderWidth: 3,
    borderColor: "#34333A",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#D0CFD5" },
  checkmark: { color: "#25242A", fontSize: 22, fontWeight: "700", lineHeight: 23, marginTop: -3 },

  statsRow: { flexDirection: "row", gap: 16, marginTop: 14 },
  statCard: {
    flex: 1,
    minHeight: 73,
    borderRadius: 17,
    backgroundColor: "#BDBCC4",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 3,
  },
  statLabel: { color: "#414047", fontSize: 13, fontWeight: "500", textAlign: "center" },
  statValue: {
    color: "#484750",
    fontSize: 32,
    fontWeight: "600",
    lineHeight: 34,
    fontVariant: ["tabular-nums"],
  },
  statFootnote: { color: "#414047", fontSize: 12, fontWeight: "600", marginTop: -1 },

  remainingCard: {
    marginTop: 10,
    minHeight: 74,
    borderRadius: 18,
    backgroundColor: "#BDBCC4",
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  remainingLabel: { flex: 1, color: "#484750", fontSize: 19, lineHeight: 22 },
  remainingValueContainer: { alignItems: "center", marginLeft: 8 },
  remainingValue: {
    fontSize: 31,
    lineHeight: 33,
    color: "#484750",
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  remainingFootnote: { fontSize: 12, color: "#414047", fontWeight: "600" },

  addButton: {
    position: "absolute",
    right: 29,
    bottom: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#25242B",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D0CFD5",
  },
  addButtonPressed: { opacity: 0.65, transform: [{ scale: 0.96 }] },
  plus: { color: "#25242B", fontSize: 35, lineHeight: 39, fontWeight: "300", marginTop: -2 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(25, 24, 31, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: { width: "100%", maxWidth: 400, backgroundColor: "#D0CFD5", borderRadius: 22, padding: 22 },
  modalTitle: { fontSize: 21, fontWeight: "600", color: "#25242B", marginBottom: 16 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#8C8B94",
    borderRadius: 12,
    paddingHorizontal: 12,
    color: "#25242B",
    fontSize: 15,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 18 },
  modalButton: { paddingHorizontal: 15, paddingVertical: 11, borderRadius: 10 },
  modalButtonText: { color: "#34333A", fontSize: 14 },
  primaryModalButton: { backgroundColor: "#414047" },
  primaryModalButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
});