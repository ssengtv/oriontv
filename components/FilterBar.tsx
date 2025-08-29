
import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { StyledButton } from "@/components/StyledButton";
import { useFilterStore, Filters, SortOrder } from "@/stores/filterStore";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

type Facets = {
  years: string[];
  types: string[];
  regions: string[];
  platforms: string[];
};

export default function FilterBar({ facets }: { facets: Facets }) {
  const { deviceType, spacing } = useResponsiveLayout();
  const { filters, setFilter, clearFilters } = useFilterStore();

  const Section = ({ label, children }:{label:string; children: React.ReactNode}) => (
    <View style={[styles.row, { marginBottom: spacing / 2 }]}>
      <ThemedText type="defaultSemiBold" style={{ width: 64 }}>{label}</ThemedText>
      <View style={[styles.wrap, { gap: spacing / 2 }]}>{children}</View>
    </View>
  );

  const Chip = ({ text, active, onPress }:{text:string; active?:boolean; onPress:()=>void}) => (
    <StyledButton
      onPress={onPress}
      style={[
        styles.chip,
        { paddingHorizontal: spacing, paddingVertical: spacing/3 },
        active ? styles.chipActive : null
      ]}
    >
      <ThemedText type="default">{text}</ThemedText>
    </StyledButton>
  );

  const sortOptions: { key: SortOrder; label: string }[] = [
    { key: "relevance", label: "默认" },
    { key: "year_desc", label: "年代↓" },
    { key: "year_asc", label: "年代↑" },
    { key: "title_asc", label: "标题A-Z" },
    { key: "title_desc", label: "标题Z-A" },
  ];

  return (
    <View style={[styles.container, { padding: spacing }]}>
      <Section label="年代">
        <Chip text="全部" active={!filters.year} onPress={() => setFilter("year", undefined)} />
        {facets.years.slice(0, 20).map((y) => (
          <Chip key={y} text={y} active={filters.year === y} onPress={() => setFilter("year", y)} />
        ))}
      </Section>
      <Section label="类型">
        <Chip text="全部" active={!filters.type} onPress={() => setFilter("type", undefined)} />
        {facets.types.slice(0, 20).map((t) => (
          <Chip key={t} text={t} active={filters.type === t} onPress={() => setFilter("type", t)} />
        ))}
      </Section>
      <Section label="地区">
        <Chip text="全部" active={!filters.region} onPress={() => setFilter("region", undefined)} />
        {facets.regions.slice(0, 20).map((r) => (
          <Chip key={r} text={r} active={filters.region === r} onPress={() => setFilter("region", r)} />
        ))}
      </Section>
      <Section label="平台">
        <Chip text="全部" active={!filters.platform} onPress={() => setFilter("platform", undefined)} />
        {facets.platforms.slice(0, 20).map((p) => (
          <Chip key={p} text={p} active={filters.platform === p} onPress={() => setFilter("platform", p)} />
        ))}
      </Section>
      <Section label="排序">
        {sortOptions.map((s) => (
          <Chip key={s.key} text={s.label} active={filters.sort === s.key} onPress={() => setFilter("sort", s.key)} />
        ))}
        <Chip text="清空筛选" onPress={clearFilters} />
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { },
  row: { flexDirection: "row", alignItems: "center" },
  wrap: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  chip: { borderRadius: 8 },
  chipActive: { },
});
