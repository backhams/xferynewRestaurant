import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Alert, Dimensions } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { decodeToken, userRole } from './LoginToken';
import {API_URL} from '@env';

export default function RestaurantOrderList({ navigation }) {
    const apiUrlBack = API_URL;
    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [fetchingMore, setFetchingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [statusFilter, setStatusFilter] = useState("preparing");
    const [filterLoadingText, setFilterLoadingText] = useState();


    useEffect(() => {
        setLoading(true);
        fetchOrderHistory(statusFilter);
        switch (statusFilter) {
          case "preparing":
            setFilterLoadingText("New Orders");
            break;
          case "assign":
            setFilterLoadingText("Accpeted Orders");
            break;
          case "pick up":
            setFilterLoadingText("Picked up Orders");
            break;
          case "delivered":
            setFilterLoadingText("Delivered Orders");
            break;
          case "dispute":
            setFilterLoadingText("Dispute Orders");
            break;
          default:
            setFilterLoadingText("");
            break;
        }
      }, [statusFilter]);


    const fetchOrderHistory = async () => {
        try {
            const decodedToken = await decodeToken();
            const userEmail = decodedToken.email;
            const response = await fetch(`${apiUrlBack}orderList?page=${page}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any additional headers if required
                },
                body: JSON.stringify({ email: userEmail, role:"delivery",status: statusFilter }),
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data)
                if (data.length > 0) {
                    // Sort the order history by createdAt in descending order
                    const sortedOrderHistory = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setOrderHistory(sortedOrderHistory);

                } else {
                    setHasMore(false);
                    setOrderHistory([]);
                }
            }
        } catch (error) {
            Alert.alert(error.message)
            console.log(error.message)
            setOrderHistory("error");
        } finally {
            setLoading(false); // After fetching, set loading to false
            setRefreshing(false); // After fetching or on error, set refreshing to false
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

    const onRefresh = () => {
        setRefreshing(true); // Set refreshing state to true when refresh action is triggered
        fetchOrderHistory(); // Fetch order history again
    };

    // Function to format time difference
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
            // Format date as desired, for example:
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



    useEffect(() => {
        fetchOrderHistory();

        const interval = setInterval(() => {
            setCurrentTime(new Date()); // Update current time every second
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.container}>
            {/* Navbar */}
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
          <TouchableOpacity style={statusFilter === "preparing" ? styles.selectedStatusTitleBtn : styles.statusTitleBtn} onPress={() => handleStatusFilter("preparing")}>
            <Text style={statusFilter === "preparing" ? styles.selectedStatusTitle : styles.statusTitle}>New Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={statusFilter === "assign" ? styles.selectedStatusTitleBtn : styles.statusTitleBtn} onPress={() => handleStatusFilter("assign")}>
            <Text style={statusFilter === "assign" ? styles.selectedStatusTitle : styles.statusTitle}>Accepted</Text>
          </TouchableOpacity>
          <TouchableOpacity style={statusFilter === "pick up" ? styles.selectedStatusTitleBtn : styles.statusTitleBtn} onPress={() => handleStatusFilter("pick up")}>
            <Text style={statusFilter === "pick up" ? styles.selectedStatusTitle : styles.statusTitle}>Pick up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={statusFilter === "delivered" ? styles.selectedStatusTitleBtn : styles.statusTitleBtn} onPress={() => handleStatusFilter("delivered")}>
            <Text style={statusFilter === "delivered" ? styles.selectedStatusTitle : styles.statusTitle}>Delivered</Text>
          </TouchableOpacity>
          <TouchableOpacity style={statusFilter === "dispute" ? styles.selectedStatusTitleBtn : styles.statusTitleBtn} onPress={() => handleStatusFilter("dispute")}>
            <Text style={statusFilter === "dispute" ? styles.selectedStatusTitle : styles.statusTitle}>Dispute</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

            {/* Loader */}
            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={{ color: "black" }}>checking {filterLoadingText}</Text>
                </View>
            ) : (orderHistory.length === 0) ? (
                // Render text in center if processingFees and deliveryFees are undefined
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, textAlign: 'center', color: 'black' }}>No {filterLoadingText}.</Text>
                </View>
            ) : (orderHistory ==="error") ? (
              // Render text in center if processingFees and deliveryFees are undefined
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, textAlign: 'center', color: 'black' }}>Oops! Unable to load order history, please try again.</Text>
              </View>
          ):(
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    onScroll={({ nativeEvent }) => {
                        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                        const paddingToBottom = 20;
                        if (
                            layoutMeasurement.height + contentOffset.y >=
                            contentSize.height - paddingToBottom
                        ) {
                            // Load more data when scrolled to the bottom
                            handleLoadMore();
                        }
                    }}
                    scrollEventThrottle={0}
                    contentContainerStyle={styles.contentContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {/* Order History */}
                    {Array.isArray(orderHistory) && orderHistory.map(order => (
                        <TouchableOpacity
                            key={order._id} onPress={() => {
                              if ( statusFilter !== "dispute" && statusFilter !=="delivered") {
                                navigation.replace("DeliveryOrders", { orderId: order.orderId });
                              }
                            }}
                            
                            activeOpacity={0.8}
                        >
                            <View style={styles.orderItem}>
                                <View style={styles.cardContainer}>
                                    <View style={styles.orderDetails}>
                                        <View style={{ marginBottom: 5, flexDirection: "row", justifyContent: "space-between" }}>
                                            <Text>ID: {order.orderId}</Text>
                                            <Text style={styles.createdAt}>{formatTimeDifference(order.createdAt)}</Text>
                                        </View>
                                        <View style={{ marginBottom: 20, flexDirection: "row", alignItems: "center" }}>
                                            {order.status==="preparing" && order.assignStatus==="yet to assign" && (
                                            <Text style={styles.statusText}>NEW ORDER</Text>
                                            )}
                                            {order.status==="preparing" && order.assignStatus==="assign" && (
                                            <Text style={styles.statusText}>ACCEPTED</Text>
                                            )}
                                            {order.status==="pick up" && order.assignStatus==="assign" && (
                                            <Text style={styles.statusText}>PICKED UP</Text>
                                            )}
                                            {order.status==="delivered" && order.assignStatus==="assign" && (
                                            <Text style={styles.statusText}>DELIVERED</Text>
                                            )}
                                        </View>
                                        <Text style={styles.restaurant}>Restaurant Name: {order.restaurantName}</Text>
                                        <Text style={styles.status}>Status: {order.status}</Text>
                                        <Text style={styles.price}>{order.status !=="delivered" ? "Expected earning" : "Earning"}  ₹ {parseFloat(order.deliveryFees) + parseFloat(order.processingFees)}</Text>
                                        {calculateTimeDifference(order.createdAt) && order.assignStatus === 'yet to assign' && (
                                            <Text style={{ textAlign: "center" }}>
                                                You have {calculateTimeDifference(order.createdAt)} to Accept Order
                                            </Text>
                                        )}

                                        {order.assignStatus==="yet to assign" ? (
                                            <TouchableOpacity  style={styles.acceptButton} onPress={() => {
                                              if ( statusFilter !== "dispute" && statusFilter !=="delivered") {
                                                navigation.replace("DeliveryOrders", { orderId: order.orderId });
                                              }
                                            }}>
                                                <Text style={styles.acceptButtonText}>View Details {calculateTimeDifference(order.createdAt)}</Text>
                                            </TouchableOpacity>
                                        ) : (order.status !== 'cancel' && order.status !== 'delivered' ) ? (
                                          <TouchableOpacity style={styles.acceptButton} onPress={() => {
                                            if ( statusFilter !== "dispute" && statusFilter !=="delivered") {
                                              navigation.replace("DeliveryOrders", { orderId: order.orderId });
                                            }
                                          }}>
                                          <Text style={styles.acceptButtonText}>View Details</Text>
                                      </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity style={[styles.acceptButton, { backgroundColor: 'darkgray' }]} onPress={() => {
                                              if ( statusFilter !== "dispute" && statusFilter !=="delivered") {
                                                navigation.replace("DeliveryOrders", { orderId: order.orderId });
                                              }
                                            }}>
                                                <Text style={styles.acceptButtonText}>{order.status}</Text>
                                            </TouchableOpacity>
                                        )}

                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
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
        color:"black"
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
        marginBottom: 15,
    },
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
        padding: 10,
    },
    orderDetails: {
        flex: 1,
    },
    price: {
        fontSize: 14,
        color: '#888',
        marginBottom: 5,
    },
    restaurant: {
        fontSize: 14,
        color: '#888',
        marginBottom: 5,
    },
    status: {
        fontSize: 14,
        color: '#888',
        marginBottom: 5,
    },
    createdAt: {
        fontSize: 12,
        color: '#888',
    },
    statusText: {
        backgroundColor: "#5cf287",
        color: "white",
        paddingHorizontal: 10,
        borderRadius: 5
    },
    acceptButton: {
        backgroundColor: "#52a4de",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        paddingVertical: 10,
        marginTop: 10,
    },
    acceptButtonText: {
        color: "white",
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
    statusButtonsContainer: {
      flexDirection: 'row',
      paddingVertical: 10,
      paddingHorizontal: 15,
    },
});
