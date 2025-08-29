import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Alert, Keyboard } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import VideoCard from '@/components/VideoCard';
import VideoLoadingAnimation from '@/components/VideoLoadingAnimation';
import { api, SearchResult } from '@/services/api';
import { Search } from 'lucide-react-native';
import { StyledButton } from '@/components/StyledButton';
import { useRemoteControlStore } from '@/stores/remoteControlStore';
import { RemoteControlModal } from '@/components/RemoteControlModal';
import { useSettingsStore } from '@/stores/settingsStore';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import CustomScrollView from '@/components/CustomScrollView';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { getCommonResponsiveStyles } from '@/utils/ResponsiveStyles';
import ResponsiveNavigation from '@/components/navigation/ResponsiveNavigation';
import ResponsiveHeader from '@/components/navigation/ResponsiveHeader';
import { DeviceUtils } from '@/utils/DeviceUtils';
import Logger from '@/utils/Logger';
import FilterBar from '@/components/FilterBar';
import { useFilterStore } from '@/stores/filterStore';

const logger = Logger.withTag('SearchScreen');

export default function SearchScreen() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const textInputRef = useRef<TextInput>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { showModal: showRemoteModal, lastMessage, targetPage, clearMessage } = useRemoteControlStore();
  const { remoteInputEnabled } = useSettingsStore();
  const router = useRouter();

  // 响应式布局
  const responsiveConfig = useResponsiveLayout();
  const commonStyles = getCommonResponsiveStyles(responsiveConfig);
  const { deviceType, spacing } = responsiveConfig;

  useEffect(() => {
    if (lastMessage && targetPage === 'search') {
      logger.debug('Received remote input:', lastMessage);
      const realMessage = lastMessage.split('_')[0];
      setKeyword(realMessage);
      handleSearch(realMessage);
      clearMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage, targetPage]);

  const handleSearch = async (text?: string) => {
    const key = (typeof text === 'string' ? text : keyword).trim();
    if (!key) {
      Alert.alert('提示', '请输入关键字');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      Keyboard.dismiss();
      const res = await api.search(key);
      setResults(res);
    } catch (e: any) {
      logger.error?.('Search failed', e);
      setError(e?.message ?? '搜索失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // ==== 筛选（来自 Zustand）====
  const { filterResults } = useFilterStore();

  const filteredList = useMemo(() => filterResults(results), [results, filterResults]);

  // 派生可选项（平台 & 年份）传给筛选面板
  const availablePlatforms = useMemo(() => {
    const setP = new Set<string>();
    results.forEach(r => {
      if (r.source_name) setP.add(r.source_name);
      else if (r.source) setP.add(r.source);
    });
    return Array.from(setP);
  }, [results]);

  const availableYears = useMemo(() => {
    const setY = new Set<string>();
    results.forEach(r => {
      const m = /\d{4}/.exec(String(r.year ?? ''));
      if (m) setY.add(m[0]);
    });
    return Array.from(setY);
  }, [results]);

  // 渲染每一个视频卡片
  const renderItem = (item: SearchResult) => (
    <VideoCard
      key={`${item.source}-${item.id}`}
      id={item.id.toString()}
      source={item.source}
      title={item.title}
      poster={item.poster}
      year={item.year}
      sourceName={item.source_name}
      api={api}
    />
  );

  const styles = createResponsiveStyles(deviceType, spacing, isInputFocused);

  return (
    <ResponsiveNavigation>
      <ResponsiveHeader title="搜索" showBackButton />
      <View style={styles.searchContainer}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.inputContainer}
          onPress={() => textInputRef.current?.focus()}
        >
          <TextInput
            ref={textInputRef}
            style={styles.input}
            value={keyword}
            onChangeText={setKeyword}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="输入关键字（支持语音/遥控输入）"
            placeholderTextColor="#8e8e93"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch()}
          />
        </TouchableOpacity>

        <StyledButton
          onPress={() => handleSearch()}
          style={styles.searchButton}
          icon={<Search size={20} color="white" />}
          label="搜索"
        />

        <StyledButton
          onPress={() => setShowFilters(true)}
          style={styles.searchButton}
          label="筛选"
        />
      </View>

      {loading && (
        <View style={commonStyles.centerBox}>
          <VideoLoadingAnimation />
          <ThemedText>加载中…</ThemedText>
        </View>
      )}

      {!loading && error && (
        <View style={commonStyles.centerBox}>
          <ThemedText style={{ color: 'red' }}>{error}</ThemedText>
        </View>
      )}

      {!loading && !error && filteredList.length === 0 && (
        <View style={commonStyles.centerBox}>
          <ThemedText>暂无结果</ThemedText>
        </View>
      )}

      {!loading && !error && filteredList.length > 0 && (
        <CustomScrollView contentContainerStyle={styles.grid}>
          {filteredList.map(renderItem)}
        </CustomScrollView>
      )}

      {remoteInputEnabled && (
        <RemoteControlModal
          visible={showRemoteModal}
          onClose={() => {}}
          targetPage="search"
        />
      )}

      <FilterBar
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        availablePlatforms={availablePlatforms}
        availableYears={availableYears}
      />
    </ResponsiveNavigation>
  );
}

const createResponsiveStyles = (deviceType: string, spacing: number, isInputFocused: boolean) => {
  const isMobile = deviceType === 'mobile';
  const minTouchTarget = DeviceUtils.getMinTouchTargetSize();

  return StyleSheet.create({
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing,
      marginBottom: spacing,
      gap: spacing / 2,
    },
    inputContainer: {
      flex: 1,
      height: isMobile ? minTouchTarget : 50,
      backgroundColor: '#2c2c2e',
      borderRadius: 8,
      borderWidth: 2,
      borderColor: isInputFocused ? Colors.dark.primary : 'transparent',
      justifyContent: 'center',
      paddingHorizontal: spacing,
    },
    input: {
      flex: 1,
      color: 'white',
      fontSize: isMobile ? 16 : 18,
    },
    searchButton: {
      height: isMobile ? minTouchTarget : 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing,
      paddingHorizontal: spacing,
      paddingBottom: spacing * 2,
    },
  });
};
