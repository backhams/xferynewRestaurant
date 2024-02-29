import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Image, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function MenuDetails() {
    const navigation = useNavigation();
    const { menu } = useRoute().params;
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [comparePrice, setComparePrice] = useState('');
    const [percentageOff, setPercentageOff] = useState(0); // State to hold the percentage off value

    useEffect(() => {
        // Set default values when the component mounts
        setTitle(menu.title);
        setPrice(menu.price.toString());
        setComparePrice(menu.comparePrice.toString());

        calculatePercentageOff(price, comparePrice);
    }, [menu, price, comparePrice]);

    const calculatePercentageOff = (priceValue, comparePriceValue) => {
        const priceNum = parseFloat(priceValue);
        const comparePriceNum = parseFloat(comparePriceValue);

        if (comparePriceNum > 0 && priceNum < comparePriceNum) {
            const percentage = ((comparePriceNum - priceNum) / comparePriceNum) * 100;
            setPercentageOff(percentage.toFixed(2)); // Fix to 2 decimal places
        } else {
            setPercentageOff(0); // If there's no discount, set to 0
        }
    };

    // Adjusting width based on a single value
    const inputWidth = Dimensions.get('window').width - 80; // Adjust this value as per your need

    return (
        <View style={styles.container}>
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={20} color="black" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Menu Details</Text>
                <View style={{ width: 20 }} />
            </View>
            <View style={styles.content}>
                <Image source={{ uri: menu.url }} style={[styles.image, { width: Dimensions.get('window').width - 40 }]} />
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Title</Text>
                    <TextInput
                        style={[styles.input, { width: inputWidth }]}
                        value={title}
                        onChangeText={text => setTitle(text)}
                        placeholder="Enter Title"
                        placeholderTextColor="black"
                    />
                    <Text style={styles.label}>Price ₹</Text>
                    <TextInput
                        style={[styles.input, { width: inputWidth }]}
                        value={price}
                        onChangeText={text => setPrice(text)}
                        keyboardType="numeric"
                        placeholder="Enter Price"
                        placeholderTextColor="black"
                    />
                    <Text style={styles.label}>Compare Price ₹</Text>
                    <TextInput
                        style={[styles.input, { width: inputWidth }]}
                        value={comparePrice}
                        onChangeText={text => setComparePrice(text)}
                        keyboardType="numeric"
                        placeholder="Enter Compare Price"
                        placeholderTextColor="black"
                    />
                    <Text style={styles.label}>Percentage Off</Text>
                    <Text style={styles.input}>{percentageOff}%</Text>
                </View>
                <Text style={styles.status}>Status: {menu.status}</Text>
                <TouchableOpacity style={[styles.button, { width: Dimensions.get('window').width - 40 }]}>
                    <Text style={styles.buttonText}>Update Menu</Text>
                </TouchableOpacity>
            </View>
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
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
    },
    navTitle: {
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
        color: 'black',
    },
    content: {
        flex: 1,
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
});
