import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Text, Dimensions, Alert } from 'react-native';
import getCurrentLocation from './Location';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { decodeToken } from './LoginToken';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function EditRestaurant() {
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [latitude, setLatitude] = useState("latitude");
    const [longitude, setLongitude] = useState("longitude");
    const [restaurantName, setRestaurantName] = useState('');
    const [selectedCoordinate, setSelectedCoordinate] = useState(null);
    const [accuracy, setAccuracy] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [apiLoading, setApiLoading] = useState(false); // State variable to manage loading state for API request

    useFocusEffect(useCallback(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Call getCurrentLocation to get the current latitude and longitude
                const { latitude, longitude, accuracy } = await getCurrentLocation();

                setLatitude(latitude);
                setLongitude(longitude);
                setAccuracy(accuracy);

            } catch (error) {
                console.error('Error getting current location:', error);
                // You can set default values or handle errors here
            } finally {
                setLoading(false); // Set loading state to false after fetching data
            }
        };

        fetchData(); // Call the fetchData function when the component gains focus

        return () => {
            // Cleanup function if needed
        };
    }, []));
    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                try {
                    const decodedToken = await decodeToken();
                    if (decodedToken) {
                        setUserEmail(decodedToken.email);
                    }

                    // Ensure userEmail is truthy before making the API call
                    if (userEmail) {
                        const response = await fetch(`http://192.168.1.6:5000/restaurantProfileData?email=${userEmail}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });

                        if (!response.ok) {
                            throw new Error('Failed to fetch data');
                        }

                        const data = await response.json();
                        setRestaurantName(data.restaurantName)
                        // setLatitude(data.latitude)
                        // setLongitude(data.longitude)
                        console.log('Data:', data);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };

            fetchData();

            return () => {
                // Cleanup function if needed
            };
        }, [userEmail])
    );

    const handleMapLongPress = (event) => {
        const { coordinate } = event.nativeEvent;
        setSelectedCoordinate(coordinate);
        // Now you can use coordinate.latitude and coordinate.longitude
        console.log('Selected Latitude:', coordinate.latitude);
        console.log('Selected Longitude:', coordinate.longitude);
        // Update the location with the selected latitude and longitude
        setLatitude(coordinate.latitude);
        setLongitude(coordinate.longitude);
    };

    const handleUpdatePress = async () => {
        try {
            // Check if any of the required data is null or undefined
            if (!restaurantName || !latitude || !longitude || !userEmail || !phoneNumber) {
                Alert.alert("Please fill all required data");
                return;
            }

            const decodedToken = await decodeToken();
            if (decodedToken) {
                setUserEmail(decodedToken.email);
            }
            setApiLoading(true); // Set loading state to true when starting the API request
            const response = await fetch('http://192.168.1.6:5000/restaurantProfileEdit', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    restaurantName: restaurantName,
                    latitude: latitude,
                    longitude: longitude,
                    location: "added",
                    email: userEmail,
                    phoneNumber: phoneNumber
                }),
            });

            const data = await response.json();
            if (response.status === 200) {
                Alert.alert(data);
                navigation.navigate("RestaurantDashboard")
            } else {
                Alert.alert(data)
            }
        } catch (error) {
            Alert.alert(error.message); // Display error message instead of undefined data
        } finally {
            setApiLoading(false);
        }
    };



    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>
            </View>
            <Text style={styles.inputTitle}>Restaurant Name</Text>
            <View style={styles.inputTextContainer}>
                <TextInput
                    style={styles.inputText}
                    placeholder='Enter your desired restaurant name'
                    value={restaurantName}
                    onChangeText={text => setRestaurantName(text)}
                />
            </View>
            <Text style={styles.inputTitle}>Phone Number</Text>
            <View style={styles.inputTextContainer}>
                <TextInput
                    style={styles.inputText}
                    placeholder='Enter phone number'
                    value={phoneNumber}
                    keyboardType='numeric'
                    maxLength={10}
                    onChangeText={text => setPhoneNumber(text)}
                />
            </View>
            <Text style={styles.cordinatesTitle}>Latitude</Text>
            <View style={styles.cordinatesContainer}>
                <TextInput
                    style={styles.CordinatesInputText}
                    placeholder='Latitude value'
                    value={String(latitude)}
                    editable={false}
                    onChangeText={text => setLatitude(parseFloat(text))}
                />
            </View>
            <Text style={styles.cordinatesTitle}>Longitude</Text>
            <View style={styles.cordinatesContainer}>
                <TextInput
                    style={styles.CordinatesInputText}
                    placeholder='Longitude value'
                    value={String(longitude)}
                    editable={false}
                    onChangeText={text => setLongitude(parseFloat(text))}
                />
            </View>
            <View style={styles.instructionsContainer}>
                <Feather style={styles.infoIcon} name="info" size={20} color="gray" />
                <Text style={styles.instructionsText}>
                    To select a manual location, zoom or move the map to the desired position, then long press on the map to set the restaurant location.
                </Text>
            </View>
            {loading ? ( // Show loading indicator if loading state is true
                <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
            ) : (
                <>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: latitude,
                            longitude: longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                        mapType="hybrid"
                        onLongPress={handleMapLongPress} // Handle long press on the map
                    >
                        {selectedCoordinate && (
                            <Marker
                                coordinate={selectedCoordinate}
                                title="Selected Location"
                                pinColor="red"
                            />
                        )}
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
                    {accuracy && accuracy > 40 ? (
                        // Show message for inaccurate location
                        <View style={styles.accuracyContainer}>
                            <Icon name="exclamation-triangle" size={20} color="red" />
                            <Text style={styles.lowAccuracyText}>Inaccurate location. Reported accuracy: {accuracy} meters. Select your location manually from the map.</Text>
                        </View>
                    ) : (
                        // Show message for accurate location
                        <Text style={styles.accurateLocationText}>Accurate location. Reported accuracy: {accuracy} meters. Acceptable for restaurant address.</Text>
                    )}
                </>
            )}
            {apiLoading ? ( // Show loading indicator if apiLoading state is true
                <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
            ) : (
                <TouchableOpacity style={styles.button} onPress={handleUpdatePress}>
                    <Text style={styles.buttonText}>Update</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 10,
        marginLeft: 10
    },
    map: {
        width: windowWidth,
        height: windowHeight * 0.4,
    },
    loadingIndicator: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -20 }, { translateY: -20 }],
    },
    inputTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 10,
    },
    inputText: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        padding: 10,
    },
    cordinatesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 10,
    },
    cordinatesTitle: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        padding: 10,
    },
    CordinatesInputText: {
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        padding: 10,
    },
    button: {
        backgroundColor: '#FE5301',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 5,
        margin: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    lowAccuracyText: {
        color: 'red',
        marginLeft: 10,
        marginRight: 10,
    },
    accurateLocationText: {
        color: 'green',
        textAlign: 'center',
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
    },
    accuracyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginLeft: 20,
        marginRight: 20,
    },
    inputTitle: {
        marginHorizontal: 20,
    },
    instructionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 35,
        marginTop: 10,
    },
    instructionsText: {
        flex: 1, // Allow the text to take up remaining space
        textAlign: 'left', // Maintain left alignment
        marginLeft: 10, // Add some margin to the left for spacing
        color: 'gray',
    },
});
