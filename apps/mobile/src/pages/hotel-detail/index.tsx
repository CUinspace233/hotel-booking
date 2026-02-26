import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter, getSystemInfoSync } from '@tarojs/taro';
import { getHotelDetail } from '../../services/api';
import { getMockHotelDetail } from '../../constants/mock';
import type { HotelDetailResponse, HotelDetailInfo, HotelRoomInfo } from '../../types/hotel';
import { ImageBanner, HotelInfo, FacilityBar, DateBanner, RoomList, BottomBar } from './components';

import './index.scss';

// 是否使用 Mock 数据
const USE_MOCK = false;

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

// 获取状态栏高度
const systemInfo = getSystemInfoSync();
const statusBarHeight = systemInfo.statusBarHeight || 20;

function HotelDetail() {
  const router = useRouter();
  const hotelId = router.params.hotelId || '';

  const [data, setData] = useState<HotelDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // 日期/间数状态
  const [checkInDate, setCheckInDate] = useState(getToday());
  const [checkOutDate, setCheckOutDate] = useState(getTomorrow());
  const [roomCount, setRoomCount] = useState(1);
  const [adultCount, setAdultCount] = useState(1);

  // 提取 published 版本详情
  const detail: HotelDetailInfo | null = data?.details?.[0] ?? null;

  // 房型按价格升序排序
  const sortedRooms: HotelRoomInfo[] = useMemo(() => {
    if (!data?.rooms) return [];
    return [...data.rooms].sort((a, b) => (a.basePrice ?? Infinity) - (b.basePrice ?? Infinity));
  }, [data?.rooms]);

  // 最低价格
  const minPrice: number | null = useMemo(() => {
    if (sortedRooms.length === 0) return null;
    return sortedRooms[0].basePrice ?? null;
  }, [sortedRooms]);

  // 计算间夜数
  const nights = useMemo(() => {
    const diff = new Date(checkOutDate).getTime() - new Date(checkInDate).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [checkInDate, checkOutDate]);

  // 加载数据
  useEffect(() => {
    if (!hotelId) return;
    setLoading(true);

    (async () => {
      try {
        let result: HotelDetailResponse;
        if (USE_MOCK) {
          result = await getMockHotelDetail(hotelId);
        } else {
          try {
            result = await getHotelDetail(hotelId);
          } catch {
            // API 不可用时降级到 mock
            result = await getMockHotelDetail(hotelId);
          }
        }
        setData(result);
      } catch (err) {
        console.error('加载酒店详情失败:', err);
        Taro.showToast({ title: '加载失败', icon: 'none' });
      } finally {
        setLoading(false);
      }
    })();
  }, [hotelId]);

  // 返回上一页
  const handleBack = useCallback(() => {
    Taro.navigateBack();
  }, []);

  // 点击"查看房型"滚动到房型区域
  const handleViewRooms = useCallback(() => {
    // 使用 Taro 的 pageScrollTo 滚动到房型区域
    Taro.createSelectorQuery()
      .select('#room-list-section')
      .boundingClientRect((rect) => {
        if (rect) {
          Taro.pageScrollTo({
            scrollTop: rect.top,
            duration: 300
          });
        }
      })
      .exec();
  }, []);

  if (loading) {
    return (
      <View className="hotel-detail hotel-detail--loading">
        <Text className="hotel-detail__loading-text">加载中...</Text>
      </View>
    );
  }

  if (!data || !detail) {
    return (
      <View className="hotel-detail hotel-detail--empty">
        <Text className="hotel-detail__empty-text">未找到酒店信息</Text>
      </View>
    );
  }

  return (
    <View className="hotel-detail">
      {/* 沉浸式导航栏 - 浮动返回按钮 */}
      <View className="hotel-detail__nav" style={{ paddingTop: `${statusBarHeight}px` }}>
        <View className="hotel-detail__back-btn" onClick={handleBack}>
          <Text className="hotel-detail__back-icon">{'<'}</Text>
        </View>
        <Text className="hotel-detail__nav-title">{data.name || '酒店详情'}</Text>
      </View>

      {/* 图片轮播 */}
      <ImageBanner coverImage={detail.coverImage} images={detail.images} />

      {/* 酒店基础信息 */}
      <HotelInfo
        name={data.name}
        fullName={detail.fullName}
        starRating={detail.starRating}
        openingYear={detail.openingYear}
        renovationYear={detail.renovationYear}
        score={data.stats?.score ?? null}
        reviewCount={data.stats?.reviewCount ?? null}
        address={detail.address}
      />

      {/* 设施栏 */}
      <FacilityBar facilities={detail.facilities} />

      {/* 日期/间夜 Banner */}
      <DateBanner
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        nights={nights}
        roomCount={roomCount}
        adultCount={adultCount}
        onCheckInChange={setCheckInDate}
        onCheckOutChange={setCheckOutDate}
        onRoomCountChange={setRoomCount}
        onAdultCountChange={setAdultCount}
      />

      {/* 房型列表 */}
      <View id="room-list-section">
        <RoomList rooms={sortedRooms} />
      </View>

      {/* 底部占位 */}
      <View className="hotel-detail__bottom-spacer" />

      {/* 吸底价格栏 */}
      <BottomBar minPrice={minPrice} onViewRooms={handleViewRooms} />
    </View>
  );
}

export default HotelDetail;
