import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { decodeToken, userRole } from './LoginToken';
import { useNavigation } from '@react-navigation/native';

const SideMenuModal = ({ visible, onClose }) => {
    const [userData, setUserData] = useState();
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserData = async () => {
            const decodedToken = await decodeToken();
            setUserData(decodedToken);
        }
        fetchUserData();
    }, []);

    // Function to close the menu
    const closeMenu = () => {
        onClose();
    };

    // Function to navigate to the delivery profile and close the menu
    const goToDeliveryProfile = () => {
        if (userData && userData.email) {
            navigation.navigate('DeliveryProfile', { email: userData.email });
            closeMenu(); // Close the menu after navigation
        }
    };

    // Event listener to close the menu when navigating
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            // Close the menu before navigating
            closeMenu();
        });

        return unsubscribe;
    }, [navigation]);
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.menuContainer}>
                    {userData && (
                        <View style={styles.userInfoContainer}>
                            {userData.picture && (
                                <Image source={{ uri: userData.picture }} style={styles.userPhoto} />
                            )}
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>@{userData.name}</Text>
                                <Text style={styles.userEmail}>{userData.email}</Text>
                            </View>
                        </View>
                    )}
                    <TouchableOpacity style={styles.menuItem}  onPress={goToDeliveryProfile}>
                        <Icon name="user" size={20} color="black" />
                        <Text style={styles.menuText}>Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => console.log('Delivery Zone')}>
                        <Icon name="map-marker" size={20} color="black" />
                        <Text style={styles.menuText}>Delivery Zone</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => console.log('Payment')}>
                        <Icon name="credit-card" size={20} color="black" />
                        <Text style={styles.menuText}>Payment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => console.log('Report Bugs')}>
                        <Icon name="bug" size={20} color="black" />
                        <Text style={styles.menuText}>Report Bugs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => console.log('Contact Support')}>
                        <Icon name="phone" size={20} color="black" />
                        <Text style={styles.menuText}>Contact Support</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => console.log('Terms and Conditions')}>
                        <Icon name="file-text" size={20} color="black" />
                        <Text style={styles.menuText}>Terms and Conditions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => console.log('Privacy Policy')}>
                        <Icon name="shield" size={20} color="black" />
                        <Text style={styles.menuText}>Privacy Policy</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={() => console.log('Logout')}>
                    <Icon name="sign-out" size={20} color="red" />
                    <Text style={[styles.menuText, { color: 'red' }]}>Logout</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={{ color: 'white' }}>Close</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuContainer: {
        backgroundColor: 'white',
        width: 250, // Adjust width as needed
        padding: 20,
    },
    userInfoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    userInfo: {
        marginLeft: 10,
    },
    userPhoto: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
    userEmail: {
        fontSize: 14,
        color: 'gray',
        textAlign: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    menuText: {
        marginLeft: 10,
    },
    logoutButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    closeButton: {
        backgroundColor: 'blue',
        alignItems: 'center',
        justifyContent: 'center',
        width: 50, // Adjust width as needed
        position: 'absolute',
        bottom: 20,
        right: 20,
    },
});

export default SideMenuModal;
