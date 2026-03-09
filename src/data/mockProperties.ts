// filename: src/data/mockProperties.ts
import { Property } from '../types/property';

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

const getImages = (count = 3): string[] =>
  Array.from({ length: count }, (_, i) => PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length]);

export const MOCK_PROPERTIES: Property[] = [
  // ── HANOI ───────────────────────────────────────────────
  {
    id: '1', title: 'Luxury Apartment in Ba Dinh', price: 4500000000,
    province: 'Hanoi', district: 'Ba Dinh', address: '12 Nguyen Thai Hoc, Ba Dinh, Hanoi',
    latitude: 21.0340, longitude: 105.8412, area: 95, bedrooms: 3, bathrooms: 2,
    propertyType: 'apartment', images: getImages(4), isFavorite: false,
    description: 'Modern luxury apartment with panoramic city views in the heart of Ba Dinh district.',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '2', title: 'Townhouse in Hoan Kiem', price: 8200000000,
    province: 'Hanoi', district: 'Hoan Kiem', address: '45 Hang Bai, Hoan Kiem, Hanoi',
    latitude: 21.0285, longitude: 105.8542, area: 60, bedrooms: 4, bathrooms: 3,
    propertyType: 'townhouse', images: getImages(3), isFavorite: true,
    description: 'Historic Old Quarter townhouse, fully renovated, steps from Hoan Kiem Lake.',
    createdAt: '2024-01-20T09:00:00Z',
  },
  {
    id: '3', title: 'Modern House in Cau Giay', price: 6800000000,
    province: 'Hanoi', district: 'Cau Giay', address: '88 Xuan Thuy, Cau Giay, Hanoi',
    latitude: 21.0378, longitude: 105.7944, area: 120, bedrooms: 4, bathrooms: 3,
    propertyType: 'house', images: getImages(5), isFavorite: false,
    description: 'Spacious modern house in university district, close to all amenities.',
    createdAt: '2024-02-01T10:00:00Z',
  },
  {
    id: '4', title: 'Studio in Dong Da', price: 1800000000,
    province: 'Hanoi', district: 'Dong Da', address: '23 Nguyen Luong Bang, Dong Da, Hanoi',
    latitude: 21.0247, longitude: 105.8434, area: 45, bedrooms: 1, bathrooms: 1,
    propertyType: 'apartment', images: getImages(3), isFavorite: false,
    description: 'Cozy studio apartment, ideal for young professionals and students.',
    createdAt: '2024-02-05T11:00:00Z',
  },
  {
    id: '5', title: 'Villa in Tay Ho', price: 15000000000,
    province: 'Hanoi', district: 'Tay Ho', address: '5 Dang Thai Mai, Tay Ho, Hanoi',
    latitude: 21.0607, longitude: 105.8232, area: 250, bedrooms: 5, bathrooms: 4,
    propertyType: 'villa', images: getImages(6), isFavorite: true,
    description: 'Stunning lakeside villa with West Lake views, private garden and pool.',
    createdAt: '2024-02-10T12:00:00Z',
  },
  {
    id: '6', title: 'Apartment in Long Bien', price: 2200000000,
    province: 'Hanoi', district: 'Long Bien', address: '101 Nguyen Van Cu, Long Bien, Hanoi',
    latitude: 21.0433, longitude: 105.8890, area: 68, bedrooms: 2, bathrooms: 2,
    propertyType: 'apartment', images: getImages(3), isFavorite: false,
    description: 'Well-maintained apartment with river views and modern facilities.',
    createdAt: '2024-02-15T13:00:00Z',
  },
  {
    id: '7', title: 'Land Plot in Ha Dong', price: 3500000000,
    province: 'Hanoi', district: 'Ha Dong', address: '77 Quang Trung, Ha Dong, Hanoi',
    latitude: 20.9711, longitude: 105.7789, area: 80, bedrooms: 0, bathrooms: 0,
    propertyType: 'land', images: getImages(2), isFavorite: false,
    description: 'Prime land plot in rapidly developing Ha Dong district. Great investment.',
    createdAt: '2024-02-20T14:00:00Z',
  },
  {
    id: '8', title: 'Penthouse in Nam Tu Liem', price: 9500000000,
    province: 'Hanoi', district: 'Nam Tu Liem', address: 'Royal City, Nam Tu Liem, Hanoi',
    latitude: 21.0051, longitude: 105.8088, area: 180, bedrooms: 4, bathrooms: 3,
    propertyType: 'apartment', images: getImages(5), isFavorite: false,
    description: 'Exclusive penthouse with rooftop terrace and 360-degree Hanoi panorama.',
    createdAt: '2024-03-01T08:00:00Z',
  },
  {
    id: '9', title: 'House in Thanh Xuan', price: 5200000000,
    province: 'Hanoi', district: 'Thanh Xuan', address: '34 Nguyen Trai, Thanh Xuan, Hanoi',
    latitude: 20.9947, longitude: 105.8364, area: 90, bedrooms: 3, bathrooms: 2,
    propertyType: 'house', images: getImages(4), isFavorite: false,
    description: 'Family home in quiet residential street, good schools nearby.',
    createdAt: '2024-03-05T09:00:00Z',
  },
  {
    id: '10', title: 'Apartment in Hai Ba Trung', price: 3100000000,
    province: 'Hanoi', district: 'Hai Ba Trung', address: '56 Bach Mai, Hai Ba Trung, Hanoi',
    latitude: 21.0100, longitude: 105.8520, area: 75, bedrooms: 2, bathrooms: 2,
    propertyType: 'apartment', images: getImages(3), isFavorite: true,
    description: 'Bright and airy apartment in central location, fully furnished.',
    createdAt: '2024-03-10T10:00:00Z',
  },

  // ── HO CHI MINH CITY ────────────────────────────────────
  {
    id: '11', title: 'Luxury Condo in District 1', price: 7800000000,
    province: 'Ho Chi Minh City', district: 'District 1', address: '88 Nguyen Hue, District 1, HCMC',
    latitude: 10.7769, longitude: 106.7009, area: 100, bedrooms: 3, bathrooms: 2,
    propertyType: 'apartment', images: getImages(5), isFavorite: false,
    description: 'Premium condo on the iconic Nguyen Hue walking street.',
    createdAt: '2024-01-18T08:00:00Z',
  },
  {
    id: '12', title: 'Villa in Binh Thanh', price: 12000000000,
    province: 'Ho Chi Minh City', district: 'Binh Thanh', address: '10 Xo Viet Nghe Tinh, Binh Thanh, HCMC',
    latitude: 10.8020, longitude: 106.7119, area: 200, bedrooms: 5, bathrooms: 4,
    propertyType: 'villa', images: getImages(6), isFavorite: true,
    description: 'Elegant villa with private pool in prestigious Binh Thanh area.',
    createdAt: '2024-01-25T09:00:00Z',
  },
  {
    id: '13', title: 'Apartment in District 7', price: 3500000000,
    province: 'Ho Chi Minh City', district: 'District 7', address: 'Phu My Hung, District 7, HCMC',
    latitude: 10.7294, longitude: 106.7218, area: 85, bedrooms: 2, bathrooms: 2,
    propertyType: 'apartment', images: getImages(4), isFavorite: false,
    description: 'Modern apartment in the upscale Phu My Hung township.',
    createdAt: '2024-02-02T10:00:00Z',
  },
  {
    id: '14', title: 'Townhouse in District 3', price: 9200000000,
    province: 'Ho Chi Minh City', district: 'District 3', address: '22 Vo Van Tan, District 3, HCMC',
    latitude: 10.7747, longitude: 106.6899, area: 70, bedrooms: 4, bathrooms: 3,
    propertyType: 'townhouse', images: getImages(4), isFavorite: false,
    description: 'Charming French colonial-style townhouse in the cultural heart of the city.',
    createdAt: '2024-02-08T11:00:00Z',
  },
  {
    id: '15', title: 'Penthouse in Thu Duc', price: 6500000000,
    province: 'Ho Chi Minh City', district: 'Thu Duc', address: 'Vinhomes Grand Park, Thu Duc, HCMC',
    latitude: 10.8485, longitude: 106.7728, area: 150, bedrooms: 4, bathrooms: 3,
    propertyType: 'apartment', images: getImages(5), isFavorite: false,
    description: 'Grand penthouse in the massive Vinhomes Grand Park development.',
    createdAt: '2024-02-12T12:00:00Z',
  },
  {
    id: '16', title: 'House in Binh Duong border', price: 4100000000,
    province: 'Ho Chi Minh City', district: 'Binh Chanh', address: 'National Road 1A, Binh Chanh, HCMC',
    latitude: 10.6930, longitude: 106.6210, area: 130, bedrooms: 3, bathrooms: 2,
    propertyType: 'house', images: getImages(3), isFavorite: false,
    description: 'Spacious house near highway, ideal for commuters.',
    createdAt: '2024-02-18T13:00:00Z',
  },
  {
    id: '17', title: 'Studio in District 4', price: 1600000000,
    province: 'Ho Chi Minh City', district: 'District 4', address: '15 Ton Dan, District 4, HCMC',
    latitude: 10.7572, longitude: 106.7026, area: 40, bedrooms: 1, bathrooms: 1,
    propertyType: 'apartment', images: getImages(3), isFavorite: false,
    description: 'Affordable studio perfect for first-time buyers.',
    createdAt: '2024-02-22T14:00:00Z',
  },
  {
    id: '18', title: 'Apartment in Go Vap', price: 2400000000,
    province: 'Ho Chi Minh City', district: 'Go Vap', address: '99 Nguyen Oanh, Go Vap, HCMC',
    latitude: 10.8350, longitude: 106.6641, area: 72, bedrooms: 2, bathrooms: 2,
    propertyType: 'apartment', images: getImages(4), isFavorite: true,
    description: 'Value apartment in growing northern district.',
    createdAt: '2024-03-02T08:00:00Z',
  },
  {
    id: '19', title: 'Villa in District 2', price: 18000000000,
    province: 'Ho Chi Minh City', district: 'District 2', address: 'Thao Dien, District 2, HCMC',
    latitude: 10.8016, longitude: 106.7351, area: 300, bedrooms: 6, bathrooms: 5,
    propertyType: 'villa', images: getImages(6), isFavorite: false,
    description: 'Ultra-luxury expat villa in prestigious Thao Dien enclave.',
    createdAt: '2024-03-06T09:00:00Z',
  },
  {
    id: '20', title: 'Land in Nha Be', price: 2800000000,
    province: 'Ho Chi Minh City', district: 'Nha Be', address: 'Phuoc Kien, Nha Be, HCMC',
    latitude: 10.6931, longitude: 106.7223, area: 100, bedrooms: 0, bathrooms: 0,
    propertyType: 'land', images: getImages(2), isFavorite: false,
    description: 'Residential land plot in fast-developing southern corridor.',
    createdAt: '2024-03-12T10:00:00Z',
  },

  // ── DA NANG ─────────────────────────────────────────────
  {
    id: '21', title: 'Beachfront Apartment in Son Tra', price: 3800000000,
    province: 'Da Nang', district: 'Son Tra', address: 'My Khe Beach Road, Son Tra, Da Nang',
    latitude: 16.0545, longitude: 108.2475, area: 80, bedrooms: 2, bathrooms: 2,
    propertyType: 'apartment', images: getImages(5), isFavorite: false,
    description: 'Stunning ocean-view apartment steps from My Khe beach.',
    createdAt: '2024-01-22T08:00:00Z',
  },
  {
    id: '22', title: 'Villa in Ngu Hanh Son', price: 8500000000,
    province: 'Da Nang', district: 'Ngu Hanh Son', address: 'Truong Sa, Ngu Hanh Son, Da Nang',
    latitude: 15.9943, longitude: 108.2568, area: 220, bedrooms: 5, bathrooms: 4,
    propertyType: 'villa', images: getImages(5), isFavorite: true,
    description: 'Luxury resort-style villa near Marble Mountains.',
    createdAt: '2024-01-28T09:00:00Z',
  },
  {
    id: '23', title: 'House in Hai Chau', price: 5000000000,
    province: 'Da Nang', district: 'Hai Chau', address: '200 Tran Phu, Hai Chau, Da Nang',
    latitude: 16.0678, longitude: 108.2208, area: 100, bedrooms: 3, bathrooms: 2,
    propertyType: 'house', images: getImages(4), isFavorite: false,
    description: 'Central district family house with great connectivity.',
    createdAt: '2024-02-03T10:00:00Z',
  },
  {
    id: '24', title: 'Apartment in Thanh Khe', price: 1900000000,
    province: 'Da Nang', district: 'Thanh Khe', address: '56 Hung Vuong, Thanh Khe, Da Nang',
    latitude: 16.0788, longitude: 108.2001, area: 58, bedrooms: 2, bathrooms: 1,
    propertyType: 'apartment', images: getImages(3), isFavorite: false,
    description: 'Affordable apartment in western Da Nang district.',
    createdAt: '2024-02-09T11:00:00Z',
  },
  {
    id: '25', title: 'Townhouse in Cam Le', price: 3200000000,
    province: 'Da Nang', district: 'Cam Le', address: 'Hoa Xuan Urban Area, Cam Le, Da Nang',
    latitude: 16.0200, longitude: 108.2100, area: 90, bedrooms: 3, bathrooms: 2,
    propertyType: 'townhouse', images: getImages(4), isFavorite: false,
    description: 'New townhouse in the rapidly growing Hoa Xuan urban zone.',
    createdAt: '2024-02-14T12:00:00Z',
  },
  {
    id: '26', title: 'Land in Hoa Vang', price: 1200000000,
    province: 'Da Nang', district: 'Hoa Vang', address: 'Hoa Nhon, Hoa Vang, Da Nang',
    latitude: 15.9650, longitude: 108.0890, area: 150, bedrooms: 0, bathrooms: 0,
    propertyType: 'land', images: getImages(2), isFavorite: false,
    description: 'Large land parcel in scenic mountain foothills.',
    createdAt: '2024-02-19T13:00:00Z',
  },
  {
    id: '27', title: 'Condo in Lien Chieu', price: 2100000000,
    province: 'Da Nang', district: 'Lien Chieu', address: 'Ton Duc Thang, Lien Chieu, Da Nang',
    latitude: 16.1017, longitude: 108.1490, area: 65, bedrooms: 2, bathrooms: 1,
    propertyType: 'apartment', images: getImages(3), isFavorite: false,
    description: 'Coastal condo near Da Nang university zone.',
    createdAt: '2024-02-25T14:00:00Z',
  },
  {
    id: '28', title: 'Resort Villa in Son Tra Peninsula', price: 22000000000,
    province: 'Da Nang', district: 'Son Tra', address: 'Son Tra Peninsula, Da Nang',
    latitude: 16.1000, longitude: 108.2800, area: 400, bedrooms: 6, bathrooms: 6,
    propertyType: 'villa', images: getImages(6), isFavorite: false,
    description: 'One-of-a-kind peninsula estate with private sea access.',
    createdAt: '2024-03-03T08:00:00Z',
  },

  // ── HAI PHONG ───────────────────────────────────────────
  {
    id: '29', title: 'Apartment in Hong Bang', price: 1500000000,
    province: 'Hai Phong', district: 'Hong Bang', address: '45 Tran Phu, Hong Bang, Hai Phong',
    latitude: 20.8648, longitude: 106.6838, area: 60, bedrooms: 2, bathrooms: 1,
    propertyType: 'apartment', images: getImages(3), isFavorite: false,
    description: 'Comfortable apartment in the historical centre of Hai Phong.',
    createdAt: '2024-01-19T08:00:00Z',
  },
  {
    id: '30', title: 'House in Ngo Quyen', price: 3800000000,
    province: 'Hai Phong', district: 'Ngo Quyen', address: '12 Lach Tray, Ngo Quyen, Hai Phong',
    latitude: 20.8733, longitude: 106.7019, area: 110, bedrooms: 3, bathrooms: 2,
    propertyType: 'house', images: getImages(4), isFavorite: false,
    description: 'Solid family house in the commercial hub of Hai Phong.',
    createdAt: '2024-01-26T09:00:00Z',
  },
  {
    id: '31', title: 'Villa in Duong Kinh', price: 6000000000,
    province: 'Hai Phong', district: 'Duong Kinh', address: 'Do Son Road, Duong Kinh, Hai Phong',
    latitude: 20.8127, longitude: 106.7490, area: 180, bedrooms: 4, bathrooms: 3,
    propertyType: 'villa', images: getImages(5), isFavorite: true,
    description: 'Peaceful villa in new suburban district near beach resorts.',
    createdAt: '2024-02-04T10:00:00Z',
  },
  {
    id: '32', title: 'Apartment in Le Chan', price: 1700000000,
    province: 'Hai Phong', district: 'Le Chan', address: '89 Cat Dai, Le Chan, Hai Phong',
    latitude: 20.8577, longitude: 106.6960, area: 55, bedrooms: 2, bathrooms: 1,
    propertyType: 'apartment', images: getImages(3), isFavorite: false,
    description: 'Neat apartment in a lively urban neighborhood.',
    createdAt: '2024-02-11T11:00:00Z',
  },
  {
    id: '33', title: 'Land in An Duong', price: 2000000000,
    province: 'Hai Phong', district: 'An Duong', address: 'An Dong, An Duong, Hai Phong',
    latitude: 20.8910, longitude: 106.6399, area: 120, bedrooms: 0, bathrooms: 0,
    propertyType: 'land', images: getImages(2), isFavorite: false,
    description: 'Industrial-adjacent land suitable for residential or commercial development.',
    createdAt: '2024-02-16T12:00:00Z',
  },
  {
    id: '34', title: 'Townhouse in Kien An', price: 2700000000,
    province: 'Hai Phong', district: 'Kien An', address: 'Tran Thanh Ngo, Kien An, Hai Phong',
    latitude: 20.8243, longitude: 106.6313, area: 80, bedrooms: 3, bathrooms: 2,
    propertyType: 'townhouse', images: getImages(3), isFavorite: false,
    description: 'Modern townhouse in the outer residential belt.',
    createdAt: '2024-02-21T13:00:00Z',
  },
  {
    id: '35', title: 'Apartment in Do Son', price: 2500000000,
    province: 'Hai Phong', district: 'Do Son', address: 'Do Son Beach, Hai Phong',
    latitude: 20.7261, longitude: 106.7921, area: 70, bedrooms: 2, bathrooms: 2,
    propertyType: 'apartment', images: getImages(4), isFavorite: false,
    description: 'Sea-view apartment in popular Do Son beach resort town.',
    createdAt: '2024-02-26T14:00:00Z',
  },

  // ── CAN THO ─────────────────────────────────────────────
  {
    id: '36', title: 'Riverside Villa in Ninh Kieu', price: 7500000000,
    province: 'Can Tho', district: 'Ninh Kieu', address: '1 Hai Ba Trung, Ninh Kieu, Can Tho',
    latitude: 10.0341, longitude: 105.7875, area: 200, bedrooms: 4, bathrooms: 3,
    propertyType: 'villa', images: getImages(5), isFavorite: true,
    description: 'Magnificent riverside villa with Hau River views and boat dock.',
    createdAt: '2024-01-23T08:00:00Z',
  },
  {
    id: '37', title: 'Apartment in Binh Thuy', price: 1400000000,
    province: 'Can Tho', district: 'Binh Thuy', address: '34 Cach Mang Thang 8, Binh Thuy, Can Tho',
    latitude: 10.0530, longitude: 105.7599, area: 65, bedrooms: 2, bathrooms: 1,
    propertyType: 'apartment', images: getImages(3), isFavorite: false,
    description: 'Affordable apartment near Can Tho University.',
    createdAt: '2024-01-29T09:00:00Z',
  },
  {
    id: '38', title: 'House in Cai Rang', price: 2900000000,
    province: 'Can Tho', district: 'Cai Rang', address: 'Hung Phu, Cai Rang, Can Tho',
    latitude: 10.0055, longitude: 105.7850, area: 100, bedrooms: 3, bathrooms: 2,
    propertyType: 'house', images: getImages(4), isFavorite: false,
    description: 'Spacious house near the famous Cai Rang floating market.',
    createdAt: '2024-02-06T10:00:00Z',
  },
  {
    id: '39', title: 'Townhouse in O Mon', price: 1800000000,
    province: 'Can Tho', district: 'O Mon', address: 'Chau Van Liem, O Mon, Can Tho',
    latitude: 10.0756, longitude: 105.7430, area: 70, bedrooms: 3, bathrooms: 2,
    propertyType: 'townhouse', images: getImages(3), isFavorite: false,
    description: 'New townhouse development in the northern industrial zone.',
    createdAt: '2024-02-13T11:00:00Z',
  },
  {
    id: '40', title: 'Land in Phong Dien', price: 850000000,
    province: 'Can Tho', district: 'Phong Dien', address: 'Phong Dien Market Area, Can Tho',
    latitude: 9.9856, longitude: 105.7421, area: 200, bedrooms: 0, bathrooms: 0,
    propertyType: 'land', images: getImages(2), isFavorite: false,
    description: 'Affordable rural land plot, ideal for agriculture or rural housing.',
    createdAt: '2024-02-17T12:00:00Z',
  },
  {
    id: '41', title: 'Apartment in Thot Not', price: 1200000000,
    province: 'Can Tho', district: 'Thot Not', address: 'Thot Not Town Center, Can Tho',
    latitude: 10.2688, longitude: 105.5905, area: 55, bedrooms: 2, bathrooms: 1,
    propertyType: 'apartment', images: getImages(3), isFavorite: false,
    description: 'Entry-level apartment in the northern Can Tho satellite town.',
    createdAt: '2024-02-23T13:00:00Z',
  },

  // ── EXTRA MIX ───────────────────────────────────────────
  {
    id: '42', title: 'High-rise Condo in Ba Dinh', price: 5500000000,
    province: 'Hanoi', district: 'Ba Dinh', address: 'Vinhomes Metropolis, Ba Dinh, Hanoi',
    latitude: 21.0380, longitude: 105.8250, area: 110, bedrooms: 3, bathrooms: 2,
    propertyType: 'apartment', images: getImages(5), isFavorite: false,
    description: 'Prestigious Vinhomes Metropolis apartment with top-tier amenities.',
    createdAt: '2024-03-08T08:00:00Z',
  },
  {
    id: '43', title: 'Duplex in District 10', price: 4200000000,
    province: 'Ho Chi Minh City', district: 'District 10', address: '40 To Hien Thanh, District 10, HCMC',
    latitude: 10.7729, longitude: 106.6715, area: 95, bedrooms: 3, bathrooms: 3,
    propertyType: 'apartment', images: getImages(4), isFavorite: false,
    description: 'Chic duplex apartment in the creative arts district.',
    createdAt: '2024-03-09T09:00:00Z',
  },
  {
    id: '44', title: 'Eco House in Hoa Vang', price: 2600000000,
    province: 'Da Nang', district: 'Hoa Vang', address: 'Nam Viet A, Hoa Vang, Da Nang',
    latitude: 16.0000, longitude: 108.1700, area: 140, bedrooms: 3, bathrooms: 2,
    propertyType: 'house', images: getImages(4), isFavorite: false,
    description: 'Green eco-friendly house surrounded by nature.',
    createdAt: '2024-03-11T10:00:00Z',
  },
  {
    id: '45', title: 'Shophouse in Ngo Quyen', price: 5800000000,
    province: 'Hai Phong', district: 'Ngo Quyen', address: 'Nguyen Duc Canh, Ngo Quyen, Hai Phong',
    latitude: 20.8780, longitude: 106.7100, area: 85, bedrooms: 4, bathrooms: 3,
    propertyType: 'townhouse', images: getImages(4), isFavorite: false,
    description: 'Commercial ground floor + residential upper floors prime location.',
    createdAt: '2024-03-13T11:00:00Z',
  },
  {
    id: '46', title: 'Riverside Apartment in Ninh Kieu', price: 2200000000,
    province: 'Can Tho', district: 'Ninh Kieu', address: 'Ben Ninh Kieu, Can Tho',
    latitude: 10.0300, longitude: 105.7920, area: 75, bedrooms: 2, bathrooms: 2,
    propertyType: 'apartment', images: getImages(4), isFavorite: true,
    description: 'Lovely riverside apartment with floating market ambiance.',
    createdAt: '2024-03-14T12:00:00Z',
  },
  {
    id: '47', title: 'Smart Home in Xuan Dinh', price: 7200000000,
    province: 'Hanoi', district: 'Bac Tu Liem', address: 'Xuan Dinh, Bac Tu Liem, Hanoi',
    latitude: 21.0650, longitude: 105.7760, area: 160, bedrooms: 4, bathrooms: 3,
    propertyType: 'house', images: getImages(5), isFavorite: false,
    description: 'Fully automated smart home with solar power and EV charging.',
    createdAt: '2024-03-15T13:00:00Z',
  },
  {
    id: '48', title: 'Budget Apartment in Tan Phu', price: 1350000000,
    province: 'Ho Chi Minh City', district: 'Tan Phu', address: '22 Tan Ky Tan Quy, Tan Phu, HCMC',
    latitude: 10.7940, longitude: 106.6280, area: 48, bedrooms: 1, bathrooms: 1,
    propertyType: 'apartment', images: getImages(3), isFavorite: false,
    description: 'Compact and affordable starter apartment in western Saigon.',
    createdAt: '2024-03-16T14:00:00Z',
  },
  {
    id: '49', title: 'Mountain View House in Lien Chieu', price: 3400000000,
    province: 'Da Nang', district: 'Lien Chieu', address: 'Nam O, Lien Chieu, Da Nang',
    latitude: 16.1150, longitude: 108.1300, area: 115, bedrooms: 3, bathrooms: 2,
    propertyType: 'house', images: getImages(4), isFavorite: false,
    description: 'Tranquil house with mountain backdrop and sea breeze.',
    createdAt: '2024-03-17T08:00:00Z',
  },
  {
    id: '50', title: 'Corner Villa in Hai An', price: 9000000000,
    province: 'Hai Phong', district: 'Hai An', address: 'Dang Hai, Hai An, Hai Phong',
    latitude: 20.8450, longitude: 106.7500, area: 280, bedrooms: 5, bathrooms: 4,
    propertyType: 'villa', images: getImages(6), isFavorite: false,
    description: 'Magnificent corner villa near Hai Phong Airport, double frontage.',
    createdAt: '2024-03-18T09:00:00Z',
  },
];

export const getPagedProperties = (
  page: number,
  pageSize: number,
  filters?: Partial<{ province: string; district: string; minPrice: number; maxPrice: number; propertyType: string }>
): { data: Property[]; hasNextPage: boolean; total: number } => {
  let filtered = [...MOCK_PROPERTIES];

  if (filters?.province) filtered = filtered.filter(p => p.province === filters.province);
  if (filters?.district) filtered = filtered.filter(p => p.district.toLowerCase().includes(filters.district!.toLowerCase()));
  if (filters?.minPrice) filtered = filtered.filter(p => p.price >= filters.minPrice!);
  if (filters?.maxPrice) filtered = filtered.filter(p => p.price <= filters.maxPrice!);
  if (filters?.propertyType) filtered = filtered.filter(p => p.propertyType === filters.propertyType);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = filtered.slice(start, end);

  return { data, hasNextPage: end < filtered.length, total: filtered.length };
};
