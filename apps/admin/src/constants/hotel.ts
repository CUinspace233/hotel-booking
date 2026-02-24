/**
 * 酒店相关常量定义
 */

import type { PolicyType, FacilityCategory } from '@/types';

// ===================== 政策相关常量 =====================

/** 预设政策类型选项 */
export const POLICY_TYPE_OPTIONS: { value: PolicyType; label: string }[] = [
  { value: 'checkIn', label: '入住时间' },
  { value: 'checkOut', label: '退房时间' },
  { value: 'pet', label: '宠物政策' },
  { value: 'cancel', label: '取消政策' },
  { value: 'parking', label: '停车政策' },
  { value: 'other', label: '其它政策' }
];

/** 根据政策类型获取默认名称 */
export function getPolicyNameByType(type: PolicyType): string {
  const option = POLICY_TYPE_OPTIONS.find((o) => o.value === type);
  return option ? option.label : '';
}

// ===================== 设施相关常量 =====================

/** 预设分类选项 */
export const FACILITY_CATEGORIES: { value: FacilityCategory; label: string }[] = [
  { value: 'transport', label: '交通服务' },
  { value: 'family', label: '亲子设施' },
  { value: 'dining', label: '餐饮服务' },
  { value: 'sports', label: '运动' },
  { value: 'reception', label: '前台服务' },
  { value: 'business', label: '商务服务' },
  { value: 'public', label: '公共区' },
  { value: 'cleaning', label: '清洁服务' },
  { value: 'security', label: '安全与安保' }
];

/** 每个分类下的预设设施 */
export const FACILITY_OPTIONS_BY_CATEGORY: Record<
  FacilityCategory,
  { value: string; label: string }[]
> = {
  transport: [
    { value: 'parking_free', label: '免费停车场' },
    { value: 'parking_paid', label: '收费停车场' },
    { value: 'airport_shuttle', label: '机场接送' },
    { value: 'station_shuttle', label: '火车站接送' },
    { value: 'rental_car', label: '租车服务' },
    { value: 'ev_charging', label: '充电桩' },
    { value: 'valet_parking', label: '代客泊车' },
    { value: 'bicycle_rental', label: '自行车租赁' }
  ],
  family: [
    { value: 'kids_playground', label: '儿童乐园' },
    { value: 'kids_pool', label: '儿童泳池' },
    { value: 'baby_crib', label: '婴儿床' },
    { value: 'kids_menu', label: '儿童餐' },
    { value: 'babysitting', label: '托婴服务' },
    { value: 'kids_club', label: '儿童俱乐部' },
    { value: 'family_room', label: '家庭房' },
    { value: 'kids_amenities', label: '儿童洗漱用品' }
  ],
  dining: [
    { value: 'restaurant', label: '餐厅' },
    { value: 'breakfast', label: '早餐服务' },
    { value: 'room_service', label: '客房送餐' },
    { value: 'bar', label: '酒吧' },
    { value: 'cafe', label: '咖啡厅' },
    { value: 'buffet', label: '自助餐' },
    { value: 'minibar', label: '迷你吧' },
    { value: 'vending_machine', label: '自动售货机' }
  ],
  sports: [
    { value: 'pool', label: '游泳池' },
    { value: 'gym', label: '健身房' },
    { value: 'spa', label: 'SPA' },
    { value: 'sauna', label: '桑拿' },
    { value: 'tennis', label: '网球场' },
    { value: 'golf', label: '高尔夫球场' },
    { value: 'yoga', label: '瑜伽室' },
    { value: 'massage', label: '按摩服务' }
  ],
  reception: [
    { value: 'front_desk_24h', label: '24小时前台' },
    { value: 'concierge', label: '礼宾服务' },
    { value: 'luggage_storage', label: '行李寄存' },
    { value: 'express_checkin', label: '快速入住' },
    { value: 'express_checkout', label: '快速退房' },
    { value: 'currency_exchange', label: '外币兑换' },
    { value: 'tour_desk', label: '旅游咨询台' },
    { value: 'wake_up_call', label: '叫醒服务' }
  ],
  business: [
    { value: 'meeting_room', label: '会议室' },
    { value: 'business_center', label: '商务中心' },
    { value: 'printer', label: '打印服务' },
    { value: 'fax', label: '传真服务' },
    { value: 'projector', label: '投影设备' },
    { value: 'translation', label: '翻译服务' },
    { value: 'secretarial', label: '秘书服务' }
  ],
  public: [
    { value: 'wifi_free', label: '免费WiFi' },
    { value: 'elevator', label: '电梯' },
    { value: 'lobby', label: '大堂' },
    { value: 'garden', label: '花园' },
    { value: 'terrace', label: '露台' },
    { value: 'library', label: '图书室' },
    { value: 'smoking_area', label: '吸烟区' },
    { value: 'atm', label: 'ATM机' },
    { value: 'wheelchair', label: '无障碍设施' }
  ],
  cleaning: [
    { value: 'daily_housekeeping', label: '每日客房清洁' },
    { value: 'laundry', label: '洗衣服务' },
    { value: 'dry_cleaning', label: '干洗服务' },
    { value: 'ironing', label: '熨烫服务' },
    { value: 'shoe_shine', label: '擦鞋服务' }
  ],
  security: [
    { value: 'cctv', label: '监控系统' },
    { value: 'security_24h', label: '24小时安保' },
    { value: 'safe_box', label: '保险箱' },
    { value: 'fire_extinguisher', label: '灭火器' },
    { value: 'smoke_detector', label: '烟雾报警器' },
    { value: 'first_aid', label: '急救包' },
    { value: 'card_access', label: '门禁系统' }
  ]
};

/** 判断是否为预设分类 */
export function isPresetCategory(category: string): category is FacilityCategory {
  return FACILITY_CATEGORIES.some((c) => c.value === category);
}

/** 获取分类显示名称 */
export function getCategoryLabel(category: string): string {
  const preset = FACILITY_CATEGORIES.find((c) => c.value === category);
  return preset ? preset.label : category;
}

/** 获取设施显示名称 */
export function getFacilityLabel(category: string, facilityCode: string): string {
  if (isPresetCategory(category)) {
    const options = FACILITY_OPTIONS_BY_CATEGORY[category];
    const option = options?.find((o) => o.value === facilityCode);
    if (option) return option.label;
  }
  return facilityCode;
}
