import { useState, useCallback, useEffect, useRef } from 'react';
import { View } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import { SearchHeader, FilterPanel, VirtualList } from './components';
import { getHotelList } from '../../services/api';
import { getMockHotelList } from '../../constants/mock';
import type { HotelListItem, FilterState, HotelListParams } from '../../types/hotel';

import './index.scss';

// 是否使用 Mock 数据
const USE_MOCK = false;

// 默认每页数量
const PAGE_SIZE = 10;

// 获取今天日期字符串
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// 获取明天日期字符串
function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function HotelList() {
  const router = useRouter();

  // 从URL参数初始化筛选状态
  const [filters, setFilters] = useState<FilterState>(() => {
    const p = router.params;
    const decode = (v: string | undefined) => (v ? decodeURIComponent(v) : '');
    return {
      keyword: decode(p.keyword),
      city: decode(p.city),
      checkInDate: decode(p.checkInDate) || getToday(),
      checkOutDate: decode(p.checkOutDate) || getTomorrow(),
      roomCount: p.roomCount ? Number(p.roomCount) : 1,
      adultCount: p.adultCount ? Number(p.adultCount) : 1,
      starRating: p.starRating ? Number(p.starRating) : undefined,
      hotelType: '',
      minPrice: p.minPrice ? Number(p.minPrice) : undefined,
      maxPrice: p.maxPrice ? Number(p.maxPrice) : undefined,
      sortBy: 'default'
    };
  });
  const [hotels, setHotels] = useState<HotelListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  // 构建请求参数
  const buildParams = useCallback(
    (page: number): HotelListParams => {
      const params: HotelListParams = {
        page,
        pageSize: PAGE_SIZE
      };
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.city) params.city = filters.city;
      if (filters.starRating !== undefined) params.starRating = filters.starRating;
      if (filters.hotelType) params.hotelType = filters.hotelType;
      if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
      if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
      if (filters.sortBy !== 'default') params.sortBy = filters.sortBy;
      return params;
    },
    [filters]
  );

  // 加载数据
  const fetchData = useCallback(
    async (page: number, append = false) => {
      if (loading) return;
      setLoading(true);

      try {
        const params = buildParams(page);
        let result;

        if (USE_MOCK) {
          result = await getMockHotelList(params);
        } else {
          try {
            result = await getHotelList(params);
          } catch {
            // API 不可用时降级到 mock
            result = await getMockHotelList(params);
          }
        }

        if (append) {
          setHotels((prev) => [...prev, ...result.list]);
        } else {
          setHotels(result.list);
        }

        setHasMore(page < result.pagination.totalPages);
        pageRef.current = page;
      } catch (err) {
        console.error('加载酒店列表失败:', err);
      } finally {
        setLoading(false);
      }
    },
    [buildParams, loading]
  );

  // 初始加载
  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 筛选变化时重新加载
  const filtersChangedRef = useRef(false);
  useEffect(() => {
    // 跳过初始渲染
    if (!filtersChangedRef.current) {
      filtersChangedRef.current = true;
      return;
    }
    pageRef.current = 1;
    setHasMore(true);
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.keyword,
    filters.city,
    filters.starRating,
    filters.hotelType,
    filters.minPrice,
    filters.maxPrice,
    filters.sortBy
  ]);

  // 筛选条件变更
  const handleFiltersChange = useCallback((partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  // 加载更多
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchData(pageRef.current + 1, true);
    }
  }, [loading, hasMore, fetchData]);

  return (
    <View className="hotel-list-page">
      <SearchHeader filters={filters} onFiltersChange={handleFiltersChange} />
      <FilterPanel filters={filters} onFiltersChange={handleFiltersChange} />
      <VirtualList
        hotels={hotels}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
      />
    </View>
  );
}

export default HotelList;
