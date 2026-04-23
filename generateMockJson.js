const fs = require('fs');

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
];

const getImages = (count = 3) =>
  Array.from({ length: count }, (_, i) => PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length]);

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'townhouse', 'land'];
const TYPE_TITLES = {
  apartment: ['Modern Apartment', 'Luxury Condo', 'Studio', 'Penthouse', 'High-rise Condo', 'Budget Apartment', 'Riverside Apartment', 'City View Apartment'],
  house:     ['Family House', 'Modern House', 'Corner House', 'Garden House', 'Smart Home', 'Eco House'],
  villa:     ['Luxury Villa', 'Pool Villa', 'Garden Villa', 'Twin Villa', 'Resort Villa'],
  townhouse: ['Townhouse', 'Duplex Townhouse', 'Shophouse', 'Corner Townhouse'],
  land:      ['Land Plot', 'Residential Land', 'Corner Land', 'Commercial Land'],
};
const STREET_NAMES = ['Nguyen Hue', 'Le Loi', 'Tran Hung Dao', 'Vo Van Tan', 'Nam Ky Khoi Nghia', 'Hai Ba Trung', 'Ly Thuong Kiet', 'Dinh Tien Hoang'];

const priceBase = {
  apartment: 1_500_000_000,
  house:     4_000_000_000,
  villa:     8_000_000_000,
  townhouse: 5_000_000_000,
  land:      2_000_000_000,
};

const makeProperty = (
  id,
  title,
  province,
  district,
  lat,
  lng,
  type,
  i,
) => {
  const priceVariance = ((i * 73 + 19) % 100) / 100;
  const price = Math.round(priceBase[type] * (1 + priceVariance * 1.5));
  const area = type === 'land' ? 80 + (i % 10) * 20
             : type === 'villa' ? 180 + (i % 6) * 30
             : 45 + (i % 12) * 10;
  const bedrooms  = type === 'land' ? 0 : type === 'apartment' ? 1 + (i % 3) : 2 + (i % 4);
  const bathrooms = type === 'land' ? 0 : 1 + (i % 3);

  return {
    id: String(id),
    title,
    price,
    province,
    district,
    address: `${10 + (i % 200)} ${STREET_NAMES[i % STREET_NAMES.length]}, ${district}`,
    latitude:  lat + (((i * 137 + 31) % 100) - 50) / 3333,
    longitude: lng + (((i * 179 + 53) % 100) - 50) / 3333,
    area,
    bedrooms,
    bathrooms,
    propertyType: type,
    images: getImages(2 + (i % 5)),
    isFavorite:    i % 15 === 0,
    isHighlighted: i % 8 === 0,
    description: `${title} — well-located property in ${district}, ${province}.`,
    createdAt: `2024-0${1 + (i % 9)}-${String(1 + (i % 28)).padStart(2, '0')}T08:00:00Z`,
  };
};

const HCM_DISTRICTS = [
  { name: 'District 1',  lat: 10.7769, lng: 106.7009 },
  { name: 'District 2',  lat: 10.8016, lng: 106.7351 },
  { name: 'District 3',  lat: 10.7747, lng: 106.6899 },
  { name: 'District 4',  lat: 10.7572, lng: 106.7026 },
  { name: 'District 5',  lat: 10.7553, lng: 106.6625 },
  { name: 'District 6',  lat: 10.7481, lng: 106.6349 },
  { name: 'District 7',  lat: 10.7294, lng: 106.7218 },
  { name: 'District 8',  lat: 10.7234, lng: 106.6285 },
  { name: 'District 9',  lat: 10.8412, lng: 106.7800 },
  { name: 'District 10', lat: 10.7729, lng: 106.6715 },
  { name: 'District 11', lat: 10.7630, lng: 106.6513 },
  { name: 'District 12', lat: 10.8688, lng: 106.6447 },
  { name: 'Binh Thanh',  lat: 10.8020, lng: 106.7119 },
  { name: 'Go Vap',      lat: 10.8350, lng: 106.6641 },
  { name: 'Phu Nhuan',   lat: 10.7993, lng: 106.6801 },
  { name: 'Tan Binh',    lat: 10.8015, lng: 106.6522 },
  { name: 'Tan Phu',     lat: 10.7940, lng: 106.6280 },
  { name: 'Binh Chanh',  lat: 10.6930, lng: 106.6210 },
  { name: 'Thu Duc',     lat: 10.8485, lng: 106.7728 },
  { name: 'Nha Be',      lat: 10.6931, lng: 106.7223 },
];

const generateHCM = () =>
  Array.from({ length: 100 }, (_, i) => {
    const d = HCM_DISTRICTS[i % HCM_DISTRICTS.length];
    const type = PROPERTY_TYPES[i % PROPERTY_TYPES.length];
    return makeProperty(51 + i, `${TYPE_TITLES[type][i % TYPE_TITLES[type].length]} in ${d.name}`,
      'Ho Chi Minh City', d.name, d.lat, d.lng, type, i);
  });

const HN_DISTRICTS = [
  { name: 'Ba Dinh',     lat: 21.0340, lng: 105.8412 },
  { name: 'Hoan Kiem',   lat: 21.0285, lng: 105.8542 },
  { name: 'Cau Giay',    lat: 21.0378, lng: 105.7944 },
  { name: 'Dong Da',     lat: 21.0247, lng: 105.8434 },
  { name: 'Tay Ho',      lat: 21.0607, lng: 105.8232 },
  { name: 'Long Bien',   lat: 21.0433, lng: 105.8890 },
  { name: 'Ha Dong',     lat: 20.9711, lng: 105.7789 },
  { name: 'Nam Tu Liem', lat: 21.0051, lng: 105.8088 },
  { name: 'Thanh Xuan',  lat: 20.9947, lng: 105.8364 },
  { name: 'Hai Ba Trung',lat: 21.0100, lng: 105.8520 },
  { name: 'Bac Tu Liem', lat: 21.0650, lng: 105.7760 },
  { name: 'Hoang Mai',   lat: 20.9806, lng: 105.8572 },
  { name: 'Tay Ho',      lat: 21.0607, lng: 105.8232 },
  { name: 'Gia Lam',     lat: 21.0050, lng: 105.9310 },
  { name: 'Chuong My',   lat: 20.9000, lng: 105.7200 },
];

const generateHanoi = () =>
  Array.from({ length: 100 }, (_, i) => {
    const d = HN_DISTRICTS[i % HN_DISTRICTS.length];
    const type = PROPERTY_TYPES[i % PROPERTY_TYPES.length];
    return makeProperty(251 + i, `${TYPE_TITLES[type][i % TYPE_TITLES[type].length]} in ${d.name}`,
      'Hanoi', d.name, d.lat, d.lng, type, i);
  });

const DN_DISTRICTS = [
  { name: 'Hai Chau',    lat: 16.0678, lng: 108.2208 },
  { name: 'Son Tra',     lat: 16.0545, lng: 108.2475 },
  { name: 'Ngu Hanh Son',lat: 15.9943, lng: 108.2568 },
  { name: 'Thanh Khe',   lat: 16.0788, lng: 108.2001 },
  { name: 'Cam Le',      lat: 16.0200, lng: 108.2100 },
  { name: 'Lien Chieu',  lat: 16.1017, lng: 108.1490 },
  { name: 'Hoa Vang',    lat: 15.9650, lng: 108.0890 },
];

const generateDaNang = () =>
  Array.from({ length: 100 }, (_, i) => {
    const d = DN_DISTRICTS[i % DN_DISTRICTS.length];
    const type = PROPERTY_TYPES[i % PROPERTY_TYPES.length];
    return makeProperty(451 + i, `${TYPE_TITLES[type][i % TYPE_TITLES[type].length]} in ${d.name}`,
      'Da Nang', d.name, d.lat, d.lng, type, i);
  });

const HP_DISTRICTS = [
  { name: 'Hong Bang',  lat: 20.8648, lng: 106.6838 },
  { name: 'Ngo Quyen',  lat: 20.8733, lng: 106.7019 },
  { name: 'Le Chan',    lat: 20.8577, lng: 106.6960 },
  { name: 'Kien An',    lat: 20.8243, lng: 106.6313 },
  { name: 'Duong Kinh', lat: 20.8127, lng: 106.7490 },
  { name: 'Hai An',     lat: 20.8450, lng: 106.7500 },
  { name: 'Do Son',     lat: 20.7261, lng: 106.7921 },
  { name: 'An Duong',   lat: 20.8910, lng: 106.6399 },
];

const generateHaiPhong = () =>
  Array.from({ length: 100 }, (_, i) => {
    const d = HP_DISTRICTS[i % HP_DISTRICTS.length];
    const type = PROPERTY_TYPES[i % PROPERTY_TYPES.length];
    return makeProperty(651 + i, `${TYPE_TITLES[type][i % TYPE_TITLES[type].length]} in ${d.name}`,
      'Hai Phong', d.name, d.lat, d.lng, type, i);
  });

const MOCK_PROPERTIES = [
  {
    id: '1', title: 'Luxury Apartment in Ba Dinh', price: 4500000000,
    province: 'Hanoi', district: 'Ba Dinh', address: '12 Nguyen Thai Hoc, Ba Dinh, Hanoi',
    latitude: 21.0340, longitude: 105.8412, area: 95, bedrooms: 3, bathrooms: 2,
    propertyType: 'apartment', images: getImages(4), isFavorite: false, isHighlighted: true,
    description: 'Modern luxury apartment with panoramic city views.', createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '2', title: 'Townhouse in Hoan Kiem', price: 8200000000,
    province: 'Hanoi', district: 'Hoan Kiem', address: '45 Hang Bai, Hoan Kiem, Hanoi',
    latitude: 21.0285, longitude: 105.8542, area: 60, bedrooms: 4, bathrooms: 3,
    propertyType: 'townhouse', images: getImages(3), isFavorite: true, isHighlighted: false,
    description: 'Historic Old Quarter townhouse, fully renovated.', createdAt: '2024-01-20T09:00:00Z',
  },
  {
    id: '3', title: 'Modern House in Cau Giay', price: 6800000000,
    province: 'Hanoi', district: 'Cau Giay', address: '88 Xuan Thuy, Cau Giay, Hanoi',
    latitude: 21.0378, longitude: 105.7944, area: 120, bedrooms: 4, bathrooms: 3,
    propertyType: 'house', images: getImages(5), isFavorite: false, isHighlighted: false,
    description: 'Spacious modern house in university district.', createdAt: '2024-02-01T10:00:00Z',
  },
  {
    id: '4', title: 'Studio in Dong Da', price: 1800000000,
    province: 'Hanoi', district: 'Dong Da', address: '23 Nguyen Luong Bang, Dong Da, Hanoi',
    latitude: 21.0247, longitude: 105.8434, area: 45, bedrooms: 1, bathrooms: 1,
    propertyType: 'apartment', images: getImages(3), isFavorite: false, isHighlighted: false,
    description: 'Cozy studio, ideal for young professionals.', createdAt: '2024-02-05T11:00:00Z',
  },
  {
    id: '5', title: 'Villa in Tay Ho', price: 15000000000,
    province: 'Hanoi', district: 'Tay Ho', address: '5 Dang Thai Mai, Tay Ho, Hanoi',
    latitude: 21.0607, longitude: 105.8232, area: 250, bedrooms: 5, bathrooms: 4,
    propertyType: 'villa', images: getImages(6), isFavorite: true, isHighlighted: true,
    description: 'Stunning lakeside villa with West Lake views.', createdAt: '2024-02-10T12:00:00Z',
  },
  {
    id: '6', title: 'Apartment in Long Bien', price: 2200000000,
    province: 'Hanoi', district: 'Long Bien', address: '101 Nguyen Van Cu, Long Bien, Hanoi',
    latitude: 21.0433, longitude: 105.8890, area: 68, bedrooms: 2, bathrooms: 2,
    propertyType: 'apartment', images: getImages(3), isFavorite: false, isHighlighted: false,
    description: 'Well-maintained apartment with river views.', createdAt: '2024-02-15T13:00:00Z',
  },
  {
    id: '7', title: 'Land Plot in Ha Dong', price: 3500000000,
    province: 'Hanoi', district: 'Ha Dong', address: '77 Quang Trung, Ha Dong, Hanoi',
    latitude: 20.9711, longitude: 105.7789, area: 80, bedrooms: 0, bathrooms: 0,
    propertyType: 'land', images: getImages(2), isFavorite: false, isHighlighted: false,
    description: 'Prime land plot in rapidly developing Ha Dong.', createdAt: '2024-02-20T14:00:00Z',
  },
  {
    id: '8', title: 'Penthouse in Nam Tu Liem', price: 9500000000,
    province: 'Hanoi', district: 'Nam Tu Liem', address: 'Royal City, Nam Tu Liem, Hanoi',
    latitude: 21.0051, longitude: 105.8088, area: 180, bedrooms: 4, bathrooms: 3,
    propertyType: 'apartment', images: getImages(5), isFavorite: false, isHighlighted: true,
    description: 'Exclusive penthouse with 360-degree Hanoi panorama.', createdAt: '2024-03-01T08:00:00Z',
  },
  {
    id: '9', title: 'House in Thanh Xuan', price: 5200000000,
    province: 'Hanoi', district: 'Thanh Xuan', address: '34 Nguyen Trai, Thanh Xuan, Hanoi',
    latitude: 20.9947, longitude: 105.8364, area: 90, bedrooms: 3, bathrooms: 2,
    propertyType: 'house', images: getImages(4), isFavorite: false, isHighlighted: false,
    description: 'Family home in quiet residential street.', createdAt: '2024-03-05T09:00:00Z',
  },
  {
    id: '10', title: 'Apartment in Hai Ba Trung', price: 3100000000,
    province: 'Hanoi', district: 'Hai Ba Trung', address: '56 Bach Mai, Hai Ba Trung, Hanoi',
    latitude: 21.0100, longitude: 105.8520, area: 75, bedrooms: 2, bathrooms: 2,
    propertyType: 'apartment', images: getImages(3), isFavorite: true, isHighlighted: false,
    description: 'Bright and airy apartment in central location.', createdAt: '2024-03-10T10:00:00Z',
  },
  {
    id: '11', title: 'Luxury Condo in District 1', price: 7800000000,
    province: 'Ho Chi Minh City', district: 'District 1', address: '88 Nguyen Hue, District 1, HCMC',
    latitude: 10.7769, longitude: 106.7009, area: 100, bedrooms: 3, bathrooms: 2,
    propertyType: 'apartment', images: getImages(5), isFavorite: false, isHighlighted: true,
    description: 'Premium condo on the iconic Nguyen Hue walking street.', createdAt: '2024-01-18T08:00:00Z',
  },
  {
    id: '12', title: 'Villa in Binh Thanh', price: 12000000000,
    province: 'Ho Chi Minh City', district: 'Binh Thanh', address: '10 Xo Viet Nghe Tinh, Binh Thanh, HCMC',
    latitude: 10.8020, longitude: 106.7119, area: 200, bedrooms: 5, bathrooms: 4,
    propertyType: 'villa', images: getImages(6), isFavorite: true, isHighlighted: false,
    description: 'Elegant villa with private pool in Binh Thanh.', createdAt: '2024-01-25T09:00:00Z',
  },
  {
    id: '13', title: 'Apartment in District 7', price: 3500000000,
    province: 'Ho Chi Minh City', district: 'District 7', address: 'Phu My Hung, District 7, HCMC',
    latitude: 10.7294, longitude: 106.7218, area: 85, bedrooms: 2, bathrooms: 2,
    propertyType: 'apartment', images: getImages(4), isFavorite: false, isHighlighted: false,
    description: 'Modern apartment in upscale Phu My Hung township.', createdAt: '2024-02-02T10:00:00Z',
  },
  {
    id: '14', title: 'Townhouse in District 3', price: 9200000000,
    province: 'Ho Chi Minh City', district: 'District 3', address: '22 Vo Van Tan, District 3, HCMC',
    latitude: 10.7747, longitude: 106.6899, area: 70, bedrooms: 4, bathrooms: 3,
    propertyType: 'townhouse', images: getImages(4), isFavorite: false, isHighlighted: true,
    description: 'French colonial-style townhouse in cultural heart.', createdAt: '2024-02-08T11:00:00Z',
  },
  {
    id: '15', title: 'Penthouse in Thu Duc', price: 6500000000,
    province: 'Ho Chi Minh City', district: 'Thu Duc', address: 'Vinhomes Grand Park, Thu Duc, HCMC',
    latitude: 10.8485, longitude: 106.7728, area: 150, bedrooms: 4, bathrooms: 3,
    propertyType: 'apartment', images: getImages(5), isFavorite: false, isHighlighted: false,
    description: 'Grand penthouse in Vinhomes Grand Park.', createdAt: '2024-02-12T12:00:00Z',
  },
  {
    id: '16', title: 'House in Binh Chanh', price: 4100000000,
    province: 'Ho Chi Minh City', district: 'Binh Chanh', address: 'National Road 1A, Binh Chanh, HCMC',
    latitude: 10.6930, longitude: 106.6210, area: 130, bedrooms: 3, bathrooms: 2,
    propertyType: 'house', images: getImages(3), isFavorite: false, isHighlighted: false,
    description: 'Spacious house near highway, ideal for commuters.', createdAt: '2024-02-18T13:00:00Z',
  },
  {
    id: '17', title: 'Studio in District 4', price: 1600000000,
    province: 'Ho Chi Minh City', district: 'District 4', address: '15 Ton Dan, District 4, HCMC',
    latitude: 10.7572, longitude: 106.7026, area: 40, bedrooms: 1, bathrooms: 1,
    propertyType: 'apartment', images: getImages(3), isFavorite: false, isHighlighted: false,
    description: 'Affordable studio perfect for first-time buyers.', createdAt: '2024-02-22T14:00:00Z',
  },
  {
    id: '18', title: 'Apartment in Go Vap', price: 2400000000,
    province: 'Ho Chi Minh City', district: 'Go Vap', address: '99 Nguyen Oanh, Go Vap, HCMC',
    latitude: 10.8350, longitude: 106.6641, area: 72, bedrooms: 2, bathrooms: 2,
    propertyType: 'apartment', images: getImages(4), isFavorite: true, isHighlighted: false,
    description: 'Value apartment in growing northern district.', createdAt: '2024-03-02T08:00:00Z',
  },
  {
    id: '19', title: 'Villa in District 2', price: 18000000000,
    province: 'Ho Chi Minh City', district: 'District 2', address: 'Thao Dien, District 2, HCMC',
    latitude: 10.8016, longitude: 106.7351, area: 300, bedrooms: 6, bathrooms: 5,
    propertyType: 'villa', images: getImages(6), isFavorite: false, isHighlighted: true,
    description: 'Ultra-luxury expat villa in Thao Dien enclave.', createdAt: '2024-03-06T09:00:00Z',
  },
  {
    id: '20', title: 'Land in Nha Be', price: 2800000000,
    province: 'Ho Chi Minh City', district: 'Nha Be', address: 'Phuoc Kien, Nha Be, HCMC',
    latitude: 10.6931, longitude: 106.7223, area: 100, bedrooms: 0, bathrooms: 0,
    propertyType: 'land', images: getImages(2), isFavorite: false, isHighlighted: false,
    description: 'Residential land in fast-developing southern corridor.', createdAt: '2024-03-12T10:00:00Z',
  },
  {
    id: '21', title: 'Beachfront Apartment in Son Tra', price: 3800000000,
    province: 'Da Nang', district: 'Son Tra', address: 'My Khe Beach Road, Son Tra, Da Nang',
    latitude: 16.0545, longitude: 108.2475, area: 80, bedrooms: 2, bathrooms: 2,
    propertyType: 'apartment', images: getImages(5), isFavorite: false, isHighlighted: true,
    description: 'Stunning ocean-view apartment steps from My Khe beach.', createdAt: '2024-01-22T08:00:00Z',
  },
  {
    id: '22', title: 'Villa in Ngu Hanh Son', price: 8500000000,
    province: 'Da Nang', district: 'Ngu Hanh Son', address: 'Truong Sa, Ngu Hanh Son, Da Nang',
    latitude: 15.9943, longitude: 108.2568, area: 220, bedrooms: 5, bathrooms: 4,
    propertyType: 'villa', images: getImages(5), isFavorite: true, isHighlighted: false,
    description: 'Luxury resort-style villa near Marble Mountains.', createdAt: '2024-01-28T09:00:00Z',
  },
  {
    id: '23', title: 'House in Hai Chau', price: 5000000000,
    province: 'Da Nang', district: 'Hai Chau', address: '200 Tran Phu, Hai Chau, Da Nang',
    latitude: 16.0678, longitude: 108.2208, area: 100, bedrooms: 3, bathrooms: 2,
    propertyType: 'house', images: getImages(4), isFavorite: false, isHighlighted: false,
    description: 'Central district family house with great connectivity.', createdAt: '2024-02-03T10:00:00Z',
  },
  {
    id: '24', title: 'Apartment in Thanh Khe', price: 1900000000,
    province: 'Da Nang', district: 'Thanh Khe', address: '56 Hung Vuong, Thanh Khe, Da Nang',
    latitude: 16.0788, longitude: 108.2001, area: 58, bedrooms: 2, bathrooms: 1,
    propertyType: 'apartment', images: getImages(3), isFavorite: false, isHighlighted: false,
    description: 'Affordable apartment in western Da Nang.', createdAt: '2024-02-09T11:00:00Z',
  },
  {
    id: '25', title: 'Townhouse in Cam Le', price: 3200000000,
    province: 'Da Nang', district: 'Cam Le', address: 'Hoa Xuan Urban Area, Cam Le, Da Nang',
    latitude: 16.0200, longitude: 108.2100, area: 90, bedrooms: 3, bathrooms: 2,
    propertyType: 'townhouse', images: getImages(4), isFavorite: false, isHighlighted: false,
    description: 'New townhouse in the rapidly growing Hoa Xuan zone.', createdAt: '2024-02-14T12:00:00Z',
  },
  {
    id: '26', title: 'Land in Hoa Vang', price: 1200000000,
    province: 'Da Nang', district: 'Hoa Vang', address: 'Hoa Nhon, Hoa Vang, Da Nang',
    latitude: 15.9650, longitude: 108.0890, area: 150, bedrooms: 0, bathrooms: 0,
    propertyType: 'land', images: getImages(2), isFavorite: false, isHighlighted: false,
    description: 'Large land parcel in scenic mountain foothills.', createdAt: '2024-02-19T13:00:00Z',
  },
  {
    id: '27', title: 'Condo in Lien Chieu', price: 2100000000,
    province: 'Da Nang', district: 'Lien Chieu', address: 'Ton Duc Thang, Lien Chieu, Da Nang',
    latitude: 16.1017, longitude: 108.1490, area: 65, bedrooms: 2, bathrooms: 1,
    propertyType: 'apartment', images: getImages(3), isFavorite: false, isHighlighted: false,
    description: 'Coastal condo near Da Nang university zone.', createdAt: '2024-02-25T14:00:00Z',
  },
  {
    id: '28', title: 'Resort Villa in Son Tra Peninsula', price: 22000000000,
    province: 'Da Nang', district: 'Son Tra', address: 'Son Tra Peninsula, Da Nang',
    latitude: 16.1000, longitude: 108.2800, area: 400, bedrooms: 6, bathrooms: 6,
    propertyType: 'villa', images: getImages(6), isFavorite: false, isHighlighted: true,
    description: 'Peninsula estate with private sea access.', createdAt: '2024-03-03T08:00:00Z',
  },
  {
    id: '29', title: 'Apartment in Hong Bang', price: 1500000000,
    province: 'Hai Phong', district: 'Hong Bang', address: '45 Tran Phu, Hong Bang, Hai Phong',
    latitude: 20.8648, longitude: 106.6838, area: 60, bedrooms: 2, bathrooms: 1,
    propertyType: 'apartment', images: getImages(3), isFavorite: false, isHighlighted: false,
    description: 'Comfortable apartment in historical Hai Phong centre.', createdAt: '2024-01-19T08:00:00Z',
  },
  {
    id: '30', title: 'House in Ngo Quyen', price: 3800000000,
    province: 'Hai Phong', district: 'Ngo Quyen', address: '12 Lach Tray, Ngo Quyen, Hai Phong',
    latitude: 20.8733, longitude: 106.7019, area: 110, bedrooms: 3, bathrooms: 2,
    propertyType: 'house', images: getImages(4), isFavorite: false, isHighlighted: true,
    description: 'Solid family house in the commercial hub.', createdAt: '2024-01-26T09:00:00Z',
  },
  {
    id: '31', title: 'Villa in Duong Kinh', price: 6000000000,
    province: 'Hai Phong', district: 'Duong Kinh', address: 'Do Son Road, Duong Kinh, Hai Phong',
    latitude: 20.8127, longitude: 106.7490, area: 180, bedrooms: 4, bathrooms: 3,
    propertyType: 'villa', images: getImages(5), isFavorite: true, isHighlighted: false,
    description: 'Peaceful villa near beach resorts.', createdAt: '2024-02-04T10:00:00Z',
  },
  {
    id: '32', title: 'Apartment in Le Chan', price: 1700000000,
    province: 'Hai Phong', district: 'Le Chan', address: '89 Cat Dai, Le Chan, Hai Phong',
    latitude: 20.8577, longitude: 106.6960, area: 55, bedrooms: 2, bathrooms: 1,
    propertyType: 'apartment', images: getImages(3), isFavorite: false, isHighlighted: false,
    description: 'Neat apartment in a lively urban neighborhood.', createdAt: '2024-02-11T11:00:00Z',
  },
  {
    id: '33', title: 'Land in An Duong', price: 2000000000,
    province: 'Hai Phong', district: 'An Duong', address: 'An Dong, An Duong, Hai Phong',
    latitude: 20.8910, longitude: 106.6399, area: 120, bedrooms: 0, bathrooms: 0,
    propertyType: 'land', images: getImages(2), isFavorite: false, isHighlighted: false,
    description: 'Land suitable for residential or commercial development.', createdAt: '2024-02-16T12:00:00Z',
  },
  {
    id: '34', title: 'Townhouse in Kien An', price: 2700000000,
    province: 'Hai Phong', district: 'Kien An', address: 'Tran Thanh Ngo, Kien An, Hai Phong',
    latitude: 20.8243, longitude: 106.6313, area: 80, bedrooms: 3, bathrooms: 2,
    propertyType: 'townhouse', images: getImages(3), isFavorite: false, isHighlighted: false,
    description: 'Modern townhouse in outer residential belt.', createdAt: '2024-02-21T13:00:00Z',
  },
  {
    id: '35', title: 'Apartment in Do Son', price: 2500000000,
    province: 'Hai Phong', district: 'Do Son', address: 'Do Son Beach, Hai Phong',
    latitude: 20.7261, longitude: 106.7921, area: 70, bedrooms: 2, bathrooms: 2,
    propertyType: 'apartment', images: getImages(4), isFavorite: false, isHighlighted: false,
    description: 'Sea-view apartment in popular Do Son resort town.', createdAt: '2024-02-26T14:00:00Z',
  },
  {
    id: '36', title: 'Riverside Villa in Ninh Kieu', price: 7500000000,
    province: 'Can Tho', district: 'Ninh Kieu', address: '1 Hai Ba Trung, Ninh Kieu, Can Tho',
    latitude: 10.0341, longitude: 105.7875, area: 200, bedrooms: 4, bathrooms: 3,
    propertyType: 'villa', images: getImages(5), isFavorite: true, isHighlighted: true,
    description: 'Magnificent riverside villa with Hau River views.', createdAt: '2024-01-23T08:00:00Z',
  },
  {
    id: '37', title: 'Apartment in Binh Thuy', price: 1400000000,
    province: 'Can Tho', district: 'Binh Thuy', address: '34 Cach Mang Thang 8, Binh Thuy, Can Tho',
    latitude: 10.0530, longitude: 105.7599, area: 65, bedrooms: 2, bathrooms: 1,
    propertyType: 'apartment', images: getImages(3), isFavorite: false, isHighlighted: false,
    description: 'Affordable apartment near Can Tho University.', createdAt: '2024-01-29T09:00:00Z',
  },
  {
    id: '38', title: 'House in Cai Rang', price: 2900000000,
    province: 'Can Tho', district: 'Cai Rang', address: 'Hung Phu, Cai Rang, Can Tho',
    latitude: 10.0055, longitude: 105.7850, area: 100, bedrooms: 3, bathrooms: 2,
    propertyType: 'house', images: getImages(4), isFavorite: false, isHighlighted: false,
    description: 'Spacious house near the famous Cai Rang floating market.', createdAt: '2024-02-06T10:00:00Z',
  },
  {
    id: '39', title: 'Townhouse in O Mon', price: 1800000000,
    province: 'Can Tho', district: 'O Mon', address: 'Chau Van Liem, O Mon, Can Tho',
    latitude: 10.0756, longitude: 105.7430, area: 70, bedrooms: 3, bathrooms: 2,
    propertyType: 'townhouse', images: getImages(3), isFavorite: false, isHighlighted: false,
    description: 'New townhouse in northern industrial zone.', createdAt: '2024-02-13T11:00:00Z',
  },
  {
    id: '40', title: 'Land in Phong Dien', price: 850000000,
    province: 'Can Tho', district: 'Phong Dien', address: 'Phong Dien Market Area, Can Tho',
    latitude: 9.9856, longitude: 105.7421, area: 200, bedrooms: 0, bathrooms: 0,
    propertyType: 'land', images: getImages(2), isFavorite: false, isHighlighted: false,
    description: 'Affordable rural land, ideal for agriculture.', createdAt: '2024-02-17T12:00:00Z',
  },
  {
    id: '41', title: 'Apartment in Thot Not', price: 1200000000,
    province: 'Can Tho', district: 'Thot Not', address: 'Thot Not Town Center, Can Tho',
    latitude: 10.2688, longitude: 105.5905, area: 55, bedrooms: 2, bathrooms: 1,
    propertyType: 'apartment', images: getImages(3), isFavorite: false, isHighlighted: false,
    description: 'Entry-level apartment in northern Can Tho satellite town.', createdAt: '2024-02-23T13:00:00Z',
  },
  {
    id: '42', title: 'High-rise Condo in Ba Dinh', price: 5500000000,
    province: 'Hanoi', district: 'Ba Dinh', address: 'Vinhomes Metropolis, Ba Dinh, Hanoi',
    latitude: 21.0380, longitude: 105.8250, area: 110, bedrooms: 3, bathrooms: 2,
    propertyType: 'apartment', images: getImages(5), isFavorite: false, isHighlighted: false,
    description: 'Prestigious Vinhomes Metropolis apartment.', createdAt: '2024-03-08T08:00:00Z',
  },
  {
    id: '43', title: 'Duplex in District 10', price: 4200000000,
    province: 'Ho Chi Minh City', district: 'District 10', address: '40 To Hien Thanh, District 10, HCMC',
    latitude: 10.7729, longitude: 106.6715, area: 95, bedrooms: 3, bathrooms: 3,
    propertyType: 'apartment', images: getImages(4), isFavorite: false, isHighlighted: false,
    description: 'Chic duplex in creative arts district.', createdAt: '2024-03-09T09:00:00Z',
  },
  {
    id: '44', title: 'Eco House in Hoa Vang', price: 2600000000,
    province: 'Da Nang', district: 'Hoa Vang', address: 'Nam Viet A, Hoa Vang, Da Nang',
    latitude: 16.0000, longitude: 108.1700, area: 140, bedrooms: 3, bathrooms: 2,
    propertyType: 'house', images: getImages(4), isFavorite: false, isHighlighted: false,
    description: 'Green eco-friendly house surrounded by nature.', createdAt: '2024-03-11T10:00:00Z',
  },
  {
    id: '45', title: 'Shophouse in Ngo Quyen', price: 5800000000,
    province: 'Hai Phong', district: 'Ngo Quyen', address: 'Nguyen Duc Canh, Ngo Quyen, Hai Phong',
    latitude: 20.8780, longitude: 106.7100, area: 85, bedrooms: 4, bathrooms: 3,
    propertyType: 'townhouse', images: getImages(4), isFavorite: false, isHighlighted: true,
    description: 'Commercial ground + residential upper floors.', createdAt: '2024-03-13T11:00:00Z',
  },
  {
    id: '46', title: 'Riverside Apartment in Ninh Kieu', price: 2200000000,
    province: 'Can Tho', district: 'Ninh Kieu', address: 'Ben Ninh Kieu, Can Tho',
    latitude: 10.0300, longitude: 105.7920, area: 75, bedrooms: 2, bathrooms: 2,
    propertyType: 'apartment', images: getImages(4), isFavorite: true, isHighlighted: false,
    description: 'Lovely riverside apartment with floating market ambiance.', createdAt: '2024-03-14T12:00:00Z',
  },
  {
    id: '47', title: 'Smart Home in Bac Tu Liem', price: 7200000000,
    province: 'Hanoi', district: 'Bac Tu Liem', address: 'Xuan Dinh, Bac Tu Liem, Hanoi',
    latitude: 21.0650, longitude: 105.7760, area: 160, bedrooms: 4, bathrooms: 3,
    propertyType: 'house', images: getImages(5), isFavorite: false, isHighlighted: false,
    description: 'Fully automated smart home with solar power.', createdAt: '2024-03-15T13:00:00Z',
  },
  {
    id: '48', title: 'Budget Apartment in Tan Phu', price: 1350000000,
    province: 'Ho Chi Minh City', district: 'Tan Phu', address: '22 Tan Ky Tan Quy, Tan Phu, HCMC',
    latitude: 10.7940, longitude: 106.6280, area: 48, bedrooms: 1, bathrooms: 1,
    propertyType: 'apartment', images: getImages(3), isFavorite: false, isHighlighted: false,
    description: 'Compact and affordable starter apartment.', createdAt: '2024-03-16T14:00:00Z',
  },
  {
    id: '49', title: 'Mountain View House in Lien Chieu', price: 3400000000,
    province: 'Da Nang', district: 'Lien Chieu', address: 'Nam O, Lien Chieu, Da Nang',
    latitude: 16.1150, longitude: 108.1300, area: 115, bedrooms: 3, bathrooms: 2,
    propertyType: 'house', images: getImages(4), isFavorite: false, isHighlighted: false,
    description: 'Tranquil house with mountain backdrop.', createdAt: '2024-03-17T08:00:00Z',
  },
  {
    id: '50', title: 'Corner Villa in Hai An', price: 9000000000,
    province: 'Hai Phong', district: 'Hai An', address: 'Dang Hai, Hai An, Hai Phong',
    latitude: 20.8450, longitude: 106.7500, area: 280, bedrooms: 5, bathrooms: 4,
    propertyType: 'villa', images: getImages(6), isFavorite: false, isHighlighted: false,
    description: 'Magnificent corner villa near Hai Phong Airport.', createdAt: '2024-03-18T09:00:00Z',
  },
  ...generateHCM(),
  ...generateHanoi(),
  ...generateDaNang(),
  ...generateHaiPhong(),
];

fs.writeFileSync('properties_mock_data.json', JSON.stringify(MOCK_PROPERTIES, null, 2));
console.log('Mock data written to properties_mock_data.json successfully.');
