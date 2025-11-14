import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { MenuItem } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function MenuItemCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  const { activeOrder } = useApp();

  const handleAdd = () => {
    if (activeOrder && activeOrder.status === 'in_progress') {
      Alert.alert('Your order is in progress. Please Wait until the order is complete before order again');
      return;
    }
    onAdd();
  };

  return (
    <View style={{ flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 }}>
      <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={{ width: 80, height: 80, borderRadius: 8, marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '700' }}>{item.name}</Text>
        <Text style={{ marginTop: 6 }}>{item.description}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ fontWeight: '700' }}>฿{item.price.toFixed(2)}</Text>
          <TouchableOpacity onPress={handleAdd} style={{ backgroundColor: '#3fb375', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
            <Text style={{ color: '#fff' }}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}