import React, { useState, useEffect } from 'react';
import { View, Dimensions, Text, useColorScheme } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const Chart = ({ data }) => {
  const colorScheme = useColorScheme(); // Retrieve color scheme directly in the component
  const [modeChange, setModeChange] = useState("0,0,0");
 
  useEffect(() => {
    // Update modeChange state based on color scheme
    if (colorScheme === "dark") {
      setModeChange("43, 224, 55"); // Dark mode color
    } else {
      setModeChange("0,0,0"); // Light mode color
    }
  }, [colorScheme]); // Run the effect when color scheme changes

  return (
    <View>
      {/* Overlay View for custom text */}
      <View style={{ position: 'absolute', top: 40, left: 0, right: 0, zIndex: 2 }}>
        {/* Custom text */}
        <Text style={{ color: 'black', fontSize: 13, fontWeight: 'bold', textAlign: 'center' }}>Total revenue</Text>
        <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>₹9700</Text>
      </View>
      <BarChart
        data={data}
        width={Dimensions.get("window").width}
        height={250}
        yAxisLabel="₹"
        chartConfig={{
          backgroundGradientFrom: "white",
          backgroundGradientFromOpacity: 0,
          backgroundGradientTo: "white",
          backgroundGradientToOpacity: 0,
          color: (opacity = 1) => `rgba(${modeChange}, ${opacity})`,
          strokeWidth: 3,
          barPercentage: 0.5,
          useShadowColorFromDataset: false
        }}
      />
    </View>
  );
};

export default Chart;
