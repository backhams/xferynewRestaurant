import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function CustomerProfile() {
  const navigation = useNavigation();

  const handleNavigateToOrderList = () => {
    navigation.navigate('CustomerOrderList');
  };

  return (
    <View>
      <Text>
        CustomerProfile
      </Text>
      <TouchableOpacity onPress={handleNavigateToOrderList}>
        <Text>Go to Order List</Text>
      </TouchableOpacity>
    </View>
  );
}
