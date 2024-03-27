import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, Alert,ActivityIndicator } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getCurrentLocation } from './Location';
import ModalSpin from './ModalSpin';
import {API_HOST} from '@env';

export default function SearchDelivery({ navigation, route }) {
  const apiUrlBack = API_HOST;
  const { orderId } = route.params;
  console.log(orderId)
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedButton, setSelectedButton] = useState(null);
  const [iconOpacity] = useState(new Animated.Value(1));
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      try {
        const { latitude, longitude } = await getCurrentLocation();
        setLatitude(latitude);
        setLongitude(longitude);

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

  const handleSearchDeliveryPartner = async () => {
    setLoading(true); // Set loading state to true when starting the API call
    try {
      if (latitude && longitude && orderId) {
        const response = await fetch(`${apiUrlBack}availableDeliveryFinder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ latitude, longitude,orderId }),
        });

        const responseData = await response.json();
        if (response.ok) {
          setResponseText("The order is confirmed. Delivery partner will arrive shortly. Please ensure the order is ready within 10 minutes.");
          setTimeout(() => {
            setLoading(false);
            setResponseText("");
            navigation.replace("RestaurantOrderList")
          }, 10000);

          console.log('API Response:', responseData);
          return responseData;
        } else {
          // Handle error in the first request
          Alert.alert(responseData.error);
        }
      }
    } catch (error) {
      // Handle errors here. For example:
      Alert.alert('Error occurred', error.message);
    } finally {
      setLoading(false); // Ensure loading state is set to false in case of any error
    }
  };



  const handleUseOwnDelivery = () => {
    // Add your logic to navigate or perform actions for using own delivery
  };

  const handleIconPress = (button) => {
    setSelectedButton(button);
    setModalVisible(true);
  };

  const startTwinkling = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconOpacity, {
          toValue: 0.3,
          duration: 300, // Decreased duration for faster twinkling
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 300, // Decreased duration for faster twinkling
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  useEffect(() => {
    startTwinkling();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrowContainer}>
        <AntDesign name="arrowleft" size={24} color="black" style={styles.backArrow} />
      </TouchableOpacity>
      <Text style={styles.title}>Choose Delivery Option</Text>
      <TouchableOpacity onPress={() => handleIconPress('search')} style={styles.iconContainer}>
        <Animated.View style={[styles.iconWrapper, { opacity: iconOpacity }]}>
          <Icon name="question-circle" size={20} color="black" style={styles.icon} />
        </Animated.View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Alert.alert(
          "Search Partner",
          "This will automatically confirm the order once a delivery partner is found.",
          [
            {
              text: "No",
              style: "cancel"
            },
            {
              text: "Continue",
              onPress: () => handleSearchDeliveryPartner() // Call the function to search and confirm order
            }
          ],
          { cancelable: false }
        )} style={styles.button}>
        <Text style={styles.buttonText}>Search Delivery Partner</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleIconPress('own')} style={styles.iconContainer}>
        <Animated.View style={[styles.iconWrapper, { opacity: iconOpacity }]}>
          <Icon name="question-circle" size={20} color="black" style={styles.icon} />
        </Animated.View>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleUseOwnDelivery} style={styles.button}>
        <Text style={styles.buttonText}>I Will Use My Own Delivery</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>
            {selectedButton === 'search'
              ? "By selecting this option, our algorithm will search for nearby available delivery partners who have registered with our platform. This ensures that you have access to a network of reliable delivery professionals ready to assist with your delivery needs."
              : "Choosing this option means you'll manage the delivery process independently. In addition to fulfilling orders, selecting this option allows you to earn extra income through delivery fees, as you'll be utilizing your own delivery resources."}
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <View style={styles.additionalInfoContainer}>
        <Text style={styles.additionalInfoText}>Need help finding a delivery partner?</Text>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
      <ModalSpin loading={loading} loadingText={"searching..."} responseText={responseText} />
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backArrowContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  backArrow: {
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
  },
  additionalInfoContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  additionalInfoText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  linkButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  linkButtonText: {
    color: 'white',
    fontSize: 14,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333',
  },
  modalCloseButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
