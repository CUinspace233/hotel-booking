import { View, Text } from '@tarojs/components';

import './BottomBar.scss';

interface BottomBarProps {
  minPrice: number | null;
  onViewRooms?: () => void;
}

function BottomBar({ minPrice, onViewRooms }: BottomBarProps) {
  return (
    <View className="bottom-bar">
      <View className="bottom-bar__price">
        {minPrice != null ? (
          <>
            <Text className="bottom-bar__price-symbol">¥</Text>
            <Text className="bottom-bar__price-value">{minPrice}</Text>
            <Text className="bottom-bar__price-unit">起</Text>
          </>
        ) : (
          <Text className="bottom-bar__price-empty">暂无报价</Text>
        )}
      </View>
      <View className="bottom-bar__btn" onClick={onViewRooms}>
        <Text className="bottom-bar__btn-text">查看房型</Text>
      </View>
    </View>
  );
}

export default BottomBar;
