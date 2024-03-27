import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import ToggleSwitch from 'toggle-switch-react-native';
import Chart from './Chart';
import { getCurrentLocation, liveLocation, clearLiveLocation } from './Location';
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import AntDesign from "react-native-vector-icons/AntDesign"
import BackgroundService from 'react-native-background-actions';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModalSpin from './ModalSpin';
import NetInfo from "@react-native-community/netinfo";
import { deviceToken } from './NotificationService';
import { decodeToken, userRole } from './LoginToken';
import {API_HOST} from '@env';

let globalsocket = null;
let globalWatchId = null

export default function DeliveryDashboard({navigation}) {
  const apiUrlBack = API_HOST;
  // console.log(API_HOST)
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [selectedNavItem, setSelectedNavItem] = useState('Daily');
  const [selectedOption, setSelectedOption] = useState("Today");
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      // Check internet connectivity
      const netInfoState = await NetInfo.fetch();
      if (!netInfoState.isConnected) {
        // If no internet connection, remove background task state and return
        await BackgroundService.stop();
        await AsyncStorage.removeItem('backgroundTaskStateDelivery');
        return;
      }

      // If there's internet connection, fetch background task state
      const backgroundTaskState = await AsyncStorage.getItem('backgroundTaskStateDelivery');
      setIsSwitchOn(backgroundTaskState === 'true');
    };

    fetchData();
  }, []);


  const startBackgroundService = async () => {
    const options = {
      taskName: 'deliveryOnline',
      taskTitle: 'xferyfood',
      taskDesc: 'You are now online and ready to receive orders',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#FE5301',
      linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
    };

    await BackgroundService.start(veryIntensiveTask, options);
    await BackgroundService.updateNotification({ taskDesc: 'You are now online and ready to receive orders' });
  };
  const stopBackgroundService = async () => {
    await BackgroundService.stop();
    if (globalsocket) {
      globalsocket.disconnect();
    }
    if (globalWatchId) {
      clearLiveLocation(globalWatchId); // Clear the live location watch
      globalWatchId = null; // Reset the global watch ID
    }
  };
  

  const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));
  const veryIntensiveTask = async () => {
    setLoading(true);
    try {
      const netInfoState = await NetInfo.fetch();
      if (!netInfoState.isConnected) {
        await AsyncStorage.removeItem('backgroundTaskStateDelivery');
        await stopBackgroundService();
        setIsSwitchOn(false);
        return;
      }
  
      if (!deviceToken) {
        Alert.alert("Token not found",
          "Something went wrong while creating token. Please reopen the app and try again.")
        await stopBackgroundService();
        setIsSwitchOn(false);
        setLoading(false);
        return;
      }
  
      const decodedToken = await decodeToken();
      if (!decodedToken || !decodedToken.email) {
        Alert.alert("Email not found",
          "An error occurred while retrieving your email. Please try again later.");
        await stopBackgroundService();
        setIsSwitchOn(false);
        setLoading(false);
        return;
      }
      
      const deliveryEmail = decodedToken.email;
      const socket = io(`${process.env.API_URL}`);
      globalsocket = socket;
  
      socket.on('connect', async () => {
        // Get initial location
        socket.on("deliveryAuthChecker",async(data)=>{
          console.log(data);
          // Stop background task
          await stopBackgroundService();
         await socket.disconnect();
          await AsyncStorage.removeItem('backgroundTaskStateDelivery');
          setIsSwitchOn(false);
  
          // Show alert with error data
          Alert.alert("Error", data.error, [
            {
              text: "OK",
              onPress: async () => {
                // navigation.navigate("Setting")
                console.log("ok")
              }
            }
          ]);
        });
        const { latitude: currentLatitude, longitude: currentLongitude } = await getCurrentLocation();
        globalsocket.emit("deliveryPartnerResponse", { latitude: currentLatitude, longitude: currentLongitude, deviceToken, email: deliveryEmail });

        setResponseText("Online now");
        console.log('Connected to server');
  
        AsyncStorage.setItem('backgroundTaskStateDelivery', String(true));
        setLoading(false);
        setResponseText("Online now");
        setTimeout(() => {
          setLoading(false);
          setResponseText('');
        }, 2000);
      });
  
      // Start continuous location tracking and emit updates
      const watchId = await liveLocation(({ latitude, longitude }) => {
        globalsocket.emit("deliveryPartnerResponse", { latitude, longitude, deviceToken, email: deliveryEmail });
      });
      
      // Store watchId to clear it later
      globalWatchId = watchId;
  
      while (BackgroundService.isRunning()) {
        const netInfoState = await NetInfo.fetch();
        if (!netInfoState.isConnected) {
          await AsyncStorage.removeItem('backgroundTaskStateDelivery');
          await stopBackgroundService();
          setIsSwitchOn(false);
          return;
        }
        await sleep(3000);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      Alert.alert("Error", "An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  


  // Function to calculate distance between two sets of latitude and longitude coordinates using Haversine formula
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 1000); // Convert to meters and round to the nearest whole number
  }

  // Function to convert degrees to radians
  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }


  const handleToggle = async (isOn) => {
    // Check internet connectivity
    const netInfoState = await NetInfo.fetch();
    if (!netInfoState.isConnected) {
      await AsyncStorage.removeItem('backgroundTaskStateDelivery');
      // If no internet connection, set the switch off and return
      Alert.alert("No Internet Connection.")
      setIsSwitchOn(false);
      return;
    }
    setIsSwitchOn(isOn);
    try {
      if (isOn) {
        await startBackgroundService();
      } else {
        await stopBackgroundService();
        await AsyncStorage.removeItem('backgroundTaskStateDelivery');
      }
    } catch (error) {
      console.error('Error handling toggle:', error);
      setIsSwitchOn(false);
    }
  };

  const handleNavItemPress = (item) => {
    setSelectedNavItem(item);
    switch (item) {
      case 'Daily':
        setSelectedOption('Today');
        break;
      case 'Weekly':
        setSelectedOption('This Week');
        break;
      case 'Monthly':
        setSelectedOption('This Month');
        break;
      default:
        setSelectedOption('Today');
    }
  };

  const todayData = {
    labels: ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"],
    datasets: [{ data: [90000, 0, 0, 367770, 0, 0] }]
  };

  const thisWeekData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{ data: [100, 150, 120, 200, 180, 220, 210] }]
  };

  const thisMonthData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [{ data: [300, 350, 400, 450] }]
  };

  const orderStatisticsWidth = Dimensions.get('window').width - 20;
  const insideViewWidth = (orderStatisticsWidth - 20) / 2;

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.navbarMenu}>
          <TouchableOpacity style={styles.menuButton}>
            <Icon name="bars" size={24} color="black" />
          </TouchableOpacity>
          <ToggleSwitch
            isOn={isSwitchOn}
            onColor="green"
            offColor="gray"
            label={isSwitchOn ? 'online' : 'offline'}
            labelStyle={{ color: 'black', fontWeight: '900' }}
            size="medium"
            onToggle={handleToggle}
          />
        </View>

        <View style={styles.navbarTitle}>
          <View style={styles.navItems}>
            <TouchableOpacity
              style={[
                styles.navItem,
                selectedNavItem === 'Daily' && styles.selectedNavItem,
              ]}
              onPress={() => handleNavItemPress('Daily')}>
              <Text style={styles.navText}>Daily</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.navItem,
                selectedNavItem === 'Weekly' && styles.selectedNavItem,
              ]}
              onPress={() => handleNavItemPress('Weekly')}>
              <Text style={styles.navText}>Weekly</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.navItem,
                selectedNavItem === 'Monthly' && styles.selectedNavItem,
              ]}
              onPress={() => handleNavItemPress('Monthly')}>
              <Text style={styles.navText}>Monthly</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={{ marginTop: 10 }}>
        {selectedOption === "Today" && <Chart data={todayData} />}
        {selectedOption === "This Week" && <Chart data={thisWeekData} />}
        {selectedOption === "This Month" && <Chart data={thisMonthData} />}
      </View>
      {/* order Statistics */}
      <View style={styles.orderStatisticsContainer}>
        <Text style={{ marginLeft: 10, marginBottom: 20, fontSize: 16, fontWeight: 'bold', color: 'black' }}>Order Statistics</Text>
        <View style={styles.orderStatisticsView}>
          <View style={styles.orderStatistics}>
            <View style={[styles.orderStatisticsInsideView, { width: insideViewWidth }]}>
              <Text style={{ marginBottom: 10, color: 'black', fontWeight: 'bold' }}>7</Text>
              <Text style={{ fontSize: 13, color: '#666666' }}>New Orders</Text>
            </View>
            <View style={[styles.orderStatisticsInsideViewTwo, { width: insideViewWidth }]}>
              <Text style={{ marginBottom: 10, color: 'black', fontWeight: 'bold' }}>17</Text>
              <Text style={{ fontSize: 13, color: '#666666' }}>Total Orders</Text>
            </View>
          </View>
        </View>
      </View>
      {/* earning Statistics */}
      <View style={styles.orderStatisticsContainer}>
        <View style={styles.orderStatisticsView}>
          <View style={styles.earningStatistics}>
            <View style={styles.earningInsideView}>
              <Text style={styles.earningTitle}>Earning for this week</Text>
              <Text style={styles.earningAmount}>₹ 7000</Text>
            </View>
            <View style={styles.earningInsideView}>
              <Text style={styles.earningTitle}>Earning for this month</Text>
              <Text style={styles.earningAmount}>₹ 18000</Text>
            </View>
          </View>
        </View>
      </View>
      {/* <View style={{ marginTop: 10, position: "absolute", bottom: 30 }}> */}
        <TouchableOpacity style={styles.settingView} onPress={() => { navigation.navigate("DeliveryOrderList") }}>
          <AntDesign name="shoppingcart" size={24} color="black" />
          <Text style={styles.settingTitle}> Manage Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingView}>
          <MaterialIcons name="health-and-safety" size={24} color="black" />
          <Text style={styles.settingTitle}>Account Health :</Text>
          <Text style={{ color: 'green', marginLeft: 10 }}>Good</Text>
        </TouchableOpacity>
      {/* </View> */}
      <ModalSpin loading={loading} loadingText={"Activating"} responseText={responseText} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },
  navbarMenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  navbarTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  menuButton: {
    marginRight: 10,
  },
  navItems: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navItem: {
    paddingHorizontal: 10,
  },
  navText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    paddingBottom: 3,
  },
  selectedNavItem: {
    borderBottomWidth: 2,
    borderBottomColor: 'red',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderStatisticsContainer: {
    marginTop: 30
  },
  orderStatisticsView: {
    alignItems: "center",
  },
  orderStatistics: {
    borderWidth: 0.3,
    borderRadius: 5,
    borderColor: "black",
    width: Dimensions.get('window').width - 20,
    height: Dimensions.get('window').height - 700,
    flexDirection: "row",
  },
  orderStatisticsInsideView: {
    flex: 1,
    height: Dimensions.get('window').height - 700,
    borderRightColor: 'black',
    borderRightWidth: 0.3,
    justifyContent: "center",
    alignItems: "center"
  },
  orderStatisticsInsideViewTwo: {
    flex: 1,
    height: Dimensions.get('window').height - 700,
    justifyContent: "center",
    alignItems: "center"
  },
  earningStatistics: {
    borderWidth: 0.3,
    borderRadius: 5,
    borderColor: "black",
    width: Dimensions.get('window').width - 20,
    height: Dimensions.get('window').height - 720,
  },
  earningInsideView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  earningTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "black",
    marginVertical: 10
  },
  earningAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: "black",
    marginVertical: 10
  },
  settingView: {
    flexDirection: "row",
    marginLeft: 10,
    marginVertical: 10
  },
  settingTitle: {
    marginLeft: 15
  }
});
