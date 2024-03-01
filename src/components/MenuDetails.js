import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Image, TextInput, TouchableOpacity, Dimensions, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ModalSpin from './ModalSpin';

export default function MenuDetails() {
    const navigation = useNavigation();
    const { menu } = useRoute().params;

    // Initialize state variables directly from route params
    const [title, setTitle] = useState(menu.title);
    const [initialTitle, setInitialTitle] = useState(menu.title); // Store initial title
    const [price, setPrice] = useState(menu.price.toString());
    const [initialPrice, setInitialPrice] = useState(menu.price.toString()); // Store initial price
    const [comparePrice, setComparePrice] = useState(menu.comparePrice.toString());
    const [initialComparePrice, setInitialComparePrice] = useState(menu.comparePrice.toString()); // Store initial compare price
    const [percentageOff, setPercentageOff] = useState(0); // State to hold the percentage off value
    const [priceError, setPriceError] = useState('');
    const [titleError, setTitleError] = useState('');
    const [comparePriceError, setComparePriceError] = useState('');
    const [loading, setLoading] = useState(false);
    const [responseText, setResponseText] = useState('');

    // Function to calculate percentage off
    const calculatePercentageOff = (priceValue, comparePriceValue) => {
        const priceNum = parseFloat(priceValue);
        const comparePriceNum = parseFloat(comparePriceValue);

        if (comparePriceNum > 0 && priceNum < comparePriceNum) {
            const percentage = ((comparePriceNum - priceNum) / comparePriceNum) * 100;
            setPercentageOff(percentage.toFixed(2)); // Round to 2 decimal places
        } else {
            setPercentageOff(0); // If there's no discount, set to 0
        }
    };

    // Adjusting width based on a single value
    const inputWidth = Dimensions.get('window').width - 80; // Adjust this value as per your need

    // Recalculate percentage off whenever price or compare price changes
    useEffect(() => {
        calculatePercentageOff(price, comparePrice);
    }, [price, comparePrice]);

    // Check if any of the fields has been modified
    const isModified = title !== initialTitle || price !== initialPrice || comparePrice !== initialComparePrice;

    const updateMenu = async () => {
        // Set loading state to true when starting the update process
        setLoading(true);
        // Check if all required fields are present
        if (!title || !price || !comparePrice) {
            setLoading(false);
            Alert.alert(
                'Missing Fields',
                'Please fill in all required fields.',
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                { cancelable: false }
            );
            return;
        }

        // Check title length
        if (title.length > 85) {
            setLoading(false);
            Alert.alert(
                'Title Too Long',
                'Title length cannot exceed 85 characters.',
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                { cancelable: false }
            );
            return;
        }

        // Check price
        if (Number(price) < 90) {
            setLoading(false);
            Alert.alert(
                'Invalid Price',
                'Price must be at least ₹ 90.',
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                { cancelable: false }
            );
            return;
        }

        // Check compare price
        if (Number(comparePrice) < 130) {
            setLoading(false);
            Alert.alert(
                'Invalid Compare Price',
                'Compare Price must be at least ₹ 130.',
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                { cancelable: false }
            );
            return;
        }

        try {
            // Make the API call to update the menu
            const response = await fetch('http://192.168.181.86:5000/updateMenu', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    price,
                    comparePrice,
                    id: menu._id // Provide the ID of the menu you want to update
                }),
            });

            // Check if the request was successful
            if (!response.ok) {
                throw new Error('Failed to update menu');
            } else{
                 // Simulate API call delay
            setResponseText('Data updated successfully.');
            setTimeout(() => {
                setLoading(false);
                setResponseText('');
                navigation.navigate("MenuManager")
            }, 3000);
            }
        } catch (error) {
            Alert.alert(error.message)
            setLoading(false);
        }
    };

    const handleTitleChange = (text) => {
        setTitle(text);
        if (text.length > 85) {
            setTitleError('Title length cannot exceed 85 characters.');
        } else {
            setTitleError('');
        }
    };

    const handlePriceChange = (text) => {
        setPrice(text);
        if (Number(text) < 90) {
            setPriceError('Price must be at least ₹ 90.');
        } else {
            setPriceError('');
        }
    };

    const handleComparePriceChange = (text) => {
        setComparePrice(text);
        if (Number(text) < 90) {
            setComparePriceError('Compare Price must be at least ₹ 130.');
        } else {
            setComparePriceError('');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <AntDesign name="arrowleft" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Edit Menu Details</Text>
                <View style={{ width: 20 }} />
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "padding"}
                style={styles.flex1}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <Image source={{ uri: menu.url }} style={[styles.image, { width: Dimensions.get('window').width - 40 }]} />
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            style={[styles.input, { width: inputWidth }]}
                            value={title}
                            onChangeText={handleTitleChange}
                            placeholder="Enter Title"
                            placeholderTextColor="black"
                            onSubmitEditing={() => { updateMenu() }}
                        />
                        {titleError ? (
                            <Text style={styles.errorText}>{titleError}</Text>
                        ) : null}
                        <Text style={styles.label}>Price ₹</Text>
                        <TextInput
                            style={[styles.input, { width: inputWidth }]}
                            value={price}
                            onChangeText={handlePriceChange}
                            keyboardType="numeric"
                            placeholder="Enter Price"
                            placeholderTextColor="black"
                            onSubmitEditing={() => { updateMenu() }}
                        />
                        {priceError ? (
                            <Text style={styles.errorText}>{priceError}</Text>
                        ) : (
                            <Text style={styles.limitText}>
                                {Number(price) < 90
                                    ? 'Price must be at least ₹ 90.'
                                    : ''}
                            </Text>
                        )}
                        <Text style={styles.label}>Compare Price ₹</Text>
                        <TextInput
                            style={[styles.input, { width: inputWidth }]}
                            value={comparePrice}
                            onChangeText={handleComparePriceChange}
                            keyboardType="numeric"
                            placeholder="Enter Compare Price"
                            placeholderTextColor="black"
                            onSubmitEditing={() => { updateMenu() }}
                        />
                        {comparePriceError ? (
                            <Text style={styles.errorText}>{comparePriceError}</Text>
                        ) : (
                            <Text style={styles.limitText}>
                                {Number(comparePrice) < 130
                                    ? 'Compare Price must be at least ₹ 130.'
                                    : ''}
                            </Text>
                        )}
                        <Text style={styles.label}>Percentage Off</Text>
                        <Text style={styles.input}>{percentageOff}%</Text>
                    </View>
                    <Text style={styles.status}>Status: {menu.status}</Text>
                    <TouchableOpacity onPress={updateMenu} style={[styles.button, { width: Dimensions.get('window').width - 40 }, !isModified && styles.disabledButton]} disabled={!isModified}>
                        <Text style={styles.buttonText}>Update Menu</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
            <ModalSpin loading={loading} loadingText={"Updating"} responseText={responseText} />
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navbar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
        zIndex: 10,
        backgroundColor: "#FE5301"
    },
    navTitle: {
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
        color: 'white',
    },
    content: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        height: 230,
        borderRadius: 10,
        marginBottom: 10, // Adjusted margin from the bottom
    },
    inputContainer: {
        width: '80%',
    },
    label: {
        color: 'black',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        color: 'black',
    },
    status: {
        color: 'black',
        textAlign: 'center',
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#FE5301',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#CCCCCC', // Change color for disabled state
    },
    errorText: {
        color: 'red',
        marginBottom: 5,
    },
    limitText: {
        color: 'red',
        marginBottom: 5,
    },
    flex1: {
        flex: 1,
    },
});
