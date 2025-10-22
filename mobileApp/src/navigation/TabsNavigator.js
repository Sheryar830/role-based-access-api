import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../context/AuthContext';

import HomeStack from './HomeStack';
import ProfileScreen from '../screens/ProfileScreen';
import UsersListScreen from '../screens/UsersListScreen';
import TasksScreen from '../screens/TasksScreen';

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
  const { user } = useContext(AuthContext);
  const role = user?.roleName; 

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false, 
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: { height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#999',
        tabBarIcon: ({ focused, color, size }) => {
          let icon = 'home-outline';
          if (route.name === 'Home') icon = focused ? 'home' : 'home-outline';
          else if (route.name === 'Users')
            icon = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Tasks')
            icon = focused ? 'list' : 'list-outline';
          else if (route.name === 'Profile')
            icon = focused ? 'person' : 'person-outline';
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      {/* Home tab is a stack (HomeMain + Roles). */}
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ unmountOnBlur: false }}
      />

      {role === 'super-admin' && (
        <Tab.Screen
          name="Users"
          component={UsersListScreen}
          options={{ unmountOnBlur: false }}
        />
      )}

      {(role === 'super-admin' || role === 'manager' || role === 'user') && (
        <Tab.Screen
          name="Tasks"
          component={TasksScreen}
          options={{ unmountOnBlur: false }}
        />
      )}

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ unmountOnBlur: false }}
      />
    </Tab.Navigator>
  );
}
