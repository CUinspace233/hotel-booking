import { Component, PropsWithChildren } from 'react';
import { View } from '@tarojs/components';

import './index.scss';

export default class HotelList extends Component<PropsWithChildren> {
  render() {
    return <View className="hotel-list">酒店列表</View>;
  }
}
