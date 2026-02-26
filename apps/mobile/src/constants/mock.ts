import type {
  HotelListItem,
  HotelListResponse,
  HotelListParams,
  SearchSuggestionItem,
  HotelDetailResponse,
  HotelRoomInfo
} from '../types/hotel';
import { FACILITY_MAP } from '../types/hotel';

// 50 条测试酒店数据
const MOCK_HOTELS: HotelListItem[] = [
  {
    hotelId: 'HTL00000001',
    name: '北京国际大饭店',
    hotelType: 'business',
    coverImage: '',
    starRating: 5,
    score: 4.8,
    reviewCount: 1256,
    city: '北京',
    district: '朝阳区',
    address: '北京市朝阳区建国门外大街9号',
    description: '位于北京CBD核心地段的五星级商务酒店',
    minPrice: 1288,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'spa']
  },
  {
    hotelId: 'HTL00000002',
    name: '上海外滩华尔道夫',
    hotelType: 'boutique',
    coverImage: '',
    starRating: 5,
    score: 4.9,
    reviewCount: 876,
    city: '上海',
    district: '黄浦区',
    address: '上海市黄浦区中山东一路2号',
    description: '坐拥外滩绝美江景的精品奢华酒店',
    minPrice: 2388,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'spa', 'restaurant', 'bar']
  },
  {
    hotelId: 'HTL00000003',
    name: '广州白天鹅宾馆',
    hotelType: 'standard',
    coverImage: '',
    starRating: 5,
    score: 4.7,
    reviewCount: 1543,
    city: '广州',
    district: '荔湾区',
    address: '广州市荔湾区沙面南街1号',
    description: '珠江畔历史悠久的五星级酒店',
    minPrice: 988,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym']
  },
  {
    hotelId: 'HTL00000004',
    name: '深圳蛇口希尔顿南海酒店',
    hotelType: 'resort',
    coverImage: '',
    starRating: 5,
    score: 4.6,
    reviewCount: 982,
    city: '深圳',
    district: '南山区',
    address: '深圳市南山区望海路1177号',
    description: '海景度假胜地，尽享南海风光',
    minPrice: 1588,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'spa', 'restaurant']
  },
  {
    hotelId: 'HTL00000005',
    name: '杭州西湖国宾馆',
    hotelType: 'resort',
    coverImage: '',
    starRating: 5,
    score: 4.8,
    reviewCount: 1123,
    city: '杭州',
    district: '西湖区',
    address: '杭州市西湖区杨公堤18号',
    description: '西湖景区内唯一的园林式国宾馆',
    minPrice: 1888,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'restaurant']
  },
  {
    hotelId: 'HTL00000006',
    name: '成都锦江宾馆',
    hotelType: 'standard',
    coverImage: '',
    starRating: 4,
    score: 4.3,
    reviewCount: 532,
    city: '成都',
    district: '锦江区',
    address: '成都市锦江区人民南路二段80号',
    description: '成都市中心地标性四星酒店',
    minPrice: 588,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'gym']
  },
  {
    hotelId: 'HTL00000007',
    name: '重庆解放碑威斯汀',
    hotelType: 'business',
    coverImage: '',
    starRating: 5,
    score: 4.5,
    reviewCount: 1678,
    city: '重庆',
    district: '渝中区',
    address: '重庆市渝中区民族路177号',
    description: '俯瞰两江交汇的高端商务酒店',
    minPrice: 1088,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'spa']
  },
  {
    hotelId: 'HTL00000008',
    name: '西安钟楼饭店',
    hotelType: 'standard',
    coverImage: '',
    starRating: 4,
    score: 4.5,
    reviewCount: 345,
    city: '西安',
    district: '碑林区',
    address: '西安市碑林区东大街110号',
    description: '毗邻钟楼的经典四星酒店',
    minPrice: 458,
    facilityCodes: ['wifi', 'parking', 'breakfast']
  },
  {
    hotelId: 'HTL00000009',
    name: '北京王府半岛酒店',
    hotelType: 'boutique',
    coverImage: '',
    starRating: 5,
    score: 4.9,
    reviewCount: 543,
    city: '北京',
    district: '东城区',
    address: '北京市东城区金鱼胡同8号',
    description: '王府井商圈顶级精品酒店',
    minPrice: 2688,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'spa', 'restaurant', 'bar']
  },
  {
    hotelId: 'HTL00000010',
    name: '上海浦东丽思卡尔顿',
    hotelType: 'business',
    coverImage: '',
    starRating: 5,
    score: 4.7,
    reviewCount: 1892,
    city: '上海',
    district: '浦东新区',
    address: '上海市浦东新区世纪大道8号',
    description: '陆家嘴金融中心的奢华商务酒店',
    minPrice: 1988,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'spa', 'restaurant']
  },
  {
    hotelId: 'HTL00000011',
    name: '广州正佳万豪酒店',
    hotelType: 'business',
    coverImage: '',
    starRating: 5,
    score: 4.6,
    reviewCount: 756,
    city: '广州',
    district: '天河区',
    address: '广州市天河区天河路228号',
    description: '天河商圈核心的五星商务酒店',
    minPrice: 888,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym']
  },
  {
    hotelId: 'HTL00000012',
    name: '深圳大梅沙京基喜来登',
    hotelType: 'resort',
    coverImage: '',
    starRating: 4,
    score: 4.2,
    reviewCount: 678,
    city: '深圳',
    district: '盐田区',
    address: '深圳市盐田区大梅沙盐梅路9号',
    description: '海滨度假好去处',
    minPrice: 788,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'spa']
  },
  {
    hotelId: 'HTL00000013',
    name: '杭州绿城尊蓝酒店',
    hotelType: 'boutique',
    coverImage: '',
    starRating: 4,
    score: 4.4,
    reviewCount: 423,
    city: '杭州',
    district: '拱墅区',
    address: '杭州市拱墅区绍兴路508号',
    description: '运河边上的精品艺术酒店',
    minPrice: 698,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'restaurant']
  },
  {
    hotelId: 'HTL00000014',
    name: '成都保利公园皇冠假日',
    hotelType: 'resort',
    coverImage: '',
    starRating: 4,
    score: 4.1,
    reviewCount: 567,
    city: '成都',
    district: '武侯区',
    address: '成都市武侯区天府大道北段28号',
    description: '天府新城的花园式度假酒店',
    minPrice: 528,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym']
  },
  {
    hotelId: 'HTL00000015',
    name: '重庆来福士洲际酒店',
    hotelType: 'business',
    coverImage: '',
    starRating: 5,
    score: 4.8,
    reviewCount: 1345,
    city: '重庆',
    district: '渝中区',
    address: '重庆市渝中区民族路188号',
    description: '来福士广场顶层的地标酒店',
    minPrice: 1388,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'spa', 'restaurant', 'bar']
  },
  {
    hotelId: 'HTL00000016',
    name: '西安威斯汀大酒店',
    hotelType: 'business',
    coverImage: '',
    starRating: 5,
    score: 4.5,
    reviewCount: 2001,
    city: '西安',
    district: '高新区',
    address: '西安市高新区锦业路12号',
    description: '高新区CBD的高端商务酒店',
    minPrice: 888,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'spa']
  },
  {
    hotelId: 'HTL00000017',
    name: '北京如家精选',
    hotelType: 'hostel',
    coverImage: '',
    starRating: 3,
    score: 3.9,
    reviewCount: 234,
    city: '北京',
    district: '海淀区',
    address: '北京市海淀区中关村大街27号',
    description: '中关村地区性价比之选',
    minPrice: 298,
    facilityCodes: ['wifi']
  },
  {
    hotelId: 'HTL00000018',
    name: '上海静安寺全季酒店',
    hotelType: 'hostel',
    coverImage: '',
    starRating: 3,
    score: 3.8,
    reviewCount: 156,
    city: '上海',
    district: '静安区',
    address: '上海市静安区愚园路68号',
    description: '静安核心地段的品质经济酒店',
    minPrice: 358,
    facilityCodes: ['wifi', 'laundry']
  },
  {
    hotelId: 'HTL00000019',
    name: '广州珠江新城亚朵',
    hotelType: 'boutique',
    coverImage: '',
    starRating: 4,
    score: 4.0,
    reviewCount: 812,
    city: '广州',
    district: '天河区',
    address: '广州市天河区花城大道30号',
    description: '人文主题精品酒店',
    minPrice: 498,
    facilityCodes: ['wifi', 'laundry', 'gym']
  },
  {
    hotelId: 'HTL00000020',
    name: '深圳华侨城洲际',
    hotelType: 'resort',
    coverImage: '',
    starRating: 5,
    score: 4.9,
    reviewCount: 634,
    city: '深圳',
    district: '南山区',
    address: '深圳市南山区深南大道9009号',
    description: '华侨城景区内的五星度假胜地',
    minPrice: 1288,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'spa', 'restaurant']
  },
  {
    hotelId: 'HTL00000021',
    name: '杭州千岛湖绿城度假酒店',
    hotelType: 'resort',
    coverImage: '',
    starRating: 5,
    score: 4.7,
    reviewCount: 1102,
    city: '杭州',
    district: '淳安县',
    address: '杭州市淳安县千岛湖镇阳光路',
    description: '千岛湖畔的园林度假胜地',
    minPrice: 1688,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'spa', 'restaurant']
  },
  {
    hotelId: 'HTL00000022',
    name: '成都太古里博舍',
    hotelType: 'boutique',
    coverImage: '',
    starRating: 5,
    score: 4.6,
    reviewCount: 1467,
    city: '成都',
    district: '锦江区',
    address: '成都市锦江区笔帖式街81号',
    description: '太古里旁的设计精品酒店',
    minPrice: 1588,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'spa', 'restaurant', 'bar']
  },
  {
    hotelId: 'HTL00000023',
    name: '重庆万达瑞华酒店',
    hotelType: 'business',
    coverImage: '',
    starRating: 5,
    score: 4.8,
    reviewCount: 891,
    city: '重庆',
    district: '南岸区',
    address: '重庆市南岸区南滨路22号',
    description: '南滨路江景商务酒店',
    minPrice: 988,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym']
  },
  {
    hotelId: 'HTL00000024',
    name: '西安钟楼亚朵',
    hotelType: 'boutique',
    coverImage: '',
    starRating: 4,
    score: 4.3,
    reviewCount: 298,
    city: '西安',
    district: '碑林区',
    address: '西安市碑林区南大街1号',
    description: '钟楼旁的文艺精品酒店',
    minPrice: 388,
    facilityCodes: ['wifi', 'laundry', 'gym']
  },
  {
    hotelId: 'HTL00000025',
    name: '北京三里屯CHAO',
    hotelType: 'boutique',
    coverImage: '',
    starRating: 4,
    score: 4.5,
    reviewCount: 456,
    city: '北京',
    district: '朝阳区',
    address: '北京市朝阳区工体东路4号',
    description: '三里屯潮流地标设计酒店',
    minPrice: 988,
    facilityCodes: ['wifi', 'parking', 'gym', 'restaurant', 'bar']
  },
  {
    hotelId: 'HTL00000026',
    name: '上海新天地安达仕',
    hotelType: 'boutique',
    coverImage: '',
    starRating: 5,
    score: 4.5,
    reviewCount: 1234,
    city: '上海',
    district: '黄浦区',
    address: '上海市黄浦区嵩山路88号',
    description: '新天地商圈的时尚精品酒店',
    minPrice: 1588,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'gym', 'spa', 'restaurant', 'bar']
  },
  {
    hotelId: 'HTL00000027',
    name: '广州从化碧水湾温泉',
    hotelType: 'resort',
    coverImage: '',
    starRating: 4,
    score: 4.2,
    reviewCount: 634,
    city: '广州',
    district: '从化区',
    address: '广州市从化区良口镇',
    description: '天然温泉度假胜地',
    minPrice: 688,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'spa']
  },
  {
    hotelId: 'HTL00000028',
    name: '深圳前海华尔道夫',
    hotelType: 'business',
    coverImage: '',
    starRating: 5,
    score: 4.9,
    reviewCount: 567,
    city: '深圳',
    district: '南山区',
    address: '深圳市南山区前海路168号',
    description: '前海自贸区超五星商务酒店',
    minPrice: 2188,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'spa', 'restaurant', 'bar']
  },
  {
    hotelId: 'HTL00000029',
    name: '杭州法云安缦',
    hotelType: 'resort',
    coverImage: '',
    starRating: 5,
    score: 4.7,
    reviewCount: 1789,
    city: '杭州',
    district: '西湖区',
    address: '杭州市西湖区法云弄22号',
    description: '灵隐寺旁的顶级度假村',
    minPrice: 2888,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'spa', 'restaurant']
  },
  {
    hotelId: 'HTL00000030',
    name: '成都世纪城天堂洲际',
    hotelType: 'business',
    coverImage: '',
    starRating: 5,
    score: 4.6,
    reviewCount: 1023,
    city: '成都',
    district: '高新区',
    address: '成都市高新区世纪城路88号',
    description: '大型会展商务五星酒店',
    minPrice: 788,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'meeting']
  },
  {
    hotelId: 'HTL00000031',
    name: '重庆融汇丽笙酒店',
    hotelType: 'standard',
    coverImage: '',
    starRating: 4,
    score: 4.4,
    reviewCount: 389,
    city: '重庆',
    district: '沙坪坝区',
    address: '重庆市沙坪坝区融汇路1号',
    description: '温泉小镇内的四星酒店',
    minPrice: 458,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'spa']
  },
  {
    hotelId: 'HTL00000032',
    name: '西安曲江银座酒店',
    hotelType: 'standard',
    coverImage: '',
    starRating: 4,
    score: 4.1,
    reviewCount: 723,
    city: '西安',
    district: '雁塔区',
    address: '西安市雁塔区慈恩路66号',
    description: '大雁塔景区旁的舒适酒店',
    minPrice: 398,
    facilityCodes: ['wifi', 'parking', 'breakfast']
  },
  {
    hotelId: 'HTL00000033',
    name: '北京望京凯悦酒店',
    hotelType: 'business',
    coverImage: '',
    starRating: 5,
    score: 4.8,
    reviewCount: 1456,
    city: '北京',
    district: '朝阳区',
    address: '北京市朝阳区广顺南大街8号',
    description: '望京商务区五星酒店',
    minPrice: 988,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'restaurant']
  },
  {
    hotelId: 'HTL00000034',
    name: '上海虹桥雅辰悦居',
    hotelType: 'apartment',
    coverImage: '',
    starRating: 4,
    score: 4.0,
    reviewCount: 512,
    city: '上海',
    district: '闵行区',
    address: '上海市闵行区申长路688号',
    description: '虹桥枢纽旁的高端服务公寓',
    minPrice: 628,
    facilityCodes: ['wifi', 'parking', 'laundry', 'gym']
  },
  {
    hotelId: 'HTL00000035',
    name: '广州汇华希尔顿逸林',
    hotelType: 'standard',
    coverImage: '',
    starRating: 4,
    score: 4.3,
    reviewCount: 532,
    city: '广州',
    district: '番禺区',
    address: '广州市番禺区汉溪大道西333号',
    description: '长隆景区周边的便捷酒店',
    minPrice: 488,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool']
  },
  {
    hotelId: 'HTL00000036',
    name: '深圳龙华希尔顿',
    hotelType: 'business',
    coverImage: '',
    starRating: 5,
    score: 4.8,
    reviewCount: 1256,
    city: '深圳',
    district: '龙华区',
    address: '深圳市龙华区民治大道168号',
    description: '龙华新中心的商务酒店',
    minPrice: 688,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'gym']
  },
  {
    hotelId: 'HTL00000037',
    name: '杭州城中香格里拉',
    hotelType: 'business',
    coverImage: '',
    starRating: 5,
    score: 4.9,
    reviewCount: 876,
    city: '杭州',
    district: '上城区',
    address: '杭州市上城区长寿路2号',
    description: '武林广场旁的五星商务酒店',
    minPrice: 1188,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'spa', 'restaurant']
  },
  {
    hotelId: 'HTL00000038',
    name: '成都宽窄巷子亚朵S',
    hotelType: 'boutique',
    coverImage: '',
    starRating: 4,
    score: 4.5,
    reviewCount: 345,
    city: '成都',
    district: '青羊区',
    address: '成都市青羊区长顺上街127号',
    description: '宽窄巷子旁的人文精品酒店',
    minPrice: 438,
    facilityCodes: ['wifi', 'laundry', 'gym']
  },
  {
    hotelId: 'HTL00000039',
    name: '重庆江北嘴丽思卡尔顿',
    hotelType: 'business',
    coverImage: '',
    starRating: 5,
    score: 4.7,
    reviewCount: 1543,
    city: '重庆',
    district: '江北区',
    address: '重庆市江北区星耀路1号',
    description: '江北嘴CBD的顶级商务酒店',
    minPrice: 1688,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'spa', 'restaurant', 'bar']
  },
  {
    hotelId: 'HTL00000040',
    name: '西安大唐芙蓉园酒店',
    hotelType: 'resort',
    coverImage: '',
    starRating: 4,
    score: 4.2,
    reviewCount: 678,
    city: '西安',
    district: '雁塔区',
    address: '西安市雁塔区芙蓉西路99号',
    description: '大唐不夜城旁的唐风度假酒店',
    minPrice: 558,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool']
  },
  {
    hotelId: 'HTL00000041',
    name: '北京国贸大酒店',
    hotelType: 'business',
    coverImage: '',
    starRating: 5,
    score: 4.6,
    reviewCount: 982,
    city: '北京',
    district: '朝阳区',
    address: '北京市朝阳区建国门外大街1号',
    description: 'CBD核心的超高层商务酒店',
    minPrice: 1488,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'spa', 'restaurant', 'bar']
  },
  {
    hotelId: 'HTL00000042',
    name: '上海迪士尼乐园酒店',
    hotelType: 'resort',
    coverImage: '',
    starRating: 5,
    score: 4.8,
    reviewCount: 1123,
    city: '上海',
    district: '浦东新区',
    address: '上海市浦东新区申迪北路799号',
    description: '迪士尼主题度假酒店',
    minPrice: 1888,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'restaurant', 'shuttle']
  },
  {
    hotelId: 'HTL00000043',
    name: '广州花园酒店',
    hotelType: 'standard',
    coverImage: '',
    starRating: 5,
    score: 4.5,
    reviewCount: 1678,
    city: '广州',
    district: '越秀区',
    address: '广州市越秀区环市东路368号',
    description: '花园式五星级酒店经典之选',
    minPrice: 798,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'restaurant']
  },
  {
    hotelId: 'HTL00000044',
    name: '深圳东部华侨城瀑布酒店',
    hotelType: 'resort',
    coverImage: '',
    starRating: 4,
    score: 4.4,
    reviewCount: 423,
    city: '深圳',
    district: '盐田区',
    address: '深圳市盐田区大梅沙东部华侨城',
    description: '山谷中的瀑布主题度假酒店',
    minPrice: 888,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'spa']
  },
  {
    hotelId: 'HTL00000045',
    name: '杭州西溪悦榕庄',
    hotelType: 'resort',
    coverImage: '',
    starRating: 5,
    score: 4.9,
    reviewCount: 543,
    city: '杭州',
    district: '西湖区',
    address: '杭州市西湖区西溪湿地紫金港路21号',
    description: '西溪湿地旁的奢华度假村',
    minPrice: 2188,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'spa', 'restaurant']
  },
  {
    hotelId: 'HTL00000046',
    name: '成都尼依格罗酒店',
    hotelType: 'boutique',
    coverImage: '',
    starRating: 5,
    score: 4.7,
    reviewCount: 1892,
    city: '成都',
    district: '锦江区',
    address: '成都市锦江区红星路三段1号',
    description: 'IFS顶层的城市奢华精品酒店',
    minPrice: 1388,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'spa', 'restaurant', 'bar']
  },
  {
    hotelId: 'HTL00000047',
    name: '重庆北碚悦榕庄',
    hotelType: 'resort',
    coverImage: '',
    starRating: 5,
    score: 4.6,
    reviewCount: 756,
    city: '重庆',
    district: '北碚区',
    address: '重庆市北碚区云清路200号',
    description: '温泉山谷中的顶级度假村',
    minPrice: 1888,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'spa', 'restaurant']
  },
  {
    hotelId: 'HTL00000048',
    name: '西安W酒店',
    hotelType: 'boutique',
    coverImage: '',
    starRating: 5,
    score: 4.8,
    reviewCount: 1345,
    city: '西安',
    district: '曲江新区',
    address: '西安市曲江新区曲江池东路333号',
    description: '曲江池畔的潮牌设计酒店',
    minPrice: 1188,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'bar']
  },
  {
    hotelId: 'HTL00000049',
    name: '北京亚朵S酒店·知乎店',
    hotelType: 'boutique',
    coverImage: '',
    starRating: 4,
    score: 4.1,
    reviewCount: 567,
    city: '北京',
    district: '朝阳区',
    address: '北京市朝阳区酒仙桥路6号',
    description: '知乎主题的人文精品酒店',
    minPrice: 428,
    facilityCodes: ['wifi', 'laundry', 'gym']
  },
  {
    hotelId: 'HTL00000050',
    name: '上海佘山世茂洲际',
    hotelType: 'resort',
    coverImage: '',
    starRating: 5,
    score: 4.5,
    reviewCount: 2001,
    city: '上海',
    district: '松江区',
    address: '上海市松江区辰花公路5888号',
    description: '深坑中的奇迹酒店',
    minPrice: 2588,
    facilityCodes: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'spa', 'restaurant', 'bar']
  }
];

/**
 * 模拟 API 请求 —— 获取酒店列表
 * 支持前端筛选、排序、分页
 */
export function getMockHotelList(params: HotelListParams): Promise<HotelListResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...MOCK_HOTELS];

      // 关键词搜索
      if (params.keyword) {
        const kw = params.keyword.toLowerCase();
        filtered = filtered.filter(
          (h) => h.name?.toLowerCase().includes(kw) || h.address?.toLowerCase().includes(kw)
        );
      }

      // 城市筛选
      if (params.city) {
        filtered = filtered.filter((h) => h.city === params.city);
      }

      // 星级筛选
      if (params.starRating) {
        filtered = filtered.filter((h) => h.starRating === params.starRating);
      }

      // 酒店类型筛选
      if (params.hotelType) {
        filtered = filtered.filter((h) => h.hotelType === params.hotelType);
      }

      // 价格区间筛选
      if (params.minPrice !== undefined) {
        filtered = filtered.filter((h) => (h.minPrice ?? 0) >= params.minPrice!);
      }
      if (params.maxPrice !== undefined) {
        filtered = filtered.filter((h) => (h.minPrice ?? Infinity) <= params.maxPrice!);
      }

      // 排序
      if (params.sortBy === 'price_asc') {
        filtered.sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity));
      } else if (params.sortBy === 'price_desc') {
        filtered.sort((a, b) => (b.minPrice ?? 0) - (a.minPrice ?? 0));
      } else if (params.sortBy === 'rating_desc') {
        filtered.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      }

      // 分页
      const page = params.page ?? 1;
      const pageSize = params.pageSize ?? 10;
      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const list = filtered.slice(start, start + pageSize);

      resolve({
        list,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    }, 300); // 模拟网络延迟
  });
}

/**
 * 模拟搜索建议 —— 根据关键词模糊匹配酒店名称和地址
 * 最多返回 20 条
 */
export function getMockSearchSuggestions(keyword: string): Promise<SearchSuggestionItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!keyword.trim()) {
        resolve([]);
        return;
      }

      const kw = keyword.toLowerCase();
      const results = MOCK_HOTELS.filter(
        (h) =>
          h.name?.toLowerCase().includes(kw) ||
          h.address?.toLowerCase().includes(kw) ||
          h.city?.toLowerCase().includes(kw) ||
          h.district?.toLowerCase().includes(kw)
      )
        .slice(0, 20)
        .map((h) => ({
          hotelId: h.hotelId,
          name: h.name ?? '',
          city: h.city ?? '',
          district: h.district ?? '',
          address: h.address ?? '',
          minPrice: h.minPrice,
          starRating: h.starRating
        }));

      resolve(results);
    }, 150); // 搜索建议延迟更短
  });
}

/**
 * 根据酒店基础信息生成模拟房型数据
 */
function generateMockRooms(hotel: HotelListItem): HotelRoomInfo[] {
  const basePrice = hotel.minPrice ?? 500;
  const rooms: HotelRoomInfo[] = [
    {
      id: 1,
      roomId: `${hotel.hotelId}-R001`,
      hotelId: hotel.hotelId,
      version: 'published',
      roomName: '高级大床房',
      roomType: 'standard',
      bedType: 'queen',
      bedCount: '1',
      bedSize: '1.8米',
      roomSize: '32',
      floor: '2-4层',
      windowType: 'window',
      maxOccupancy: '2',
      basePrice: basePrice,
      breakfastType: 'none',
      breakfastCount: 0,
      totalCount: 10,
      availableCount: 5,
      description: '宽敞明亮的大床房，配备高品质床品',
      coverImage: '',
      status: 'active',
      sortOrder: 0,
      facilities: [],
      images: []
    },
    {
      id: 2,
      roomId: `${hotel.hotelId}-R002`,
      hotelId: hotel.hotelId,
      version: 'published',
      roomName: '豪华双床房',
      roomType: 'standard',
      bedType: 'twin',
      bedCount: '2',
      bedSize: '1.2米',
      roomSize: '36',
      floor: '5-8层',
      windowType: 'window',
      maxOccupancy: '2',
      basePrice: Math.round(basePrice * 1.2),
      breakfastType: 'none',
      breakfastCount: 0,
      totalCount: 8,
      availableCount: 3,
      description: '双床房，适合商务出行或亲子入住',
      coverImage: '',
      status: 'active',
      sortOrder: 1,
      facilities: [],
      images: []
    },
    {
      id: 3,
      roomId: `${hotel.hotelId}-R003`,
      hotelId: hotel.hotelId,
      version: 'published',
      roomName: '豪华大床房（含早）',
      roomType: 'deluxe',
      bedType: 'king',
      bedCount: '1',
      bedSize: '2.0米',
      roomSize: '40',
      floor: '9-12层',
      windowType: 'window',
      maxOccupancy: '2',
      basePrice: Math.round(basePrice * 1.5),
      breakfastType: 'buffet',
      breakfastCount: 2,
      totalCount: 6,
      availableCount: 2,
      description: '高楼层豪华房，含双份自助早餐',
      coverImage: '',
      status: 'active',
      sortOrder: 2,
      facilities: [],
      images: []
    },
    {
      id: 4,
      roomId: `${hotel.hotelId}-R004`,
      hotelId: hotel.hotelId,
      version: 'published',
      roomName: '行政套房',
      roomType: 'suite',
      bedType: 'king',
      bedCount: '1',
      bedSize: '2.0米',
      roomSize: '58',
      floor: '15-18层',
      windowType: 'window',
      maxOccupancy: '2',
      basePrice: Math.round(basePrice * 2.2),
      breakfastType: 'buffet',
      breakfastCount: 2,
      totalCount: 4,
      availableCount: 1,
      description: '行政楼层套房，尊享行政酒廊权益',
      coverImage: '',
      status: 'active',
      sortOrder: 3,
      facilities: [],
      images: []
    }
  ];
  return rooms;
}

/**
 * 模拟 API 请求 —— 获取酒店详情
 */
export function getMockHotelDetail(hotelId: string): Promise<HotelDetailResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const hotel = MOCK_HOTELS.find((h) => h.hotelId === hotelId);
      if (!hotel) {
        reject(new Error('酒店不存在'));
        return;
      }

      resolve({
        id: 1,
        hotelId: hotel.hotelId,
        name: hotel.name,
        hotelType: hotel.hotelType,
        status: 'approved',
        details: [
          {
            id: 1,
            hotelId: hotel.hotelId,
            version: 'published',
            fullName: hotel.name,
            englishName: null,
            starRating: hotel.starRating,
            brand: null,
            openingYear: 2019,
            renovationYear: null,
            totalRooms: null,
            totalFloors: null,
            country: '中国',
            province: null,
            city: hotel.city,
            district: hotel.district,
            address: hotel.address,
            longitude: null,
            latitude: null,
            phone: null,
            checkInTime: '14:00',
            checkOutTime: '12:00',
            description: hotel.description,
            highlight: null,
            coverImage: hotel.coverImage,
            facilities: hotel.facilityCodes.map((code, i) => ({
              id: i + 1,
              facilityCode: code,
              facilityName: FACILITY_MAP[code] || code,
              facilityCategory: 'general',
              description: null,
              isFree: true
            })),
            images: [],
            policies: []
          }
        ],
        rooms: generateMockRooms(hotel),
        stats: {
          id: 1,
          hotelId: hotel.hotelId,
          score: hotel.score ?? 0,
          reviewCount: hotel.reviewCount ?? 0
        }
      });
    }, 300);
  });
}
