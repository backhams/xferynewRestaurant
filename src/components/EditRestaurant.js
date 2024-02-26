import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator, TextInput } from 'react-native';
import getCurrentLocation from './Location';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';

export default function EditRestaurant() {
    const [loading, setLoading] = useState(true);
    const [latitude, setLatitude] = useState(37.78825);
    const [longitude, setLongitude] = useState(-122.4324);
    const [restaurantName, setRestaurantName] = useState('');
    const [selectedCoordinate, setSelectedCoordinate] = useState(null);

    useFocusEffect(useCallback(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Call getCurrentLocation to get the current latitude and longitude
                const { latitude, longitude } = await getCurrentLocation();

                // Now you can use latitude and longitude here
                setLatitude(latitude);
                setLongitude(longitude);
                console.log('Latitude:', latitude);
                console.log('Longitude:', longitude);

                // Do something with latitude and longitude here...
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

    return (
        <View style={styles.container}>
            <TextInput
                placeholder='Restaurant name'
                value={restaurantName}
                onChangeText={text => setRestaurantName(text)}
            />
            <View style={styles.coordinateInputContainer}>
                <TextInput
                    style={styles.coordinateInput}
                    placeholder='Latitude value'
                    value={String(latitude)}
                    onChangeText={text => setLatitude(parseFloat(text))}
                />
            </View>
            <View style={styles.coordinateInputContainer}>
                <TextInput
                    style={styles.coordinateInput}
                    placeholder='Longitude value'
                    value={String(longitude)}
                    onChangeText={text => setLongitude(parseFloat(text))}
                />
            </View>
            {loading ? ( // Show loading indicator if loading state is true
                <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
            ) : (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: latitude,
                        longitude: longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
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
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        marginTop: 90,
        width: '100%',
        height: '50%'
    },
    loadingIndicator: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -20 }, { translateY: -20 }],
    },
    coordinateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 10,
    },
    coordinateInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        padding: 10,
    },
});
