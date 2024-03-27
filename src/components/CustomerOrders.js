import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MapView, { Marker } from 'react-native-maps';
import { decodeToken, userRole } from './LoginToken';
import ModalSpin from './ModalSpin';
import {API_HOST} from '@env';

export default function CustomerOrders({ navigation, route }) {
  const apiUrlBack = API_HOST;
  const { orderId } = route.params;

  const [orderData, setOrderData] = useState();
  const [loading, setLoading] = useState(true); 
  const [orderCancelLoader, setOrderCancelLoader] = useState(false);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await fetch(`${apiUrlBack}orderInformation/${orderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if(response.ok){
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

  // Function to check if the cancel button should be hidden
  const isCancelButtonHidden = () => {
    if (!orderData || !orderData.createdAt || !orderData.status) return true; // If orderData, createdAt, or status is not available, hide cancel button
    const orderCreatedAt = new Date(orderData.createdAt);
    const currentTime = new Date();
    const timeDifferenceInMinutes = (currentTime - orderCreatedAt) / (1000 * 60); // Difference in minutes
    return timeDifferenceInMinutes > 1 || orderData.status === 'cancel'; // Hide cancel button if time difference is more than 1 minute or status is 'cancel'
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
            title:orderData.title
          }),
        });
        if (response.ok) {
          const data = await response.json();
          setResponseText("Order canceled.");
          console.log(data);
          setTimeout(() => {
            setOrderCancelLoader(false);
            // Reload the current screen
            navigation.replace('CustomerOrders', { orderId: orderId });
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
  
  
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={styles.loadingIndicator} size="large" color="#0000ff" />
      ) : (orderData === undefined) ? (
        // Render text in center if processingFees and deliveryFees are undefined
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, textAlign: 'center',color:'black' }}>Oops! Unable to load order info, please try again.</Text>
        </View>
      ): (
        <>
          <AntDesign onPress={()=>{navigation.navigate("Menu")}} name="arrowleft" size={24} color="black" style={styles.backIcon} />
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
              style={styles.map}
              initialRegion={{
                latitude: orderData.customerLatitude,
                longitude: orderData.customerLongitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
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
              <Text style={styles.customerInfoText}>Name: {orderData.customerName}</Text>
              <Text style={styles.customerInfoText}>Number: +91{orderData.customerNumber}</Text>
              <Text style={styles.customerInfoText}>email: {orderData.customerEmail}</Text>
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
                <Text>₹ {orderData.price*orderData.quantity}</Text>
              </View>
              <View style={styles.feesView}>
                <Text>Platform Processing Fee</Text>
                <Text>₹ {orderData.processingFees}</Text>
              </View>
              <View style={styles.feesView}>
                <Text>Delivery Fee</Text>
                <Text>₹ {orderData.deliveryFees}</Text>
              </View>
              <View style={styles.feesView}>
                <Text style={{ color: '#FE5301', fontWeight: 'bold' }}>Total</Text>
                <Text style={{ color: '#FE5301', fontWeight: 'bold' }}>
                  ₹ {parseFloat(orderData.price) * parseInt(orderData.quantity) + parseFloat(orderData.processingFees) + parseFloat(orderData.deliveryFees)}
                </Text>
              </View>
              <View style={styles.feesView}>
                <Text>Status</Text>
                <Text>{orderData.status}</Text>
              </View>
            </View>
          </View>
          {/* Thank you section */}
          <View style={styles.thankYou}>
            <Text style={{ fontWeight: '700', fontSize: 20 }}>Thank you for your order</Text>
          </View>
          {/* Cancel button */}
          {!isCancelButtonHidden() && (
            <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity onPress={cancelOrder} style={{ backgroundColor: '#FE5301', height: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}>
                <Text style={{ color: 'white', marginHorizontal: 39 }}>Cancel</Text>
              </TouchableOpacity>
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
  backIcon: {
    marginBottom: 20,
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
    fontSize: 25,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
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
});
