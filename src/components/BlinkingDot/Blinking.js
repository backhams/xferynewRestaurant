import React, { useEffect, useState } from 'react';
import { View, Animated, Easing } from 'react-native';


const Blinking = () => {
    const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity set to 0
    const [scaleAnim] = useState(new Animated.Value(1)); // Initial scale set to 1
  
    useEffect(() => {
      const startAnimation = () => {
        Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(
                fadeAnim,
                {
                  toValue: 1,
                  duration: 500, // Adjust the duration of the animation as needed
                  easing: Easing.linear,
                  useNativeDriver: true,
                }
              ),
              Animated.timing(
                fadeAnim,
                {
                  toValue: 0,
                  duration: 500, // Adjust the duration of the animation as needed
                  easing: Easing.linear,
                  useNativeDriver: true,
                }
              ),
            ]),
            Animated.sequence([
              Animated.timing(
                scaleAnim,
                {
                  toValue: 1.2,
                  duration: 1000, // Adjust the duration of the animation as needed
                  easing: Easing.linear,
                  useNativeDriver: true,
                }
              ),
              Animated.timing(
                scaleAnim,
                {
                  toValue: 1,
                  duration: 0, // No duration for instant scale reset
                  useNativeDriver: true,
                }
              ),
            ]),
          ])
        ).start();
      };
  
      startAnimation();
  
      return () => {
        fadeAnim.setValue(0); // Reset the animation value when component unmounts
        scaleAnim.setValue(1); // Reset the animation value when component unmounts
      };
    }, [fadeAnim, scaleAnim]);
  
    return (
      <View style={{ position: 'relative', width: 10, height: 10 }}>
        {/* Static dark green circle */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#13ad3f',
            zIndex: 2, // Ensures the dark green circle is in front
          }}
        />
        {/* Blinking light green circle border */}
        <Animated.View
          style={{
            position: 'absolute',
            top: -3,
            left: -3,
            width: 16,
            height: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#6ae68d', // Light green color
            backgroundColor: '#6ae68d', // Light green color for background
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            zIndex: 1, // Ensures this view is behind the dark green circle
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            top: -3,
            left: -3,
            width: 16,
            height: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#4d974d', // Darker green color
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            zIndex: 0, // Ensures this view is behind the light green circle
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            top: -5,
            left: -5,
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#6ae68d', // Light green color
            backgroundColor: '#6ae68d', // Light green color for background
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            zIndex: 1, // Ensures this view is behind the dark green circle
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            top: -5,
            left: -5,
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#4d974d', // Darker green color
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            zIndex: 0, // Ensures this view is behind the light green circle
          }}
        />
      </View>
    );
  };

  export default Blinking;