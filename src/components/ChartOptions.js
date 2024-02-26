import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

const ChartOptions = ({ onSelectOption }) => {
  const [selectedOption, setSelectedOption] = useState("Today");

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    onSelectOption(option);
  };

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
      <TouchableOpacity onPress={() => handleSelectOption("Today")}>
        <Text style={{ fontWeight: selectedOption === "Today" ? 'bold' : 'normal' }}>Today</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleSelectOption("Yesterday")}>
        <Text style={{ fontWeight: selectedOption === "Yesterday" ? 'bold' : 'normal' }}>Yesterday</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleSelectOption("This Week")}>
        <Text style={{ fontWeight: selectedOption === "This Week" ? 'bold' : 'normal' }}>This Week</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleSelectOption("This Month")}>
        <Text style={{ fontWeight: selectedOption === "This Month" ? 'bold' : 'normal' }}>This Month</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChartOptions;
