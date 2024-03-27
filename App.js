import React, { useState, useEffect } from 'react';
import { View,Alert } from 'react-native';
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
import MenuManager from './src/components/MenuManager';
import MenuDetails from './src/components/MenuDetails';
import FullMenu from './src/components/FullMenu';
import CompleteOrder from './src/components/CompleteOrder';
import messaging from '@react-native-firebase/messaging';
import  PushNotification from 'react-native-push-notification';
import {requestUserPermission} from './src/components/NotificationService'
import CustomerOrders from './src/components/CustomerOrders'
import CustomerOrderList from './src/components/CustomerOrderList';
import RestaurantOrderList from './src/components/RestaurantOrderList';
import RestaurantOrders from './src/components/RestaurantOrders';
import SearchDelivery from './src/components/SearchDelivery';
import DeliveryOrderList from './src/components/DeliveryOrderList';
import DeliveryOrders from './src/components/DeliveryOrders';
import DeliveryProfile from './src/components/DeliveryProfile'
import DeliverySideMenu from './src/components/DeliverySideMenu';

export default function App() {
  const Stack = createNativeStackNavigator();
  const [initialRoute, setInitialRoute] = useState('SignUpAs');
  useEffect(() => {

    const fetchData = async () => {
      await requestLocationPermission(); // Request location permission
      await requestUserPermission();
    };

    fetchData();
  }, []);

  useEffect(() => {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));

    // Extract title and body from remoteMessage
    const { title, body } = remoteMessage.notification;
    // console.log(title)

    PushNotification.localNotification({
      channelId: "your_channel_id",
      title: title,
      message: body,
      soundName: "default",
      vibrate: true,
      playSound: true
    });
  });

  return unsubscribe;
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
      <Stack.Screen name="MenuManager" component={MenuManager} />
      <Stack.Screen name="MenuDetails" component={MenuDetails} />
      <Stack.Screen name="FullMenu" component={FullMenu} />
      <Stack.Screen name="CompleteOrder" component={CompleteOrder} />
      <Stack.Screen name="CustomerOrders" component={CustomerOrders} />
      <Stack.Screen name="CustomerOrderList" component={CustomerOrderList} />
      <Stack.Screen name="RestaurantOrderList" component={RestaurantOrderList} />
      <Stack.Screen name="RestaurantOrders" component={RestaurantOrders} />
      <Stack.Screen name="SearchDelivery" component={SearchDelivery} />
      <Stack.Screen name="DeliveryOrderList" component={DeliveryOrderList} />
      <Stack.Screen name="DeliveryOrders" component={DeliveryOrders} />
      <Stack.Screen name="DeliveryProfile" component={DeliveryProfile} />
      <Stack.Screen name="DeliverySideMenu" component={DeliverySideMenu} />
    </Stack.Navigator>
  </NavigationContainer>
  );
}