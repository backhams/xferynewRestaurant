import React from 'react';
import { View, Text,Image,StyleSheet } from 'react-native';
import BottomMenu from './BottomMenu';

export default function FullMenu({ route }) {
  // Extract the itemData from route params
  const { item } = route.params;

  return (
    <View>
      <Text>Full menu</Text>
      <Image source={{ uri: item.url }} width={500}  height={300} />

      <Text>Title: {item.title}</Text>
      <Text>Price: {item.price}</Text>
      <Text>Compare Price: {item.comparePrice}</Text>
      <Text>Restaurant Name: {item.restaurantName}</Text>
      {/* You can render the image here if needed */}
      {/* <BottomMenu/> */}
    </View>
  );
}
