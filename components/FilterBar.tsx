import React, { useMemo, useState } from "react";
import { View, Modal, Pressable, ScrollView, StyleSheet, Platform } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { StyledButton } from "@/components/StyledButton";
import { SearchResult, api } from "@/services/api";
import { useFilterStore, guessRegion, SortOrder } from "@/stores/filterStore";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

type Props = {
  results: SearchResult[];
};

type SourceInfo = { key: string; name: string };

export const FilterBar: React.FC<Props> = ({ results }) => {
  const { isTV, isMobile, minTouchTarget } = useResponsiveLayout();
  const [visible, setVisible] = useState(false);
  const {
    selectedTypes, selectedRegions, selectedYears, selectedSources,
    sortOrder,
    toggleType, toggleRegion, toggleYear, toggleSource,
    setSortOrder, clearAll, filterResults
  } = useFilterStore();

  // collect options from current results
  const { types, years, regions, sources } = useMemo(() => {
    const typeSet = new Set<string>();
    const yearSet = new Set<string>();
    const regionSet = new Set<string>();
    const sourceMap = new Map<string, string>(); // key->name

    results.forEach((r) => {
      // 类型
      (r.class || "").split(/[,/|、\s]+/).filter(Boolean).forEach((t) => typeSet.add(t));
      // 年份
      if (r.year) yearSet.add(r.year);
      // 地区（启发式）
      const region = guessRegion(r);
      if (region) regionSet.add(region);
      // 平台
      sourceMap.set(r.source, r.source_name || r.source);
    });

    // sort sets
    const typeList = Array.from(typeSet).sort((a,b)=>a.localeCompare(b, "zh-Hans-CN"));
    const yearList = Array.from(yearSet).sort((a,b)=>parseInt(b||"0")-parseInt(a||"0"));
    const regionList = Array.from(regionSet).sort((a,b)=>a.localeCompare(b, "zh-Hans-CN"));
    const sourceList: SourceInfo[] = Array.from(sourceMap.entries()).map(([key, name]) => ({ key, name }))
      .sort((a,b)=>a.name.localeCompare(b.name, "zh-Hans-CN"));

    return { types: typeList, years: yearList, regions: regionList, sources: sourceList };
  }, [results]);

  const dynamic = getStyles(isMobile, minTouchTarget);

  const activeCount = selectedTypes.size + selectedRegions.size + selectedYears.size + selectedSources.size + (sortOrder ? 1 : 0);

  return (
    <View style={dynamic.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ThemedText style={dynamic.label}>筛选</ThemedText>
        <StyledButton style={dynamic.chip} onPress={() => setVisible(true)}>
          <ThemedText>打开筛选{activeCount ? `（${activeCount}）` : ""}</ThemedText>
        </StyledButton>
        <StyledButton style={dynamic.chip} onPress={() => setSortOrder(sortOrder === "yearDesc" ? "yearAsc" : "yearDesc")}>
          <ThemedText>{sortOrder === "yearDesc" ? "排序：最新→最旧" : "排序：最旧→最新"}</ThemedText>
        </StyledButton>
        {Array.from(selectedYears).slice(0,3).map((y)=> (
          <ThemedText key={y} style={dynamic.activeTag}>年份：{y}</ThemedText>
        ))}
        {Array.from(selectedTypes).slice(0,2).map((t)=> (
          <ThemedText key={t} style={dynamic.activeTag}>类型：{t}</ThemedText>
        ))}
        {Array.from(selectedSources).slice(0,2).map((s)=> (
          <ThemedText key={s} style={dynamic.activeTag}>平台：{sources.find(x=>x.key===s)?.name || s}</ThemedText>
        ))}
        {Array.from(selectedRegions).slice(0,2).map((r)=> (
          <ThemedText key={r} style={dynamic.activeTag}>地区：{r}</ThemedText>
        ))}
        {activeCount>0 && (
          <StyledButton style={[dynamic.chip, {marginLeft: 12}]} onPress={clearAll}>
            <ThemedText>清空</ThemedText>
          </StyledButton>
        )}
      </ScrollView>

      {/* Modal for full control */}
      <Modal animationType="fade" visible={visible} transparent onRequestClose={()=>setVisible(false)}>
        <Pressable style={dynamic.backdrop} onPress={()=>setVisible(false)} />
        <View style={dynamic.modal}>
          <ScrollView contentContainerStyle={{paddingBottom: 24}}>
            <ThemedText style={dynamic.sectionTitle}>年代</ThemedText>
            <View style={dynamic.grid}>
              {years.map((y)=>{
                const sel = selectedYears.has(y);
                return (
                  <Pressable key={y} style={[dynamic.option, sel && dynamic.optionActive]} onPress={()=>toggleYear(y)}>
                    <ThemedText style={sel?dynamic.optionTextActive:undefined}>{y}</ThemedText>
                  </Pressable>
                )
              })}
            </View>

            <ThemedText style={dynamic.sectionTitle}>类型</ThemedText>
            <View style={dynamic.grid}>
              {types.map((t)=>{
                const sel = selectedTypes.has(t);
                return (
                  <Pressable key={t} style={[dynamic.option, sel && dynamic.optionActive]} onPress={()=>toggleType(t)}>
                    <ThemedText style={sel?dynamic.optionTextActive:undefined}>{t}</ThemedText>
                  </Pressable>
                )
              })}
            </View>

            {regions.length>0 && (
              <>
                <ThemedText style={dynamic.sectionTitle}>地区</ThemedText>
                <View style={dynamic.grid}>
                  {regions.map((r)=>{
                    const sel = selectedRegions.has(r);
                    return (
                      <Pressable key={r} style={[dynamic.option, sel && dynamic.optionActive]} onPress={()=>toggleRegion(r)}>
                        <ThemedText style={sel?dynamic.optionTextActive:undefined}>{r}</ThemedText>
                      </Pressable>
                    )
                  })}
                </View>
              </>
            )}

            <ThemedText style={dynamic.sectionTitle}>平台</ThemedText>
            <View style={dynamic.grid}>
              {sources.map(({key,name})=>{
                const sel = selectedSources.has(key);
                return (
                  <Pressable key={key} style={[dynamic.option, sel && dynamic.optionActive]} onPress={()=>toggleSource(key)}>
                    <ThemedText style={sel?dynamic.optionTextActive:undefined}>{name}</ThemedText>
                  </Pressable>
                )
              })}
            </View>

            <ThemedText style={dynamic.sectionTitle}>排序</ThemedText>
            <View style={dynamic.grid}>
              {[
                {k: "yearDesc", label: "最新→最旧"},
                {k: "yearAsc", label: "最旧→最新"},
                {k: "titleAsc", label: "名称 A→Z"},
                {k: "titleDesc", label: "名称 Z→A"},
              ].map(({k,label})=>{
                const sel = sortOrder === (k as SortOrder);
                return (
                  <Pressable key={k} style={[dynamic.option, sel && dynamic.optionActive]} onPress={()=>setSortOrder(k as SortOrder)}>
                    <ThemedText style={sel?dynamic.optionTextActive:undefined}>{label}</ThemedText>
                  </Pressable>
                )
              })}
            </View>

            <View style={{height: 12}} />
            <StyledButton onPress={()=>setVisible(false)} style={dynamic.applyBtn}>
              <ThemedText style={dynamic.applyText}>完成</ThemedText>
            </StyledButton>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (isMobile: boolean, minTouchTarget: number) => StyleSheet.create({
  container: {
    paddingHorizontal: isMobile ? 12 : 24,
    paddingVertical: 8,
  },
  label: {
    marginRight: 8,
    opacity: 0.8,
  },
  chip: {
    height: isMobile ? minTouchTarget : 40,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginRight: 8,
  },
  activeTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 6,
  },
  backdrop: {
    position: "absolute", left: 0, top: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)",
  },
  modal: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    maxHeight: "80%",
    backgroundColor: "rgba(18,18,18,0.98)",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  sectionTitle: { fontSize: isMobile ? 16 : 18, marginTop: 10, marginBottom: 8, fontWeight: "600" },
  grid: {
    flexDirection: "row", flexWrap: "wrap",
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
    marginRight: 8,
    marginBottom: 8,
  },
  optionActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  optionTextActive: {
    color: "#fff",
  },
  applyBtn: {
    height: isMobile ? minTouchTarget : 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  applyText: { fontSize: isMobile ? 16 : 18, fontWeight: "600" },
});

export default FilterBar;
