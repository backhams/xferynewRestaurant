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

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };

  return (
    <View style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        {/* Left side of Navbar */}
        <TouchableOpacity onPress={toggleSearch}>
          <FontAwesome name="search" size={25} color="black" />
        </TouchableOpacity>
        {/* Center (Empty for now) */}
        <View style={{ flex: 1 }} />
        {/* Right side of Navbar (Bottom Navigation Buttons) */}
        <View style={styles.navbarRight}>
          <TouchableOpacity style={styles.navbarButton}>
            <FontAwesome name="home" size={25} color="black" />
            <Text style={styles.navbarButtonText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navbarButton}>
            <FontAwesome name="user" size={25} color="black" />
            <Text style={styles.navbarButtonText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navbarButton}>
            <FontAwesome name="bell" size={25} color="black" />
            <Text style={styles.navbarButtonText}>Notification</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input (conditionally rendered) */}
      {searchVisible && (
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <TextInput
            style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10 }}
            placeholder="Search..."
          />
        </View>
      )}

      {/* Display user name and email */}
      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfoText}>Name: {userInfo.name}</Text>
        <Text style={styles.userInfoText}>Email: {userInfo.email}</Text>
        <Text style={styles.userInfoText}>role: {userInfo.role}</Text>
      </View>

      {/* Bottom Navigation Buttons */}
      <BottomMenu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  navbarRight: {
    flexDirection: 'row',
  },
  navbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  navbarButtonText: {
    marginLeft: 5,
  },
  userInfoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  userInfoText: {
    fontSize: 16,
    marginBottom: 5,
  }
});

export default MenuPage;
