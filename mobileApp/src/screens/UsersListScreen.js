import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../context/AuthContext';
import { fetchUsers, updateUser, deleteUser } from '../api/users';

const ACCENT = '#0B63F6';
const BG = '#0A0D14';

const ROLES = ['manager', 'user'];

export default function UsersListScreen() {
  const { user: me } = useContext(AuthContext);
  const canUpdate = me?.permissionNames?.includes('users.update');
  const canDelete = me?.permissionNames?.includes('users.delete');

  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: '',
    email: '',
    role: 'user',
  });

  const load = useCallback(async (p = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      const res = await fetchUsers(p);
      if (res?.status) {
        const items = Array.isArray(res.data) ? res.data : [];
        setMeta(res?.meta || {});
        setList(prev => (append ? [...prev, ...items] : items));
      } else {
        Alert.alert('Error', 'Failed to load users');
      }
    } catch (e) {
      console.log('Users load error:', e?.response?.data || e.message);
      Alert.alert('Error', 'Could not load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(1, false);
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    load(1, false);
  };

  const onEndReached = () => {
    if (meta.current_page < meta.last_page) {
      const next = meta.current_page + 1;
      setPage(next);
      load(next, true);
    }
  };

  const openEdit = u => {
    const current =
      Array.isArray(u.roles) && u.roles.length
        ? typeof u.roles[0] === 'string'
          ? u.roles[0]
          : u.roles[0]?.name ?? 'user'
        : 'user';
    setForm({
      id: u.id,
      name: u.name || '',
      email: u.email || '',
      role: Array.isArray(u.roles) && u.roles.length ? u.roles[0] : 'user',
    });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      Alert.alert('Missing fields', 'Name and Email are required.');
      return;
    }
    try {
      setSaving(true);
      const res = await updateUser(form.id, {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
      });

      if (res?.status) {
        setList(prev =>
          prev.map(u =>
            u.id === form.id
              ? { ...u, name: form.name, email: form.email, roles: [form.role] }
              : u,
          ),
        );
        setEditOpen(false);
      } else {
        Alert.alert('Update failed', res?.message || 'Please try again');
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Server error';
      Alert.alert('Update failed', String(msg));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = u => {
    Alert.alert(
      'Delete user',
      `Are you sure you want to delete “${u.name}”?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteUser(u.id);
              if (res?.status) {
                setList(prev => prev.filter(x => x.id !== u.id));
              } else {
                Alert.alert('Failed', res?.message || 'Could not delete user');
              }
            } catch (e) {
              const msg =
                e?.response?.data?.message || e?.message || 'Server error';
              Alert.alert('Failed', String(msg));
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const renderItem = ({ item }) => {
    const role =
      Array.isArray(item.roles) && item.roles.length ? item.roles[0] : 'user';
    return (
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <View style={styles.badges}>
            <Badge text={role} />
          </View>
        </View>

        <View style={styles.actions}>
          {canUpdate && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => openEdit(item)}
            >
              <Ionicons name="pencil" size={18} color="#fff" />
            </TouchableOpacity>
          )}
          {canDelete && (
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: '#B42318' }]}
              onPress={() => confirmDelete(item)}
            >
              <Ionicons name="trash" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" />
        <Text style={{ color: '#D1D5DB', marginTop: 6 }}>Loading users…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={list}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
        onEndReachedThreshold={0.3}
        onEndReached={onEndReached}
        ListFooterComponent={
          meta.current_page < meta.last_page ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : null
        }
        contentContainerStyle={{ padding: 12 }}
      />

      {/* Edit modal */}
      <Modal
        visible={editOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setEditOpen(false)}
      >
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit User</Text>

            <Field
              label="Name"
              value={form.name}
              onChangeText={t => setForm({ ...form, name: t })}
            />
            <Field
              label="Email"
              value={form.email}
              onChangeText={t => setForm({ ...form, email: t })}
              keyboardType="email-address"
            />

            <Text style={styles.label}>Role</Text>
            <View style={styles.roleWrap}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.rolePill,
                    form.role === r && styles.rolePillActive,
                  ]}
                  onPress={() => setForm({ ...form, role: r })}
                >
                  <Text
                    style={[
                      styles.roleText,
                      form.role === r && styles.roleTextActive,
                    ]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#334155' }]}
                onPress={() => setEditOpen(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: ACCENT, flex: 1 }]}
                onPress={submitEdit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Badge({ text, secondary }) {
  return (
    <View style={[styles.badge, secondary && styles.badgeSecondary]}>
      <Text
        style={[styles.badgeText, secondary && styles.badgeSecondaryText]}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
}

function Field({ label, ...props }) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor="#98A2B3"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  center: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },

  row: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#0F1420',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 10,
  },
  name: { color: '#E5E7EB', fontSize: 16, fontWeight: '700' },
  email: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },

  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },

  actions: { justifyContent: 'center', gap: 8, marginLeft: 10 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badge: {
    backgroundColor: '#0B1220',
    borderColor: '#1F2937',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { color: '#E5E7EB', fontSize: 12 },

  badgeSecondary: {
    borderColor: '#20324a',
  },
  badgeSecondaryText: { color: '#7FB2FF' },

  label: { color: '#98A2B3', fontSize: 12, marginBottom: 6 },
  input: {
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 12,
    color: '#F3F4F6',
    paddingHorizontal: 12,
    height: 46,
  },

  modalWrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#0F1420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },

  roleWrap: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  rolePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F2937',
    backgroundColor: '#0B1220',
  },
  rolePillActive: { borderColor: ACCENT, backgroundColor: '#0B1C34' },
  roleText: { color: '#9CA3AF', fontSize: 12 },
  roleTextActive: { color: '#7FB2FF', fontWeight: '700' },

  btn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },
});
