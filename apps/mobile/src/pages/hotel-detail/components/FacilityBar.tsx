import { View, Text, ScrollView } from '@tarojs/components';
import { FACILITY_MAP } from '../../../types/hotel';
import type { HotelFacilityInfo } from '../../../types/hotel';

import './FacilityBar.scss';

interface FacilityBarProps {
  facilities: HotelFacilityInfo[];
}

function FacilityBar({ facilities }: FacilityBarProps) {
  if (facilities.length === 0) return null;

  return (
    <View className="facility-bar">
      <ScrollView scrollX className="facility-bar__scroll" enhanced showScrollbar={false}>
        <View className="facility-bar__list">
          {facilities.map((f) => (
            <View key={f.id} className="facility-bar__item">
              <Text className="facility-bar__item-text">
                {f.facilityName || FACILITY_MAP[f.facilityCode] || f.facilityCode}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default FacilityBar;
