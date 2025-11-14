import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Image, Modal, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { haversineDistanceKm } from '../utils/geo';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
type SortMode = 'relevance' | 'popularity' | 'distance';

export default function HomeScreen() {
  const { restaurants, activeOrder, addToCart, userLocation } = useApp();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<SortMode>('relevance');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const nav = useNavigation<HomeScreenNavigationProp>();

  const data = useMemo(() => {
    const searchTerm = q.trim().toLowerCase();
    let filteredRestaurants = restaurants.map(r => {
      const matchingItems = searchTerm
        ? r.menu.filter(
            m =>
              m.name.toLowerCase().includes(searchTerm) ||
              (m.description || '').toLowerCase().includes(searchTerm)
          )
        : [];
      const isRestaurantMatch = r.name.toLowerCase().includes(searchTerm);
      return { restaurant: r, matches: matchingItems, visible: isRestaurantMatch || matchingItems.length > 0 };
    }).filter(x => x.visible || !searchTerm);

    if (sort === 'popularity') {
      filteredRestaurants.sort((a, b) => b.restaurant.rating - a.restaurant.rating);
    } else if (sort === 'distance' && userLocation) {
      filteredRestaurants.sort((a, b) => {
        const distA = haversineDistanceKm(userLocation.lat, userLocation.lng, a.restaurant.lat, a.restaurant.lng);
        const distB = haversineDistanceKm(userLocation.lat, userLocation.lng, b.restaurant.lat, b.restaurant.lng);
        return distA - distB;
      });
    }

    return filteredRestaurants;
  }, [q, restaurants, sort, userLocation]);

  const handleAddToCart = (restaurantId: string, menuItem: any) => {
    if (activeOrder && activeOrder.status === 'in_progress') {
      Alert.alert('Order in Progress', 'Please wait until your current order is complete before starting a new one.');
      return;
    }
    const result = addToCart(restaurantId, menuItem);
    if (!result.ok) {
      if (result.reason === 'different_restaurant') {
        Alert.alert('Clear Cart?', 'You can only order from one restaurant at a time. Would you like to clear your cart and add this item?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK', onPress: () => { /* Implement clear cart and add logic if desired */ } },
        ]);
      } else {
        Alert.alert('Error', 'Could not add item to cart.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar + Buttons */}
      <View style={styles.header}>
        <TextInput
          placeholder="Search Restaurants or Food"
          value={q}
          onChangeText={setQ}
          style={styles.searchInput}
        />
        <TouchableOpacity onPress={() => setSortModalVisible(true)} style={styles.headerButton}>
          <Text>Sort ▾</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => nav.navigate('Cart')} style={styles.headerButton}>
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      {/* Active Order Notification */}
      {activeOrder && activeOrder.status === 'in_progress' && (
        <TouchableOpacity
          onPress={() => nav.navigate('OrderProgress', { order: activeOrder })}
          style={styles.activeOrderBanner}
        >
          <Text style={styles.activeOrderText}>An order is in progress. Tap to view.</Text>
        </TouchableOpacity>
      )}

      {/* Restaurant List */}
      <FlatList
        data={data}
        keyExtractor={item => item.restaurant.id}
        renderItem={({ item }) => (
          <View style={styles.restaurantCardContainer}>
            <TouchableOpacity
              onPress={() => nav.navigate('Restaurant', { restaurantId: item.restaurant.id })}
              style={styles.restaurantCard}
            >
              <Image 
                source={typeof item.restaurant.image === 'string' ? { uri: item.restaurant.image } : item.restaurant.image} 
                style={styles.restaurantImage} 
              />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{item.restaurant.name}</Text>
                <Text style={styles.restaurantRating}>
                  {item.restaurant.rating.toFixed(1)} ⭐ ({item.restaurant.reviews})
                </Text>
              </View>
              <Text style={styles.restaurantDescription}>
                {item.matches.length > 0
                  ? `Found: ${item.matches.map(m => m.name).join(', ')}`
                  : item.restaurant.description}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Sort Modal */}
      <Modal visible={sortModalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalBackdrop} onPress={() => setSortModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            {['relevance', 'popularity', 'distance'].map((sortMode) => (
              <TouchableOpacity
                key={sortMode}
                onPress={() => { setSort(sortMode as SortMode); setSortModalVisible(false); }}
                style={styles.modalOption}
              >
                <Text>{sortMode.charAt(0).toUpperCase() + sortMode.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  searchInput: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e9ecef' },
  headerButton: { padding: 8, marginLeft: 8 },
  cartIcon: { fontSize: 24 },
  activeOrderBanner: { backgroundColor: '#17a2b8', padding: 12, borderRadius: 8, marginBottom: 10 },
  activeOrderText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  restaurantCardContainer: { marginBottom: 12 },
  restaurantCard: { padding: 12, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e9ecef' },
  restaurantImage: { width: '100%', height: 150, borderRadius: 6 },
  restaurantInfo: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  restaurantName: { fontWeight: '700', fontSize: 16 },
  restaurantRating: { color: '#6c757d' },
  restaurantDescription: { marginTop: 6, color: '#6c757d' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 20 },
  modalTitle: { fontWeight: '700', fontSize: 18, marginBottom: 10 },
  modalOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e9ecef' },
});
