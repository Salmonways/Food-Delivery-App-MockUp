import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
  const nav = useNavigation<any>();
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Image source={require('../../assets/Logo/DeliGoLogo.png')} style={{ width: 180, height: 180, borderRadius: 20 }} />
      <Text style={{ marginTop: 20, fontSize: 32, fontWeight: '800', color: '#3fb375' }}>DeliGO</Text>

      <TouchableOpacity
        onPress={() => nav.replace('Login')}
        style={{ marginTop: 40, backgroundColor: '#3fb375', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>Begin your experience</Text>
      </TouchableOpacity>
    </View>
  );
}