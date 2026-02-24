import { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import HotelCard from './HotelCard';
import type { HotelListItem } from '../../../types/hotel';

import './VirtualList.scss';

interface VirtualListProps {
  hotels: HotelListItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

// 每个卡片的固定高度（px）
const ITEM_HEIGHT = 274; // 216(image) + 56(padding) + 2(border)
// 上下 buffer 区域的额外项数
const BUFFER_SIZE = 5;

function VirtualList({ hotels, loading, hasMore, onLoadMore }: VirtualListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(800);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.detail.scrollTop);
  }, []);

  const handleScrollToLower = useCallback(() => {
    if (!loading && hasMore) {
      onLoadMore();
    }
  }, [loading, hasMore, onLoadMore]);

  // 计算可视区域的 start / end index
  const { startIndex, endIndex, paddingTop, paddingBottom } = useMemo(() => {
    const totalHeight = hotels.length * ITEM_HEIGHT;
    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const visibleCount = Math.ceil(viewportHeight / ITEM_HEIGHT);
    const end = Math.min(hotels.length - 1, start + visibleCount + BUFFER_SIZE * 2);

    return {
      startIndex: start,
      endIndex: end,
      paddingTop: start * ITEM_HEIGHT,
      paddingBottom: Math.max(0, totalHeight - (end + 1) * ITEM_HEIGHT)
    };
  }, [scrollTop, viewportHeight, hotels.length]);

  // 只渲染可视区域的卡片
  const visibleHotels = useMemo(() => {
    return hotels.slice(startIndex, endIndex + 1);
  }, [hotels, startIndex, endIndex]);

  return (
    <ScrollView
      className="virtual-list"
      scrollY
      enhanced
      showScrollbar={false}
      onScroll={handleScroll}
      onScrollToLower={handleScrollToLower}
      lowerThreshold={200}
      // @ts-expect-error onLayout not in types but works in H5
      onLayout={(e) => {
        if (e?.detail?.height) {
          setViewportHeight(e.detail.height);
        }
      }}
    >
      {/* 顶部占位 */}
      {paddingTop > 0 && <View style={{ height: `${paddingTop}px` }} />}

      {/* 可视区域的卡片 */}
      {visibleHotels.map((hotel, idx) => (
        <HotelCard key={hotel.hotelId} hotel={hotel} index={startIndex + idx} />
      ))}

      {/* 底部占位 */}
      {paddingBottom > 0 && <View style={{ height: `${paddingBottom}px` }} />}

      {/* 加载状态 */}
      <View className="virtual-list__footer">
        {loading && <Text className="virtual-list__loading">加载中...</Text>}
        {!loading && !hasMore && hotels.length > 0 && (
          <Text className="virtual-list__no-more">没有更多酒店了</Text>
        )}
        {!loading && hotels.length === 0 && (
          <View className="virtual-list__empty">
            <Text className="virtual-list__empty-text">暂无符合条件的酒店</Text>
            <Text className="virtual-list__empty-hint">试试调整筛选条件</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

export default VirtualList;
