import { useState, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import type { FilterState } from '../../../types/hotel';
import BookingModal from './BookingModal';

import './SearchHeader.scss';

interface SearchHeaderProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
}

function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  return `${parts[1]}-${parts[2]}`;
}

function SearchHeader({ filters, onFiltersChange }: SearchHeaderProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleModalConfirm = useCallback(
    (data: {
      city: string;
      checkInDate: string;
      checkOutDate: string;
      roomCount: number;
      adultCount: number;
    }) => {
      onFiltersChange(data);
      setModalVisible(false);
    },
    [onFiltersChange]
  );

  const handleSearchClick = useCallback(() => {
    const url = filters.keyword
      ? `/pages/search/index?keyword=${encodeURIComponent(filters.keyword)}`
      : '/pages/search/index';
    Taro.navigateTo({ url });
  }, [filters.keyword]);

  return (
    <View className="search-header">
      <View className="search-header__bar">
        {/* 城市 */}
        <View className="search-header__city" onClick={handleOpenModal}>
          <Text className="search-header__city-name">{filters.city || '全城'}</Text>
        </View>

        <View className="search-header__divider" />

        {/* 日期：入住在上，离店在下 */}
        <View className="search-header__date-stack" onClick={handleOpenModal}>
          <Text className="search-header__date-top">{formatShortDate(filters.checkInDate)}</Text>
          <Text className="search-header__date-bottom">
            {formatShortDate(filters.checkOutDate)}
          </Text>
        </View>

        {/* 间数/人数：N间在上，N人在下 */}
        <View className="search-header__room-stack" onClick={handleOpenModal}>
          <Text className="search-header__room-top">{filters.roomCount}间</Text>
          <Text className="search-header__room-bottom">{filters.adultCount}人</Text>
        </View>

        <View className="search-header__divider" />

        {/* 搜索 - 点击跳转搜索页 */}
        <View className="search-header__search" onClick={handleSearchClick}>
          <Text className="search-header__search-placeholder">
            {filters.keyword || '关键词/位置/酒店名'}
          </Text>
        </View>
      </View>

      {/* 底部弹窗 */}
      <BookingModal
        visible={modalVisible}
        city={filters.city}
        checkInDate={filters.checkInDate}
        checkOutDate={filters.checkOutDate}
        roomCount={filters.roomCount}
        adultCount={filters.adultCount}
        onConfirm={handleModalConfirm}
        onClose={handleCloseModal}
      />
    </View>
  );
}

export default SearchHeader;
