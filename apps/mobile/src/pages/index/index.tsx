import { Component, PropsWithChildren } from 'react';
import { View } from '@tarojs/components';

import './index.scss';

export default class Index extends Component<PropsWithChildren> {
  render() {
    return <View className="index">酒店查询</View>;
  }
}
