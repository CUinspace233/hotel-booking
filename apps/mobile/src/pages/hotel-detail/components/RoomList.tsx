import { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { BED_TYPE_MAP } from '../../../types/hotel';
import type { HotelRoomInfo } from '../../../types/hotel';
import RoomCard from './RoomCard';

import './RoomList.scss';

interface RoomListProps {
  rooms: HotelRoomInfo[];
}

function RoomList({ rooms }: RoomListProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // 从房型数据中提取筛选标签
  const filterTags = useMemo(() => {
    const tags: { key: string; label: string }[] = [{ key: 'all', label: '全部' }];
    const seen = new Set<string>();

    rooms.forEach((room) => {
      // 按床型分类
      if (room.bedType && !seen.has(`bed_${room.bedType}`)) {
        seen.add(`bed_${room.bedType}`);
        tags.push({
          key: `bed_${room.bedType}`,
          label: BED_TYPE_MAP[room.bedType] || room.bedType
        });
      }
      // 含早餐标签
      if (room.breakfastType && room.breakfastType !== 'none' && !seen.has('breakfast')) {
        seen.add('breakfast');
        tags.push({ key: 'breakfast', label: '含早餐' });
      }
    });

    return tags;
  }, [rooms]);

  // 筛选后的房型列表
  const filteredRooms = useMemo(() => {
    if (activeFilter === 'all') return rooms;
    if (activeFilter === 'breakfast') {
      return rooms.filter((r) => r.breakfastType && r.breakfastType !== 'none');
    }
    if (activeFilter.startsWith('bed_')) {
      const bedType = activeFilter.replace('bed_', '');
      return rooms.filter((r) => r.bedType === bedType);
    }
    return rooms;
  }, [rooms, activeFilter]);

  const handleFilterClick = useCallback((key: string) => {
    setActiveFilter(key);
  }, []);

  if (rooms.length === 0) {
    return (
      <View className="room-list">
        <View className="room-list__empty">
          <Text className="room-list__empty-text">暂无可预订房型</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="room-list">
      {/* 筛选标签行 */}
      {filterTags.length > 1 && (
        <ScrollView scrollX className="room-list__filters" enhanced showScrollbar={false}>
          <View className="room-list__filters-inner">
            {filterTags.map((tag) => (
              <View
                key={tag.key}
                className={`room-list__filter-tag ${
                  activeFilter === tag.key ? 'room-list__filter-tag--active' : ''
                }`}
                onClick={() => handleFilterClick(tag.key)}
              >
                <Text
                  className={`room-list__filter-text ${
                    activeFilter === tag.key ? 'room-list__filter-text--active' : ''
                  }`}
                >
                  {tag.label}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* 房型卡片列表 */}
      <View className="room-list__cards">
        {filteredRooms.map((room) => (
          <RoomCard key={room.roomId} room={room} />
        ))}
      </View>
    </View>
  );
}

export default RoomList;
