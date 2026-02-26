import { View, Text, Input, Button, Image } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import './index.scss';

export default function Index() {
  const [city, setCity] = useState('上海');
  const [keyword, setKeyword] = useState('');
  const [checkIn, setCheckIn] = useState('2024-07-01');
  const [checkOut, setCheckOut] = useState('2024-07-02');
  const [star, setStar] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const handleSearch = () => {
    Taro.navigateTo({
      url: `/pages/hotel-list/index?city=${city}&keyword=${keyword}`
    });
  };

  const goToDetail = () => {
    Taro.navigateTo({
      url: '/pages/hotel-detail/index?id=1'
    });
  };

  const tags = ['亲子', '豪华', '免费停车', '近地铁', '商务出行'];

  return (
    <View className="search-page">
      {/* 顶部 Banner */}
      <View className="banner" onClick={goToDetail}>
        <Image src="https://picsum.photos/400/200" mode="aspectFill" />
        <View className="banner-text">点击查看推荐酒店</View>
      </View>

      {/* 查询区域 */}
      <View className="search-box">
        {/* 当前城市 */}
        <View className="form-item">
          <Text className="label">当前城市</Text>
          <Input value={city} onInput={(e) => setCity(e.detail.value)} />
        </View>

        {/* 入住日期 */}
        <View className="form-item">
          <Text className="label">入住日期</Text>
          <View className="date-box">
            <Text>{checkIn}</Text>
            <Text> - </Text>
            <Text>{checkOut}</Text>
          </View>
        </View>

        {/* 关键词 */}
        <View className="form-item">
          <Text className="label">关键词</Text>
          <Input
            value={keyword}
            placeholder="如：外滩、迪士尼"
            onInput={(e) => setKeyword(e.detail.value)}
          />
        </View>

        {/* 星级筛选 */}
        <View className="form-item">
          <Text className="label">酒店星级</Text>
          <Input value={star} placeholder="如：3星以上" onInput={(e) => setStar(e.detail.value)} />
        </View>

        {/* 价格区间 */}
        <View className="form-item">
          <Text className="label">价格区间</Text>
          <Input
            value={priceRange}
            placeholder="如：200-500"
            onInput={(e) => setPriceRange(e.detail.value)}
          />
        </View>

        {/* 快捷标签 */}
        <View className="tag-section">
          <Text className="label">快捷筛选</Text>
          <View className="tags">
            {tags.map((tag) => (
              <Text
                key={tag}
                className={`tag ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Text>
            ))}
          </View>
        </View>

        {/* 查询按钮 */}
        <Button className="search-btn" onClick={handleSearch}>
          查询酒店
        </Button>
      </View>
    </View>
  );
}
