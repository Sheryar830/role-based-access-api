import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../context/AuthContext';
import TabsNavigator from './TabsNavigator';

const Drawer = createDrawerNavigator();
const Noop = () => null;

const AVATAR_URL =
  'https://media.istockphoto.com/id/2171382633/vector/user-profile-icon-anonymous-person-symbol-blank-avatar-graphic-vector-illustration.jpg?s=1024x1024&w=is&k=20&c=qcfUz-2TZEaFotFckzmyFkQnqx7BWOeAl6fs2VYnmrc=';

function CustomDrawerContent(props) {
  const { user } = useContext(AuthContext);
  const name = user?.name || 'Guest User';
  const email = user?.email || '—';

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ paddingTop: 0 }}
    >
      <View style={styles.profileHeader}>
        <Image source={{ uri: AVATAR_URL }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.name}>
            {name}
          </Text>
          <Text numberOfLines={1} style={styles.email}>
            {email}
          </Text>
        </View>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

function getHomeTabsHeaderTitle(route) {
  const tabName = getFocusedRouteNameFromRoute(route) ?? 'Home';

  if (tabName === 'Users') return 'Users';
  if (tabName === 'Tasks') return 'Tasks';
  if (tabName === 'Profile') return 'Profile';

  if (tabName === 'Home') {
    const fromParams =
      route?.params?.screen || route?.params?.params?.screen || null;
    if (fromParams === 'Roles') return 'Roles & Permissions';

    // b) After mount, rely on nested state
    const tabState = route?.state;
    if (tabState?.routes && typeof tabState.index === 'number') {
      const currentTabRoute = tabState.routes[tabState.index];

      // If current tab isn't Home (rare race), fall back
      if (currentTabRoute?.name !== 'Home') return 'Home';

      const homeState = currentTabRoute?.state;
      if (homeState?.routes && typeof homeState.index === 'number') {
        const inner = homeState.routes[homeState.index];
        const innerName = inner?.name ?? 'HomeMain';
        if (innerName === 'Roles') return 'Roles & Permissions';
        return 'Home';
      }
    }

    return 'Home';
  }

  return 'Home';
}

export default function DrawerNavigator() {
  const { user } = useContext(AuthContext);
  const role = user?.roleName;

  return (
    <Drawer.Navigator
      initialRouteName="HomeTabs"
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#1e90ff',
        drawerInactiveTintColor: '#6b7280',
        drawerLabelStyle: { fontSize: 15 },
        drawerItemStyle: {
          borderRadius: 14,
          marginHorizontal: 10,
          marginVertical: 4,
        },
      }}
      drawerContent={props => <CustomDrawerContent {...props} />}
    >
      {/* Main Tabs container */}
      <Drawer.Screen
        name="HomeTabs"
        component={TabsNavigator}
        options={({ route }) => ({
          title: getHomeTabsHeaderTitle(route), // ✅ dynamic header title
          drawerLabel: 'Home', // ✅ keep drawer label fixed to "Home"
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        })}
        // 👇 ensures the title updates even during fast nested transitions
        listeners={({ navigation, route }) => ({
          state: () => {
            navigation.setOptions({ title: getHomeTabsHeaderTitle(route) });
          },
          drawerItemPress: e => {
            e.preventDefault();
            navigation.navigate('HomeTabs', {
              screen: 'Home',
              params: { screen: 'HomeMain' },
            });
          },
        })}
      />

      {/* Admin-only Users */}
      {role === 'super-admin' && (
        <Drawer.Screen
          name="UsersLink"
          component={Noop}
          options={{
            title: 'Users',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
          listeners={({ navigation }) => ({
            drawerItemPress: e => {
              e.preventDefault();
              navigation.navigate('HomeTabs', { screen: 'Users' });
            },
          })}
        />
      )}

      {/* Roles & Permissions (inside HomeStack) */}
      {role === 'super-admin' && (
        <Drawer.Screen
          name="RolesLink"
          component={Noop}
          options={{
            title: 'Roles & Permissions',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="shield-outline" size={size} color={color} />
            ),
          }}
          listeners={({ navigation }) => ({
            drawerItemPress: e => {
              e.preventDefault();
              navigation.navigate('HomeTabs', {
                screen: 'Home',
                params: { screen: 'Roles' }, // Stack screen inside HomeStack
              });
            },
          })}
        />
      )}

      {/* Tasks for everyone */}
      {(role === 'super-admin' || role === 'manager' || role === 'user') && (
        <Drawer.Screen
          name="TasksLink"
          component={Noop}
          options={{
            title: 'Tasks',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
          listeners={({ navigation }) => ({
            drawerItemPress: e => {
              e.preventDefault();
              navigation.navigate('HomeTabs', { screen: 'Tasks' });
            },
          })}
        />
      )}

      {/* Profile */}
      <Drawer.Screen
        name="ProfileLink"
        component={Noop}
        options={{
          title: 'Profile',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          drawerItemPress: e => {
            e.preventDefault();
            navigation.navigate('HomeTabs', { screen: 'Profile' });
          },
        })}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 10 },
  name: { fontSize: 16, fontWeight: '700', color: '#111827' },
  email: { marginTop: 2, fontSize: 12, color: '#6b7280' },
});
