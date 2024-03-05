import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, Alert, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { decodeToken, userRole } from './LoginToken';
import BottomMenu from './BottomMenu';
import getCurrentLocation from './Location';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
import LinearGradient from 'react-native-linear-gradient'
const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)

const MenuPage = () => {
  const [searchVisible, setSearchVisible] = useState(false);
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState({ name: '', email: '', role: '' });
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [page, setPage] = useState(1);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [errorType, setErrorType] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const { latitude, longitude } = await getCurrentLocation();
  //       setLatitude(latitude);
  //       setLongitude(longitude);
  //       console.log('Latitude:', latitude);
  //       console.log('Longitude:', longitude);
  //     } catch (error) {
  //       console.error('Error getting current location:', error);
  //     }
  //   };

  //   fetchData();

  //   return () => {
  //     // Cleanup function if needed
  //   };
  // }, []);


  const fetchData = async () => {
    try {
      const { latitude, longitude } = await getCurrentLocation();
      setLatitude(latitude);
      setLongitude(longitude);
      console.log('Latitude:', latitude);
      console.log('Longitude:', longitude);
      const decodedToken = await decodeToken();
      if (decodedToken && latitude && longitude) {

        const role = await userRole();
        setUserInfo({ name: decodedToken.name, email: decodedToken.email, role: role });
      }

      setLoading(true);

      const response = await fetch(`http://192.168.1.6:5000/nearbySearch?page=${page}&latitude=${latitude}&longitude=${longitude}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setMenu(data);
        } else {
          setHasMore(false); // No more pages to fetch
        }
      } else {
        setMenu("no response");
      }
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        setErrorType('network');
      } else {
        setErrorType('server');
      }
      Alert.alert(error.message)
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  useEffect(() => {

    fetchData();

    return () => {
      // Cleanup function if needed
    };
  }, []);



  const handleLoadMore = async () => {
    if (!loading && !fetchingMore && hasMore) {
      setFetchingMore(true);
      setPage(prevPage => {
        const updatedPage = prevPage + 1;
        return updatedPage;
      });

      try {
        const response = await fetch(`http://192.168.1.6:5000/nearbySearch?page=${page + 1}&latitude=${latitude}&longitude=${longitude}`, { // Use page + 1 directly
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setMenu(prevMenu => [...prevMenu, ...data]);
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


  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const handleItemClick = (item) => {
    // Calculate distance
    const distanceInfo = calculateDistance(latitude, longitude, item.latitude, item.longitude);
  
    // Navigate to FullMenu page and send data via route params
    navigation.navigate('FullMenu', {
      item,
      distance: distanceInfo.distance,
      unit: distanceInfo.unit
    });
  }
  

  // Function to calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers

    // Determine appropriate unit
    let unit;
    let displayDistance;
    if (distance < 1) {
      // Convert distance to meters
      displayDistance = (distance * 1000).toFixed(0);
      unit = 'm';
    } else {
      displayDistance = distance.toFixed(2);
      unit = 'km';
    }

    return { distance: displayDistance, unit };
  };

  // Function to convert degrees to radians
  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {/* Top Navbar */}
        <Text style={{ color: "gray" }}>GOOD FOOD GOOD HEALTH</Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ color: "black", fontSize: 25, fontWeight: "bold", marginTop: 10 }}>Xfery Food</Text>
          <Text style={{ color: "black" }}>Hi, Backham</Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: 'wrap', marginTop: 10 }}>
          <View style={{
            flex: 1,
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

        {/* Render different text based on loading state */}
        {loading ? (
          errorType === 'network' ? (
            <Text style={styles.loadingText}>Please check your internet connection and try again.</Text>
          ) : errorType === 'server' ? (
            <Text style={styles.loadingText}>Server Error. Please try again later.</Text>
          ) : (
            <View style={{ marginTop: 20 }}>
              <ShimmerPlaceholder
                style={{ borderRadius: 5 }}
                width={100}
                height={20}
              />
              <ShimmerPlaceholder
                style={{ borderRadius: 10, marginTop: 10 }}
                width={370}
                height={200}
              />
              <ShimmerPlaceholder
                style={{ borderRadius: 5, marginTop: 20 }}
                width={100}
                height={20}
              />
              <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: 10 }}>
                <ShimmerPlaceholder
                  style={{ borderRadius: 100 }}
                  height={70}
                  width={70}
                />
                <ShimmerPlaceholder
                  style={{ borderRadius: 100 }}
                  height={70}
                  width={70}
                />
                <ShimmerPlaceholder
                  style={{ borderRadius: 100 }}
                  height={70}
                  width={70}
                />
                <ShimmerPlaceholder
                  style={{ borderRadius: 100 }}
                  height={70}
                  width={70}
                />
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: 10 }}>
                <ShimmerPlaceholder height={20} width={50} style={{ borderRadius: 5 }} />
                <ShimmerPlaceholder height={20} width={50} style={{ borderRadius: 5 }} />
                <ShimmerPlaceholder height={20} width={50} style={{ borderRadius: 5 }} />
                <ShimmerPlaceholder height={20} width={50} style={{ borderRadius: 5 }} />
              </View>
              <View style={{ marginTop: 10 }}>
                <ShimmerPlaceholder
                  style={{ borderRadius: 10, marginTop: 10 }}
                  width={370}
                  height={200}
                />
                <ShimmerPlaceholder height={20} width={300} style={{ borderRadius: 5, marginTop: 5 }} />
                <ShimmerPlaceholder height={20} width={100} style={{ borderRadius: 5, marginTop: 5 }} />
                <ShimmerPlaceholder height={20} width={110} style={{ borderRadius: 5, marginTop: 5 }} />
                <ShimmerPlaceholder
                  style={{ borderRadius: 10, marginTop: 10 }}
                  width={370}
                  height={200}
                />
                <ShimmerPlaceholder height={20} width={300} style={{ borderRadius: 5, marginTop: 5 }} />
                <ShimmerPlaceholder height={20} width={100} style={{ borderRadius: 5, marginTop: 5 }} />
                <ShimmerPlaceholder height={20} width={110} style={{ borderRadius: 5, marginTop: 5 }} />
                <ShimmerPlaceholder
                  style={{ borderRadius: 10, marginTop: 10 }}
                  width={370}
                  height={200}
                />
                <ShimmerPlaceholder height={20} width={300} style={{ borderRadius: 5, marginTop: 5 }} />
                <ShimmerPlaceholder height={20} width={100} style={{ borderRadius: 5, marginTop: 5 }} />
                <ShimmerPlaceholder height={20} width={110} style={{ borderRadius: 5, marginTop: 5 }} />
                <ShimmerPlaceholder
                  style={{ borderRadius: 10, marginTop: 10 }}
                  width={370}
                  height={200}
                />
                <ShimmerPlaceholder height={20} width={300} style={{ borderRadius: 5, marginTop: 5 }} />
                <ShimmerPlaceholder height={20} width={100} style={{ borderRadius: 5, marginTop: 5 }} />
                <ShimmerPlaceholder height={20} width={110} style={{ borderRadius: 5, marginTop: 5 }} />
                <ShimmerPlaceholder
                  style={{ borderRadius: 10, marginTop: 10 }}
                  width={370}
                  height={200}
                />
                <ShimmerPlaceholder height={20} width={300} style={{ borderRadius: 5, marginTop: 5 }} />
                <ShimmerPlaceholder height={20} width={100} style={{ borderRadius: 5, marginTop: 5 }} />
                <ShimmerPlaceholder height={20} width={110} style={{ borderRadius: 5, marginTop: 5 }} />
              </View>
            </View>
          )
        ) : errorType === 'network' ? (
          <Text style={styles.loadingText}>Please check your internet connection and try again.</Text>
        ) : menu === "no response" ? (
          <Text style={styles.loadingText}>Server Error. Please try again later.</Text>
        ) : menu.length === 0 ? (
          <Text style={styles.loadingText}>No menu found</Text>
        ) : (
          <View>
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
            <View style={{ marginTop: 20 }}>
              <Text style={{ color: "black", fontWeight: "700" }}>Categories</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: 10 }}>
                <Image
                  source={{ uri: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/burger-food-banner-template-design-66bfd460d3a4b90f273ba25ec12bec6d_screen.jpg?ts=1698822899' }}
                  style={{ width: 70, height: 70, borderRadius: 100 }}
                />
                <Image
                  source={{ uri: 'https://wallpapersmug.com/download/1600x900/b67e3e/pizza-slices-food.jpg' }}
                  style={{ width: 70, height: 70, borderRadius: 100 }}
                />
                <Image
                  source={{ uri: 'https://as1.ftcdn.net/v2/jpg/06/70/83/54/1000_F_670835408_sq2wwLy7SdxSmDbpo7SFrAA39E5Pqsp6.jpg' }}
                  style={{ width: 70, height: 70, borderRadius: 100 }}
                />
                <Image
                  source={{ uri: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/burger-food-banner-template-design-66bfd460d3a4b90f273ba25ec12bec6d_screen.jpg?ts=1698822899' }}
                  style={{ width: 70, height: 70, borderRadius: 100 }}
                />
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: 10 }}>
                <Text style={{ color: "black" }}>Burger</Text>
                <Text style={{ color: "black" }}>Pizza</Text>
                <Text style={{ color: "black" }}>Chow</Text>
                <Text style={{ color: "black" }}>Momos</Text>
              </View>
            </View>

            {/* menu section */}
            <View style={{ marginTop: 25 }}>
              {menu.map((item, index) => {
                // Calculate discount percentage
                const discountPercentage = ((item.comparePrice - item.price) / item.comparePrice) * 100;

                return (
                  <TouchableOpacity
                    style={styles.menuItem}
                    key={item._id}
                    onPress={() => handleItemClick(item)}
                    activeOpacity={0.8}
                  >
                    {/* Image */}
                    <Image source={{ uri: item.url }} style={styles.menuItemImage} />
                    {/* Discount percentage */}
                    <View style={styles.discountContainer}>
                      <Text style={styles.discountText}>{discountPercentage.toFixed(2)}% OFF</Text>
                    </View>

                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={{ marginHorizontal: 10, marginTop: 5 }}>{item.description}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, marginTop: 10 }}>
                      <Text style={styles.menuItemPrice}>₹ {item.price}</Text>
                      <Text style={styles.menuItemRestaurant}>{item.restaurantName}</Text>
                      <Text style={styles.menuItemRestaurant}>{item.activeStatus}</Text>
                      <Text style={styles.menuItemRestaurant}>
                        {calculateDistance(latitude, longitude, item.latitude, item.longitude).distance}{' '}
                        {calculateDistance(latitude, longitude, item.latitude, item.longitude).unit} Away
                      </Text>

                    </View>
                  </TouchableOpacity>
                );
              })}
              {fetchingMore && (
                <View style={styles.loading}>
                  <ActivityIndicator size="large" color="#0000ff" />
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
      {/* Bottom Navigation Buttons */}
      <BottomMenu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
    marginHorizontal: 10,
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
    width: 370,
    height: 220,
    borderRadius: 10,
  },
  discountContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'green',
    padding: 5,
    borderRadius: 5,
  },
  discountText: {
    color: 'white',
    fontWeight: 'bold',
  },
  menuItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: "black",
    marginHorizontal: 10 
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
    color: "black"
  },
  menuItemRestaurant: {
    fontSize: 14,
    color: 'gray',
    marginLeft: 20
  },
  loading: {
    alignItems: 'center',
    marginVertical: 10,
  },
  loadingText: {
    color: "black"
  },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    elevation: 2,
    backgroundColor: 'white',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  button: {
    backgroundColor: "#FE5301",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    marginLeft: 'auto', // Pushes the button to the right
  },
});

export default MenuPage;
