// Import necessary modules
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Image, Alert, Modal, TextInput } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import {getCurrentLocation} from './Location';
import EvilIcons from "react-native-vector-icons/EvilIcons"
import { calculateDistance } from './DistanceCalculator';
import { decodeToken, userRole } from './LoginToken';
import { deviceToken } from './NotificationService';
import ModalSpin from './ModalSpin';
import Blinking from './BlinkingDot/Blinking';
import {API_URL} from '@env';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function CompleteOrder({ navigation, route }) {
  const apiUrlBack = API_URL;
  // console.log(API_HOST)
  
  const { item, data,quantity } = route.params;
  const handleBackButton = () => {
    navigation.goBack();
  };

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderCreateLoader, setOrderCreateLoader] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [processingFees, setProcessingFees] = useState();
  const [deliveryFees, setDeliveryFees] = useState();

  const [modalVisible, setModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
  const [name, setName] = useState('');
  const [isNameValid, setIsNameValid] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { latitude, longitude, accuracy } = await getCurrentLocation();
        setLatitude(latitude);
        setLongitude(longitude);
        setAccuracy(accuracy);
        
        // Fetch data from backend API endpoint using GET method
        const response = await fetch(`${process.env.API_URL}feesCalculator?price=${item.price}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json' // Adjust the content type as needed
            // You can add more headers if required
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setProcessingFees(data.processingFees)
          setDeliveryFees(data.deliveryFees)
          setLoading(false);

        } else{
          setLoading(false);  
          throw new Error('Failed to fetch data from backend'); 
        }
      } catch (error) {
        console.log('Error getting current location or fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      // Cleanup function if needed
    };
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    // Calculate distance between user's location and item's location
    const distanceResult = calculateDistance(latitude, longitude, item.latitude, item.longitude);
    setDistance(distanceResult);
    return () => {
      // Cleanup function if needed
    };
  }, [latitude, longitude]);

  const handleMapLongPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log('New Latitude:', latitude);
    console.log('New Longitude:', longitude);
    setLatitude(latitude);
    setLongitude(longitude);
    setAccuracy(20);
  };

  const completeOrderButton = async () => {
    if (accuracy > 40) {
      Alert.alert(
        "Accuracy Low",
        `Accuracy is ${accuracy} meters. Please select your address from the map manually.`
      );
    } else {
      setModalVisible(true)
    }
  };

  const handleNameChange = (name) => {
    setName(name);
    if (name.trim() !== '') {
      setIsNameValid(true);
    } else {
      setIsNameValid(false); 
    }
  };

  const handlePhoneNumberChange = (number) => {
    setPhoneNumber(number);
    if (number.length < 10) {
      setIsPhoneNumberValid(false);
    } else {
      setIsPhoneNumberValid(true);
    }
  };
  const location = {
    latitude,
    longitude
  };

  const handleContinue = async () => {
    try {
      setOrderCreateLoader(true)
      const decodedToken = await decodeToken();
      const userEmail = decodedToken.email;
      const apiUrl = `${process.env.API_URL}placeOrder`;
      const requestBody = {
        menu: item, 
        restaurantToken: data,
        customerCoordinates: location,
        phoneNumber,
        customerEmail: userEmail,
        customerName:name,
        customerToken:deviceToken,
        quantity,
        processingFees,
        deliveryFees,
        quantity
      };

      if (userEmail || deviceToken) {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log('Response from backend:', responseData);
          setResponseText("Order Placed")
          setModalVisible(false);
          setTimeout(()=>{
            navigation.replace("CustomerOrders",{orderId:responseData})
          },3000)
        } else {
          setOrderCreateLoader(false)
          throw new Error('Failed to complete order');
        }

      } else {
        setOrderCreateLoader(false)
        console.log("email not found ");
      }
    } catch (error) {
      console.error('Error completing order:', error);
      setOrderCreateLoader(false)
      Alert.alert('Error', 'Failed to complete order. Please try again later.');
    }
  };



  // JSX rendering
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

      {/* Render loading indicator if loading */}
      {loading ? (
        <ActivityIndicator style={styles.loadingIndicator} size="large" color="#0000ff" />
      ) : (processingFees === undefined && deliveryFees === undefined) ? (
        // Render text in center if processingFees and deliveryFees are undefined
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, textAlign: 'center',color:'black' }}>Oops! something went wrong, please try again.</Text>
        </View>
      ) : (
        // Main content
        <View style={styles.container}>
          {/* MapView */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: latitude,
                longitude: longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              mapType="hybrid"
              onLongPress={handleMapLongPress}
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
            {/* Accuracy display */}
            {accuracy !== null && (
              <View style={styles.accuracyContainer}>
                <Text style={[styles.accuracyText, { color: accuracy > 40 ? 'red' : 'green' }]}>
                  {accuracy > 40
                    ? `Inaccurate location. Reported accuracy: ${accuracy} meters. Select your location manually from the map.`
                    : `We're using your current location as your delivery address. If you need to change it, simply long-press on the map to select a new address.`}
                </Text>
              </View>
            )}
          </View>
          {/* Menu items */}
          <View style={styles.menuMainContainer}>
            <View style={styles.menuContainer}>
              {distance !== null && (
                <Text style={styles.distance}>Delivering from {distance.distance} {distance.unit} away Shortest distance, you can chill while we bring your food to you.</Text>
              )}
              {/* Menu item */}
              <View style={styles.menuItem}>
                {/* Menu image */}
                <Image
                  source={{ uri: item.url }}
                  style={styles.menuImage}
                />

                {/* Menu info */}
                <View style={styles.menuInfo}>
                  {/* Title and price */}
                  <View style={styles.priceContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.title}>×  {quantity}</Text>
                    <View style={styles.iconAndPirce}>
                      <EvilIcons name="question" size={24} color="black" />
                      <Text style={styles.price}>₹ {item.price*quantity}</Text>
                    </View>
                  </View>
                  {/* Platform Processing fees */}
                  <View style={styles.priceContainer}>
                    <Text style={styles.feeText}>Platform Processing fees</Text>
                    <View style={styles.iconAndPirce}>
                      <EvilIcons name="question" size={24} color="black" />
                      <Text style={styles.price}>₹ {processingFees}</Text>
                    </View>
                  </View>
                  {/* Delivery fees */}
                  <View style={styles.priceContainer}>
                    <Text style={styles.feeText}>Delivery fees</Text>
                    <View style={styles.iconAndPirce}>
                      <EvilIcons name="question" size={24} color="black" />
                      <Text style={styles.price}>₹ {deliveryFees}</Text>
                    </View>
                  </View>
                  {/* Total */}
                  <View style={styles.priceContainer}>
                    <Text style={styles.total}>Total:</Text>
                    <View style={styles.iconAndPirce}>
                      <EvilIcons name="question" size={24} color="black" />
                      <Text style={styles.price}>₹ {item.price*quantity+processingFees+deliveryFees}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            {/* Complete Order button */}
            <TouchableOpacity style={styles.completeOrderButton} onPress={() => { completeOrderButton() }}>
              <Text style={styles.completeOrderButtonText}>Complete Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setModalVisible(!modalVisible)} style={styles.closeButton}>
              <EvilIcons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.inputTitle}>Enter Name:</Text>
            <TextInput
              style={styles.input}
              value={name}
              placeholder='Your Name'
              onChangeText={handleNameChange}
            />
            <Text style={styles.inputTitle}>Enter Phone Number:</Text>
            {/* Country code with +91 */}
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              maxLength={10}
              value={phoneNumber}
              placeholder='00 00 00 00 00'
              onChangeText={handlePhoneNumberChange}
            />
            <TouchableOpacity
              style={[styles.continueButton, (!isPhoneNumberValid || !isNameValid) && styles.disabledButton]}
              onPress={handleContinue}
              disabled={!isPhoneNumberValid || !isNameValid}
            >

              <Text style={{ color: 'white', fontSize: 18 }}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ModalSpin loading={orderCreateLoader} loadingText={"Creating Order"} responseText={responseText} />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    marginBottom: 20,
  },
  map: {
    width: windowWidth,
    height: windowHeight * 0.5,
  },
  accuracyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
  accuracyText: {
    fontSize: 16,
    marginHorizontal: 10,
    textAlign: "center"
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuMainContainer: {
    position: "fixed",
    marginBottom: 20
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  menuInfo: {
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginHorizontal: 10
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    marginLeft: 10
  },
  feeText: {
    fontSize: 14,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconAndPirce: {
    flexDirection: "row"
  },
  completeOrderButton: {
    backgroundColor: '#FE5301',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  completeOrderButtonText: {
    color: 'white',
    fontSize: 18,
  },
  distance: {
    textAlign: "center",
    marginBottom: 10
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  inputTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    height: 40,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  continueButton: {
    backgroundColor: '#FE5301',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20
  },
  countryCode: {
    fontSize: 16,
    marginBottom: 10,
    marginRight: 10,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  }

});

