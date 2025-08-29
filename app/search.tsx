import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { useFilterStore } from "../store/filterStore"; // 你已有的筛选 store
import { ResponsiveNavigation } from "../components/ResponsiveNavigation";
import { ResponsiveHeader } from "../components/ResponsiveHeader";

export default function SearchScreen({ results }: { results: any[] }) {
  const { filterResults, setFilter } = useFilterStore();
  const [isFilterVisible, setFilterVisible] = useState(false);

  // ✅ 只声明一次
  const filteredList = filterResults(results);

  const filters = {
    类型: ["全部", "电影", "剧集", "动漫"],
    地区: ["全部", "大陆", "香港", "台湾", "日本", "韩国", "欧美"],
    年代: ["全部", "2025", "2024", "2023", "2022", "2021"],
    平台: ["全部", "优酷", "爱奇艺", "腾讯视频", "Netflix", "Disney+"],
    排序: ["最新", "最热", "评分最高"],
  };

  const applyFilter = (category: string, value: string) => {
    setFilter(category, value);
  };

  return (
    <ResponsiveNavigation>
      <ResponsiveHeader title="搜索" showBackButton />

      {/* 筛选按钮 */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setFilterVisible(true)}
      >
        <Text style={styles.filterButtonText}>筛选</Text>
      </TouchableOpacity>

      {/* 结果列表 */}
      <FlatList
        data={filteredList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.title}</Text>
          </View>
        )}
      />

      {/* 筛选面板 */}
      <Modal visible={isFilterVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>筛选条件</Text>

            {Object.keys(filters).map((category) => (
              <View key={category} style={styles.filterCategory}>
                <Text style={styles.filterCategoryTitle}>{category}</Text>
                <View style={styles.filterOptions}>
                  {filters[category as keyof typeof filters].map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={styles.filterOption}
                      onPress={() => applyFilter(category, value)}
                    >
                      <Text style={styles.filterOptionText}>{value}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setFilterVisible(false)}
            >
              <Text style={styles.closeButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ResponsiveNavigation>
  );
}

const styles = StyleSheet.create({
  filterButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-end",
    margin: 10,
  },
  filterButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  itemText: {
    fontSize: 16,
  },
  modalContainer: {
    fle
