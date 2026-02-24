import { View, Text, Input, Button, Image } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import './index.scss';

export default function Index() {
  const [city, setCity] = useState('上海');
  const [keyword, setKeyword] = useState('');

  const handleSearch = () => {
    Taro.navigateTo({
      url: '/pages/hotel-list/index'
    });
  };

  const goToDetail = () => {
    Taro.navigateTo({
      url: '/pages/hotel-detail/index'
    });
  };

  return (
    <View className="search-page">
      {/* Banner */}
      <View className="banner" onClick={goToDetail}>
        <Image src="https://picsum.photos/400/200" mode="aspectFill" />
      </View>

      {/* 核心查询区 */}
      <View className="search-box">
        <View className="form-item">
          <Text>当前城市</Text>
          <Input value={city} onInput={(e) => setCity(e.detail.value)} />
        </View>

        <View className="form-item">
          <Text>关键词</Text>
          <Input value={keyword} onInput={(e) => setKeyword(e.detail.value)} />
        </View>

        <Button className="search-btn" onClick={handleSearch}>
          查询酒店
        </Button>
      </View>
    </View>
  );
}
