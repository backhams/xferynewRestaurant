import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUpAs from './src/components/SignUpAs';
import Login from './src/components/Login';
import Menu from './src/components/Menu';
import RestaurantDashboard from "./src/components/RestaurantDasboard";
import DeliveryDashboard from "./src/components/DeliveryDasboard";
import CustomerProfile from "./src/components/CustomerProfile";
import requestLocationPermission from './src/components/PermissionLocation';
import EditRestaurant from './src/components/EditRestaurant';
import UploadMenu from './src/components/UploadMenu';

export default function App() {
  const Stack = createNativeStackNavigator();
  const [initialRoute, setInitialRoute] = useState('SignUpAs');
  useEffect(() => {

    const fetchData = async () => {
      await requestLocationPermission(); // Request location permission
    };

    fetchData();
  }, []);


  return (
    <NavigationContainer>
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SignUpAs" component={SignUpAs} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Menu" component={Menu} />
      <Stack.Screen name="RestaurantDashboard" component={RestaurantDashboard} />
      <Stack.Screen name="DeliveryDashboard" component={DeliveryDashboard} />
      <Stack.Screen name="CustomerProfile" component={CustomerProfile} />
      <Stack.Screen name="EditRestaurant" component={EditRestaurant} />
      <Stack.Screen name="UploadMenu" component={UploadMenu} />
    </Stack.Navigator>
  </NavigationContainer>
  );
}