import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useFilterStore } from '@/stores/filterStore';
import { Colors } from '@/constants/Colors';

interface FilterBarProps {
  visible: boolean;
  onClose: () => void;
  availableYears?: string[];
  availablePlatforms?: string[];
}

const TYPES = ['全部','电影','电视剧','综艺','动漫','纪录片'];
const REGIONS = ['全部','中国大陆','香港','台湾','日本','韩国','美国','英国','泰国','印度','新加坡','马来西亚','欧美'];

const SORTS: Array<ReturnType<typeof useFilterStore.getState>['sort']> = ['默认','最新','标题'];

export default function FilterBar(props: FilterBarProps) {
  const { visible, onClose, availableYears = [], availablePlatforms = [] } = props;
  const { type, region, year, platform, sort, setFilter, resetFilters } = useFilterStore();

  const years = useMemo(() => {
    // 年份按倒序展示
    const ys = Array.from(new Set(availableYears.filter(Boolean)));
    ys.sort((a,b) => parseInt(b,10) - parseInt(a,10));
    return ['全部', ...ys];
  }, [availableYears]);

  const platforms = useMemo(() => {
    const ps = Array.from(new Set(availablePlatforms.filter(Boolean)));
    ps.sort((a,b) => a.localeCompare(b, 'zh-Hans-CN'));
    return ['全部', ...ps];
  }, [availablePlatforms]);

  if (!visible) return null;

  const Chip = ({label, active, onPress}:{label:string;active:boolean;onPress:()=>void}) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      focusable
      hasTVPreferredFocus={false}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const Group = ({title, children}:{title:string;children:React.ReactNode}) => (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.rowWrap}>{children}</View>
    </View>
  );

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <Text style={styles.title}>筛选</Text>

        <Group title="类型">
          {TYPES.map(t => (
            <Chip key={t} label={t} active={type===t} onPress={() => setFilter('type', t)} />
          ))}
        </Group>

        <Group title="地区">
          {REGIONS.map(r => (
            <Chip key={r} label={r} active={region===r} onPress={() => setFilter('region', r)} />
          ))}
        </Group>

        <Group title="年代">
          {years.map(y => (
            <Chip key={y} label={y} active={year===y} onPress={() => setFilter('year', y)} />
          ))}
        </Group>

        <Group title="平台">
          {platforms.map(p => (
            <Chip key={p} label={p} active={platform===p} onPress={() => setFilter('platform', p)} />
          ))}
        </Group>

        <Group title="排序">
          {SORTS.map(s => (
            <Chip key={s} label={s} active={sort===s} onPress={() => setFilter('sort', s)} />
          ))}
        </Group>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={resetFilters}
            style={[styles.actionBtn, styles.resetBtn]}
            focusable
          >
            <Text style={styles.actionText}>重置</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={[styles.actionBtn, styles.applyBtn]}
            focusable
            hasTVPreferredFocus
          >
            <Text style={styles.actionText}>完成</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  panel: {
    width: '100%',
    maxWidth: 980,
    borderRadius: 12,
    backgroundColor: '#1c1c1e',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  group: {
    marginTop: 8,
  },
  groupTitle: {
    color: '#c7c7cc',
    marginBottom: 8,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3a3a3c',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#2c2c2e',
  },
  chipActive: {
    borderColor: Colors.dark?.primary ?? '#0a84ff',
    backgroundColor: 'rgba(10,132,255,0.15)',
  },
  chipText: {
    color: '#f2f2f7',
  },
  chipTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#2c2c2e',
  },
  resetBtn: {
    backgroundColor: '#3a3a3c',
  },
  applyBtn: {
    backgroundColor: Colors.dark?.primary ?? '#0a84ff',
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
  },
});
