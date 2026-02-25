import { useState, useMemo, useCallback } from 'react';
import { View, Text, Picker } from '@tarojs/components';
import { HOT_CITIES } from '../../../types/hotel';

import './BookingModal.scss';

interface BookingModalProps {
  visible: boolean;
  city: string;
  checkInDate: string;
  checkOutDate: string;
  roomCount: number;
  adultCount: number;
  onConfirm: (data: {
    city: string;
    checkInDate: string;
    checkOutDate: string;
    roomCount: number;
    adultCount: number;
  }) => void;
  onClose: () => void;
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const ROOM_RANGE = Array.from({ length: 10 }, (_, i) => `${i + 1}间房`);
const ADULT_RANGE = Array.from({ length: 10 }, (_, i) => `${i + 1}成人`);

// 格式化日期为「M月D日」
function formatDateCN(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

// 获取周几/今天标签
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
  return WEEKDAYS[d.getDay()];
}

function BookingModal({
  visible,
  city,
  checkInDate,
  checkOutDate,
  roomCount,
  adultCount,
  onConfirm,
  onClose
}: BookingModalProps) {
  // 弹窗内部临时状态
  const [tempCity, setTempCity] = useState(city);
  const [tempCheckIn, setTempCheckIn] = useState(checkInDate);
  const [tempCheckOut, setTempCheckOut] = useState(checkOutDate);
  const [tempRoomCount, setTempRoomCount] = useState(roomCount);
  const [tempAdultCount, setTempAdultCount] = useState(adultCount);

  // 每次打开时同步外部数据
  useMemo(() => {
    if (visible) {
      setTempCity(city);
      setTempCheckIn(checkInDate);
      setTempCheckOut(checkOutDate);
      setTempRoomCount(roomCount);
      setTempAdultCount(adultCount);
    }
  }, [visible, city, checkInDate, checkOutDate, roomCount, adultCount]);

  // 计算间夜数
  const nights = useMemo(() => {
    if (!tempCheckIn || !tempCheckOut) return 0;
    const diff = new Date(tempCheckOut).getTime() - new Date(tempCheckIn).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [tempCheckIn, tempCheckOut]);

  const handleCityChange = useCallback((e) => {
    setTempCity(HOT_CITIES[e.detail.value]);
  }, []);

  const handleCheckInChange = useCallback(
    (e) => {
      const date = e.detail.value;
      setTempCheckIn(date);
      // 入住 >= 离店时自动调整离店
      if (date >= tempCheckOut) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        setTempCheckOut(nextDay.toISOString().split('T')[0]);
      }
    },
    [tempCheckOut]
  );

  const handleCheckOutChange = useCallback((e) => {
    setTempCheckOut(e.detail.value);
  }, []);

  const handleRoomChange = useCallback((e) => {
    setTempRoomCount(Number(e.detail.value) + 1);
  }, []);

  const handleAdultChange = useCallback((e) => {
    setTempAdultCount(Number(e.detail.value) + 1);
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm({
      city: tempCity,
      checkInDate: tempCheckIn,
      checkOutDate: tempCheckOut,
      roomCount: tempRoomCount,
      adultCount: tempAdultCount
    });
  }, [tempCity, tempCheckIn, tempCheckOut, tempRoomCount, tempAdultCount, onConfirm]);

  if (!visible) return null;

  return (
    <View className="booking-modal">
      {/* 遮罩 */}
      <View className="booking-modal__mask" onClick={onClose} />

      {/* 弹窗内容 */}
      <View className="booking-modal__sheet">
        {/* 城市 */}
        <View className="booking-modal__section">
          <Picker mode="selector" range={HOT_CITIES} onChange={handleCityChange}>
            <Text className="booking-modal__city">{tempCity || '选择城市'}</Text>
          </Picker>
        </View>

        <View className="booking-modal__line" />

        {/* 日期行 */}
        <View className="booking-modal__section booking-modal__date-row">
          <View className="booking-modal__date-left">
            <Picker mode="date" value={tempCheckIn} onChange={handleCheckInChange}>
              <View className="booking-modal__date-item">
                <Text className="booking-modal__date-main">{formatDateCN(tempCheckIn)}</Text>
                <Text className="booking-modal__date-tag">{getDateTag(tempCheckIn)}</Text>
              </View>
            </Picker>

            <Text className="booking-modal__date-sep">—</Text>

            <Picker
              mode="date"
              value={tempCheckOut}
              start={tempCheckIn}
              onChange={handleCheckOutChange}
            >
              <View className="booking-modal__date-item">
                <Text className="booking-modal__date-main">{formatDateCN(tempCheckOut)}</Text>
                <Text className="booking-modal__date-tag">{getDateTag(tempCheckOut)}</Text>
              </View>
            </Picker>
          </View>

          <Text className="booking-modal__nights">共{nights}晚</Text>
        </View>

        <View className="booking-modal__line" />

        {/* 间数/人数行 */}
        <View className="booking-modal__section booking-modal__room-row">
          <Picker
            mode="selector"
            range={ROOM_RANGE}
            value={tempRoomCount - 1}
            onChange={handleRoomChange}
          >
            <Text className="booking-modal__room-item">{tempRoomCount}间房</Text>
          </Picker>
          <Picker
            mode="selector"
            range={ADULT_RANGE}
            value={tempAdultCount - 1}
            onChange={handleAdultChange}
          >
            <Text className="booking-modal__room-item">{tempAdultCount}成人</Text>
          </Picker>
        </View>

        <View className="booking-modal__line" />

        {/* 确定按钮 */}
        <View className="booking-modal__section">
          <View className="booking-modal__btn" onClick={handleConfirm}>
            <Text className="booking-modal__btn-text">确定</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default BookingModal;
