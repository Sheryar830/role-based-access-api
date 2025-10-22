import React, { useEffect, useMemo, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { fetchRoles, updateRolePermissions } from '../api/roles';
import { AuthContext } from '../context/AuthContext';

const BG = '#0A0D14';
const CARD = '#0F1420';
const ACCENT = '#0B63F6';

export default function RolePermissionScreen() {
  const { user: me } = useContext(AuthContext);
  const canUpdate = me?.permissionNames?.includes('roles.update');

  const [roles, setRoles] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState(null); 
  const [selected, setSelected] = useState(new Set()); 

  // Load roles
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetchRoles();
        if (res?.status) setRoles(Array.isArray(res.data) ? res.data : []);
        else Alert.alert('Error', 'Failed to load roles');
      } catch (e) {
        console.log('roles load error:', e?.response?.data || e.message);
        Alert.alert('Error', 'Could not load roles');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Full permission catalog grouped by namespace (users.*, roles.*, projects.*, tasks.*)
  const allPermissions = useMemo(() => {
    const superAdmin = roles.find(r => r.name === 'super-admin');
    const base =
      superAdmin?.permissions ??
      roles.reduce((acc, r) => {
        if (Array.isArray(r.permissions)) acc.push(...r.permissions);
        return acc;
      }, []);
    const map = new Map(); // unique by name
    (base || []).forEach(p => map.set(p.name, p));
    const groups = {};
    [...map.values()].forEach(p => {
      const ns = p.name.split('.')[0];
      if (!groups[ns]) groups[ns] = [];
      groups[ns].push(p);
    });
    Object.values(groups).forEach(arr =>
      arr.sort((a, b) => a.name.localeCompare(b.name)),
    );
    return groups; // { users:[{id,name},...], roles:[...], ... }
  }, [roles]);

  // A flat array for quick lookups (avoids .flat)
  const allPermissionsFlat = useMemo(() => {
    return Object.keys(allPermissions).reduce((acc, k) => {
      acc.push(...allPermissions[k]);
      return acc;
    }, []);
  }, [allPermissions]);

  // Hide super-admin from the list entirely
  const visibleRoles = useMemo(
    () => roles.filter(r => r.name !== 'super-admin'),
    [roles],
  );

  const openEdit = role => {
    setCurrent(role);
    const currentNames = new Set((role.permissions || []).map(p => p.name));
    setSelected(currentNames);
    setOpen(true);
  };

  const togglePerm = permName => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(permName)) next.delete(permName);
      else next.add(permName);
      return next;
    });
  };

  const selectAll = () => {
    const names = [];
    Object.values(allPermissions).forEach(arr =>
      arr.forEach(p => names.push(p.name)),
    );
    setSelected(new Set(names));
  };
  const clearAll = () => setSelected(new Set());

  const save = async () => {
    if (current?.name === 'super-admin') {
      Alert.alert('Blocked', 'Super Admin permissions cannot be changed.');
      return;
    }
    if (!canUpdate) {
      Alert.alert('Not allowed', 'You do not have permission to update roles.');
      return;
    }

    try {
      setSaving(true);

      const selectedIds = [...selected]
        .map(name => allPermissionsFlat.find(p => p.name === name)?.id)
        .filter(Boolean);

      if (selectedIds.length !== selected.size) {
        console.log('Some permission names did not map to ids', {
          selected: [...selected],
          selectedIds,
        });
      }

      const res = await updateRolePermissions(current.id, {
        permissions: selectedIds,
      });

      if (!res?.status) {
        Alert.alert('Update failed', res?.message || 'Please try again');
        return;
      }

      setRoles(prev =>
        prev.map(r =>
          r.id === current.id
            ? {
                ...r,
                permissions: selectedIds
                  .map(id => allPermissionsFlat.find(p => p.id === id))
                  .filter(Boolean),
              }
            : r,
        ),
      );

      setOpen(false);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.errors?.permissions?.[0] ||
        e?.message ||
        'Server error';
      Alert.alert('Update failed', String(msg));
    } finally {
      setSaving(false);
    }
  };

  const renderRole = ({ item }) => {
    // By design super-admin is hidden; this is just extra safety.
    const canEditThisRole = canUpdate && item.name !== 'super-admin';

    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.roleName}>{item.display_name || item.name}</Text>
          <Text style={styles.roleSub}>{item.name}</Text>

          <View style={styles.badges}>
            {(item.permissions || []).slice(0, 4).map(p => (
              <Badge key={p.name} text={p.name} />
            ))}
            {(item.permissions || []).length > 4 && (
              <Badge text={`+${item.permissions.length - 4} more`} dim />
            )}
          </View>
        </View>

        {canEditThisRole && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => openEdit(item)}
          >
            <Ionicons name="settings-outline" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" />
        <Text style={{ color: '#D1D5DB', marginTop: 6 }}>Loading roles…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={visibleRoles}
        keyExtractor={r => String(r.id)}
        renderItem={renderRole}
        contentContainerStyle={{ padding: 12 }}
      />

      {/* Edit modal */}
      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Edit Permissions — {current?.display_name || current?.name}
            </Text>

            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={[styles.smallBtn, { backgroundColor: '#334155' }]}
                onPress={clearAll}
              >
                <Text style={styles.smallBtnText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallBtn, { backgroundColor: ACCENT }]}
                onPress={selectAll}
              >
                <Text style={styles.smallBtnText}>Select All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: 380 }}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              {Object.keys(allPermissions)
                .sort()
                .map(ns => (
                  <View key={ns} style={{ marginTop: 12 }}>
                    <Text style={styles.sectionTitle}>{ns.toUpperCase()}</Text>
                    <View style={styles.pillsWrap}>
                      {allPermissions[ns].map(p => {
                        const active = selected.has(p.name);
                        return (
                          <TouchableOpacity
                            key={p.name}
                            style={[styles.pill, active && styles.pillActive]}
                            onPress={() => togglePerm(p.name)}
                          >
                            <Text
                              style={[
                                styles.pillText,
                                active && styles.pillTextActive,
                              ]}
                            >
                              {p.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#334155' }]}
                onPress={() => setOpen(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: ACCENT, flex: 1 }]}
                onPress={save}
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

function Badge({ text, dim }) {
  return (
    <View style={[styles.badge, dim && styles.badgeDim]}>
      <Text
        style={[styles.badgeText, dim && styles.badgeTextDim]}
        numberOfLines={1}
      >
        {text}
      </Text>
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

  card: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 10,
  },
  roleName: { color: '#E5E7EB', fontSize: 16, fontWeight: '700' },
  roleSub: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },

  controlsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  smallBtn: {
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtnText: { color: '#fff', fontWeight: '700' },

  sectionTitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 6,
    marginTop: 4,
  },
  pillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  pill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  pillActive: { backgroundColor: '#0B1C34', borderColor: ACCENT },
  pillText: { color: '#9CA3AF', fontSize: 12 },
  pillTextActive: { color: '#7FB2FF', fontWeight: '700' },

  btn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },

  badge: {
    backgroundColor: '#0B1220',
    borderColor: '#1F2937',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeDim: { borderColor: '#20324a' },
  badgeText: { color: '#E5E7EB', fontSize: 12 },
  badgeTextDim: { color: '#7FB2FF' },
});
