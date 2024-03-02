import React, { useEffect, useState } from 'react';
import { View, Text, Alert, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { decodeToken } from './LoginToken';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Tooltip from 'react-native-walkthrough-tooltip';
import storage from '@react-native-firebase/storage';
import ModalSpin from './ModalSpin';

export default function MenuManager() {
    const navigation = useNavigation();
    const [menus, setMenus] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [refreshPage, setRefreshPage] = useState(false);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            const getMenus = async () => {
                try {
                    const decodedToken = await decodeToken();
                    if (decodedToken) {
                        const userEmail = decodedToken.email;
                        const response = await fetch(`http://192.168.1.8:5000/fetchMenu?email=${userEmail}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            setMenus(data);
                        } else {
                            // Handle response not ok
                        }
                    } else {
                        Alert.alert("Email not found.");
                    }
                } catch (error) {
                    console.error('Error fetching menus:', error);
                }
            };

            getMenus();

            return () => {
                console.log('MenuManager screen is unfocused');
            };
        }, [refreshPage])
    );

    const sortedMenus = menus.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const deleteMenu = async (menuId) => {
        try {
            setLoading(true);

            const menuToDelete = menus.find(menu => menu._id === menuId);
            if (!menuToDelete) {
                console.error('Menu not found');
                return;
            }

            const menuUrl = menuToDelete.url;

            const storageRef = storage().refFromURL(menuUrl);
            await storageRef.delete();
            console.log('File deleted successfully');

            const response = await fetch(`http://192.168.1.8:5000/deleteMenu?id=${menuId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setRefreshPage(prevState => !prevState);
                const data = await response.json();
                console.log("API call successful:", data);
            } else {
                Alert.alert("Failed to delete");
            }
        } catch (error) {
            console.error("Error deleting menu from Firebase storage:", error);
            Alert.alert("Failed to delete");
        } finally {
            setLoading(false);
        }

        console.log("Menu deleted:", menuId);
    };

    const handleDeleteMenu = (menuId) => {
        Alert.alert(
            "Delete Menu",
            "Are you sure you want to delete this menu?",
            [
                {
                    text: "No",
                    onPress: () => {
                        setSelectedMenu(null);
                        setTooltipVisible(false);
                    },
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => {
                        deleteMenu(menuId);
                        setSelectedMenu(null);
                        setTooltipVisible(false);
                    }
                }
            ]
        );
    };

    const toggleTooltip = (menu) => {
        if (selectedMenu === menu) {
            setSelectedMenu(null);
            setTooltipVisible(false);
        } else {
            setSelectedMenu(menu);
            setTooltipVisible(true);
        }
    };

    const navigateToMenuDetails = (menu) => {
        navigation.navigate('MenuDetails', {
            menu
        });
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={30} color="#000" style={{ marginRight: 10 }} />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Menu Manager ({menus.length})</Text>
            </View>
            <ScrollView style={{ flex: 1 }}>
                <View style={styles.container}>
                    {sortedMenus.map((menu, index) => (
                        <View key={index} style={styles.menuItem}>
                            <TouchableOpacity onPress={() => navigateToMenuDetails(menu)}>
                                <View style={styles.itemContainer}>
                                    <Image source={{ uri: menu.url }} style={styles.image} />
                                    <Text numberOfLines={2} ellipsizeMode="tail" style={styles.title}>{menu.title}</Text>
                                    <Text style={styles.price}>₹{menu.price}</Text>
                                    <Text style={styles.price}>status:{menu.status}</Text>
                                    <Tooltip
                                        isVisible={tooltipVisible && selectedMenu === menu}
                                        content={(
                                            <View style={{ padding: 10 }}>
                                                <TouchableOpacity onPress={() => handleDeleteMenu(menu._id)}>
                                                    <Text style={styles.deleteText}>Delete</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                        placement="top"
                                        onClose={() => {
                                            setSelectedMenu(null);
                                            setTooltipVisible(false);
                                        }}
                                    >
                                        <View style={styles.iconContainer}>
                                            <Icon name="dots-vertical" size={20} color="#000" onPress={() => toggleTooltip(menu)} />
                                        </View>
                                    </Tooltip>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>
            <ModalSpin loading={loading} loadingText={"Deleting"} />
        </View>
    );
}

const styles = StyleSheet.create({
    navbar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 70
    },
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 10,
    },
    menuItem: {
        width: '50%',
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    itemContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        elevation: 1,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 150,
        borderRadius: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        color: "black"
    },
    price: {
        fontSize: 16,
        marginTop: 5,
        color: "black"
    },
    iconContainer: {
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
    deleteText: {
        color: 'red',
        fontSize: 16,
    },
});
