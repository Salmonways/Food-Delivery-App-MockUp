
import React, { useMemo, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import MenuItemCard from '../components/MenuItemCard';
import { haversineDistanceKm, etaMsFromDistanceKm } from '../utils/geo';

type GroupedMenu = {
  food: any[];
  drink: any[];
  dessert: any[];
};

export default function RestaurantScreen() {
  const route = useRoute<RouteProp<Record<string, { restaurantId: string }>, string>>();
  const nav = useNavigation<any>();
  const { restaurants, addToCart, userLocation, activeOrder, confirmOrder, cart } = useApp();
  const id = route.params?.restaurantId;
  const r = restaurants.find(x => x.id === id)!;

  if (!r) return <Text>Restaurant not found</Text>;

  
  const distanceKm = useMemo(() => {
    if (!userLocation) return null;
    return haversineDistanceKm(userLocation.lat, userLocation.lng, r.lat, r.lng);
  }, [userLocation, r]);

  
  const etaMs = useMemo(() => {
    if (!distanceKm) return null;
    return etaMsFromDistanceKm(distanceKm, 50);
  }, [distanceKm]);

  
  const etaText = useMemo(() => {
    if (!userLocation) return '—';
    const dist = haversineDistanceKm(userLocation.lat, userLocation.lng, r.lat, r.lng);
    const eta = etaMsFromDistanceKm(dist, 50);
    return `${Math.ceil(eta / 60000)} min`;
  }, [userLocation, r]);
  const distanceText = distanceKm ? `${distanceKm.toFixed(2)} km` : '—';
  const userAddress = userLocation?.address || 'Detecting your current location...';

  
  const grouped: GroupedMenu = useMemo(() => {
    const out: GroupedMenu = { food: [], drink: [], dessert: [] };
    r.menu.forEach(m => {
      (out[m.type] as any[]).push(m);
    });
    return out;
  }, [r]);

  
  const handleConfirmOrder = () => {
    if (activeOrder && activeOrder.status === 'in_progress') {
      Alert.alert('Order in progress', 'Please wait until your current order is complete.');
      return;
    }
    if (!cart.items.length) {
      Alert.alert('Cart is empty', 'Please add some items before ordering.');
      return;
    }
    if (!etaMs) {
      Alert.alert('Location error', 'Unable to calculate delivery time.');
      return;
    }

    const order = confirmOrder(); 
    if (order) nav.navigate('OrderProgress');
  };

  return (
    <ScrollView style={{ flex: 1, padding: 12, backgroundColor: '#f7f7f7' }}>
      {/* Restaurant image */}
      <Image
        source={typeof r.image === 'string' ? { uri: r.image } : r.image}
        style={{ width: '100%', height: 140, borderRadius: 10 }}
      />

      {/* Restaurant header */}
      <View style={{ marginTop: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: '800', fontSize: 22 }}>{r.name}</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontWeight: '700' }}>{r.rating.toFixed(1)} ⭐</Text>
            <Text style={{ color: '#666' }}>{r.reviews} Reviews</Text>
          </View>
        </View>

        <Text style={{ color: '#666', marginTop: 6 }}>{r.description}</Text>

        {/* Delivery and Address Section */}
        <View style={{
          marginTop: 12,
          backgroundColor: '#fff',
          padding: 10,
          borderRadius: 8,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 4
        }}>
          <Text style={{ fontWeight: '700', color: '#333' }}>Restaurant Address</Text>
          <Text style={{ color: '#666', marginTop: 4 }}>{r.address}</Text>

          <Text style={{ fontWeight: '700', color: '#333', marginTop: 8 }}>Delivering To</Text>
          <Text style={{ color: '#666', marginTop: 4 }}>{userAddress}</Text>

          <Text style={{ color: '#444', marginTop: 8 }}>
            Distance: {distanceText} • ETA: {etaText}
          </Text>
        </View>
      </View>

      {/* Menu Sections */}
      <View style={{ marginTop: 18 }}>
        {(['food', 'drink', 'dessert'] as const).map(type => (
          grouped[type].length ? (
            <View key={type}>
              <Text style={{ fontWeight: '800', fontSize: 18, marginVertical: 8 }}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
              {grouped[type].map(m => (
                <MenuItemCard
                  key={m.id}
                  item={m}
                  onAdd={() => {
                    if (activeOrder && activeOrder.status === 'in_progress') {
                      Alert.alert('Your order is in progress. Wait until it’s complete.');
                      return;
                    }
                    const res = addToCart(r.id, m);
                    if (!res.ok) {
                      if (res.reason === 'different_restaurant')
                        Alert.alert('You can only add items from one restaurant at a time.');
                      else Alert.alert('Could not add to cart');
                    }
                  }}
                />
              ))}
            </View>
          ) : null
        ))}
      </View>

    </ScrollView>
  );
}