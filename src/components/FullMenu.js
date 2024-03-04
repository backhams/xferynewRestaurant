import React from 'react';
import { View, Text,Image,StyleSheet } from 'react-native';
import BottomMenu from './BottomMenu';

export default function FullMenu({ route }) {
  // Extract the itemData from route params
  const { item, distance, unit } = route.params;

  return (
    <View>
      <Image source={{ uri: item.url }} width={500}  height={300} />

      <Text>{item.title}</Text>
      <Text>₹ {item.price}</Text>
      <Text>Restaurant Name: {item.restaurantName}</Text>
      <Text>Description: {item.description}</Text>
      <Text>{distance} {unit} Away</Text>
      {/* <BottomMenu/> */}
    </View>
  );
}
