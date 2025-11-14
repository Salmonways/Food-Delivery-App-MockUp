

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RESTAURANTS as INITIAL_RESTAURANTS, Restaurant, MenuItem } from '../data/mockData';
import { haversineDistanceKm, etaMsFromDistanceKm } from '../utils/geo';

type CartItem = MenuItem & { quantity: number };

export type Order = {
  id: string;
  restaurantId: string;
  items: CartItem[];
  createdAt: number;
  etaMs: number;
  status: 'in_progress' | 'completed';
  rated?: boolean;
};

type UserLocation = {
  lat: number;
  lng: number;
  address?: string;
};

type User = {
  name: string;
  email: string;
  password: string;
};

type AppContextType = {
  restaurants: Restaurant[];
  userLocation: UserLocation | null;
  cart: { restaurantId: string | null; items: CartItem[] };
  activeOrder: Order | null;
  currentUser: User | null;
  addToCart: (restaurantId: string, item: MenuItem, qty?: number) => { ok: boolean; reason?: string };
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  confirmOrder: () => Order | null;
  submitRating: (orderId: string, rating: number) => boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [restaurants, setRestaurants] = useState(INITIAL_RESTAURANTS);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [cart, setCart] = useState({ restaurantId: null as string | null, items: [] as CartItem[] });
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = pos.coords;
          const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
          const address = place
            ? `${place.name || ''} ${place.street || ''}, ${place.city || ''}, ${place.region || ''}`
            : 'Unknown location';
          setUserLocation({ lat: latitude, lng: longitude, address });
        } else {
          
          setUserLocation({ lat: 13.7367, lng: 100.5231, address: 'Bangkok, Thailand' });
        }
      } catch {
        setUserLocation({ lat: 13.7367, lng: 100.5231, address: 'Bangkok, Thailand' });
      }
    })();
  }, []);

 
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('currentUser');
      if (saved) setCurrentUser(JSON.parse(saved));
    })();
  }, []);

 
  useEffect(() => {
    if (currentUser) AsyncStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  
  useEffect(() => {
    if (!activeOrder) return;
    const remaining = activeOrder.createdAt + activeOrder.etaMs - Date.now();
    const timer = setTimeout(
      () => setActiveOrder(prev => (prev ? { ...prev, status: 'completed' } : prev)),
      remaining
    );
    return () => clearTimeout(timer);
  }, [activeOrder]);


  const addToCart = (restaurantId: string, item: MenuItem, qty = 1) => {
    if (activeOrder && activeOrder.status === 'in_progress')
      return { ok: false, reason: 'in_progress' };

    if (!cart.restaurantId || cart.restaurantId === restaurantId) {
      setCart(prev => {
        const existing = prev.items.find(i => i.id === item.id);
        if (existing) {
          existing.quantity += qty;
          return { ...prev, items: [...prev.items] };
        }
        return { restaurantId, items: [...prev.items, { ...item, quantity: qty }] };
      });
      return { ok: true };
    }
    return { ok: false, reason: 'different_restaurant' };
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const items = prev.items.filter(i => i.id !== itemId);
      return { restaurantId: items.length ? prev.restaurantId : null, items };
    });
  };

  const clearCart = () => setCart({ restaurantId: null, items: [] });


  const confirmOrder = () => {
    if (!cart.restaurantId || !cart.items.length || !userLocation) return null;
    const rest = restaurants.find(r => r.id === cart.restaurantId)!;
    const dist = haversineDistanceKm(userLocation.lat, userLocation.lng, rest.lat, rest.lng);
    const etaMs = etaMsFromDistanceKm(dist, 50);
    const createdAt = Date.now();

    const order: Order = {
      id: 'o' + createdAt,
      restaurantId: rest.id,
      items: cart.items,
      createdAt,
      etaMs,
      status: 'in_progress',
    };

    setActiveOrder(order);
    clearCart();
    return order;
  };


  const submitRating = (orderId: string, rating: number) => {
    if (!activeOrder || activeOrder.id !== orderId) return false;
    if (activeOrder.rated) return false;

    const idx = restaurants.findIndex(r => r.id === activeOrder.restaurantId);
    if (idx === -1) return false;

    setRestaurants(prev => {
      const updated = [...prev];
      const rest = { ...updated[idx] };
      const newCount = rest.reviews + 1;
      const newAvg = (rest.rating * rest.reviews + rating) / newCount;
      rest.rating = Math.round(newAvg * 10) / 10;
      rest.reviews = newCount;
      updated[idx] = rest;
      return updated;
    });

    setActiveOrder(prev => (prev ? { ...prev, rated: true } : prev));
    return true;
  };

  // 🔹 Authentication using AsyncStorage
  const signUp = async (name: string, email: string, password: string) => {
    const users = JSON.parse((await AsyncStorage.getItem('users')) || '[]');
    if (users.some((u: User) => u.email === email)) return false;
    const newUser = { name, email, password };
    users.push(newUser);
    await AsyncStorage.setItem('users', JSON.stringify(users));
    setCurrentUser(newUser);
    return true;
  };

  const login = async (email: string, password: string) => {
    const users = JSON.parse((await AsyncStorage.getItem('users')) || '[]');
    const found = users.find((u: User) => u.email === email && u.password === password);
    if (!found) return false;
    setCurrentUser(found);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    AsyncStorage.removeItem('currentUser');
  };

  return (
    <AppContext.Provider
      value={{
        restaurants,
        userLocation,
        cart,
        activeOrder,
        currentUser,
        addToCart,
        removeFromCart,
        clearCart,
        confirmOrder,
        submitRating,
        login,
        signUp,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used inside AppProvider');
    return ctx;
};