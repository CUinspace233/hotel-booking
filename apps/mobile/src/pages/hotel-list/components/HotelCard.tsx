import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { FACILITY_MAP, HOTEL_TYPE_MAP } from '../../../types/hotel';
import type { HotelListItem } from '../../../types/hotel';

import './HotelCard.scss';

interface HotelCardProps {
  hotel: HotelListItem;
  index: number;
}

function HotelCard({ hotel }: HotelCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const observerRef = useRef<Taro.IntersectionObserver | null>(null);
  const cardId = `hotel-card-${hotel.hotelId}`;

  // 图片懒加载
  useEffect(() => {
    const observer = Taro.createIntersectionObserver(
      // @ts-expect-error Taro types
      Taro.getCurrentInstance().page,
      { thresholds: [0], observeAll: false }
    );

    observer.relativeToViewport({ top: 200, bottom: 200 }).observe(`#${cardId}`, (res) => {
      if (res.intersectionRatio && res.intersectionRatio > 0) {
        setImageVisible(true);
        observer.disconnect();
      }
    });

    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [cardId]);

  const handleClick = useCallback(() => {
    Taro.navigateTo({
      url: `/pages/hotel-detail/index?hotelId=${hotel.hotelId}`
    });
  }, [hotel.hotelId]);

  const formatPrice = (price: number | null) => {
    if (price === null) return '--';
    return price;
  };

  // 设施标签（最多展示 4 个）
  const facilityTags = hotel.facilityCodes.slice(0, 4).map((code) => FACILITY_MAP[code] || code);

  return (
    <View className="hotel-card" id={cardId} onClick={handleClick}>
      {/* 左侧图片 */}
      <View className="hotel-card__image-wrapper">
        {imageVisible && hotel.coverImage ? (
          <Image
            className="hotel-card__image"
            src={hotel.coverImage}
            mode="aspectFill"
            lazyLoad
            onLoad={() => setImageLoaded(true)}
          />
        ) : null}
        {(!imageVisible || !imageLoaded) && (
          <View className="hotel-card__image-placeholder">
            <Text className="hotel-card__image-placeholder-text">{hotel.name?.[0] || '酒'}</Text>
          </View>
        )}
        {hotel.hotelType && (
          <View className="hotel-card__type-badge">
            <Text className="hotel-card__type-badge-text">
              {HOTEL_TYPE_MAP[hotel.hotelType] || hotel.hotelType}
            </Text>
          </View>
        )}
      </View>

      {/* 右侧信息 */}
      <View className="hotel-card__info">
        {/* 酒店名称 + 星级钻石标 */}
        <View className="hotel-card__title-row">
          <Text className="hotel-card__name">{hotel.name || '未命名酒店'}</Text>
          {hotel.starRating && (
            <View className="hotel-card__diamond">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <Text key={i} className="hotel-card__diamond-icon">
                  ◆
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* 评分 */}
        {hotel.starRating && (
          <View className="hotel-card__score-row">
            <View className="hotel-card__score-badge">
              <Text className="hotel-card__score-num">4.8</Text>
            </View>
            <Text className="hotel-card__score-label">超棒</Text>
          </View>
        )}

        {/* 地址 */}
        <View className="hotel-card__location">
          <Text className="hotel-card__location-text">
            {[hotel.city, hotel.district].filter(Boolean).join('·') || '暂无位置'}
          </Text>
        </View>

        {/* 描述 */}
        {hotel.description && <Text className="hotel-card__desc">{hotel.description}</Text>}

        {/* 设施标签 */}
        {facilityTags.length > 0 && (
          <View className="hotel-card__facilities">
            {facilityTags.map((tag) => (
              <Text key={tag} className="hotel-card__facility-tag">
                {tag}
              </Text>
            ))}
          </View>
        )}

        {/* 价格 - 右下角 */}
        <View className="hotel-card__price-row">
          <View className="hotel-card__price">
            <Text className="hotel-card__price-symbol">¥</Text>
            <Text className="hotel-card__price-value">{formatPrice(hotel.minPrice)}</Text>
            <Text className="hotel-card__price-unit">起</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default HotelCard;
