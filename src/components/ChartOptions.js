import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';

const ChartOptions = ({ onSelectOption }) => {
  const [selectedOption, setSelectedOption] = useState("Today");
  const [optionBgColor, setOptionBgColor] = useState("#e3e3e3");
  const [optionSelectedColor, setOptionSelectedColor] = useState("#bbbbbb");
  const colorScheme = useColorScheme();
  
  useEffect(() => {
    if (colorScheme === 'dark') {
      setOptionBgColor("#e3e3e3");
      setOptionSelectedColor("#bbbbbb");
    } else {
      setOptionBgColor("green");
      setOptionSelectedColor("darkgreen");
    }
  }, [colorScheme]);

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    onSelectOption(option);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingEnd: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
        <TouchableOpacity style={[styles.optionButton, { backgroundColor: optionBgColor, ...(selectedOption === "Today" && { backgroundColor: optionSelectedColor }) }]} onPress={() => handleSelectOption("Today")}>
          <Text style={styles.optionText}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionButton, { backgroundColor: optionBgColor, ...(selectedOption === "Yesterday" && { backgroundColor: optionSelectedColor }) }]} onPress={() => handleSelectOption("Yesterday")}>
          <Text style={styles.optionText}>Yesterday</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionButton, { backgroundColor: optionBgColor, ...(selectedOption === "This Week" && { backgroundColor: optionSelectedColor }) }]} onPress={() => handleSelectOption("This Week")}>
          <Text style={styles.optionText}>This Week</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionButton, { backgroundColor: optionBgColor, ...(selectedOption === "This Month" && { backgroundColor: optionSelectedColor }) }]} onPress={() => handleSelectOption("This Month")}>
          <Text style={styles.optionText}>This Month</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  optionButton: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  optionText: {
    fontWeight: 'bold',
    color: "white"
  },
});

export default ChartOptions;
