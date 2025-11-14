import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Restaurant } from '../data/mockData';
import { useNavigation } from '@react-navigation/native';

export default function RestaurantCard({ r }: { r: Restaurant }) {
  const nav = useNavigation<any>();
  return (
    <TouchableOpacity onPress={() => nav.navigate('Restaurant', { restaurantId: r.id })} style={{ padding: 12, backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, alignItems: 'center' }}>
      <Image source={typeof r.image === 'string' ? { uri: r.image } : r.image} style={{ width: '100%', height: 140, borderRadius: 10 }} />
      <Text style={{ marginTop: 8, fontWeight: '700' }}>{r.name}</Text>
    </TouchableOpacity>
  );
}