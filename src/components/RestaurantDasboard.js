import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image, Dimensions, Alert } from 'react-native';
import ToggleSwitch from 'toggle-switch-react-native'
import BottomMenu from './BottomMenu';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { decodeToken, userRole } from './LoginToken';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Chart from './Chart';
import ChartOptions from './ChartOptions';
import MenuManager from './MenuManager';
import BackgroundService from 'react-native-background-actions';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModalSpin from './ModalSpin';
import NetInfo from "@react-native-community/netinfo";

let globalsocket = null; 

export default function RestaurantDashboard() {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState({ name: '', email: '', role: '', image: '' });
  const [selectedOption, setSelectedOption] = useState("Today");
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState('');



  useEffect(() => {
    const fetchData = async () => {
      // Check internet connectivity
      const netInfoState = await NetInfo.fetch();
      if (!netInfoState.isConnected) {
        // If no internet connection, remove background task state and return
        await BackgroundService.stop();
        await AsyncStorage.removeItem('backgroundTaskState');
        return;
      }

      // If there's internet connection, fetch background task state
      const backgroundTaskState = await AsyncStorage.getItem('backgroundTaskState');
      setIsSwitchOn(backgroundTaskState === 'true');
    };

    fetchData();
  }, []);


  const startBackgroundService = async () => {
    const options = {
      taskName: 'Example',
      taskTitle: 'xferyfood',
      taskDesc: 'The restaurant is now online and actively accepting orders',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#ff00ff',
      linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
    };

    await BackgroundService.start(veryIntensiveTask, options);
    await BackgroundService.updateNotification({ taskDesc: 'The restaurant is now online and actively accepting orders' });
  };

  const stopBackgroundService = async () => {
    await BackgroundService.stop();
    if (globalsocket) {
      console.log(globalsocket)
      globalsocket.disconnect();
      // setSocket(null); // Update socket state to null
    }
  };

  const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));
  const veryIntensiveTask = async () => {
    setLoading(true)
    const checkInternetAndDisconnect = async () => {
      const netInfoState = await NetInfo.fetch();
      if (!netInfoState.isConnected) {
        // If no internet connection, stop the background service and return
        await AsyncStorage.removeItem('backgroundTaskState');
        console.log("remove")
        await stopBackgroundService();
        setIsSwitchOn(false)
        return;
      }
    };

    const socket = io('http://192.168.150.86:5000/');
    socket.on('connect', async () => {
      console.log('Connected to server');
      // Send initial data upon connecting
      const decodedToken = await decodeToken();
      const restaurantEmail = await decodedToken.email;
      socket.emit('connectData', restaurantEmail);
      cacheRestaurant();
    });
    globalsocket=socket;
    // send restaurant data to server for active cache
    const cacheRestaurant = async () => {

      try {
        const decodedToken = await decodeToken();
        if (decodedToken) {
          const userEmail = await decodedToken.email;
          const responseOfAccount = await fetch(`http://192.168.150.86:5000/getAccount?email=${userEmail}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (responseOfAccount.ok) {
            const accountData = await responseOfAccount.json();
            const email = await accountData.email;
            console.log(email)

            const response = await fetch('http://192.168.150.86:5000/cache-restaurant-status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email }),
            });

            if (response.ok) {
              console.log('Restaurant data sent successfully.');
              // Handle response if needed
              // Save the background task state to AsyncStorage
              await AsyncStorage.setItem('backgroundTaskState', String(true));
              setLoading(false)
              setResponseText("Restaurant Online now")
              setTimeout(() => {
                setLoading(false);
                setResponseText('');
              }, 2000);

            } else {
              await stopBackgroundService();
              // Handle error appropriately
              setLoading(false)
              setIsSwitchOn(false);
            }
          }
        }



      } catch (error) {
        Alert.alert(error.message)
        await stopBackgroundService();
        // Handle error appropriately
        console.log(error)
        console.warn(error)
        setLoading(false)
        setIsSwitchOn(false);
      }
    };


    while (BackgroundService.isRunning()) {
      await checkInternetAndDisconnect();
      await sleep(3000); // Wait for 10 seconds
    }
  };


  const handleToggle = async (isOn) => {
    // Check internet connectivity
    const netInfoState = await NetInfo.fetch();
    if (!netInfoState.isConnected) {
      await AsyncStorage.removeItem('backgroundTaskState');
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
        await AsyncStorage.removeItem('backgroundTaskState');
      }
    } catch (error) {
      console.error('Error handling toggle:', error);
      setIsSwitchOn(false);
    }
  };
  // Sample data for each time period
  const todayData = {
    labels: ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"],
    datasets: [{ data: [90000, 0, 0, 367770, 0, 0] }]
  };

  const yesterdayData = {
    labels: ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"],
    datasets: [{ data: [60, 900, 500, 700, 1200, 40] }]
  };

  const thisWeekData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{ data: [100, 150, 120, 200, 180, 220, 210] }]
  };

  const thisMonthData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [{ data: [300, 350, 400, 450] }]
  };

  const handleSelectOption = (option) => {
    setSelectedOption(option);
  };

  useEffect(() => {
    const fetchData = async () => {
      const decodedToken = await decodeToken();
      if (decodedToken) {
        console.log(decodedToken.picture)
        // Calling userRole function to get the role value
        const role = await userRole();
        setUserInfo({ name: decodedToken.name, email: decodedToken.email, role: role, image: decodedToken.picture });
      }
    };

    fetchData();
  }, []);

  const locationExistendChecker = async () => {
    try {
      const decodedToken = await decodeToken();
      if (decodedToken) {
        const userEmail = decodedToken.email;

        // Proceed with API call using userEmail
        const response = await fetch(`http://192.168.150.86:5000/restaurantProfileData?email=${userEmail}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add any other headers if needed
          },
          // Add any other options like body if needed
        });

        const data = await response.json();
        // Process the data received from the API
        if (data.location === "added" && data.phoneNumber !== "not set") {
          navigation.navigate("UploadMenu")
        } else {
          Alert.alert("You much upload your phone number and location")
        }
        console.log(data);
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle errors if necessary
    }
  };

  return (
    <View style={styles.parentContainer}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Dashboard</Text>
        <ToggleSwitch
          isOn={isSwitchOn}
          onColor="green"
          offColor="gray"
          label={isSwitchOn ? "online" : "offline"}
          labelStyle={{ color: "black", fontWeight: "900" }}
          size="medium"
          onToggle={handleToggle}
        />
      </View>
      <View>
        <ChartOptions onSelectOption={handleSelectOption} />
        {selectedOption === "Today" && <Chart data={todayData} />}
        {selectedOption === "Yesterday" && <Chart data={yesterdayData} />}
        {selectedOption === "This Week" && <Chart data={thisWeekData} />}
        {selectedOption === "This Month" && <Chart data={thisMonthData} />}
      </View>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <AntDesign name="shoppingcart" size={24} color="black" />
          <Text style={styles.menuText}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => { navigation.navigate("MenuManager") }}>
          <AntDesign name="menuunfold" size={24} color="black" />
          <Text style={styles.menuText}>Menu Manager</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => { locationExistendChecker() }}>
          <AntDesign name="upload" size={24} color="black" />
          <Text style={styles.menuText}>Upload Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => { navigation.navigate("EditRestaurant") }}>
          <AntDesign name="edit" size={24} color="black" />
          <Text style={styles.menuText}>Profile Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="payment" size={24} color="black" />
          <Text style={styles.menuText}>Billing</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <AntDesign name="question" size={24} color="black" />
          <Text style={styles.menuText}>Get Help</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <AntDesign name="logout" size={24} color="black" />
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <BottomMenu />
      <ModalSpin loading={loading} loadingText={"Activating Restaurant"} responseText={responseText} />
    </View>
  );
}

const styles = StyleSheet.create({
  parentContainer: {
    flex: 1
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10, // Increase padding to accommodate the shadow
    backgroundColor: 'white', // Ensure your navbar has a background color
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
    shadowOpacity: 0.25, // Shadow opacity for iOS
    shadowRadius: 3.84, // Shadow radius for iOS
    elevation: 5, // Elevation for Android
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButtonContainer: {
    padding: 10,
  },
  image: {
    width: 100,
    borderRadius: "100%",
    height: 150,
    resizeMode: 'contain', // Adjust as per your requirement
  },
  menuContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  menuContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginVertical: 20,
    marginLeft: 20, // Left padding
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  menuText: {
    marginLeft: 10, // Space between icon and text
    color: 'black'
  },
});