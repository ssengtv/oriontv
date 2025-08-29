import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useFilterStore } from "../stores/filterStore";

const options = {
  type: ["全部", "电影", "剧集", "综艺", "动漫"],
  region: ["全部", "香港", "台湾", "内地", "日本", "韩国", "欧美"],
  year: ["全部", "2025", "2024", "2023", "2022", "2021"],
  platform: ["全部", "优酷", "爱奇艺", "腾讯", "Netflix", "Disney+"],
  sort: ["默认", "最新", "标题"],
};

export default function FilterBar() {
  const { setFilter } = useFilterStore();

  return (
    <ScrollView horizontal style={{ flexDirection: "row", marginVertical: 8 }}>
      {Object.entries(options).map(([key, values]) => (
        <View key={key} style={{ marginRight: 12 }}>
          <Text style={{ color: "white", fontWeight: "bold" }}>{key}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {values.map((v) => (
              <TouchableOpacity
                key={v}
                onPress={() => setFilter(key as any, v)}
                style={{ backgroundColor: "#333", padding: 6, borderRadius: 6, margin: 2 }}
              >
                <Text style={{ color: "white" }}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
