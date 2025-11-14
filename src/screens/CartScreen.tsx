import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Cart'>;

export default function CartScreen() {
  const { cart, clearCart, confirmOrder, restaurants } = useApp();
  const nav = useNavigation<CartScreenNavigationProp>();

  if (!cart.items.length) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Your cart is empty</Text>
        <TouchableOpacity onPress={() => nav.replace('Home')} style={{ marginTop: 12 }}>
          <Text style={{ color: '#3fb375' }}>Back Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const rest = restaurants.find(r => r.id === cart.restaurantId);
  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleClearOrder = () => {
    Alert.alert('Clear Cart', 'Are you sure you want to remove all items?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: () => {
          clearCart();
          Alert.alert('Cart Cleared');
        },
      },
    ]);
  };

  const handleConfirmOrder = () => {
    const order = confirmOrder();
    if (order) {
      nav.replace('OrderProgress', { order });
    } else {
      Alert.alert('Order Failed', 'Could not place your order. Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
      <Text style={{ fontWeight: '800', fontSize: 20 }}>{rest?.name || 'Your Order'}</Text>

      <FlatList
        data={cart.items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
            }}
          >
            <Text>
              {item.name} x{item.quantity}
            </Text>
            <Text>฿{(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        )}
      />

      <Text style={{ marginTop: 12, fontWeight: '700' }}>Total: ฿{total.toFixed(2)}</Text>

      {/* Confirm Order Button */}
      <TouchableOpacity
        onPress={handleConfirmOrder}
        style={{
          marginTop: 20,
          backgroundColor: '#3fb375',
          padding: 14,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Confirm Order</Text>
      </TouchableOpacity>

      {/* Clear Order Button */}
      <TouchableOpacity
        onPress={handleClearOrder}
        style={{
          marginTop: 12,
          backgroundColor: '#ff4d4d',
          padding: 12,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Clear Order</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
