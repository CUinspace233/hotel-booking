import { useState, useEffect, useCallback } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import useDebounce from '../../hooks/useDebounce';
import { getHotelList } from '../../services/api';
import { getMockSearchSuggestions } from '../../constants/mock';
import type { SearchSuggestionItem } from '../../types/hotel';

import './index.scss';

/** 高亮关键词：将匹配部分用 <Text className="highlight"> 包裹 */
function HighlightText({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword.trim()) {
    return <Text>{text}</Text>;
  }

  const idx = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1) {
    return <Text>{text}</Text>;
  }

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + keyword.length);
  const after = text.slice(idx + keyword.length);

  return (
    <Text>
      {before}
      <Text className="search-page__highlight">{match}</Text>
      {after}
    </Text>
  );
}

function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchSuggestionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedKeyword = useDebounce(keyword, 300);

  // 读取页面参数中的初始关键词
  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params;
    if (params?.keyword) {
      setKeyword(decodeURIComponent(params.keyword));
    }
  }, []);

  // debounced 关键词变化时发起搜索
  useEffect(() => {
    if (!debouncedKeyword.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        // 调用真实 API 搜索
        const res = await getHotelList({ keyword: debouncedKeyword, pageSize: 20 });
        if (!cancelled) {
          setResults(
            res.list.map((h) => ({
              hotelId: h.hotelId,
              name: h.name ?? '',
              city: h.city ?? '',
              district: h.district ?? '',
              address: h.address ?? '',
              minPrice: h.minPrice,
              starRating: h.starRating
            }))
          );
        }
      } catch {
        // API 不可用时降级到 mock
        const list = await getMockSearchSuggestions(debouncedKeyword);
        if (!cancelled) {
          setResults(list);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedKeyword]);

  const handleInput = useCallback((e) => {
    setKeyword(e.detail.value);
  }, []);

  const handleClear = useCallback(() => {
    setKeyword('');
    setResults([]);
  }, []);

  const handleCancel = useCallback(() => {
    Taro.navigateBack();
  }, []);

  const handleHotelClick = useCallback((hotelId: string) => {
    Taro.navigateTo({ url: `/pages/hotel-detail/index?hotelId=${hotelId}` });
  }, []);

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return '★'.repeat(rating);
  };

  return (
    <View className="search-page">
      {/* 顶部搜索栏 */}
      <View className="search-page__header">
        <View className="search-page__input-wrap">
          <Text className="search-page__icon">&#xe604;</Text>
          <Input
            className="search-page__input"
            placeholder="关键词/位置/酒店名"
            placeholderClass="search-page__placeholder"
            value={keyword}
            onInput={handleInput}
            focus
            confirmType="search"
          />
          {keyword && (
            <View className="search-page__clear" onClick={handleClear}>
              <Text className="search-page__clear-icon">×</Text>
            </View>
          )}
        </View>
        <Text className="search-page__cancel" onClick={handleCancel}>
          取消
        </Text>
      </View>

      {/* 搜索结果 */}
      <View className="search-page__body">
        {loading && (
          <View className="search-page__loading">
            <Text>搜索中...</Text>
          </View>
        )}

        {!loading && debouncedKeyword.trim() && results.length === 0 && (
          <View className="search-page__empty">
            <Text>未找到相关酒店</Text>
          </View>
        )}

        {!loading && results.length > 0 && (
          <View className="search-page__results">
            <View className="search-page__section-title">
              <Text>酒店 · {results.length}个结果</Text>
            </View>
            {results.map((item) => (
              <View
                key={item.hotelId}
                className="search-page__item"
                onClick={() => handleHotelClick(item.hotelId)}
              >
                <View className="search-page__item-main">
                  <View className="search-page__item-name">
                    <HighlightText text={item.name} keyword={debouncedKeyword} />
                  </View>
                  {item.minPrice != null && (
                    <Text className="search-page__item-price">¥{item.minPrice}起</Text>
                  )}
                </View>
                <View className="search-page__item-info">
                  <Text className="search-page__item-stars">{renderStars(item.starRating)}</Text>
                  <Text className="search-page__item-location">
                    {item.city} {item.district}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {!debouncedKeyword.trim() && !loading && (
          <View className="search-page__hint">
            <Text className="search-page__hint-text">输入酒店名、城市或地址进行搜索</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default SearchPage;
