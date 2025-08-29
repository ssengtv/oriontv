import React, { useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import movies from "../data/movies.json";

const YEARS = [0, 2025, 2024, 2023, 2022];

export default function HomeScreen() {
  const [year, setYear] = useState<number>(0);
  const { width } = useWindowDimensions();

  const filtered = useMemo(() => {
    if (!year) return movies;
    return movies.filter((m) => m.year === year);
  }, [year]);

  const numColumns = width >= 1200 ? 6 : width >= 900 ? 5 : width >= 600 ? 4 : 3;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>OrionTV</Text>

      {/* Year Filter */}
      <View style={styles.filterRow}>
        {YEARS.map((y) => (
          <Pressable
            key={y}
            onPress={() => setYear(y)}
            style={[styles.chip, year === y && styles.chipActive]}
          >
            <Text style={styles.chipText}>{y === 0 ? "全部年份" : String(y)}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        key={numColumns} // reflow when columns change
        numColumns={numColumns}
        contentContainerStyle={{ paddingHorizontal: 24 }}
        columnWrapperStyle={{ gap: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        renderItem={({ item }) => (
          <Pressable style={styles.card}>
            <View style={styles.poster} />
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardMeta}>{item.year}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0b0c", paddingTop: 24 },
  title: { color: "#fff", fontSize: 28, fontWeight: "700", marginLeft: 24, marginBottom: 12 },
  filterRow: { flexDirection: "row", gap: 12, paddingHorizontal: 24, marginBottom: 12, flexWrap:"wrap" },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#202226" },
  chipActive: { backgroundColor: "#3a82f7" },
  chipText: { color: "#fff", fontSize: 14 },
  card: { flex: 1/3, backgroundColor: "#131416", borderRadius: 12, padding: 12, width: "100%" },
  poster: { backgroundColor: "#2a2c31", borderRadius: 8, height: 120, marginBottom: 8 },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cardMeta: { color: "#9aa0a6", marginTop: 2 }
});
