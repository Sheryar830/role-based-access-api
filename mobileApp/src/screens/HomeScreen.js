import React, { useContext, useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthContext } from '../context/AuthContext';
import { getProfile } from '../api/auth';           
import { normalizeUser } from '../utils/authHelpers';

const BG = '#0A0D14';
const CARD = '#0F1420';
const ACCENT = '#0B63F6';

export default function HomeScreen({ navigation }) {
  const { user, setUser, refreshUser } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);

  const name = user?.name || 'Welcome';
  const roleName = user?.roleName || 'user';
  const canCreateTask = user?.permissionNames?.includes('tasks.create');
  const isAdmin = roleName === 'super-admin';

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      
      if (typeof refreshUser === 'function') {
        await refreshUser();
      } else {
        const res = await getProfile();
        if (res?.status && res?.user) {
          const normalized = normalizeUser(res.user);
          setUser(normalized);
          await AsyncStorage.setItem('userData', JSON.stringify(normalized));
        }
      }
    } catch (e) {
      console.log('Home refresh error:', e?.response?.data || e.message);
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser, setUser]);

  const actions = useMemo(() => {
    const arr = [
      {
        key: 'tasks',
        label: 'View Tasks',
        icon: 'list-outline',
        onPress: () => navigation.navigate('Tasks'),
      },
      {
        key: 'profile',
        label: 'Profile',
        icon: 'person-outline',
        onPress: () => navigation.navigate('Profile'),
      },
    ];

    if (canCreateTask) {
      arr.splice(1, 0, {
        key: 'newtask',
        label: 'New Task',
        icon: 'add-circle-outline',
        onPress: () => navigation.navigate('Tasks'),
      });
    }

    if (isAdmin) {
      arr.push(
        {
          key: 'users',
          label: 'Manage Users',
          icon: 'people-outline',
          onPress: () => navigation.navigate('Users'),
        },
        {
          key: 'roles',
          label: 'Roles & Permissions',
          icon: 'shield-outline',
          onPress: () => navigation.navigate('Roles'),
        },
      );
    }

    return arr;
  }, [canCreateTask, isAdmin, navigation]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#fff"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hi, {name}</Text>
        <Text style={styles.headerSubtitle}>
          You’re signed in as <Text style={styles.badge}>{roleName}</Text>
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>

        <View style={styles.grid}>
          {actions.map(a => (
            <TouchableOpacity
              key={a.key}
              style={styles.tile}
              activeOpacity={0.9}
              onPress={a.onPress}
            >
              <View style={styles.tileIconWrap}>
                <Ionicons name={a.icon} size={22} color="#fff" />
              </View>
              <Text style={styles.tileText}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 28,
    backgroundColor: BG,
    flexGrow: 1,
  },

  header: {
    backgroundColor: ACCENT,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 14,
    shadowColor: ACCENT,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerSubtitle: { color: '#E6F0FF', fontSize: 13, marginTop: 6 },
  badge: { color: '#fff', fontWeight: '800' },

  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTitle: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    width: '48%',
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: ACCENT,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  tileText: { color: '#E5E7EB', fontWeight: '700', textAlign: 'center' },
});
