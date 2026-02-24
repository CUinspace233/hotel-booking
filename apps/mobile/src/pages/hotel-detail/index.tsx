import { Component, PropsWithChildren } from 'react';
import { View } from '@tarojs/components';

import './index.scss';

export default class HotelDetail extends Component<PropsWithChildren> {
  render() {
    return <View className="hotel-detail">酒店详情</View>;
  }
}
