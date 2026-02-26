import { useCallback } from 'react';
import { View, Text, Picker } from '@tarojs/components';

import './DateBanner.scss';

interface DateBannerProps {
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  roomCount: number;
  adultCount: number;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  onRoomCountChange: (count: number) => void;
  onAdultCountChange: (count: number) => void;
}

const ROOM_RANGE = Array.from({ length: 10 }, (_, i) => `${i + 1}间`);
const ADULT_RANGE = Array.from({ length: 10 }, (_, i) => `${i + 1}成人`);

// 格式化日期为「M月D日」
function formatDateCN(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

// 获取"今天"/"明天"/周几 标签
function getDateTag(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  if (target.getTime() === today.getTime()) return '今天';
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (target.getTime() === tomorrow.getTime()) return '明天';

  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[d.getDay()];
}

function DateBanner({
  checkInDate,
  checkOutDate,
  nights,
  roomCount,
  adultCount,
  onCheckInChange,
  onCheckOutChange,
  onRoomCountChange,
  onAdultCountChange
}: DateBannerProps) {
  const handleCheckInChange = useCallback(
    (e) => {
      const date = e.detail.value;
      onCheckInChange(date);
      // 入住日期 >= 离店日期时自动调整
      if (date >= checkOutDate) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        onCheckOutChange(nextDay.toISOString().split('T')[0]);
      }
    },
    [checkOutDate, onCheckInChange, onCheckOutChange]
  );

  const handleCheckOutChange = useCallback(
    (e) => {
      onCheckOutChange(e.detail.value);
    },
    [onCheckOutChange]
  );

  const handleRoomChange = useCallback(
    (e) => {
      onRoomCountChange(Number(e.detail.value) + 1);
    },
    [onRoomCountChange]
  );

  const handleAdultChange = useCallback(
    (e) => {
      onAdultCountChange(Number(e.detail.value) + 1);
    },
    [onAdultCountChange]
  );

  return (
    <View className="date-banner">
      {/* 左侧：日期区域 */}
      <View className="date-banner__dates">
        <Picker mode="date" value={checkInDate} onChange={handleCheckInChange}>
          <View className="date-banner__date-item">
            <Text className="date-banner__date-label">{getDateTag(checkInDate)}</Text>
            <Text className="date-banner__date-value">{formatDateCN(checkInDate)}</Text>
          </View>
        </Picker>

        <Text className="date-banner__sep">-</Text>

        <Picker
          mode="date"
          value={checkOutDate}
          start={checkInDate}
          onChange={handleCheckOutChange}
        >
          <View className="date-banner__date-item">
            <Text className="date-banner__date-label">{getDateTag(checkOutDate)}</Text>
            <Text className="date-banner__date-value">{formatDateCN(checkOutDate)}</Text>
          </View>
        </Picker>

        <View className="date-banner__nights">
          <Text className="date-banner__nights-text">共{nights}晚</Text>
        </View>
      </View>

      {/* 右侧：间数人数 */}
      <View className="date-banner__room-info">
        <Text className="date-banner__room-label">间数人数</Text>
        <View className="date-banner__room-pickers">
          <Picker
            mode="selector"
            range={ROOM_RANGE}
            value={roomCount - 1}
            onChange={handleRoomChange}
          >
            <Text className="date-banner__room-value">{roomCount}间</Text>
          </Picker>
          <Picker
            mode="selector"
            range={ADULT_RANGE}
            value={adultCount - 1}
            onChange={handleAdultChange}
          >
            <Text className="date-banner__room-value">{adultCount}成人</Text>
          </Picker>
        </View>
      </View>
    </View>
  );
}

export default DateBanner;
