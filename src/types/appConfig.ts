// filename: src/types/appConfig.ts
// ─── Shape của remote config trả từ server (GET /app-config) ─────────────────
//
// Server response example:
// {
//   "map": { "defaultLat": 10.7769, "defaultLng": 106.7009, "defaultZoom": 12 },
//   "pagination": { "pageSize": 10 },
//   "search": { "debounceMs": 400 },
//   "propertyTypes": [
//     { "value": "apartment", "label": "Căn hộ" },
//     ...
//   ],
//   "priceRanges": [
//     { "label": "Dưới 2 tỷ", "min": 0, "max": 2000000000 },
//     ...
//   ],
//   "theme": {
//     "primary": "#006AFF",
//     "primaryDark": "#0052CC",
//     ...
//   }
// }

export interface AppConfigMap {
  defaultLat:  number;
  defaultLng:  number;
  defaultZoom: number;
}

export interface AppConfigPagination {
  pageSize: number;
}

export interface AppConfigSearch {
  debounceMs: number;
}

export interface AppConfigPropertyType {
  value: string;
  label: string;
}

export interface AppConfigPriceRange {
  label: string;
  min:   number;
  max:   number;
}

export interface AppConfigTheme {
  primary:      string;
  primaryDark:  string;
  primaryLight: string;
  secondary:    string;
  success:      string;
  warning:      string;
  error:        string;
  mapBackground:string;
}

export interface AppConfig {
  map:           AppConfigMap;
  pagination:    AppConfigPagination;
  search:        AppConfigSearch;
  propertyTypes: AppConfigPropertyType[];
  priceRanges:   AppConfigPriceRange[];
  theme:         AppConfigTheme;
}
