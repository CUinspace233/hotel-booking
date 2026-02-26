import { useState, useMemo } from 'react';
import { View, Text, Swiper, SwiperItem, Image } from '@tarojs/components';
import type { HotelImageInfo } from '../../../types/hotel';

import './ImageBanner.scss';

interface ImageBannerProps {
  coverImage: string | null;
  images: HotelImageInfo[];
}

function ImageBanner({ coverImage, images }: ImageBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 合并 coverImage 和 images，去重
  const allImages = useMemo(() => {
    const urls: string[] = [];
    if (coverImage) {
      urls.push(coverImage);
    }
    images.forEach((img) => {
      if (img.imageUrl && !urls.includes(img.imageUrl)) {
        urls.push(img.imageUrl);
      }
    });
    return urls;
  }, [coverImage, images]);

  const handleChange = (e) => {
    setCurrentIndex(e.detail.current);
  };

  // 无图片时显示占位
  if (allImages.length === 0) {
    return (
      <View className="image-banner">
        <View className="image-banner__placeholder">
          <Text className="image-banner__placeholder-text">暂无图片</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="image-banner">
      <Swiper
        className="image-banner__swiper"
        autoplay={false}
        indicatorDots={false}
        circular
        onChange={handleChange}
      >
        {allImages.map((url, index) => (
          <SwiperItem key={index} className="image-banner__slide">
            <Image className="image-banner__img" src={url} mode="aspectFill" />
          </SwiperItem>
        ))}
      </Swiper>
      <View className="image-banner__indicator">
        <Text className="image-banner__indicator-text">
          {currentIndex + 1}/{allImages.length}
        </Text>
      </View>
    </View>
  );
}

export default ImageBanner;
