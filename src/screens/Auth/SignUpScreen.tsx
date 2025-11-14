import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';

export default function SignUpScreen() {
  const nav = useNavigation<any>();
  const { signUp } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    const ok = await signUp(name.trim(), email.trim(), password);
    if (!ok) Alert.alert('Error', 'Email already registered');
    else nav.replace('Home');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 48 }}>
        <TouchableOpacity onPress={() => nav.navigate('Login')} style={{ padding: 10, backgroundColor: '#eee', borderRadius: 20 }}>
          <Text>Log in</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => nav.navigate('SignUp')} style={{ padding: 10, marginLeft: 8, backgroundColor: '#3fb375', borderRadius: 20 }}>
          <Text style={{ color: '#fff' }}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 40, borderWidth: 1, borderColor: '#eee', padding: 18, borderRadius: 8 }}>
        <TextInput placeholder="Name" value={name} onChangeText={setName} style={{ borderWidth: 1, borderColor: '#eee', padding: 10, borderRadius: 8, marginBottom: 12 }} />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, borderColor: '#eee', padding: 10, borderRadius: 8, marginBottom: 12 }} />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, borderColor: '#eee', padding: 10, borderRadius: 8, marginBottom: 12 }} />
        <TouchableOpacity onPress={handleSignUp} style={{ backgroundColor: '#3fb375', padding: 12, borderRadius: 8 }}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}