import React, { useState, useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useFilterStore, filterResults } from "../stores/filterStore";
import FilterBar from "../components/FilterBar";

let ResponsiveHeader: any = ({ children }: any) => <Text style={{fontSize:20,fontWeight:"bold"}}>{children}</Text>;
try {
  ResponsiveHeader = require("../components/ResponsiveHeader").default;
} catch {}

let VideoCard: any = ({ item }: any) => <Text>{item?.title ?? "无标题"}</Text>;
try {
  VideoCard = require("../components/VideoCard").default;
} catch {}

export default function Search({ results }: any) {
  const filters = useFilterStore((s) => s);
  const filteredList = useMemo(() => filterResults(results, filters), [results, filters]);

  return (
    <View style={{ flex: 1, backgroundColor: "black", padding: 8 }}>
      <ResponsiveHeader>筛选搜索</ResponsiveHeader>
      <FilterBar />
      <FlatList
        data={filteredList}
        keyExtractor={(item, idx) => (item?.id ?? idx).toString()}
        renderItem={({ item }) => <VideoCard item={item} />}
        ListEmptyComponent={<Text style={{ color: "white" }}>暂无结果</Text>}
      />
    </View>
  );
}
