import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

const ChartOptions = ({ onSelectOption }) => {
  const [selectedOption, setSelectedOption] = useState("Today");

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    onSelectOption(option);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingEnd: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
        <TouchableOpacity style={[styles.optionButton, selectedOption === "Today" && styles.optionSelected]} onPress={() => handleSelectOption("Today")}>
          <Text style={styles.optionText}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionButton, selectedOption === "Yesterday" && styles.optionSelected]} onPress={() => handleSelectOption("Yesterday")}>
          <Text style={styles.optionText}>Yesterday</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionButton, selectedOption === "This Week" && styles.optionSelected]} onPress={() => handleSelectOption("This Week")}>
          <Text style={styles.optionText}>This Week</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionButton, selectedOption === "This Month" && styles.optionSelected]} onPress={() => handleSelectOption("This Month")}>
          <Text style={styles.optionText}>This Month</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  optionButton: {
    backgroundColor: "#e3e3e3",
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 10,
    marginHorizontal: 5, // Add margin between buttons
  },
  optionText: {
    fontWeight: 'bold',
    color: 'black',
  },
  optionSelected: {
    backgroundColor: "#bbbbbb",
  },
});

export default ChartOptions;
