import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import Ionicons from 'react-native-vector-icons/Ionicons';

const BG = '#0A0D14';
const CARD = '#0F1420';
const ACCENT = '#0B63F6';

export default function LocationGate({ onReady }) {
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  const requestAndroidPermission = async () => {
    // Check first to avoid re-prompt loops
    const hasFine = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (hasFine) return PermissionsAndroid.RESULTS.GRANTED;

    return PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app requires location access to continue.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      }
    );
  };

  const askPermission = useCallback(async () => {
    setChecking(true);
    setError('');

    try {
      if (Platform.OS === 'android') {
        const granted = await requestAndroidPermission();
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setError('Location permission is required to use this app.');
          setChecking(false);
          return;
        }
      } else {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        if (auth !== 'granted') {
          setError('Location permission is required to use this app.');
          setChecking(false);
          return;
        }
      }

      // Only after permission is granted, get a first fix
      Geolocation.getCurrentPosition(
        (pos) => {
          setChecking(false);
          onReady?.(pos.coords);
        },
        (err) => {
          setError(err?.message || 'Unable to access location.');
          setChecking(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
      );
    } catch (e) {
      setError(e?.message || 'Unexpected error while requesting location.');
      setChecking(false);
    }
  }, [onReady]);

  useEffect(() => {
    askPermission();
  }, [askPermission]);

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings().catch(() =>
        Alert.alert('Error', 'Unable to open settings.')
      );
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="navigate-outline" size={28} color="#fff" />
        </View>

        <Text style={styles.title}>Location Required</Text>
        <Text style={styles.subtitle}>
          Please allow location access to continue.
        </Text>

        {checking ? (
          <View style={{ alignItems: 'center', marginTop: 14 }}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.helper}>Checking permission…</Text>
          </View>
        ) : (
          <>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity style={styles.primaryBtn} onPress={askPermission}>
              <Ionicons name="reload-outline" size={18} color="#fff" />
              <Text style={styles.primaryText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={openSettings}>
              <Ionicons name="settings-outline" size={18} color="#7FB2FF" />
              <Text style={styles.secondaryText}>Open Settings</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10,
    shadowColor: ACCENT,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  title: { color: '#E5E7EB', fontSize: 18, fontWeight: '800' },
  subtitle: { color: '#AAB2C2', marginTop: 6, fontSize: 13 },
  helper: { color: '#C9D1D9', marginTop: 10 },
  error: { color: '#FCA5A5', marginTop: 10 },

  primaryBtn: {
    marginTop: 14,
    height: 48,
    borderRadius: 12,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 6 },

  secondaryBtn: {
    marginTop: 10,
    height: 46,
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
});
