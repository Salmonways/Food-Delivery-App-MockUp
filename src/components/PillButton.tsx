import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export default function PillButton({ onPress, label }: { onPress?: () => void; label: string }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: '#3fb375', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
}