// App.jsx
import React, { useContext, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AuthProvider, { AuthContext } from './src/context/AuthContext';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import ChangePasswordScreen from './src/screens/auth/ChangePasswordScreen';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import LocationGate from './src/components/LocationGate';

const Stack = createNativeStackNavigator();

const ACCENT = '#0B63F6';
function RootNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={user ? 'Main' : 'Login'}
    >
      <Stack.Screen name="Main" component={DrawerNavigator} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [locationReady, setLocationReady] = useState(false);

  if (!locationReady) {
    return <LocationGate onReady={() => setLocationReady(true)} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar backgroundColor="#0B63F6" barStyle="light-content" />
        <SafeAreaView style={{ backgroundColor: ACCENT }} />
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
