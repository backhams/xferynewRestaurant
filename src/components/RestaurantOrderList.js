import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
  TextInput,
  Linking,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { decodeToken, userRole } from './LoginToken';
import Blinking from './BlinkingDot/Blinking';
import io from 'socket.io-client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Foundation from 'react-native-vector-icons/Foundation'
import { API_URL } from '@env';

export default function RestaurantOrderList({ navigation }) {
  const apiUrlBack = API_URL;
  // console.log(apiUrlBack)
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ordered");
  const [filterLoadingText, setFilterLoadingText] = useState();
  const [preparationTimes, setPreparationTimes] = useState({});
  const [showMenu, setShowMenu] = useState({});
  const [showMenuDelivery, setShowMenuDelivery] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [socket, setSocket] = useState(null);
  const [orderIds, setOrderIds] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetchOrderHistory(statusFilter);
    switch (statusFilter) {
      case "ordered":
        setFilterLoadingText("New Orders");
        break;
      case "preparing":
        setFilterLoadingText("Preparing Orders");
        break;
      case "ready":
        setFilterLoadingText("Ready Orders");
        break;
      case "pick up":
        setFilterLoadingText("Picked up Orders");
        break;
      case "delivered":
        setFilterLoadingText("Delivered Orders");
        break;
      case "dispute":
        setFilterLoadingText("dispute Orders");
        break;
      default:
        setFilterLoadingText("");
        break;
    }
  }, [statusFilter]);

  // Modify the useEffect hook to handle the orderAssignStatusChange event
  useEffect(() => {
    // Connect to the socket server
    const newSocket = io(apiUrlBack);
    setSocket(newSocket);

    // Handle connection
    newSocket.on('connect', () => {
      console.log('Connected to socket server');
    });

    // Handle disconnection
    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    // Clean up the socket connection on component unmount
    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, []);


  useEffect(() => {
    if (statusFilter === "preparing") {
      console.log("run")
      socket.on('orderAssignStatusChange', async (data) => {
        // Check if the received data contains an orderId
        if (data) {
          // Find the order in orderHistory with matching orderId
          const matchedOrder = orderIds.filter(orderId => orderId === data);
          console.log(matchedOrder)

          if (matchedOrder.length > 0) {
            // Order found, do further processing
            console.log('Order matched:', matchedOrder);
            // Check which document has this orderId and perform actions accordingly
            // Refresh the page here
            const stopLoading = "stopLoading"
            onRefresh(stopLoading);
          } else {
            // No order found with the received orderId
            console.log('No order found with orderId:', data);
          }
        } else {
          // No orderId found in the received data
          console.log('Received data does not contain orderId');
        }
      });
    }

  }, [orderIds])




  const fetchOrderHistory = async () => {
    try {
      const decodedToken = await decodeToken();
      const userEmail = decodedToken.email;
      const role = await userRole();
      const response = await fetch(`${process.env.API_URL}orderList?page=${page}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, role, status: statusFilter }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const sortedOrderHistory = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setOrderHistory(sortedOrderHistory);
          // Initialize preparation times for each order item

          // Extracting orderIds from data array
          const orderIdsArray = sortedOrderHistory.map(order => order.orderId);
          setOrderIds(orderIdsArray);


          const initialPreparationTimes = {};
          data.forEach(order => {
            initialPreparationTimes[order.orderId] = 17; // Initial preparation time set to 17 minutes
          });
          setPreparationTimes(initialPreparationTimes);
          // Initialize showMenu state for each order item
          const initialShowMenuState = {};
          data.forEach(order => {
            initialShowMenuState[order.orderId] = false;
          });
          setShowMenu(initialShowMenuState);
        } else {
          setOrderHistory([]);
        }
      }
    } catch (error) {
      setOrderHistory("error");
      Alert.alert(error.message)
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusFilter = async (status) => {
    await setPage(1);
    await setStatusFilter(status);
  };

  const handleLoadMore = async () => {
    if (!loading && !fetchingMore && hasMore) {
      setFetchingMore(true);

      try {
        const nextPage = page + 1; // Increment page number
        await setPage(1);
        const decodedToken = await decodeToken();
        const userEmail = decodedToken.email;
        const role = await userRole();
        const response = await fetch(`${process.env.API_URL}orderList?page=${nextPage}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: userEmail, role, status: statusFilter }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setOrderHistory(prevMenu => [...prevMenu, ...data]);
            // Initialize preparation times for newly fetched order items
            const newPreparationTimes = { ...preparationTimes };
            data.forEach(order => {
              newPreparationTimes[order.orderId] = 17; // Initial preparation time set to 17 minutes
            });
            setPreparationTimes(newPreparationTimes);
            // Initialize showMenu state for newly fetched order items
            const newShowMenuState = { ...showMenu };
            data.forEach(order => {
              newShowMenuState[order.orderId] = false;
            });
            setShowMenu(newShowMenuState);
            setPage(nextPage); // Update page number
          } else {
            setHasMore(false); // No more data available
          }
        } else {
          throw new Error('Failed to fetch menu');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setFetchingMore(false);
      }
    }
  };


  const onRefresh = async (stopLoading) => {
    if (stopLoading == "stopLoading") {
      await fetchOrderHistory();
    } else {
      setRefreshing(true);
      await setHasMore(true);
      await fetchOrderHistory();
    }

  };

  const formatTimeDifference = (createdAt) => {
    const currentTime = new Date();
    const orderTime = new Date(createdAt);
    const timeDiff = currentTime - orderTime;
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    if (timeDiff < oneHour) {
      return `${Math.floor(timeDiff / (60 * 1000))} minutes ago`;
    } else if (timeDiff < oneDay) {
      return `${Math.floor(timeDiff / oneHour)} hours ago`;
    } else if (timeDiff < 2 * oneDay) {
      return 'Yesterday';
    } else {
      return orderTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

  const calculateTimeDifference = (createdAt) => {
    const orderTime = new Date(createdAt);
    const diffInSeconds = Math.floor((currentTime - orderTime) / 1000); // Time difference in seconds

    // If time difference is greater than 7 minutes (420 seconds), return null
    if (diffInSeconds >= 420) {
      return null;
    }

    // Calculate remaining time
    const remainingSeconds = 420 - diffInSeconds;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };



  const calculateTimeDifferencePreparing = (preparationCreatedAt, preparationTime, orderId) => {
    const orderTime = new Date(preparationCreatedAt);
    const currentTime = new Date();
    const diffInSeconds = Math.floor((currentTime - orderTime) / 1000); // Time difference in seconds
    const preparationTimeInSeconds = preparationTime * 60; // Convert preparation time from minutes to seconds

    // Calculate remaining time
    let remainingSeconds = preparationTimeInSeconds - diffInSeconds;

    if (remainingSeconds <= 0) {
      let elapsedAfterThreshold = Math.max(diffInSeconds - preparationTimeInSeconds, 0); // Calculate elapsed time after preparation time threshold
      const elapsedMinutes = Math.floor(elapsedAfterThreshold / 60);
      const elapsedSeconds = elapsedAfterThreshold % 60;
      return `Order Delay for: (${elapsedMinutes}:${elapsedSeconds < 10 ? '0' : ''}${elapsedSeconds})`;
    }

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return `Ready order in: (${minutes}:${seconds < 10 ? '0' : ''}${seconds})`;
  };


  useEffect(() => {
    fetchOrderHistory();

    const interval = setInterval(() => {
      setCurrentTime(new Date()); // Update current time every second
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const increaseTime = (orderId) => {
    // Check if current preparation time is less than 45 minutes
    if (preparationTimes[orderId] < 45) {
      setPreparationTimes(prevTimes => ({
        ...prevTimes,
        [orderId]: (prevTimes[orderId] || 0) + 1
      }));
    }
  };


  const decreaseTime = (orderId) => {
    // Check if current preparation time is greater than 1 minute
    if (preparationTimes[orderId] > 9) {
      setPreparationTimes(prevTimes => ({
        ...prevTimes,
        [orderId]: (prevTimes[orderId] || 0) - 1
      }));
    }
  };

  // Function to toggle menu visibility for a specific order item
  const toggleMenu = (orderId) => {
    setShowMenu(prevState => ({
      ...prevState,
      [orderId]: !prevState[orderId]
    }));
  };

  // Function to call the customer
  const callCustomer = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  // Function to toggle menu visibility for a specific order item
  const toggleMenuDelivery = (orderId) => {
    setShowMenuDelivery(prevState => ({
      ...prevState,
      [orderId]: !prevState[orderId]
    }));
  };

  // Function to call the customer
  const callDelivery = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  // accept order 
  const acceptOrder = async (orderId, restaurantLatitude, restaurantLongitude, preparationTime) => {
    try {
      const response = await fetch(`${apiUrlBack}availableDeliveryFinder`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ orderId, latitude: restaurantLatitude, longitude: restaurantLongitude, time: preparationTime })
      })
      const data = await response.json();
      console.log(data)

    } catch (error) {

    }
  }


  return (
    <View style={styles.container}>
      <View style={styles.navbarContainer}>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => { navigation.navigate("CustomerProfile") }}>
            <AntDesign name="arrowleft" size={24} style={styles.icon} />
          </TouchableOpacity>
          <Text style={styles.title}>Order</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusButtonsContainer}
        >
          <TouchableOpacity style={statusFilter === "ordered" ? styles.selectedStatusTitleBtn : styles.statusTitleBtn} onPress={() => handleStatusFilter("ordered")}>
            <Text style={statusFilter === "ordered" ? styles.selectedStatusTitle : styles.statusTitle}>New Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={statusFilter === "preparing" ? styles.selectedStatusTitleBtn : styles.statusTitleBtn} onPress={() => handleStatusFilter("preparing")}>
            <Text style={statusFilter === "preparing" ? styles.selectedStatusTitle : styles.statusTitle}>Preparing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={statusFilter === "ready" ? styles.selectedStatusTitleBtn : styles.statusTitleBtn} onPress={() => handleStatusFilter("ready")}>
            <Text style={statusFilter === "ready" ? styles.selectedStatusTitle : styles.statusTitle}>Ready</Text>
          </TouchableOpacity>
          <TouchableOpacity style={statusFilter === "pick up" ? styles.selectedStatusTitleBtn : styles.statusTitleBtn} onPress={() => handleStatusFilter("pick up")}>
            <Text style={statusFilter === "pick up" ? styles.selectedStatusTitle : styles.statusTitle}>Pick up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={statusFilter === "delivered" ? styles.selectedStatusTitleBtn : styles.statusTitleBtn} onPress={() => handleStatusFilter("delivered")}>
            <Text style={statusFilter === "delivered" ? styles.selectedStatusTitle : styles.statusTitle}>Delivered</Text>
          </TouchableOpacity>
          <TouchableOpacity style={statusFilter === "dispute" ? styles.selectedStatusTitleBtn : styles.statusTitleBtn} onPress={() => handleStatusFilter("dispute")}>
            <Text style={statusFilter === "dispute" ? styles.selectedStatusTitle : styles.statusTitle}>dispute</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ color: "black" }}>checking {filterLoadingText}</Text>
        </View>
      ) : (orderHistory === "error") ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, textAlign: 'center', color: 'black' }}>Oops! Unable to load order history, please try again.</Text>
        </View>
      ) : (orderHistory.length === 0) ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, textAlign: 'center', color: 'black' }}>No {filterLoadingText}</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const paddingToBottom =20;
            if (
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom
            ) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={0}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {Array.isArray(orderHistory) && orderHistory.map(order => (
            <View style={styles.orderItem} key={order.orderId}>
              <View style={styles.cardContainer}>
                <Image
                  source={{ uri: order.url }}
                  style={styles.image}
                />
                <View style={styles.orderDetails}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.orderId}>ID: {order.orderId}</Text>
                    <TouchableOpacity onPress={() => toggleMenu(order.orderId)}>
                      <MaterialCommunityIcons name="dots-vertical" size={24} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ maxWidth: "80%" }}>
                    <Text numberOfLines={3} ellipsizeMode="tail">
                      Order by:
                      <Text style={{ color: 'blue' }}> {order.customerName}</Text>
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={styles.quantity}> {order.quantity}</Text>
                      <Text style={{ marginHorizontal: 10 }}>×</Text>
                      <View style={{ maxWidth: "70%" }}>
                        <Text numberOfLines={3} ellipsizeMode="tail" style={styles.orderTitle}>{order.title}</Text>
                      </View>
                    </View>
                    <Text style={styles.price}>₹ {parseFloat(order.price * order.quantity)}</Text>
                  </View>
                </View>
              </View>
              {showMenu[order.orderId] && (
                <View style={styles.menu}>
                  <TouchableOpacity onPress={() => callCustomer(order.customerNumber)}>
                    <Text>Call Customer</Text>
                  </TouchableOpacity>
                  {/* Add more menu options as needed */}
                </View>
              )}
              {/* Total price and createdAt */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 15 }}>
                <Text>Total Bill: ₹{parseFloat(order.price * order.quantity)}</Text>
                <Text style={styles.createdAt}>{formatTimeDifference(order.createdAt)}</Text>
              </View>

              {/* button render base on order status */}
              {order.status === "ordered" && (
                <>
                  {/* preparation time section */}
                  <View style={{ marginTop: 5 }}>
                    <Text style={{ marginBottom: 5 }}>Set food preparation time:</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <TouchableOpacity style={styles.timeButton} onPress={() => decreaseTime(order.orderId)}>
                        <Text style={styles.durationBtn}>-</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.timeInput}
                        placeholder="Enter minutes"
                        keyboardType="numeric"
                        value={`${preparationTimes[order.orderId]} mins`}
                        editable={false}
                      />
                      <TouchableOpacity style={styles.timeButton} onPress={() => increaseTime(order.orderId)}>
                        <Text style={styles.durationBtn}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* accpet and reject section */}
                  <View style={styles.accpetNrejectBtns}>
                    <TouchableOpacity style={styles.rejectButton}>
                      <Text style={styles.buttonText}>Reject</Text>
                    </TouchableOpacity>
                    <View style={{ width: 10 }} />
                    <TouchableOpacity style={styles.acceptButton} onPress={() => { acceptOrder(order.orderId, order.restaurantLatitude, order.restaurantLongitude, preparationTimes[order.orderId]) }}>
                      <Text style={styles.buttonText}>Accept ({calculateTimeDifference(order.createdAt)})</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
              {/* for preparing */}
              {order.status === "preparing" && (
                <>
                  {order.assignStatus === "yet to assign" && (
                    <View style={styles.deliveryAssign}>
                      <View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Blinking />
                          <Text style={styles.deliveryAssignTitle}>Delivery Partner will be assigned shortly</Text>
                        </View>
                        <Text style={styles.deliveryDescription}>Kindly continue food preparation, delivery will reach your location shortly</Text>
                      </View>
                      <Text>{order.nearbyPartner} delivery partners have been assigned to pick up your order. One will be assigned shortly </Text>
                    </View>
                  )}

                  {order.assignStatus === "assign" && (
                    <View style={styles.deliveryAssign}>
                      <View>
                        <Image
                          source={{ uri: order.deliveryProfile }}
                          style={styles.deliveryImage}
                        />
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text style={styles.deliveryAssignTitle}>{order.deliveryName}, assigned, will arrive shortly.</Text>
                        </View>
                        <Text style={styles.deliveryDescription}>OTP: {order.restaurantOtp}</Text>
                      </View>
                      <TouchableOpacity onPress={() => toggleMenuDelivery(order.orderId)}>
                        <MaterialIcons name="wifi-calling-3" size={24} color={"blue"} />
                      </TouchableOpacity>
                      {showMenuDelivery[order.orderId] && (
                        <View style={styles.menu}>
                          <TouchableOpacity onPress={() => callDelivery(order.deliveryNumber)}>
                            <Text>Call Delivery partner</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                  )}

                  {order.assignStatus === "not assign" && (
                    <TouchableOpacity onPress={() => { Alert.alert("Manage Delivery") }} style={styles.deliveryAssign}>
                      <View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Foundation name="alert" size={24} color={"black"} />
                          <Text style={styles.deliveryAssignTitle}>No delivery partner assigned</Text>
                        </View>
                        <Text style={styles.deliveryDescription}>
                          Would you like to manage the delivery for this order? If yes, <Text onPress={() => { Alert.alert("Manage Delivery") }} style={{ textDecorationLine: 'underline', color: 'blue' }}>click here</Text>.
                        </Text>
                      </View>
                    </TouchableOpacity>

                  )}

                  <TouchableOpacity
                    style={[
                      styles.acceptButton,
                      (calculateTimeDifferencePreparing(order.preparationCreatedAt, order.preparationTime, order.orderId).startsWith('Order Delay'))
                        ? { backgroundColor: 'lightblue' }
                        : null
                    ]}
                  >
                    <Text style={[
                      styles.buttonText,
                      (calculateTimeDifferencePreparing(order.preparationCreatedAt, order.preparationTime, order.orderId).startsWith('Order Delay'))
                        ? { color: 'red' }
                        : null
                    ]}>
                      {calculateTimeDifferencePreparing(order.preparationCreatedAt, order.preparationTime, order.orderId)}
                    </Text>
                  </TouchableOpacity>


                </>
              )}

            </View>
          ))}
          {fetchingMore && (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  navbarContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    elevation: 3,
    marginBottom: 20
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  statusTitleBtn: {
    backgroundColor: "#e3e3e3",
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 10,
    marginHorizontal: 5,
    // height:Dimensions.get("screen").height - 817,
    paddingVertical: 7,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedStatusTitleBtn: {
    paddingHorizontal: 7,
    borderRadius: 5,
    // height:Dimensions.get("screen").height - 817,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FE5301"
  },
  statusTitle: {
    fontSize: 12,
    color: "black"
  },
  selectedStatusTitle: {
    color: "white"
  },
  icon: {
    marginRight: 10,
    color: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  orderItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    padding: 10,
    marginBottom: 15,
  },
  cardContainer: {
    flexDirection: 'row',
  },
  image: {
    width: 80,
    height: 80,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginRight: 10,
  },
  orderDetails: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  price: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  orderId: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  createdAt: {
    fontSize: 12,
    color: '#888',
  },
  bottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    alignItems: 'center',
    marginVertical: 10,
    marginBottom: 10
  },
  accpetNrejectBtns: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
    alignItems: "center"

  },
  rejectButton: {
    flex: 0.4,
    backgroundColor: "red",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#127be6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  timeButton: {
    backgroundColor: "lightgray",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  timeInput: {
    flex: 1,
    backgroundColor: "lightgray",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 5,
    color: "black",
    textAlign: "center"
  },
  durationBtn: {
    fontSize: 20
  },
  menu: {
    backgroundColor: '#fff',
    position: 'absolute',
    top: 40,
    right: 10,
    padding: 10,
    borderRadius: 5,
    elevation: 3,
  },
  deliveryAssign: {
    flexDirection: "row",
    backgroundColor: "lightgray",
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
    flexWrap: "wrap"
  },
  deliveryAssignTitle: {
    borderLeftColor: "black",
    fontWeight: "bold",
    marginBottom: 5,
    marginHorizontal: 10,
    paddingTop: 5
  },
  deliveryDescription: {
    marginHorizontal: 20
  },
  deliveryImage: {
    width: 50,
    height: 50,
    resizeMode: 'cover', // Adjust the resizeMode as needed
    borderRadius: 100
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
});


