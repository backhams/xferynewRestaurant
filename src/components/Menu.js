import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Dimensions, Image, Alert,FlatList } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { decodeToken, userRole } from './LoginToken';
import BottomMenu from './BottomMenu';
import getCurrentLocation, { clearLiveLocation } from './Location';

const MenuPage = () => {
  const [searchVisible, setSearchVisible] = useState(false);
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState({ name: '', email: '', role: '' });
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [page, setPage] = useState(1);
  const [menu, setMenu] = useState([]);

  useFocusEffect(() => {
    const fetchData = async () => {
      try {
        // Call getCurrentLocation to get the current latitude and longitude
        const { latitude, longitude } = await getCurrentLocation();

        // Now you can use latitude and longitude here
        setLatitude(latitude)
        setLongitude(longitude)
        console.log('Latitude:', latitude);
        console.log('Longitude:', longitude);

        // Do something with latitude and longitude here...
      } catch (error) {
        console.error('Error getting current location:', error);
      }
    };

    fetchData(); // Call the fetchData function when the component gains focus

    return () => {
      // Cleanup function if needed
    };
  });

  useEffect(() => {
    const fetchData = async () => {
      const decodedToken = await decodeToken();
      if (decodedToken) {
        // Calling userRole function to get the role value
        const role = await userRole();
        setUserInfo({ name: decodedToken.name, email: decodedToken.email, role: role });
      }
    };

    fetchData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
        const fetchMenu = async () => {
            try {
              
                    const response = await fetch(`http://192.168.181.86:5000/nearbySearch?page=${page}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    if(response.ok){

                      const data = await response.json();
                      setMenu(data);
                      console.log(data)
                    } else{
                      Alert.alert("failed")
                    }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchMenu();

        return () => {
            // Cleanup function if needed
        };
    }, [])
);


const renderItem = ({ item }) => (
  <View style={styles.menuItem}>
    <Image source={{ uri: item.url }} style={styles.menuItemImage} />
    <Text style={styles.menuItemTitle}>{item.title}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={styles.menuItemPrice}>{item.price}</Text>
      <Text style={styles.menuItemRestaurant}>{item.restaurantName}</Text>
    </View>
  </View>
);

  return (
    <View style={styles.container}>
      {/* Top Navbar */}
      <Text style={{ color: "gray" }}>GOOD FOOD GOOD HEALTH</Text>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ color: "black", fontSize: 25, fontWeight: "bold", marginTop: 10 }}>Xfery Food</Text>
        <Text style={{ color: "black" }}>Hi, Backham</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: 'wrap', marginTop: 10 }}>
        <View style={{
          flex: 1, // Take up remaining space
          color: "black",
          backgroundColor: "#DDDDDD",
          marginRight: 10,
          borderRadius: 10,
          flexDirection: "row",
          alignItems: "center"
        }}>
          <EvilIcons style={{ marginLeft: 15 }} color="black" name="search" size={25} />
          <TextInput
            style={{
              marginHorizontal: 0,
              color: "black"
            }}
            placeholderTextColor={"gray"}
            placeholder='Search by menu or Restaurant'
          />
        </View>
        <TouchableOpacity style={styles.button}>
          <View style={{ marginHorizontal: 30 }}>
            <Text>Search</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* sponsored section */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ color: "black", fontWeight: "700" }}>sponsored</Text>
        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <Image
            source={{ uri: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/burger-food-banner-template-design-66bfd460d3a4b90f273ba25ec12bec6d_screen.jpg?ts=1698822899' }}
            style={{ width: 370, height: 200, borderRadius: 10 }}
          />
        </View>
      </View>

      {/* Categories section */}
      <View style={{ marginTop: 20}}>
        <Text style={{ color: "black", fontWeight: "700" }}>Categories</Text>
        <View style={{flexDirection:"row",justifyContent:"space-evenly",marginTop:10}}>
        <Image
            source={{ uri: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/burger-food-banner-template-design-66bfd460d3a4b90f273ba25ec12bec6d_screen.jpg?ts=1698822899' }}
            style={{ width: 70, height: 70, borderRadius:100 }}
          />
        <Image
            source={{ uri: 'https://wallpapersmug.com/download/1600x900/b67e3e/pizza-slices-food.jpg' }}
            style={{ width: 70, height: 70, borderRadius:100 }}
          />
        <Image
            source={{ uri: 'https://as1.ftcdn.net/v2/jpg/06/70/83/54/1000_F_670835408_sq2wwLy7SdxSmDbpo7SFrAA39E5Pqsp6.jpg' }}
            style={{ width: 70, height: 70, borderRadius:100 }}
          />
        <Image
            source={{ uri: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/burger-food-banner-template-design-66bfd460d3a4b90f273ba25ec12bec6d_screen.jpg?ts=1698822899' }}
            style={{ width: 70, height: 70, borderRadius:100 }}
          />
        </View>
        <View style={{flexDirection:"row",justifyContent:"space-evenly",marginTop:10}}>
          <Text style={{color:"black"}}>Burger</Text>
          <Text style={{color:"black"}}>Pizza</Text>
          <Text style={{color:"black"}}>Chow</Text>
          <Text style={{color:"black"}}>Momos</Text>
        </View>
      </View>


      {/* menu section */}
      <FlatList
        data={menu}
        renderItem={renderItem}
        keyExtractor={(item, index) => item._id.toString()} // assuming you have unique IDs for menu items
      />

      {/* Bottom Navigation Buttons */}
      <BottomMenu />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
    marginHorizontal: 10
  },
  button: {
    backgroundColor: "#FE5301",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15
  },
  menuItem: {
    marginBottom: 20,
  },
  menuItemImage: {
    width: 370, // Adjust according to your design
    height: 200, // Adjust according to your design
    borderRadius: 10,
  },
  menuItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  menuItemRestaurant: {
    fontSize: 14,
    color: 'gray',
  },
});


export default MenuPage;
