import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, setAuthToken } from '../../api/auth';
import { normalizeUser } from '../../utils/authHelpers';
import { AuthContext } from '../../context/AuthContext';

const ACCENT = '#0B63F6';
const BG = '#0A0D14';

const LoginScreen = ({ navigation }) => {
  const { setUser } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter both email and password');
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(email, password);

      if (!data?.status) {
        Alert.alert('Login failed', data?.message || 'Invalid credentials');
        return;
      }

      const token =
        data?.token || data?.data?.token || data?.access_token || null;

      const rawUser = data?.user || data?.data?.user || null;

      if (!token || !rawUser) {
        console.log('Unexpected login payload:', data);
        Alert.alert('Error', 'Unexpected login .');
        return;
      }

      const user = normalizeUser(rawUser);

      await AsyncStorage.multiSet([
        ['userToken', String(token)],
        ['userData', JSON.stringify(user)],
      ]);
      setAuthToken(String(token));

      setUser(user);

      Alert.alert('Success', data?.message || 'Logged in successfully');

      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      console.log('Login error:', {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        url: err?.config?.url,
      });
      Alert.alert('Error', 'Server not reachable or invalid response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Premium header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to continue</Text>
        </View>

        {/* Glassy card */}
        <View style={styles.card}>
          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#667085"
              style={styles.leftIcon}
            />
            <TextInput
              placeholder="name@domain.com"
              placeholderTextColor="#98A2B3"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#667085"
              style={styles.leftIcon}
            />
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#98A2B3"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          {/* Button */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={18} color="#fff" />
                <Text style={styles.buttonText}>Login</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Signup')}
            style={{ alignSelf: 'center', marginTop: 16 }}
          >
            <Text style={styles.linkText}>
              Don’t have an account?{' '}
              <Text style={styles.linkHighlight}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'flex-start' },
  header: {
    backgroundColor: ACCENT,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginTop: 50,
    marginBottom: 18,
    shadowColor: ACCENT,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: 0.2 },
  subtitle: { color: '#E6F0FF', fontSize: 13, marginTop: 6 },
  card: {
    backgroundColor: '#0F1420',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  label: { color: '#98A2B3', fontSize: 12, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  leftIcon: { marginRight: 8 },
  input: { flex: 1, color: '#F3F4F6', fontSize: 16, paddingVertical: 0 },
  button: {
    marginTop: 18,
    height: 50,
    borderRadius: 12,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: ACCENT,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 6 },
  linkText: { color: '#D1D5DB', fontSize: 13 },
  linkHighlight: { color: '#7FB2FF', fontWeight: '700' },
});
