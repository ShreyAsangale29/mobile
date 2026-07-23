// components/yoga/CategoryTabs.tsx
import React from "react";
import { ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";

type FilterType =
  | "all"
  | "standing"
  | "sitting"
  | "supine"
  | "prone";

interface Props {
  selectedFilter: FilterType;
  onSelectFilter: (f: FilterType) => void;
}

const TABS: { id: FilterType; label: string }[] = [
  { id: "all", label: "All Asanas" },
  { id: "standing", label: "Standing" },
  { id: "sitting", label: "Sitting" },
  { id: "supine", label: "Supine" },
  { id: "prone", label: "Prone" },
];

export default function CategoryTabs({ selectedFilter, onSelectFilter }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroller}
    >
      {TABS.map((tab) => {
        const active = selectedFilter === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onSelectFilter(tab.id)}
            activeOpacity={0.8}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroller: {
    marginBottom: 14,
  },
  row: {
    gap: 6,
    paddingRight: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(26,20,51,0.5)",
    borderWidth: 1.5,
    borderColor: "rgba(139,92,246,0.22)",
  },
  tabActive: {
    backgroundColor: "rgba(125,83,255,0.2)",
    borderColor: "rgba(125,83,255,0.6)",
  },
  tabText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8A84AD",
  },
  tabTextActive: {
    color: "#B59BFF",
  },
});

export type { FilterType };