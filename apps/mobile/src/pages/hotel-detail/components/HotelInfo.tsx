import { View, Text } from '@tarojs/components';

import './HotelInfo.scss';

interface HotelInfoProps {
  name: string | null;
  fullName: string | null;
  starRating: number | null;
  openingYear: number | null;
  renovationYear: number | null;
  score: number | null;
  reviewCount: number | null;
  address: string | null;
}

function getScoreLabel(score: number): string {
  if (score >= 4.8) return '超棒';
  if (score >= 4.5) return '很好';
  if (score >= 4.0) return '不错';
  return '尚可';
}

function HotelInfo({
  name,
  fullName,
  starRating,
  openingYear,
  renovationYear,
  score,
  reviewCount,
  address
}: HotelInfoProps) {
  const displayName = fullName || name || '未命名酒店';

  return (
    <View className="hotel-info">
      {/* 第一行：名称 + 星级 + 开业年份 */}
      <View className="hotel-info__name-row">
        <Text className="hotel-info__name">{displayName}</Text>
        {starRating != null && starRating > 0 && (
          <View className="hotel-info__diamond">
            {Array.from({ length: starRating }).map((_, i) => (
              <Text key={i} className="hotel-info__diamond-icon">
                ◆
              </Text>
            ))}
          </View>
        )}
        {openingYear && (
          <View className="hotel-info__year-badge">
            <Text className="hotel-info__year-text">{openingYear}年开业</Text>
          </View>
        )}
      </View>

      {/* 第二行：评分 + 评论数 + 装修年份 */}
      {score != null && score > 0 && (
        <View className="hotel-info__score-row">
          <View className="hotel-info__score-badge">
            <Text className="hotel-info__score-num">{score.toFixed(1)}</Text>
          </View>
          <Text className="hotel-info__score-label">{getScoreLabel(score)}</Text>
          {reviewCount != null && reviewCount > 0 && (
            <Text className="hotel-info__review-count">{reviewCount}条</Text>
          )}
          {renovationYear && (
            <View className="hotel-info__reno-badge">
              <Text className="hotel-info__reno-text">{renovationYear}年装修</Text>
            </View>
          )}
        </View>
      )}

      {/* 第三行：地址 */}
      {address && (
        <View className="hotel-info__address-row">
          <Text className="hotel-info__address-text">{address}</Text>
        </View>
      )}
    </View>
  );
}

export default HotelInfo;
