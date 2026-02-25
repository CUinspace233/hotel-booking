import { useState, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import type { FilterState } from '../../../types/hotel';

import './FilterPanel.scss';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
}

// 价格区间选项
const PRICE_OPTIONS = [
  { label: '不限', min: undefined, max: undefined },
  { label: '200以下', min: undefined, max: 200 },
  { label: '200-500', min: 200, max: 500 },
  { label: '500-1000', min: 500, max: 1000 },
  { label: '1000以上', min: 1000, max: undefined }
];

// 星级选项
const STAR_OPTIONS = [
  { label: '不限', value: undefined },
  { label: '经济型', value: 3 },
  { label: '四星/高档', value: 4 },
  { label: '五星/豪华', value: 5 }
];

// 酒店类型选项
const TYPE_OPTIONS = [
  { label: '不限', value: '' },
  { label: '商务酒店', value: 'business' },
  { label: '度假酒店', value: 'resort' },
  { label: '精品酒店', value: 'boutique' },
  { label: '公寓', value: 'apartment' },
  { label: '经济型', value: 'hostel' }
];

// 排序选项
const SORT_OPTIONS: { label: string; value: FilterState['sortBy'] }[] = [
  { label: '默认排序', value: 'default' },
  { label: '低价优先', value: 'price_asc' },
  { label: '高价优先', value: 'price_desc' },
  { label: '评分优先', value: 'rating_desc' }
];

type DropdownType = 'sort' | 'star' | 'price' | 'type' | null;

function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);

  const toggleDropdown = useCallback((type: DropdownType) => {
    setActiveDropdown((prev) => (prev === type ? null : type));
  }, []);

  const handlePriceSelect = useCallback(
    (option: (typeof PRICE_OPTIONS)[number]) => {
      onFiltersChange({ minPrice: option.min, maxPrice: option.max });
      setActiveDropdown(null);
    },
    [onFiltersChange]
  );

  const handleStarSelect = useCallback(
    (option: (typeof STAR_OPTIONS)[number]) => {
      onFiltersChange({ starRating: option.value });
      setActiveDropdown(null);
    },
    [onFiltersChange]
  );

  const handleTypeSelect = useCallback(
    (option: (typeof TYPE_OPTIONS)[number]) => {
      onFiltersChange({ hotelType: option.value });
      setActiveDropdown(null);
    },
    [onFiltersChange]
  );

  const handleSortSelect = useCallback(
    (option: (typeof SORT_OPTIONS)[number]) => {
      onFiltersChange({ sortBy: option.value });
      setActiveDropdown(null);
    },
    [onFiltersChange]
  );

  // 获取当前标签文字
  const getSortLabel = () => {
    if (filters.sortBy === 'default') return '排序';
    const opt = SORT_OPTIONS.find((o) => o.value === filters.sortBy);
    return opt?.label ?? '排序';
  };

  const getStarLabel = () => {
    if (filters.starRating === undefined) return '星级';
    const opt = STAR_OPTIONS.find((o) => o.value === filters.starRating);
    return opt?.label ?? '星级';
  };

  const getPriceLabel = () => {
    if (filters.minPrice === undefined && filters.maxPrice === undefined) return '价格';
    const opt = PRICE_OPTIONS.find((o) => o.min === filters.minPrice && o.max === filters.maxPrice);
    return opt?.label ?? '价格';
  };

  const getTypeLabel = () => {
    if (!filters.hotelType) return '筛选';
    const opt = TYPE_OPTIONS.find((o) => o.value === filters.hotelType);
    return opt?.label ?? '筛选';
  };

  const isActive = (type: DropdownType) => activeDropdown === type;
  const hasSortFilter = filters.sortBy !== 'default';
  const hasStarFilter = filters.starRating !== undefined;
  const hasPriceFilter = filters.minPrice !== undefined || filters.maxPrice !== undefined;
  const hasTypeFilter = !!filters.hotelType;

  return (
    <View className="filter-panel">
      {/* 等宽四栏 */}
      <View className="filter-panel__bar">
        <View
          className={`filter-panel__col ${isActive('sort') || hasSortFilter ? 'filter-panel__col--active' : ''}`}
          onClick={() => toggleDropdown('sort')}
        >
          <Text className="filter-panel__col-text">{getSortLabel()}</Text>
          <Text
            className={`filter-panel__col-arrow ${isActive('sort') ? 'filter-panel__col-arrow--up' : ''}`}
          >
            ▼
          </Text>
        </View>

        <View
          className={`filter-panel__col ${isActive('star') || hasStarFilter ? 'filter-panel__col--active' : ''}`}
          onClick={() => toggleDropdown('star')}
        >
          <Text className="filter-panel__col-text">{getStarLabel()}</Text>
          <Text
            className={`filter-panel__col-arrow ${isActive('star') ? 'filter-panel__col-arrow--up' : ''}`}
          >
            ▼
          </Text>
        </View>

        <View
          className={`filter-panel__col ${isActive('price') || hasPriceFilter ? 'filter-panel__col--active' : ''}`}
          onClick={() => toggleDropdown('price')}
        >
          <Text className="filter-panel__col-text">{getPriceLabel()}</Text>
          <Text
            className={`filter-panel__col-arrow ${isActive('price') ? 'filter-panel__col-arrow--up' : ''}`}
          >
            ▼
          </Text>
        </View>

        <View
          className={`filter-panel__col ${isActive('type') || hasTypeFilter ? 'filter-panel__col--active' : ''}`}
          onClick={() => toggleDropdown('type')}
        >
          <Text className="filter-panel__col-text">{getTypeLabel()}</Text>
          <Text
            className={`filter-panel__col-arrow ${isActive('type') ? 'filter-panel__col-arrow--up' : ''}`}
          >
            ▼
          </Text>
        </View>
      </View>

      {/* 下拉选项 */}
      {activeDropdown && (
        <View className="filter-panel__dropdown">
          <View className="filter-panel__dropdown-content">
            {activeDropdown === 'sort' &&
              SORT_OPTIONS.map((opt) => (
                <View
                  key={opt.label}
                  className={`filter-panel__option ${opt.value === filters.sortBy ? 'filter-panel__option--active' : ''}`}
                  onClick={() => handleSortSelect(opt)}
                >
                  <Text className="filter-panel__option-text">{opt.label}</Text>
                  {opt.value === filters.sortBy && (
                    <Text className="filter-panel__option-check">✓</Text>
                  )}
                </View>
              ))}

            {activeDropdown === 'star' &&
              STAR_OPTIONS.map((opt) => (
                <View
                  key={opt.label}
                  className={`filter-panel__option ${opt.value === filters.starRating ? 'filter-panel__option--active' : ''}`}
                  onClick={() => handleStarSelect(opt)}
                >
                  <Text className="filter-panel__option-text">{opt.label}</Text>
                  {opt.value === filters.starRating && (
                    <Text className="filter-panel__option-check">✓</Text>
                  )}
                </View>
              ))}

            {activeDropdown === 'price' &&
              PRICE_OPTIONS.map((opt) => (
                <View
                  key={opt.label}
                  className={`filter-panel__option ${opt.min === filters.minPrice && opt.max === filters.maxPrice ? 'filter-panel__option--active' : ''}`}
                  onClick={() => handlePriceSelect(opt)}
                >
                  <Text className="filter-panel__option-text">{opt.label}</Text>
                  {opt.min === filters.minPrice && opt.max === filters.maxPrice && (
                    <Text className="filter-panel__option-check">✓</Text>
                  )}
                </View>
              ))}

            {activeDropdown === 'type' &&
              TYPE_OPTIONS.map((opt) => (
                <View
                  key={opt.label}
                  className={`filter-panel__option ${opt.value === filters.hotelType ? 'filter-panel__option--active' : ''}`}
                  onClick={() => handleTypeSelect(opt)}
                >
                  <Text className="filter-panel__option-text">{opt.label}</Text>
                  {opt.value === filters.hotelType && (
                    <Text className="filter-panel__option-check">✓</Text>
                  )}
                </View>
              ))}
          </View>
          <View className="filter-panel__mask" onClick={() => setActiveDropdown(null)} />
        </View>
      )}
    </View>
  );
}

export default FilterPanel;
