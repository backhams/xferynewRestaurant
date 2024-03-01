import React, { useState,useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { decodeToken, userRole } from './LoginToken';
import BottomMenu from './BottomMenu';
import getCurrentLocation, { clearLiveLocation } from './Location';

const MenuPage = () => {
  const [searchVisible, setSearchVisible] = useState(false);
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState({ name: '', email: '', role: '' });
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useFocusEffect(() => {
    const fetchData = async () => {
      try {
        // Call getCurrentLocation to get the current latitude and longitude
        const { latitude, longitude } = await getCurrentLocation();

        // Now you can use latitude and longitude here
        setLatitude(latitude)
        setLongitude(longitude)
        console.log('Latitude:', latitude);
        console.log('Longitude:', longitude);

        // Do something with latitude and longitude here...
      } catch (error) {
        console.error('Error getting current location:', error);
      }
    };

    fetchData(); // Call the fetchData function when the component gains focus

    return () => {
      // Cleanup function if needed
    };
  });

  useEffect(() => {
    const fetchData = async () => {
      const decodedToken = await decodeToken();
      if (decodedToken) {
        // Calling userRole function to get the role value
        const role = await userRole();
        setUserInfo({ name: decodedToken.name, email: decodedToken.email, role: role });
      }
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Navbar */}

      {/* Bottom Navigation Buttons */}
      <BottomMenu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MenuPage;
