import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AuthContext } from '../context/AuthContext';
import { fetchTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { fetchAllUsersLite } from '../api/users';

const BG = '#0A0D14';
const CARD = '#0F1420';
const ACCENT = '#0B63F6';

const STATUSES = [
  { key: 'todo',        label: 'To-Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done',        label: 'Done' },
];

const DEFAULT_FORM = {
  title: '',
  description: '',
  status: 'todo',
  assigned_to: null,
};

export default function TasksScreen() {
  const { user: me } = useContext(AuthContext);
  const canCreate   = me?.permissionNames?.includes('tasks.create');
  const canUpdate   = me?.permissionNames?.includes('tasks.update');
  const canDelete   = me?.permissionNames?.includes('tasks.delete');
  const canSeeUsers = me?.permissionNames?.includes('users.read');

  
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [mineOnly, setMineOnly] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); 
  const [form, setForm] = useState(DEFAULT_FORM); 
  const f = form ?? DEFAULT_FORM; 

  // assignees list (only role=user)
  const [users, setUsers] = useState([]);

  /* ----------------- helpers for /users payloads ----------------- */
  // Normalize many possible API shapes into a plain array
  const normalizeUsersArray = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;           // plain array
    if (Array.isArray(payload.data)) return payload.data; // { data:[...] }
    if (Array.isArray(payload.users)) return payload.users;
    if (Array.isArray(payload.data?.data)) return payload.data.data; // paginator
    if (Array.isArray(payload.data?.items)) return payload.data.items;

    // Fallback: first array found among values
    const firstArray = Object.values(payload).find(v => Array.isArray(v));
    return Array.isArray(firstArray) ? firstArray : [];
  };

  const isRegularUser = (u) => {
    if (u?.roleName) return u.roleName === 'user';
    if (Array.isArray(u?.roles)) {
      return u.roles.some(r => (typeof r === 'string' ? r : r?.name) === 'user');
    }
    return true;
  };

  const loadUsers = useCallback(async () => {
    try {
      if (!canSeeUsers) {
        setUsers([{ id: me?.id, name: `${me?.name} (me)` }].filter(Boolean));
        return;
      }

      
      let res = await fetchAllUsersLite({ role: 'user', per_page: 100 });
      let arr = normalizeUsersArray(res);

      
      if (!Array.isArray(arr) || arr.length === 0) {
        res = await fetchAllUsersLite({ per_page: 100 });
        arr = normalizeUsersArray(res);
      }

      const list = (arr || [])
        .filter(isRegularUser)
        .map(u => ({ id: u.id, name: u.name }));

      setUsers(list.length ? list : [{ id: me?.id, name: `${me?.name} (me)` }].filter(Boolean));
    } catch (e) {
      console.log('assignees load error:', e?.response?.status, e?.response?.data || e.message);
      setUsers([{ id: me?.id, name: `${me?.name} (me)` }].filter(Boolean));
    }
  }, [canSeeUsers, me?.id, me?.name]);

  const load = useCallback(
    async (p = 1, append = false) => {
      try {
        if (!append) setLoading(true);
        const res = await fetchTasks({
          page: p,
          per_page: 20,
          q: search || undefined,
          status: statusFilter || undefined,
          mine: mineOnly || undefined,
        });
        if (res?.status) {
          const arr = Array.isArray(res.data) ? res.data : [];
          setMeta(res.meta || {});
          setItems(prev => (append ? [...prev, ...arr] : arr));
        } else {
          Alert.alert('Error', 'Failed to load tasks');
        }
      } catch (e) {
        console.log('tasks load error:', e?.response?.data || e.message);
        Alert.alert('Error', 'Could not load tasks');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, statusFilter, mineOnly],
  );

  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => { load(1, false); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load(1, false);
  };

  const onEndReached = () => {
    if (meta.current_page < meta.last_page) {
      const next = meta.current_page + 1;
      load(next, true);
    }
  };

  // open create/edit modal
  const openCreate = () => {
    setEditing(null);
    setForm(DEFAULT_FORM);
    setOpen(true);
  };
  const openEdit = (t) => {
    setEditing(t);
    setForm({
      title: t?.title ?? '',
      description: t?.description ?? '',
      status: t?.status ?? 'todo',
      assigned_to: t?.assigned_to ?? null,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!f.title.trim()) {
      Alert.alert('Missing title', 'Title is required.');
      return;
    }
    if (!STATUSES.find(s => s.key === f.status)) {
      Alert.alert('Invalid status', 'Choose a valid status.');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        title: f.title.trim(),
        description: f.description?.trim() || '',
        status: f.status,
        assigned_to: f.assigned_to ?? null,
      };

      let res;
      if (editing) res = await updateTask(editing.id, payload);
      else         res = await createTask(payload);

      if (!res?.status) {
        Alert.alert('Failed', res?.message || 'Please try again');
        return;
      }

      const task = res.data;
      setItems(prev => (editing ? prev.map(x => (x.id === task.id ? task : x)) : [task, ...prev]));
      setOpen(false);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.errors?.status?.[0] ||
        e?.message ||
        'Server error';
      Alert.alert('Failed', String(msg));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (t) => {
    Alert.alert(
      'Delete task',
      `Delete “${t.title}”?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteTask(t.id);
              if (res?.status) {
                setItems(prev => prev.filter(x => x.id !== t.id));
              } else {
                Alert.alert('Failed', res?.message || 'Could not delete task');
              }
            } catch (e) {
              const msg = e?.response?.data?.message || e?.message || 'Server error';
              Alert.alert('Failed', String(msg));
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const headerFilters = (
    <View style={styles.filters}>
      {/* search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color="#9CA3AF" />
        <TextInput
          placeholder="Search title or description"
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          onSubmitEditing={() => load(1, false)}
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearch('');
              load(1, false);
            }}
          >
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* status pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <FilterPill active={statusFilter === ''} onPress={() => setStatusFilter('')} label="All" />
        {STATUSES.map(s => (
          <FilterPill
            key={s.key}
            active={statusFilter === s.key}
            onPress={() => setStatusFilter(s.key)}
            label={s.label}
          />
        ))}
        <FilterPill
          active={mineOnly}
          onPress={() => setMineOnly(v => !v)}
          label="Mine"
          icon={mineOnly ? 'person' : 'person-outline'}
        />
      </ScrollView>

      {/* create button */}
      {canCreate && (
        <TouchableOpacity style={styles.createBtn} onPress={openCreate}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.createText}>New Task</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderItem = ({ item }) => {
    const statusObj = STATUSES.find(s => s.key === item.status);
    return (
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          {!!item.description && <Text style={styles.desc}>{item.description}</Text>}
          <View style={styles.metaRow}>
            <Badge text={statusObj?.label || item.status} />
            {item.assignee && <Badge text={`@${item.assignee.name}`} secondary />}
            {item.creator  && <Badge text={`by ${item.creator.name}`} dim />}
          </View>
        </View>

        <View style={styles.actions}>
          {canUpdate && (
            <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(item)}>
              <Ionicons name="create-outline" size={18} color="#fff" />
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
        <Text style={{ color: '#D1D5DB', marginTop: 6 }}>Loading tasks…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={it => String(it.id)}
        renderItem={renderItem}
        ListHeaderComponent={headerFilters}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        onEndReachedThreshold={0.3}
        onEndReached={onEndReached}
        ListFooterComponent={
          meta.current_page < meta.last_page ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : null
        }
        contentContainerStyle={{ padding: 12, paddingBottom: 20 }}
      />

      {/* Create/Edit Modal */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? 'Edit Task' : 'New Task'}</Text>

            <LabeledInput
              label="Title"
              value={f.title}
              onChangeText={(t) => setForm(prev => ({ ...(prev ?? DEFAULT_FORM), title: t }))}
              placeholder="Short, descriptive title"
            />
            <LabeledInput
              label="Description"
              value={f.description}
              onChangeText={(t) => setForm(prev => ({ ...(prev ?? DEFAULT_FORM), description: t }))}
              placeholder="Optional details"
              multiline
            />

            {/* Status quick picker */}
            <View style={{ marginTop: 10 }}>
              <Text style={styles.label}>Status</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {STATUSES.map(s => {
                  const active = f.status === s.key;
                  return (
                    <TouchableOpacity
                      key={s.key}
                      onPress={() => setForm(prev => ({ ...(prev ?? DEFAULT_FORM), status: s.key }))}
                      style={[styles.filterPill, active && styles.filterPillActive]}
                    >
                      <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Assignee (role=user only) */}
            <View style={{ marginTop: 10 }}>
              <Text style={styles.label}>Assignee</Text>

              {/* Quick actions */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <TouchableOpacity
                  onPress={() => setForm(prev => ({ ...(prev ?? DEFAULT_FORM), assigned_to: null }))}
                  style={[styles.filterPill, f.assigned_to === null && styles.filterPillActive]}
                >
                  <Text style={[styles.filterPillText, f.assigned_to === null && styles.filterPillTextActive]}>
                    Unassigned
                  </Text>
                </TouchableOpacity>

               
              </View>

              {/* Scrollable list of regular users */}
              <View style={[styles.input, { paddingVertical: 0, height: undefined }]}>
                <ScrollView style={{ maxHeight: 160 }}>
                  {Array.isArray(users) && users.length > 0 ? (
                    users.map((u) => {
                      const active = f.assigned_to === u.id;
                      return (
                        <TouchableOpacity
                          key={u.id}
                          onPress={() => setForm(prev => ({ ...(prev ?? DEFAULT_FORM), assigned_to: u.id }))}
                          style={{ paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                          <Text style={{ color: '#E5E7EB' }}>{u.name}</Text>
                          {active ? <Ionicons name="checkmark" size={18} color="#7FB2FF" /> : null}
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <Text style={{ color: '#98A2B3', paddingVertical: 8 }}>
                      {canSeeUsers ? 'No regular users found' : 'You can only assign to yourself'}
                    </Text>
                  )}
                </ScrollView>
              </View>
            </View>

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
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{editing ? 'Save' : 'Create'}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


function LabeledInput({ label, ...props }) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[
          styles.input,
          props.multiline && { height: 90, textAlignVertical: 'top' },
        ]}
        placeholderTextColor="#98A2B3"
      />
    </View>
  );
}

function Badge({ text, secondary, dim }) {
  return (
    <View
      style={[
        styles.badge,
        secondary && styles.badgeSecondary,
        dim && styles.badgeDim,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          secondary && styles.badgeSecondaryText,
          dim && styles.badgeTextDim,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

function FilterPill({ active, onPress, label, icon }) {
  return (
    <TouchableOpacity
      style={[styles.filterPill, active && styles.filterPillActive]}
      onPress={onPress}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={active ? '#fff' : '#9CA3AF'}
          style={{ marginRight: 6 }}
        />
      ) : null}
      <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
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

  filters: { gap: 10, marginBottom: 10 },
  searchWrap: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#1F2937',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, color: '#F3F4F6', paddingVertical: 0 },

  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#1F2937',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterPillActive: { backgroundColor: '#0B1C34', borderColor: ACCENT },
  filterPillText: { color: '#9CA3AF', fontSize: 12 },
  filterPillTextActive: { color: '#7FB2FF', fontWeight: '700' },

  row: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 10,
  },
  title: { color: '#E5E7EB', fontSize: 16, fontWeight: '700' },
  desc: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },

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
  badgeSecondary: { borderColor: '#20324a' },
  badgeSecondaryText: { color: '#7FB2FF' },
  badgeDim: { opacity: 0.8 },
  badgeTextDim: { color: '#A6B0BF' },

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
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },

  label: { color: '#98A2B3', fontSize: 12, marginBottom: 6 },

  btn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },

  createBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  createText: { color: '#fff', fontWeight: '700' },
});
