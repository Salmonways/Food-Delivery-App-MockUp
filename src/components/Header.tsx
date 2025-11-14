import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Header({ title }: { title?: string }) {
  const nav = useNavigation<any>();
  return (
    <View style={{ paddingTop: 40, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => nav.goBack()} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 18 }}>◁</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>{title}</Text>
      </View>
    </View>
  );
}