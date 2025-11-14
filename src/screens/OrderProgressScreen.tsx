import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type OrderProgressNavigationProp = StackNavigationProp<RootStackParamList, 'OrderProgress'>;
type OrderProgressRouteProp = RouteProp<RootStackParamList, 'OrderProgress'>;

export default function OrderProgressScreen() {
  const { userLocation, restaurants, submitRating: submitContextRating } = useApp();
  const nav = useNavigation<OrderProgressNavigationProp>();
  const { params: { order } } = useRoute<OrderProgressRouteProp>();

  const [remainingMs, setRemainingMs] = useState(0);
  const [selectedStars, setSelectedStars] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isRated, setIsRated] = useState(order.rated || false);

  useEffect(() => {
    const finishAt = order.createdAt + order.etaMs;
    const updateRemainingTime = () => {
      const now = Date.now();
      const remaining = Math.max(0, finishAt - now);
      setRemainingMs(remaining);
      if (remaining === 0 && !isCompleted) {
        setIsCompleted(true);
      }
    };

    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(timer);
  }, [order, isCompleted]);

  if (!order) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>No order data found.</Text>
        <TouchableOpacity onPress={() => nav.replace('Home')} style={styles.homeButton}>
          <Text style={styles.homeButtonText}>Back Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const restaurant = restaurants.find(r => r.id === order.restaurantId);
  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000).toString().padStart(2, '0');

  const handleSubmitRating = () => {
    if (selectedStars === 0) {
      Alert.alert('Please select a rating', 'Tap a star to select a rating.');
      return;
    }
    const success = submitContextRating(order.id, selectedStars);
    if (success) {
      setIsRated(true);
      Alert.alert('Rating Submitted', 'Thank you for your feedback!');
    } else {
      Alert.alert('Error', 'Could not submit rating. You may have already rated this order.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>{isCompleted ? 'Order Completed' : 'Order in Progress'}</Text>
        <Text style={styles.restaurantName}>{restaurant?.name}</Text>
        <Text style={styles.address}>Delivering to: {userLocation?.address || 'Your Location'}</Text>
        
        {!isCompleted && (
          <Text style={styles.timer}>
            Time remaining: {minutes}:{seconds}
          </Text>
        )}

        <View style={styles.itemList}>
          {order.items.map(item => (
            <View key={item.id} style={styles.item}>
              <Text style={styles.itemText}>{item.name} x{item.quantity}</Text>
              <Text style={styles.itemText}>฿{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.total}>Total: ฿{total.toFixed(2)}</Text>

        {/* Contact Rider Section */}
        <TouchableOpacity 
          onPress={() => Alert.alert('The rider is on their way to you')}
          style={styles.contactButton}
        >
          <Text style={styles.contactButtonText}>Contact Rider</Text>
        </TouchableOpacity>

        {/* Rating Section */}
        {!isRated && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingHeader}>Rate the restaurant</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => setSelectedStars(star)}>
                  <Text style={styles.star}>{star <= selectedStars ? '★' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={handleSubmitRating} style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {isRated && (
          <Text style={styles.ratedText}>Thank you for your rating!</Text>
        )}

        <View style={{height: 40}} />

      </ScrollView>
      <View style={styles.footer}>
          <TouchableOpacity onPress={() => nav.replace('Home')} style={styles.homeButton}>
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 24, fontWeight: '800', paddingTop: 16 },
  restaurantName: { marginTop: 8, fontSize: 18, fontWeight: '600' },
  address: { marginTop: 4, color: '#666', marginBottom: 8 },
  timer: { marginVertical: 8, fontSize: 18, fontWeight: '700', color: '#d9534f', textAlign: 'center' },
  itemList: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemText: { fontSize: 16 },
  total: { marginTop: 16, fontWeight: '700', fontSize: 18, textAlign: 'right' },
  contactButton: { backgroundColor: '#5bc0de', padding: 14, borderRadius: 8, marginTop: 24 },
  contactButtonText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
  ratingContainer: { marginTop: 24, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 },
  ratingHeader: { fontWeight: '700', fontSize: 16, textAlign: 'center', marginBottom: 10 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10 },
  star: { fontSize: 36, marginHorizontal: 5, color: '#f0ad4e' },
  ratedText: { textAlign: 'center', marginTop: 24, color: '#666', fontSize: 16 },
  submitButton: { backgroundColor: '#3fb375', padding: 14, borderRadius: 8, marginTop: 10 },
  submitButtonText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
  footer: { paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  homeButton: { backgroundColor: '#6c757d', padding: 14, borderRadius: 8 },
  homeButtonText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
});
