import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { changePassword } from '../../api/user';
import { logoutUser } from '../../api/auth';

const ACCENT = '#0B63F6';
const BG = '#0A0D14';

export default function ChangePasswordScreen({ navigation }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [secure1, setSecure1] = useState(true);
  const [secure2, setSecure2] = useState(true);
  const [secure3, setSecure3] = useState(true);
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    if (!current || !next || !confirm) {
      Alert.alert('Missing info', 'Please fill all fields.');
      return;
    }
    if (next.length < 8) {
      Alert.alert(
        'Weak password',
        'New password must be at least 8 characters.',
      );
      return;
    }
    if (next !== confirm) {
      Alert.alert('Mismatch', 'Password confirmation does not match.');
      return;
    }

    try {
      setSaving(true);
      const res = await changePassword({
        current_password: current,
        password: next,
        password_confirmation: confirm,
      });

      if (res?.status) {
        Alert.alert('Password changed', 'Please log in again.', [
          {
            text: 'OK',
            onPress: async () => {
              await logoutUser();
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            },
          },
        ]);
      } else {
        Alert.alert('Update failed', res?.message || 'Please try again.');
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header with back button on the left and text shifted right */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>

            <View style={styles.textWrap}>
              <Text style={styles.title}>Change Password</Text>
              <Text style={styles.subtitle}>
                Enter your current and new password
              </Text>
            </View>
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Field
            icon="lock-closed-outline"
            label="Current Password"
            value={current}
            onChangeText={setCurrent}
            placeholder="••••••••"
            secureTextEntry={secure1}
            right={
              <TouchableOpacity onPress={() => setSecure1(s => !s)}>
                <Ionicons
                  name={secure1 ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#667085"
                />
              </TouchableOpacity>
            }
          />

          <Field
            icon="shield-checkmark-outline"
            label="New Password"
            value={next}
            onChangeText={setNext}
            placeholder="••••••••"
            secureTextEntry={secure2}
            right={
              <TouchableOpacity onPress={() => setSecure2(s => !s)}>
                <Ionicons
                  name={secure2 ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#667085"
                />
              </TouchableOpacity>
            }
            style={{ marginTop: 14 }}
          />

          <Field
            icon="shield-checkmark-outline"
            label="Confirm New Password"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="••••••••"
            secureTextEntry={secure3}
            right={
              <TouchableOpacity onPress={() => setSecure3(s => !s)}>
                <Ionicons
                  name={secure3 ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#667085"
                />
              </TouchableOpacity>
            }
            style={{ marginTop: 14 }}
          />

          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.primaryBtn, saving && { opacity: 0.7 }]}
            onPress={onSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="key-outline" size={18} color="#fff" />
                <Text style={styles.primaryText}>Update Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---- Reusable Field ---- */
function Field({ icon, label, right, style, ...inputProps }) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons
          name={icon}
          size={20}
          color="#667085"
          style={styles.leftIcon}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor="#98A2B3"
          {...inputProps}
        />
        {right ? <View style={styles.rightIcon}>{right}</View> : null}
      </View>
    </View>
  );
}

/* ---- Styles ---- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  header: {
    backgroundColor: ACCENT,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 50,
    marginBottom: 18,
    shadowColor: ACCENT,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  textWrap: {
    flex: 1,
    marginLeft: 12, 
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subtitle: { color: '#E6F0FF', fontSize: 13, marginTop: 4 },

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

  field: { marginTop: 8 },
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
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
  },
});
