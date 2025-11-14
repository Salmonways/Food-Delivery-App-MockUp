import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';

export default function LoginScreen() {
  const nav = useNavigation<any>();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const ok = await login(email.trim(), password);
    if (!ok) Alert.alert('Login failed', 'Invalid email or password');
    else nav.replace('Home');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 48 }}>
        <TouchableOpacity onPress={() => nav.navigate('Login')} style={{ padding: 10, marginRight: 8, backgroundColor: '#3fb375', borderRadius: 20 }}>
          <Text style={{ color: '#fff' }}>Log in</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => nav.navigate('SignUp')} style={{ padding: 10, backgroundColor: '#eee', borderRadius: 20 }}>
          <Text>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 40, borderWidth: 1, borderColor: '#eee', padding: 18, borderRadius: 8 }}>
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, borderColor: '#eee', padding: 10, borderRadius: 8, marginBottom: 12 }} />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, borderColor: '#eee', padding: 10, borderRadius: 8, marginBottom: 12 }} />
        <TouchableOpacity onPress={handleLogin} style={{ backgroundColor: '#3fb375', padding: 12, borderRadius: 8 }}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}