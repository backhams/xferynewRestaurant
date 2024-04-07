import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    Linking,
    Dimensions,
    Animated,
    Easing,
    Alert,
    Modal,
    TextInput,
    Image
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MapView, { Marker } from 'react-native-maps';
import { getCurrentLocation } from './Location';
import { calculateDistance } from './DistanceCalculator';
import { API_URL } from '@env';
import ModalSpin from './ModalSpin';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function DeliveryOrders({ navigation, route }) {
    const apiUrlBack = API_URL;
    const [animatedValue] = useState(new Animated.Value(0));
    const { orderId } = route.params;
    const scrollViewRef = useRef(null);
    const [orderData, setOrderData] = useState();
    const [loading, setLoading] = useState(true);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [showScrollIndicator, setShowScrollIndicator] = useState(true);
    const [eventHandlerLoader, setEventHandlerLoader] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [responseText, setResponseText] = useState('');
    const [reloadTrack, setReloadTrack] = useState(false);
    const [otp1, setOtp1] = useState('');
    const [otp2, setOtp2] = useState('');
    const [otp3, setOtp3] = useState('');
    const [otp4, setOtp4] = useState('');
    const otp1Ref = useRef(null);
    const otp2Ref = useRef(null);
    const otp3Ref = useRef(null);
    const otp4Ref = useRef(null);

    useEffect(() => {
        setLoading(true)
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
                    setReloadTrack(false)
                }
            } catch (error) {
                setLoading(false);
                setReloadTrack(false)
            }
        };

        fetchOrderData();
    }, [reloadTrack]);

    useEffect(() => {
        // Start twinkling animation if showScrollIndicator is true
        if (showScrollIndicator) {
            twinklingAnimation();
        } else {
            // Stop animation if showScrollIndicator becomes false
            animatedValue.setValue(0);
        }
    }, [showScrollIndicator]);

    const twinklingAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    };

    const Pickup = orderData && orderData.restaurantLatitude && orderData.restaurantLongitude && latitude && longitude
        ? calculateDistance(orderData.restaurantLatitude, orderData.restaurantLongitude, latitude, longitude)
        : { distance: 'N/A', unit: '' };

    const { distance: pickupDistance, unit: pickupUnit } = Pickup;

    const Drop = orderData && orderData.customerLatitude && orderData.customerLongitude && latitude && longitude
        ? calculateDistance(orderData.customerLatitude, orderData.customerLongitude, latitude, longitude)
        : { distance: 'N/A', unit: '' };

    const { distance: dropDistance, unit: dropUnit } = Drop;

    const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        if (offsetY > 0) {
            setShowScrollIndicator(false);
        } else {
            setShowScrollIndicator(true);
        }
    };

    const scrollToBottom = () => {
        if (scrollViewRef.current) {
            const { height } = Dimensions.get('window');
            scrollViewRef.current.scrollTo({ x: 0, y: height, animated: true });
        }
    };

    // accept order function 
    const orderEventHandler = async (event, otp) => {
        try {
            setEventHandlerLoader(true)
            const response = await fetch(`${apiUrlBack}deliveryOrderHandler`, {
                method: 'PATCH',
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ event, orderId: orderData.orderId, otp }),
            });
            const data = await response.json();
            console.log(data);
            if (response.ok) {
                setResponseText(event)
                setTimeout(() => {
                    setEventHandlerLoader(false)
                    setResponseText("")
                    setReloadTrack(true)
                    setShowModal(false)
                    setOtp1('');
                    setOtp2('');
                    setOtp3('');
                    setOtp4('');

                }, 3000)
            } else {
                Alert.alert(data.error);
                setEventHandlerLoader(false)
            }

        } catch (error) {
            Alert.alert(error.message)
            console.log(error)
        }
    }

    const handleModalClose = () => {
        setShowModal(false);
        setOtp1('');
        setOtp2('');
        setOtp3('');
        setOtp4('');
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
                <View style={styles.centeredText}>
                    <Text style={styles.errorText}>
                        Oops! Unable to load order info, please try again.
                    </Text>
                </View>
            ) : orderData.status === "delivered" ? (
                <>
                    <View style={styles.deliveredUi}>
                        <Text style={styles.congratulationsText}>Congratulations!</Text>
                        <Text style={styles.description}>You have successfully delivered this order. Thanks for your efforts in ensuring timely service and customer satisfaction. Well done!</Text>
                        <MaterialIcons name="verified" size={100} color="green" style={{ alignSelf: 'center' }} />
                        <View style={styles.earningsContainer}>
                            <Text style={styles.earningsText}>Earnings: ₹ {parseFloat(orderData.deliveryFees) + parseFloat(orderData.processingFees)}</Text>
                            <Text style={styles.distanceText}>Distance Traveled: {pickupDistance + dropDistance} {pickupUnit}</Text>
                        </View>
                        <TouchableOpacity style={styles.nextOrderButton} onPress={() => { navigation.replace('DeliveryOrderList') }}>
                            <Text style={styles.buttonText}>Take Next Order</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate('DeliveryOrderList');
                            }}
                            style={styles.backButton}>
                            <AntDesign
                                name="arrowleft"
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={styles.scrollContentContainer}
                        showsVerticalScrollIndicator={false}
                        onScroll={handleScroll}
                    >
                        <View style={styles.orderInfoSection}>
                            <Text style={styles.orderInfoTitle}>Order Information</Text>
                            <View style={styles.orderId}>
                                <Text style={styles.label}>ID:</Text>
                                <Text>{orderData.orderId}</Text>
                            </View>
                        </View>
                        <View style={styles.mapContainer}>
                            <View style={styles.mapWrapper}>
                                <Image
                                    source={{ uri: orderData.url }}
                                    style={styles.map}
                                />
                                {/* <MapView
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
                                </MapView> */}
                            </View>
                        </View>
                        <Text style={styles.sectionTitle}>New Order</Text>
                        <View style={styles.earningContainer}>
                            <Text style={styles.earningText}>Expected Earning: ₹ {parseFloat(orderData.deliveryFees) + parseFloat(orderData.processingFees)}</Text>
                            <View style={styles.distanceContainer}>
                                <View style={[styles.distanceSubview, styles.leftBorder]}>
                                    <Text>Pickup: {pickupDistance}{pickupUnit}</Text>
                                </View>
                                <View style={styles.distanceSubview}>
                                    <Text>Drop: {dropDistance}{dropUnit}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.orderDetailsContainer}>
                            {orderData.status === "preparing" && orderData.assignStatus === "yet to assign" && (
                                <View style={styles.locationButtonContainer}>
                                    <TouchableOpacity
                                        style={styles.locationButton}
                                        onPress={() => {
                                            const restaurantCoords = `${orderData.restaurantLatitude},${orderData.restaurantLongitude}`;
                                            const userCoords = `${latitude},${longitude}`;
                                            const url = `https://www.google.com/maps/dir/?api=1&origin=${userCoords}&destination=${restaurantCoords}`;
                                            Linking.openURL(url);
                                        }}
                                    >
                                        <Text style={styles.buttonText}>Pickup Location</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {orderData.status === "preparing" && orderData.assignStatus === "assign" && (
                                <>
                                    <View style={styles.callButtonsContainer}>
                                        <TouchableOpacity
                                            style={styles.callButton}
                                            onPress={() => {
                                                Linking.openURL(`tel:${orderData.restaurantNumber}`);
                                            }}
                                        >
                                            <Text style={styles.buttonText}>Call Restaurant</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.paymentSection}>
                                        <Text style={styles.paymentLabel}>Payment to be collected:</Text>
                                        <Text style={styles.paymentValue}>₹{parseFloat(orderData.price) + parseFloat(orderData.deliveryFees) + parseFloat(orderData.processingFees)}</Text>
                                    </View>
                                    <View style={styles.paymentSection}>
                                        <Text style={styles.paymentLabel}>Payment to pay restaurant:</Text>
                                        <Text style={styles.paymentValue}>₹{parseFloat(orderData.price)}</Text>
                                    </View>
                                    <View style={styles.locationButtonContainer}>
                                        <TouchableOpacity
                                            style={styles.locationButton}
                                            onPress={() => {
                                                const restaurantCoords = `${orderData.restaurantLatitude},${orderData.restaurantLongitude}`;
                                                const userCoords = `${latitude},${longitude}`;
                                                const url = `https://www.google.com/maps/dir/?api=1&origin=${userCoords}&destination=${restaurantCoords}`;
                                                Linking.openURL(url);
                                            }}
                                        >
                                            <Text style={styles.buttonText}>Pickup Location</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}

                            {orderData.status === "pick up" && (
                                <>
                                    <View style={styles.callButtonsContainer}>
                                        <TouchableOpacity
                                            style={styles.callButton}
                                            onPress={() => {
                                                Linking.openURL(`tel:${orderData.customerNumber}`);
                                            }}
                                        >
                                            <Text style={styles.buttonText}>Call Customer</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.callButton}
                                            onPress={() => {
                                                Linking.openURL(`tel:${orderData.restaurantNumber}`);
                                            }}
                                        >
                                            <Text style={styles.buttonText}>Call Restaurant</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.paymentSection}>
                                        <Text style={styles.paymentLabel}>Payment to be collected:</Text>
                                        <Text style={styles.paymentValue}>₹{parseFloat(orderData.price) + parseFloat(orderData.deliveryFees) + parseFloat(orderData.processingFees)}</Text>
                                    </View>
                                    <View style={styles.paymentSection}>
                                        <Text style={styles.paymentLabel}>Payment to pay restaurant:</Text>
                                        <Text style={styles.paymentValue}>₹{parseFloat(orderData.price)}</Text>
                                    </View>
                                    <View style={styles.locationButtonContainer}>
                                        <TouchableOpacity
                                            style={styles.locationButton}
                                            onPress={() => {
                                                const restaurantCoords = `${orderData.restaurantLatitude},${orderData.restaurantLongitude}`;
                                                const userCoords = `${latitude},${longitude}`;
                                                const url = `https://www.google.com/maps/dir/?api=1&origin=${userCoords}&destination=${restaurantCoords}`;
                                                Linking.openURL(url);
                                            }}
                                        >
                                            <Text style={styles.buttonText}>Pickup Location</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.locationButton}
                                            onPress={() => {
                                                const dropCoords = `${orderData.customerLatitude},${orderData.customerLongitude}`;
                                                const userCoords = `${latitude},${longitude}`;
                                                const url = `https://www.google.com/maps/dir/?api=1&origin=${userCoords}&destination=${dropCoords}`;
                                                Linking.openURL(url);
                                            }}
                                        >
                                            <Text style={styles.buttonText}>Drop Location</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}

                        </View>
                    </ScrollView>
                    {/* Render animated arrow button if showScrollIndicator is true */}
                    {showScrollIndicator && (
                        <Animated.View
                            style={[
                                styles.arrowButton,
                                {
                                    opacity: animatedValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.5, 1],
                                    }),
                                    transform: [
                                        {
                                            translateY: animatedValue.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [-5, 5],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <TouchableOpacity
                                onPress={scrollToBottom}
                            >
                                <AntDesign name="downcircleo" size={24} color="black" />
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                    {orderData.status === "preparing" && orderData.assignStatus === "yet to assign" && (
                        <TouchableOpacity style={styles.acceptButton} onPress={() => { orderEventHandler("accept") }}>
                            <Text style={styles.buttonText}>Accept</Text>
                        </TouchableOpacity>
                    )}

                    {orderData.status === "preparing" && orderData.assignStatus === "assign" && (
                        <TouchableOpacity style={styles.acceptButton} onPress={() => { setShowModal(true) }}>
                            <Text style={styles.buttonText}>pick up</Text>
                        </TouchableOpacity>
                    )}

                    {orderData.status === "pick up" && orderData.assignStatus === "assign" && (
                        <TouchableOpacity style={styles.acceptButton} onPress={() => { setShowModal(true) }}>
                            <Text style={styles.buttonText}>delivered</Text>
                        </TouchableOpacity>
                    )}

                    {/* OTP Modal */}
                    <Modal
                        visible={showModal}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={handleModalClose}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <TouchableOpacity style={styles.closeButton} onPress={handleModalClose}>
                                    <AntDesign name="close" size={24} color="black" />
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>Enter Your OTP</Text>
                                {orderData.status === "preparing" && orderData.assignStatus === "assign" && (
                                    <Text style={styles.modalDescription}>Please provide the OTP sent from the restaurant:</Text>
                                )}
                                {orderData.status === "pick up" && orderData.assignStatus === "assign" && (
                                    <Text style={styles.modalDescription}>Please provide the OTP sent from the customer:</Text>
                                )}
                                <View style={styles.otpContainer}>
                                    <TextInput
                                        ref={otp1Ref}
                                        style={styles.otpInput}
                                        keyboardType="numeric"
                                        onChangeText={(text) => {
                                            setOtp1(text);
                                            if (text.length === 1) {
                                                otp2Ref.current.focus();
                                            }
                                        }}
                                        value={otp1}
                                        maxLength={1}
                                    />
                                    <TextInput
                                        ref={otp2Ref}
                                        style={styles.otpInput}
                                        keyboardType="numeric"
                                        onChangeText={(text) => {
                                            setOtp2(text);
                                            if (text.length === 0) {
                                                otp1Ref.current.focus();
                                            } else if (text.length === 1) {
                                                otp3Ref.current.focus();
                                            }
                                        }}
                                        value={otp2}
                                        maxLength={1}
                                    />
                                    <TextInput
                                        ref={otp3Ref}
                                        style={styles.otpInput}
                                        keyboardType="numeric"
                                        onChangeText={(text) => {
                                            setOtp3(text);
                                            if (text.length === 0) {
                                                otp2Ref.current.focus();
                                            } else if (text.length === 1) {
                                                otp4Ref.current.focus();
                                            }
                                        }}
                                        value={otp3}
                                        maxLength={1}
                                    />
                                    <TextInput
                                        ref={otp4Ref}
                                        style={styles.otpInput}
                                        keyboardType="numeric"
                                        onChangeText={(text) => {
                                            setOtp4(text);
                                            if (text.length === 0) {
                                                otp3Ref.current.focus();
                                            }
                                        }}
                                        value={otp4}
                                        maxLength={1}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={() => {
                                        let event;
                                        if (orderData.status === "preparing" && orderData.assignStatus === "assign") {
                                            event = "pick up";
                                        } else if (orderData.status === "pick up" && orderData.assignStatus === "assign") {
                                            event = "delivered";
                                        }
                                        orderEventHandler(event, otp1 + otp2 + otp3 + otp4);
                                    }}
                                >
                                    <Text style={styles.buttonText}>Submit OTP</Text>
                                </TouchableOpacity>

                            </View>
                        </View>
                    </Modal>
                </>
            )}
            <ModalSpin loading={eventHandlerLoader} loadingText={"Processing"} responseText={responseText} />
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
    centeredText: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
        color: 'black',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    backButton: {
        padding: 5,
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
    label: {
        color: '#FE5301',
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
    sectionTitle: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 15,
    },
    earningContainer: {
        marginTop: 30,
        borderWidth: 1,
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    earningText: {
        textAlign: "center",
        marginBottom: 15,
        fontSize: 18,
    },
    distanceContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    distanceSubview: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
    },
    leftBorder: {
        borderRightWidth: 1,
    },
    orderDetailsContainer: {
        marginTop: 30,
        borderWidth: 1,
        padding: 10,
    },
    callButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    callButton: {
        backgroundColor: '#2c3e50', // Change background color
        padding: 15, // Increase padding for better touch area
        borderRadius: 10, // Round corners
        marginBottom: 10,
        alignItems: 'center', // Center text horizontally
    },
    paymentSection: {
        flexDirection: 'column', // Change to column layout
        marginBottom: 20, // Increase margin bottom for better separation
    },
    paymentLabel: {
        fontWeight: 'bold',
        fontSize: 18, // Increase font size
        marginBottom: 5, // Add margin bottom for spacing
    },
    paymentValue: {
        fontSize: 16, // Adjust font size
    },
    locationButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: 10,
        marginTop: 10,
    },
    locationButton: {
        backgroundColor: "orange",
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        textAlign: "center",
        color: "white",
        fontSize: 16, // Adjust font size
        fontWeight: 'bold', // Add bold font weight
    },
    acceptButton: {
        backgroundColor: "green",
        padding: 15,
        borderRadius: 10,
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
    },
    scrollContentContainer: {
        paddingBottom: 100,
    },
    arrowButton: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        backgroundColor: 'rgba(144, 238, 144, 0.5)',
        borderRadius: 30,
        padding: 10,
        elevation: 2,
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
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalDescription: {
        textAlign: 'center',
        marginBottom: 20,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    otpInput: {
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        borderRadius: 5,
        width: '20%',
        textAlign: 'center',
    },
    modalButton: {
        backgroundColor: 'green',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
    },
    modalButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    deliveredUi: {
        // backgroundColor:"red",
        marginVertical: "50%"
    },
    congratulationsText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    description: {
        textAlign: "center",
        marginBottom: 20,
        fontWeight: "500"
    },
    earningsContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    earningsText: {
        fontSize: 18,
        marginBottom: 10,
    },
    distanceText: {
        fontSize: 16,
        color: '#666',
    },
    nextOrderButton: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 50,
        marginTop: 20,
        alignItems: 'center',
    },
});
