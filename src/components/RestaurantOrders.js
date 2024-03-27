import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MapView, { Marker } from 'react-native-maps';
import { decodeToken, userRole } from './LoginToken';
import ModalSpin from './ModalSpin';
import SwipeButton from 'rn-swipe-button';
import {API_HOST} from '@env';

export default function RestaurantOrders({ navigation, route }) {
  const apiUrlBack = API_HOST;
  const { orderId } = route.params;

  const [orderData, setOrderData] = useState();
  const [loading, setLoading] = useState(true);
  const [orderCancelLoader, setOrderCancelLoader] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);


  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await fetch(`${apiUrlBack}orderInformation/${orderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setOrderData(data);
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, []);

  // Function to toggle full-screen mode
  const toggleFullScreen = () => {
    setIsMapFullScreen(!isMapFullScreen);
  };

  // Function to format the date with short month names
  const formatDate = (createdAt) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const date = new Date(createdAt);
    const monthIndex = date.getMonth();
    const day = date.getDate();
    const year = date.getFullYear();
    return `${monthNames[monthIndex]} ${day}, ${year}`;
  }

  // Function to format the time
  const formatTime = (createdAt) => {
    const date = new Date(createdAt);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${formattedHours}:${formattedMinutes}${ampm}`;
  }

  const conrfirmSwipeSuccess = async () => {
      navigation.replace("SearchDelivery",{orderId:orderData.orderId})
  };

  const confirmSwipeFail = () => {
    Alert.alert("Failed! to confirm")
  };

  // Function to check if the cancel button should be hidden
  const isCancelButtonHidden = () => {
    if (!orderData || !orderData.createdAt || !orderData.status) return true; // If orderData, createdAt, or status is not available, hide cancel button
    return orderData.status !== 'ordered'; // Hide cancel button if status is not 'ordered'
};




  const renderStatusText = () => {
    if (!orderData || !orderData.status) {
      return null; // Return null if order data or status is not available
    }
  
    if (orderData.status === 'cancel') {
      return <Text>This order was canceled.</Text>;
    } else if (orderData.status === 'delivered') {
      return <Text>Order delivered.</Text>;
    } else {
      return <Text>Order history.</Text>; // Or any default text if status is neither cancel nor delivered
    }
  };
  const cancelOrder = async () => {
    try {
      setOrderCancelLoader(true);
      const role = await userRole();
      if (orderData.orderId || role || orderData.title) {
        const response = await fetch(`${apiUrlBack}cancelOrder`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderId: orderData.orderId,
            role,
            title: orderData.title
          }),
        });
        if (response.ok) {
          const data = await response.json();
          setResponseText("Order canceled.");
          console.log(data);
          setTimeout(() => {
            setOrderCancelLoader(false);
            // Reload the current screen
            navigation.replace('RestaurantOrders', { orderId: orderId });
          }, 2000); // Hide loader after 2 seconds
        } else {
          const data = await response.json();
          console.log(data);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      // Hide loader in case of error as well
      setOrderCancelLoader(false);
    }
  };

  const cancelSwipeFail = () => {
    Alert.alert("Failed! to cancel")
  };

  const CheckoutButton = () => {
    return (
      <AntDesign name="doubleright" size={24} color="green" />
    );
  }
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={styles.loadingIndicator} size="large" color="#0000ff" />
      ) : (orderData === undefined) ? (
        // Render text in center if processingFees and deliveryFees are undefined
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, textAlign: 'center', color: 'black' }}>Oops! Unable to load order info, please try again.</Text>
        </View>
      ) : (
        <>
          <View style={styles.buttonContainer}>
            {isMapFullScreen ? null : (
              <AntDesign onPress={() => { navigation.navigate("Menu") }} name="arrowleft" size={24} color="black" style={styles.backIcon} />
            )}
            <TouchableOpacity onPress={toggleFullScreen} style={styles.fullScreenButton}>
              <Text style={styles.fullScreenButtonText}>
                {isMapFullScreen ? 'Exit Full Screen' : 'Full Screen'}
              </Text>
            </TouchableOpacity>

          </View>
          {/* Order information section */}
          <View style={styles.orderInfoSection}>
            <Text style={styles.orderInfoTitle}>Order Information</Text>
            <View style={styles.orderId}>
              <Text style={{ color: '#FE5301' }}>ID:</Text>
              <Text>{orderData.orderId}</Text>
            </View>
          </View>
          {/* Delivery location section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery to</Text>
            <MapView
              style={[styles.map, isMapFullScreen && styles.fullScreenMap]} // Update styles based on full-screen mode
              initialRegion={{
                latitude: orderData.customerLatitude,
                longitude: orderData.customerLongitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              mapType='hybrid'
              showsPointsOfInterest={true}
            >
              <Marker
                coordinate={{ latitude: orderData.customerLatitude, longitude: orderData.customerLongitude }}
                title="You"
                description="Your current location"
                pinColor="red"
              />
            </MapView>
            <View style={styles.customerInfo}>
              <Text style={styles.customerInfoText}>Customer Name: {orderData.customerName}</Text>
              <Text style={styles.customerInfoText}>Customer Number: +91{orderData.customerNumber}</Text>
            </View>
          </View>
          {/* Menu section */}
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.sectionTitle}>Ordered Menu</Text>
              <Text style={styles.sectionTitle}>{formatTime(orderData.createdAt)}</Text>
              <Text style={styles.sectionTitle}>{formatDate(orderData.createdAt)}</Text>
            </View>

            <View style={styles.menuSectionConatainer}>
              <View style={styles.menuItem}>
                <Image
                  source={{ uri: orderData.url }}
                  style={styles.menuImage}
                />
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemName}>{orderData.title}</Text>
                  <Text>{orderData.restaurantName}</Text>
                </View>
              </View>
              <View style={styles.feesView}>
                <Text>Price ({orderData.quantity} item)</Text>
                <Text>₹ {orderData.price * orderData.quantity}</Text>
              </View>
              <View style={styles.feesView}>
                <Text style={{ color: '#FE5301', fontWeight: 'bold' }}>Total</Text>
                <Text style={{ color: '#FE5301', fontWeight: 'bold' }}>
                  ₹ {parseFloat(orderData.price) * parseInt(orderData.quantity)}
                </Text>
              </View>
              <View style={styles.feesView}>
                <Text>Status</Text>
                <Text>{orderData.status}</Text>
              </View>
            </View>
          </View>
          {/* Add TouchableOpacity at the bottom */}
          {!isCancelButtonHidden() ? (
            <>
              <SwipeButton
                containerStyles={{ borderRadius: 90, borderWidth: 0, marginVertical: 10 }}
                height={50}
                onSwipeFail={confirmSwipeFail} // Execute function on swipe fail
                onSwipeSuccess={conrfirmSwipeSuccess} // Execute function on swipe success
                railBackgroundColor="#0be06c"
                thumbIconBackgroundColor="#FFFFFF"
                railStyles={{
                  borderRadius: 35,
                  backgroundColor: 'transparent',
                  borderColor: '#0be06c',
                }}
                thumbIconComponent={CheckoutButton}
                thumbIconStyles={{ borderRadius: 100 }}
                thumbIconWidth={90}
                title="Swipe to Confirm"
                titleStyles={{
                  color: 'white',
                  fontWeight: "bold",
                  fontSize:14,
                }}
              />
              <SwipeButton
                enableReverseSwipe
                containerStyles={{ borderRadius: 90, borderWidth: 0 }}
                height={50}
                onSwipeFail={cancelSwipeFail}
                onSwipeSuccess={cancelOrder}
                railBackgroundColor="#0be06c"
                thumbIconBackgroundColor="#FFFFFF"
                railStyles={{
                  borderRadius: 35,
                  backgroundColor: 'transparent',
                  borderColor: '#0be06c',
                }}
                thumbIconComponent={CheckoutButton}
                thumbIconStyles={{ borderRadius: 100 }}
                thumbIconWidth={90}
                title="Swipe to Confirm"
                titleStyles={{
                  color: 'white',
                  fontWeight: "bold",
                  fontSize:14
                }}
              />
            </>
          ) : (
            <View style={styles.thankYou}>
            <Text style={{ fontWeight: '700', fontSize: 20 }}>{renderStatusText()}</Text>
          </View>
          )}
        </>
      )}
      <ModalSpin loading={orderCancelLoader} loadingText={"Cancelling Order"} responseText={responseText} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fullScreenButton: {
    backgroundColor: '#FE5301',
    padding: 10,
    borderRadius: 5,
  },
  fullScreenButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  backIcon: {
    // Your back button styles
  },
  orderInfoSection: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  orderInfoTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  orderId: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  map: {
    width: Dimensions.get('window').width - 40,
    height: 200,
    marginBottom: 10,
  },
  fullScreenMap: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').height,
  },
  deliverySection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerInfo: {
    marginLeft: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuImage: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemName: {
    fontWeight: 'bold',
  },
  feesView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  thankYou: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  swipeButton: {
    backgroundColor: '#FE5301',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20, // Adjust margin bottom as needed
  },
  swipeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

});
