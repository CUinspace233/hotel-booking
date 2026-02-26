import { View, Text, Image } from '@tarojs/components';
import { BED_TYPE_MAP, WINDOW_TYPE_MAP, BREAKFAST_TYPE_MAP } from '../../../types/hotel';
import type { HotelRoomInfo } from '../../../types/hotel';

import './RoomCard.scss';

interface RoomCardProps {
  room: HotelRoomInfo;
}

function RoomCard({ room }: RoomCardProps) {
  const price = room.basePrice;
  const imageCount = room.images.length + (room.coverImage ? 1 : 0);

  // 构建规格信息
  const specs: string[] = [];
  if (room.bedType) {
    const bedLabel = BED_TYPE_MAP[room.bedType] || room.bedType;
    const countStr = room.bedCount ? `${room.bedCount}张` : '';
    const sizeStr = room.bedSize ? `${room.bedSize}` : '';
    specs.push(`${countStr}${sizeStr}${bedLabel}`);
  }
  if (room.roomSize) {
    specs.push(`${room.roomSize}m²`);
  }
  if (room.maxOccupancy) {
    specs.push(`${room.maxOccupancy}人入住`);
  }
  if (room.floor) {
    specs.push(room.floor);
  }

  // 窗户/景观标签
  const windowLabel = room.windowType ? WINDOW_TYPE_MAP[room.windowType] || room.windowType : null;

  // 早餐信息
  const breakfastLabel =
    room.breakfastType && room.breakfastType !== 'none'
      ? room.breakfastCount && room.breakfastCount > 0
        ? `含${room.breakfastCount}份${BREAKFAST_TYPE_MAP[room.breakfastType] || '早餐'}`
        : BREAKFAST_TYPE_MAP[room.breakfastType] || '含早'
      : '不含早';

  return (
    <View className="room-card">
      {/* 左侧：房型图片 */}
      <View className="room-card__image-wrapper">
        {room.coverImage ? (
          <Image className="room-card__image" src={room.coverImage} mode="aspectFill" />
        ) : (
          <View className="room-card__image-placeholder">
            <Text className="room-card__image-placeholder-text">{room.roomName[0]}</Text>
          </View>
        )}
        {imageCount > 1 && (
          <View className="room-card__image-count">
            <Text className="room-card__image-count-text">{imageCount}</Text>
          </View>
        )}
      </View>

      {/* 右侧：房型信息 */}
      <View className="room-card__info">
        <Text className="room-card__name">{room.roomName}</Text>

        {specs.length > 0 && <Text className="room-card__specs">{specs.join('  ')}</Text>}

        <View className="room-card__tags">
          {windowLabel && (
            <View className="room-card__tag">
              <Text className="room-card__tag-text">{windowLabel}</Text>
            </View>
          )}
          <View
            className={`room-card__breakfast ${room.breakfastType !== 'none' ? 'room-card__breakfast--included' : ''}`}
          >
            <Text className="room-card__breakfast-text">{breakfastLabel}</Text>
          </View>
        </View>

        {/* 价格行 */}
        <View className="room-card__price-row">
          {price != null ? (
            <View className="room-card__price">
              <Text className="room-card__price-symbol">¥</Text>
              <Text className="room-card__price-value">{price}</Text>
              <Text className="room-card__price-unit">/晚</Text>
            </View>
          ) : (
            <Text className="room-card__price-empty">暂无报价</Text>
          )}
        </View>
      </View>
    </View>
  );
}

export default RoomCard;
