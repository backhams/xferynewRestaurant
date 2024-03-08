import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import getCurrentLocation from './Location';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function CompleteOrder({ navigation }) {
  // Define a function to handle the back button press
  const handleBackButton = () => {
    navigation.goBack(); // Go back to the previous screen
  };

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { latitude, longitude } = await getCurrentLocation();
        setLatitude(latitude);
        setLongitude(longitude);
        console.log('Latitude:', latitude);
        console.log('Longitude:', longitude);
      } catch (error) {
        console.error('Error getting current location:', error);
      }
    };

    fetchData();

    return () => {
      // Cleanup function if needed
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Navbar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', padding: 10 }}>
        {/* Back Button */}
        <TouchableOpacity onPress={handleBackButton}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 18 }}>Complete Order</Text>
        <View style={{ flex: 1 }} />
      </View>

      {/* MapView */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        mapType="hybrid"
      >
        <Marker
          coordinate={{ latitude: latitude, longitude: longitude }}
          title="You"
          description="Your current location"
          pinColor="blue"
        />
        <Circle
          center={{
            latitude,
            longitude,
          }}
          radius={100}
          strokeWidth={1}
          strokeColor="rgba(0, 0, 255, 0.3)"
          fillColor="rgba(0, 0, 255, 0.1)"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: windowWidth,
    height: windowHeight * 0.4,
  }
});
