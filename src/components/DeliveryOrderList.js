import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Alert, Dimensions } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { decodeToken, userRole } from './LoginToken';
import {API_HOST} from '@env';

export default function RestaurantOrderList({ navigation }) {
    const apiUrlBack = API_HOST;
    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [fetchingMore, setFetchingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        fetchOrderHistory();
    }, []);

    const fetchOrderHistory = async () => {
        try {
            const decodedToken = await decodeToken();
            const userEmail = decodedToken.email;
            const role = await userRole();
            const response = await fetch(`${apiUrlBack}orderList?page=${page}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any additional headers if required
                },
                body: JSON.stringify({ email: userEmail, role }),
            });
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    // Sort the order history by createdAt in descending order
                    const sortedOrderHistory = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setOrderHistory(sortedOrderHistory);

                } else {
                    setHasMore(false);
                }
            }
        } catch (error) {
            Alert.alert(error.message)
        } finally {
            setLoading(false); // After fetching, set loading to false
            setRefreshing(false); // After fetching or on error, set refreshing to false
        }
    };

    const handleLoadMore = async () => {
        if (!loading && !fetchingMore && hasMore) {
            setFetchingMore(true);
            setPage(prevPage => prevPage + 1);

            try {
                const decodedToken = await decodeToken();
                const userEmail = decodedToken.email;
                const role = await userRole();
                const response = await fetch(`${apiUrlBack}orderList?page=${page + 1}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: userEmail, role }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        setOrderHistory(prevMenu => [...prevMenu, ...data]);
                    } else {
                        setHasMore(false); // No more pages to fetch
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
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => { navigation.navigate("CustomerProfile") }}>
                    <AntDesign name="arrowleft" size={24} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.title}>Order</Text>
            </View>

            {/* Loader */}
            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (orderHistory.length === 0) ? (
                // Render text in center if processingFees and deliveryFees are undefined
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, textAlign: 'center', color: 'black' }}>Oops! Unable to load order history, please try again.</Text>
                </View>
            ) : (
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
                            key={order._id} onPress={() => navigation.navigate("DeliveryOrders", { orderId: order.orderId })}
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
                                            <Text style={styles.statusText}>PREPARING</Text>
                                        </View>
                                        <Text style={styles.restaurant}>Restaurant Name: {order.restaurantName}</Text>
                                        <Text style={styles.status}>Status: {order.status}</Text>
                                        <Text style={styles.price}>Expected earning ₹ {parseFloat(order.deliveryFees) + parseFloat(order.processingFees)}</Text>
                                        {calculateTimeDifference(order.createdAt) && order.status === 'ordered' && (
                                            <Text style={{ textAlign: "center" }}>
                                                You have {calculateTimeDifference(order.createdAt)} to Accept Order
                                            </Text>
                                        )}

                                        {order.status !== 'cancel' && order.status !== 'delivered' && order.status !== 'confirm' ? (
                                            <TouchableOpacity style={styles.acceptButton}>
                                                <Text style={styles.acceptButtonText}>View Details {calculateTimeDifference(order.createdAt)}</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity style={[styles.acceptButton, { backgroundColor: 'darkgray' }]}>
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
    navbar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        elevation: 3,
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
});
