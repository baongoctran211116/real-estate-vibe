// // filename: src/screens/SearchScreen.tsx
// import React, { useCallback, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   ListRenderItemInfo,
//   KeyboardAvoidingView,
//   Platform,
//   TouchableOpacity,
// } from 'react-native';
// import { FlashList } from '@shopify/flash-list';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useSearch } from '../features/search/useSearch';
// import { useFilterStore } from '../store/useFilterStore';
// import PropertyCard from '../components/PropertyCard';
// import SearchBar from '../components/SearchBar';
// import FilterPanel from '../components/FilterPanel';
// import { Property } from '../types/property';

// const SearchScreen: React.FC = () => {
//   const insets = useSafeAreaInsets();
//   const [filterVisible, setFilterVisible] = React.useState(false);
//   const hasActive = useFilterStore((s) => s.hasActiveFilters());

//   const {
//     keyword,
//     setKeyword,
//     resetFilters,
//     results,
//     isLoading,
//     isFetchingNextPage,
//     hasNextPage,
//     fetchNextPage,
//     totalResults,
//   } = useSearch();

//   const handleEndReached = useCallback(() => {
//     if (hasNextPage && !isFetchingNextPage) fetchNextPage();
//   }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

//   const renderItem = useCallback(
//     ({ item }: ListRenderItemInfo<Property>) => <PropertyCard property={item} />,
//     []
//   );

//   const keyExtractor = useCallback((item: Property) => item.id, []);

//   const ListHeader = useCallback(
//     () =>
//       keyword.trim().length > 0 ? (
//         <View style={styles.resultHeader}>
//           <Text style={styles.resultCount}>
//             {isLoading ? 'Đang tìm kiếm...' : `${totalResults} kết quả cho "${keyword}"`}
//           </Text>
//           {hasActive && (
//             <TouchableOpacity onPress={resetFilters}>
//               <Text style={styles.clearFilters}>Xóa bộ lọc</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       ) : null,
//     [keyword, isLoading, totalResults, hasActive, resetFilters]
//   );

//   const ListEmpty = useCallback(
//     () =>
//       !isLoading && keyword.trim().length > 0 ? (
//         <View style={styles.empty}>
//           <Text style={styles.emptyEmoji}>🔍</Text>
//           <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
//           <Text style={styles.emptySubtitle}>
//             Thử từ khóa khác hoặc điều chỉnh bộ lọc
//           </Text>
//         </View>
//       ) : null,
//     [isLoading, keyword]
//   );

//   const ListFooter = useCallback(
//     () =>
//       isFetchingNextPage ? (
//         <View style={styles.footer}>
//           <ActivityIndicator size="small" color="#2563EB" />
//         </View>
//       ) : null,
//     [isFetchingNextPage]
//   );

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//     >
//       {/* Search header */}
//       <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
//         <Text style={styles.headerTitle}>Tìm kiếm</Text>
//         <View style={styles.searchRow}>
//           <View style={styles.searchBarFlex}>
//             <SearchBar
//               value={keyword}
//               onChangeText={setKeyword}
//               autoFocus={false}
//               placeholder="Tìm theo tên, quận, thành phố..."
//             />
//           </View>
//           <TouchableOpacity
//             style={[styles.filterIconBtn, hasActive && styles.filterIconActive]}
//             onPress={() => setFilterVisible(true)}
//           >
//             <Text style={styles.filterIcon}>⚙️</Text>
//             {hasActive && <View style={styles.filterDot} />}
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Results */}
//       {keyword.trim().length === 0 ? (
//         <View style={styles.idleState}>
//           <Text style={styles.idleEmoji}>🏠</Text>
//           <Text style={styles.idleTitle}>Tìm bất động sản</Text>
//           <Text style={styles.idleSubtitle}>
//             Nhập tên, quận hoặc thành phố để bắt đầu
//           </Text>
//           <View style={styles.suggestionsGrid}>
//             {['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Hai Phong', 'Can Tho'].map(
//               (city) => (
//                 <TouchableOpacity
//                   key={city}
//                   style={styles.suggestionChip}
//                   onPress={() => setKeyword(city)}
//                 >
//                   <Text style={styles.suggestionText}>📍 {city}</Text>
//                 </TouchableOpacity>
//               )
//             )}
//           </View>
//         </View>
//       ) : (
//         <FlashList
//           data={results}
//           renderItem={renderItem}
//           keyExtractor={keyExtractor}
//           estimatedItemSize={320}
//           ListHeaderComponent={ListHeader}
//           ListEmptyComponent={ListEmpty}
//           ListFooterComponent={ListFooter}
//           onEndReached={handleEndReached}
//           onEndReachedThreshold={0.4}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.listContent}
//           keyboardShouldPersistTaps="handled"
//         />
//       )}

//       <FilterPanel visible={filterVisible} onClose={() => setFilterVisible(false)} />
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8FAFC' },
//   header: {
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: 16,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F3F4F6',
//     gap: 12,
//     shadowColor: '#000',
//     shadowOpacity: 0.04,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: 2 },
//     elevation: 2,
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: '800',
//     color: '#111827',
//   },
//   searchRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },
//   searchBarFlex: { flex: 1 },
//   filterIconBtn: {
//     width: 46,
//     height: 46,
//     borderRadius: 14,
//     backgroundColor: '#F3F4F6',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   filterIconActive: { backgroundColor: '#EFF6FF' },
//   filterIcon: { fontSize: 20 },
//   filterDot: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#2563EB',
//   },
//   listContent: { paddingTop: 8, paddingBottom: 24 },
//   resultHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   resultCount: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
//   clearFilters: { fontSize: 13, color: '#EF4444', fontWeight: '600' },
//   footer: { paddingVertical: 20, alignItems: 'center' },
//   empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
//   emptyEmoji: { fontSize: 48 },
//   emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151' },
//   emptySubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 32 },
//   idleState: {
//     flex: 1,
//     alignItems: 'center',
//     paddingTop: 60,
//     gap: 10,
//     paddingHorizontal: 32,
//   },
//   idleEmoji: { fontSize: 56, marginBottom: 4 },
//   idleTitle: { fontSize: 20, fontWeight: '800', color: '#374151' },
//   idleSubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
//   suggestionsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//     justifyContent: 'center',
//     marginTop: 20,
//   },
//   suggestionChip: {
//     paddingHorizontal: 14,
//     paddingVertical: 9,
//     backgroundColor: '#EFF6FF',
//     borderRadius: 20,
//     borderWidth: 1.5,
//     borderColor: '#BFDBFE',
//   },
//   suggestionText: { fontSize: 13, color: '#2563EB', fontWeight: '600' },
// });

// export default SearchScreen;
