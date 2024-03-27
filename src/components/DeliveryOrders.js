import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MapView, { Marker } from 'react-native-maps';
import { getCurrentLocation } from './Location';
import { calculateDistance } from './DistanceCalculator';
import {API_HOST} from '@env';

export default function DeliveryOrders({ navigation, route }) {
    const apiUrlBack = API_HOST;
    const { orderId } = route.params;

    const [orderData, setOrderData] = useState();
    const [loading, setLoading] = useState(true);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                const { latitude, longitude } = await getCurrentLocation();
                setLatitude(latitude);
                setLongitude(longitude);
                const response = await fetch(
                    `${apiUrlBack}orderInformation/${orderId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                );
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


    const Pickup = orderData && orderData.restaurantLatitude && orderData.restaurantLongitude && latitude && longitude
        ? calculateDistance(orderData.restaurantLatitude, orderData.restaurantLongitude, latitude, longitude)
        : { distance: 'N/A', unit: '' }; // Set default values if data is not available

    const { distance: pickupDistance, unit: pickupUnit } = Pickup;

    const Drop = orderData && orderData.customerLatitude && orderData.customerLongitude && latitude && longitude
        ? calculateDistance(orderData.customerLatitude, orderData.customerLongitude, latitude, longitude)
        : { distance: 'N/A', unit: '' }; // Set default values if data is not available

    const { distance: dropDistance, unit: dropUnit } = Drop;


    // Function to format the date with short month names
    const formatDate = createdAt => {
        const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        const date = new Date(createdAt);
        const monthIndex = date.getMonth();
        const day = date.getDate();
        const year = date.getFullYear();
        return `${monthNames[monthIndex]} ${day}, ${year}`;
    };

    // Function to format the time
    const formatTime = createdAt => {
        const date = new Date(createdAt);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        return `${formattedHours}:${formattedMinutes}${ampm}`;
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator
                    style={styles.loadingIndicator}
                    size="large"
                    color="#0000ff"
                />
            ) : orderData === undefined ? (
                // Render text in center if processingFees and deliveryFees are undefined
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, textAlign: 'center', color: 'black' }}>
                        Oops! Unable to load order info, please try again.
                    </Text>
                </View>
            ) : (
                <>
                    {/* Back arrow icon */}
                    <View style={styles.buttonContainer}>
                        <AntDesign
                            onPress={() => {
                                navigation.navigate('Menu');
                            }}
                            name="arrowleft"
                            size={24}
                            color="black"
                            style={styles.backIcon}
                        />
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
                    <View style={styles.mapContainer}>
                        <View style={styles.mapWrapper}>
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: orderData.customerLatitude,
                                    longitude: orderData.customerLongitude,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                }}
                                showsPointsOfInterest={true}>
                                <Marker
                                    coordinate={{
                                        latitude: orderData.customerLatitude,
                                        longitude: orderData.customerLongitude,
                                    }}
                                    title="You"
                                    description="Your current location"
                                    pinColor="red"
                                />
                            </MapView>
                        </View>
                    </View>
                    <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 20 }}>
                        New Order
                    </Text>
                    <View style={styles.earningContainer}>
                        <Text style={{ textAlign: "center", marginBottom: 15, marginTop: 15 }}>Expected Earning: ₹ {parseFloat(orderData.deliveryFees) + parseFloat(orderData.processingFees)}</Text>
                        <View style={{ flexDirection: "row" }}>
                            <View style={[styles.earningSubview, { width: Dimensions.get("window").width / 2 - 20, borderWidth: 1 }]}>
                                <Text>Pickup: {pickupDistance}{pickupUnit}</Text>
                            </View>
                            <View style={[styles.earningSubview, { width: Dimensions.get("window").width / 2 - 20, borderWidth: 1 }]}>
                                <Text>Drop: {dropDistance}{dropUnit}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.orderDetailsContainer}>
                        <Text>Customer Number: +91 {orderData.customerNumber}</Text>
                        <Text>Restaurant Number: +91 {orderData.restaurantNumber}</Text>
                        <Text>Payment to be collected: ₹{parseFloat(orderData.price)+parseFloat(orderData.deliveryFees) + parseFloat(orderData.processingFees)}</Text>
                        <Text>Payment to pay restaurant: ₹{parseFloat(orderData.price)}</Text>
                        <View style={{flexDirection:"row",justifyContent:"space-between",marginHorizontal:10}}>
                        <TouchableOpacity style={styles.locationButton}>
                            <Text>Pickup Location</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.locationButton}>
                            <Text>Drop Location</Text>
                        </TouchableOpacity>
                        </View>
                    </View>

                </>
            )}
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
    backIcon: {
        // Your back button styles
    },
    orderInfoSection: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderInfoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    orderId: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    mapContainer: {
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapWrapper: {
        borderRadius: Dimensions.get('screen').width / 2,
        overflow: 'hidden',
        width: Dimensions.get('screen').width - 200,
        height: Dimensions.get('screen').width - 200,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    earningContainer: {
        marginTop: 30,
        borderWidth: 1,
        height: Dimensions.get('window').height - 700,
    },
    earningSubview: {
        height: Dimensions.get('window').height - 750,
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center"
    },
    orderDetailsContainer: {
        marginTop: 30,
        borderWidth: 1,
        height: Dimensions.get('window').height - 650,
    },
    locationButton: {
        backgroundColor:"orange"
    }

});

