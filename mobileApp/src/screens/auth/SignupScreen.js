import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { registerUser, setAuthToken } from '../../api/auth';

const ACCENT = '#0B63F6';
const BG = '#0A0D14';

const SignupScreen = ({ navigation }) => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirm) {
      Alert.alert('Missing info', 'Please fill all fields');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password mismatch', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const data = await registerUser(name.trim(), email.trim(), password);

      if (data?.status) {
        const token = data.token;
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        setAuthToken(token);

        Alert.alert('Success', data?.message ?? 'Registered successfully.');
        navigation.replace('Login');
      } else {
        Alert.alert('Signup failed', data?.message ?? 'Please try again.');
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Server error';
      Alert.alert('Signup failed', String(msg));
      console.log('Signup error:', {
        status: err?.response?.status,
        data: err?.response?.data,
        url: err?.config?.url,
      });
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us by creating a new account</Text>
        </View>

        {/* Glassy card */}
        <View style={styles.card}>
          {/* Name */}
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={20} color="#667085" style={styles.leftIcon} />
            <TextInput
              placeholder="John Doe"
              placeholderTextColor="#98A2B3"
              style={styles.input}
              value={name}
              onChangeText={setName}
              returnKeyType="next"
            />
          </View>

          {/* Email */}
          <Text style={[styles.label, { marginTop: 14 }]}>Email</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={20} color="#667085" style={styles.leftIcon} />
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
            <Ionicons name="lock-closed-outline" size={20} color="#667085" style={styles.leftIcon} />
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#98A2B3"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="next"
            />
          </View>

          {/* Confirm Password */}
          <Text style={[styles.label, { marginTop: 14 }]}>Confirm Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#667085" style={styles.leftIcon} />
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#98A2B3"
              style={styles.input}
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
              returnKeyType="done"
              onSubmitEditing={handleSignup}
            />
          </View>

          {/* CTA */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="person-add-outline" size={18} color="#fff" />
                <Text style={styles.buttonText}>Sign Up</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ alignSelf: 'center', marginTop: 16 }}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLink}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
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

  loginText: { textAlign: 'center', color: '#D1D5DB', fontSize: 13, marginTop: 4 },
  loginLink: { color: '#7FB2FF', fontWeight: '700' },
});
