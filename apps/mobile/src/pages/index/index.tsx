import { View, Text, Picker } from '@tarojs/components';
import { useState, useMemo, useCallback } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { HOT_CITIES } from '../../types/hotel';
import Calendar from './components/Calendar';
import './index.scss';

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const ROOM_RANGE = Array.from({ length: 10 }, (_, i) => `${i + 1}间房`);
const ADULT_RANGE = Array.from({ length: 10 }, (_, i) => `${i + 1}成人`);

const STAR_OPTIONS = [
  { label: '不限', value: undefined as number | undefined },
  { label: '经济型(3★)', value: 3 },
  { label: '四星/高档(4★)', value: 4 },
  { label: '五星/豪华(5★)', value: 5 }
];

const PRICE_OPTIONS = [
  { label: '不限', min: undefined as number | undefined, max: undefined as number | undefined },
  { label: '200以下', min: undefined as number | undefined, max: 200 },
  { label: '200-500', min: 200, max: 500 },
  { label: '500-1000', min: 500, max: 1000 },
  { label: '1000以上', min: 1000, max: undefined as number | undefined }
];

function formatDateCN(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

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

function getTodayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getTomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

type FilterDropdown = 'star' | 'price' | null;

export default function Index() {
  const [statusBarHeight, setStatusBarHeight] = useState(0);

  // 查询状态
  const [city, setCity] = useState('上海');
  const [keyword, setKeyword] = useState('');
  const [checkInDate, setCheckInDate] = useState(getTodayStr);
  const [checkOutDate, setCheckOutDate] = useState(getTomorrowStr);
  const [roomCount, setRoomCount] = useState(1);
  const [adultCount, setAdultCount] = useState(2);
  const [starRating, setStarRating] = useState<number | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  // UI 状态
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterDropdown>(null);

  // 获取状态栏高度
  useMemo(() => {
    try {
      const info = Taro.getSystemInfoSync();
      setStatusBarHeight(info.statusBarHeight || 0);
    } catch {
      setStatusBarHeight(0);
    }
  }, []);

  // 从搜索页返回时获取关键词
  useDidShow(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const data = (currentPage as any)?.data;
    if (data?.selectedKeyword) {
      setKeyword(data.selectedKeyword);
      delete data.selectedKeyword;
    }
  });

  // 计算间夜数
  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    const diff = new Date(checkOutDate).getTime() - new Date(checkInDate).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [checkInDate, checkOutDate]);

  // 随机推荐酒店ID
  const recommendHotelId = useMemo(() => {
    const idx = Math.floor(Math.random() * 20) + 1;
    return `HTL${String(idx).padStart(8, '0')}`;
  }, []);

  // Banner 点击
  const handleBannerClick = useCallback(() => {
    Taro.navigateTo({ url: `/pages/hotel-detail/index?hotelId=${recommendHotelId}` });
  }, [recommendHotelId]);

  // 城市选择
  const handleCityChange = useCallback((e) => {
    setCity(HOT_CITIES[e.detail.value]);
  }, []);

  // 定位
  const handleLocate = useCallback(() => {
    Taro.getLocation({
      type: 'wgs84',
      success: () => {
        Taro.showToast({ title: '定位成功', icon: 'success' });
      },
      fail: () => {
        Taro.showToast({ title: '定位失败，请手动选择城市', icon: 'none' });
      }
    });
  }, []);

  // 搜索框点击
  const handleSearchClick = useCallback(() => {
    Taro.navigateTo({
      url: `/pages/search/index?keyword=${encodeURIComponent(keyword)}`
    });
  }, [keyword]);

  // 日历确认
  const handleCalendarConfirm = useCallback((checkIn: string, checkOut: string) => {
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
    setCalendarVisible(false);
  }, []);

  // 房间选择
  const handleRoomChange = useCallback((e) => {
    setRoomCount(Number(e.detail.value) + 1);
  }, []);

  // 成人选择
  const handleAdultChange = useCallback((e) => {
    setAdultCount(Number(e.detail.value) + 1);
  }, []);

  // 筛选下拉
  const toggleFilter = useCallback((type: FilterDropdown) => {
    setActiveFilter((prev) => (prev === type ? null : type));
  }, []);

  // 星级选择
  const handleStarSelect = useCallback((value: number | undefined) => {
    setStarRating(value);
    setActiveFilter(null);
  }, []);

  // 价格选择
  const handlePriceSelect = useCallback((opt: (typeof PRICE_OPTIONS)[number]) => {
    setMinPrice(opt.min);
    setMaxPrice(opt.max);
    setActiveFilter(null);
  }, []);

  // 当前筛选标签文字
  const starLabel = useMemo(() => {
    if (starRating === undefined) return '星级';
    return STAR_OPTIONS.find((o) => o.value === starRating)?.label ?? '星级';
  }, [starRating]);

  const priceLabel = useMemo(() => {
    if (minPrice === undefined && maxPrice === undefined) return '价格';
    return PRICE_OPTIONS.find((o) => o.min === minPrice && o.max === maxPrice)?.label ?? '价格';
  }, [minPrice, maxPrice]);

  // 查询
  const handleSearch = useCallback(() => {
    const parts: string[] = [
      `city=${city}`,
      `checkInDate=${checkInDate}`,
      `checkOutDate=${checkOutDate}`,
      `roomCount=${roomCount}`,
      `adultCount=${adultCount}`
    ];
    if (keyword) parts.push(`keyword=${keyword}`);
    if (starRating !== undefined) parts.push(`starRating=${starRating}`);
    if (minPrice !== undefined) parts.push(`minPrice=${minPrice}`);
    if (maxPrice !== undefined) parts.push(`maxPrice=${maxPrice}`);

    Taro.navigateTo({
      url: `/pages/hotel-list/index?${parts.join('&')}`
    });
  }, [
    city,
    keyword,
    checkInDate,
    checkOutDate,
    roomCount,
    adultCount,
    starRating,
    minPrice,
    maxPrice
  ]);

  return (
    <View className="home">
      {/* ========== Banner ========== */}
      <View className="home__banner" onClick={handleBannerClick}>
        <View style={{ height: `${statusBarHeight}px` }} />
        <View className="home__banner-content">
          <Text className="home__banner-title">精选酒店推荐</Text>
          <Text className="home__banner-sub">点击查看详情 &gt;</Text>
        </View>
      </View>

      {/* ========== 白色浮动卡片 ========== */}
      <View className="home__card">
        {/* Row1: 城市 + 搜索 */}
        <View className="home__row-city-search">
          <View className="home__city-box">
            <Text className="home__city-icon" onClick={handleLocate}>
              📍
            </Text>
            <Picker mode="selector" range={HOT_CITIES} onChange={handleCityChange}>
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <Text className="home__city-name">{city}</Text>
                <Text className="home__city-arrow">▼</Text>
              </View>
            </Picker>
          </View>

          <View className="home__divider" />

          <View className="home__search-box" onClick={handleSearchClick}>
            <Text className="home__search-icon">🔍</Text>
            <Text className="home__search-placeholder">{keyword || '位置/品牌/酒店'}</Text>
          </View>
        </View>

        {/* Row2: 日期 */}
        <View className="home__row-date" onClick={() => setCalendarVisible(true)}>
          <View className="home__date-left">
            <View className="home__date-item">
              <Text className="home__date-main">{formatDateCN(checkInDate)}</Text>
              <Text className="home__date-tag">{getDateTag(checkInDate)}</Text>
            </View>
            <Text className="home__date-sep">—</Text>
            <View className="home__date-item">
              <Text className="home__date-main">{formatDateCN(checkOutDate)}</Text>
              <Text className="home__date-tag">{getDateTag(checkOutDate)}</Text>
            </View>
          </View>
          <Text className="home__nights">共{nights}晚</Text>
        </View>

        {/* Row3: 房间/人数 + 筛选 */}
        <View className="home__row-room-filter">
          <View className="home__room-info">
            <Picker
              mode="selector"
              range={ROOM_RANGE}
              value={roomCount - 1}
              onChange={handleRoomChange}
            >
              <Text className="home__room-item">{roomCount}间房</Text>
            </Picker>
            <Picker
              mode="selector"
              range={ADULT_RANGE}
              value={adultCount - 1}
              onChange={handleAdultChange}
            >
              <Text className="home__room-item">{adultCount}成人</Text>
            </Picker>
          </View>

          <View className="home__filter-btns">
            <View
              className={`home__filter-btn ${activeFilter === 'star' || starRating !== undefined ? 'home__filter-btn--active' : ''}`}
              onClick={() => toggleFilter('star')}
            >
              <Text className="home__filter-btn-text">{starLabel}</Text>
              <Text
                className={`home__filter-btn-arrow ${activeFilter === 'star' ? 'home__filter-btn-arrow--up' : ''}`}
              >
                ▼
              </Text>
            </View>
            <View
              className={`home__filter-btn ${activeFilter === 'price' || minPrice !== undefined || maxPrice !== undefined ? 'home__filter-btn--active' : ''}`}
              onClick={() => toggleFilter('price')}
            >
              <Text className="home__filter-btn-text">{priceLabel}</Text>
              <Text
                className={`home__filter-btn-arrow ${activeFilter === 'price' ? 'home__filter-btn-arrow--up' : ''}`}
              >
                ▼
              </Text>
            </View>
          </View>
        </View>

        {/* 筛选下拉面板 */}
        {activeFilter && (
          <View className="home__filter-dropdown">
            {activeFilter === 'star' &&
              STAR_OPTIONS.map((opt) => (
                <View
                  key={opt.label}
                  className={`home__filter-option ${opt.value === starRating ? 'home__filter-option--active' : ''}`}
                  onClick={() => handleStarSelect(opt.value)}
                >
                  <Text className="home__filter-option-text">{opt.label}</Text>
                  {opt.value === starRating && <Text className="home__filter-option-check">✓</Text>}
                </View>
              ))}

            {activeFilter === 'price' &&
              PRICE_OPTIONS.map((opt) => (
                <View
                  key={opt.label}
                  className={`home__filter-option ${opt.min === minPrice && opt.max === maxPrice ? 'home__filter-option--active' : ''}`}
                  onClick={() => handlePriceSelect(opt)}
                >
                  <Text className="home__filter-option-text">{opt.label}</Text>
                  {opt.min === minPrice && opt.max === maxPrice && (
                    <Text className="home__filter-option-check">✓</Text>
                  )}
                </View>
              ))}
          </View>
        )}

        {/* 查询按钮 */}
        <View className="home__search-btn" onClick={handleSearch}>
          <Text className="home__search-btn-text">查 询</Text>
        </View>
      </View>

      {/* ========== 日历组件 ========== */}
      <Calendar
        visible={calendarVisible}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        onConfirm={handleCalendarConfirm}
        onClose={() => setCalendarVisible(false)}
      />
    </View>
  );
}
