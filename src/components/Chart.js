import React from 'react';
import { View, Dimensions, Text } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const Chart = ({ data }) => {
  return (
    <View>
      {/* Overlay View for custom text */}
      <View style={{ position: 'absolute', top: 40, left: 0, right: 0, zIndex: 2 }}>
        {/* Custom text */}
        <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold', textAlign: 'center' }}>Total revenue</Text>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>₹367770s.00</Text>
      </View>
      <BarChart
        data={data}
        width={Dimensions.get("window").width}
        height={250}
        yAxisLabel="₹"
        chartConfig={{
          backgroundGradientFrom: "#1E2923",
          backgroundGradientFromOpacity: 0.7,
          backgroundGradientTo: "#08130D",
          backgroundGradientToOpacity: 0.7,
          color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
          strokeWidth: 3,
          barPercentage: 0.5,
          useShadowColorFromDataset: false
        }}
      />
    </View>
  );
};

export default Chart;
