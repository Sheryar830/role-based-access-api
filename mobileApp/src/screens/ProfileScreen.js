import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getProfile, updateProfile } from '../api/user';
import { setAuthToken, logoutUser } from '../api/auth';
import { AuthContext } from '../context/AuthContext';

const ACCENT = '#0B63F6';
const BG = '#0A0D14';

export default function ProfileScreen({ navigation }) {
  const [initializing, setInitializing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [secure, setSecure] = useState(true);

  const [roles, setRoles] = useState([]); 
  const [permissions, setPermissions] = useState([]);
  const { setUser } = useContext(AuthContext);

  const bootstrap = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) setAuthToken(token);

      const data = await getProfile(); 
      if (data?.status && data?.user) {
        setName(data.user.name ?? '');
        setEmail(data.user.email ?? '');
        setRoles(Array.isArray(data.user.roles) ? data.user.roles : []);
        setPermissions(
          Array.isArray(data.user.permissions) ? data.user.permissions : [],
        );
      } else {
        Alert.alert('Error', 'Failed to load profile');
      }
    } catch (e) {
      console.log('Profile load error:', e?.response?.data || e.message);
      Alert.alert('Error', 'Could not load your profile');
    } finally {
      setInitializing(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    bootstrap();
  }, [bootstrap]);

  const onSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Missing info', 'Name and Email are required');
      return;
    }
    try {
      setSaving(true);
      const res = await updateProfile({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (res?.status) {
        if (res.user) {
          setName(res.user.name ?? name);
          setEmail(res.user.email ?? email);
          setRoles(Array.isArray(res.user.roles) ? res.user.roles : roles);
          setPermissions(
            Array.isArray(res.user.permissions)
              ? res.user.permissions
              : permissions,
          );
          await AsyncStorage.setItem('userData', JSON.stringify(res.user));
        }
        setPassword('');
        Alert.alert('Saved', res?.message || 'Your profile was updated successfully');
      } else {
        Alert.alert('Update failed', res?.message || 'Please try again');
      }
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        'Server error';
      Alert.alert('Update failed', String(msg));
    } finally {
      setSaving(false);
    }
  };

  if (initializing) {
    return (
      <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#D1D5DB', marginTop: 8 }}>Loading profile…</Text>
      </View>
    );
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logoutUser(navigation, setUser);
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={styles.root}>
      {/* One ScrollView contains header + avatar + content (same design) */}
      <ScrollView
        contentContainerStyle={[styles.scroll, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
        overScrollMode="always" // Android: allow pull even when content is short
      >
        {/* Header (unchanged) */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your account details</Text>
        </View>

        {/* Avatar (unchanged) */}
        <View style={styles.avatarWrap}>
          <Image
            source={{
              uri:
                'https://media.istockphoto.com/id/2171382633/vector/user-profile-icon-anonymous-person-symbol-blank-avatar-graphic-vector-illustration.jpg?s=1024x1024&w=is&k=20&c=qcfUz-2TZEaFotFckzmyFkQnqx7BWOeAl6fs2VYnmrc=',
            }}
            style={styles.avatar}
          />
        </View>

        {/* Account card + buttons (unchanged design) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>

          <Field
            icon="person-outline"
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
          />

          <Field
            icon="mail-outline"
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="name@domain.com"
          />

          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.secondaryBtn]}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Ionicons name="key-outline" size={18} color="#0B63F6" />
            <Text style={styles.secondaryText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.primaryBtn, saving && { opacity: 0.6 }]}
            onPress={onSave}
            disabled={saving}
          >
            <Ionicons name="save-outline" size={18} color="#fff" />
            <Text style={styles.primaryText}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.dangerBtn]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.dangerBtnText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Field({ icon, label, right, style, ...inputProps }) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon} size={20} color="#667085" style={styles.leftIcon} />
        <TextInput style={styles.input} placeholderTextColor="#98A2B3" {...inputProps} />
        {right ? <View style={styles.rightIcon}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  header: {
    
    paddingTop: 52,
    paddingBottom: 64,
    paddingHorizontal: 20,
    backgroundColor: ACCENT,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },
  headerSubtitle: { color: '#E6F0FF', marginTop: 6, fontSize: 13 },

  avatarWrap: { alignItems: 'center', marginTop: -38, marginBottom: 8 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#111827',
  },

  scroll: { padding: 16, paddingBottom: 28 },

  card: {
    backgroundColor: '#0F1420',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTitle: { color: '#E5E7EB', fontSize: 16, fontWeight: '700', marginBottom: 4 },

  field: { marginTop: 14 },
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
  rightIcon: { marginLeft: 8 },

  secondaryBtn: {
    marginTop: 12,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#20324a',
  },
  secondaryText: { color: '#7FB2FF', fontSize: 15, fontWeight: '700', marginLeft: 6 },

  primaryBtn: {
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
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  dangerBtn: {
    marginTop: 14,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#B42318',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#B42318',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  dangerBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 6 },
});
