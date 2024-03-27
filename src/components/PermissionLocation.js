import { Alert, Platform, BackHandler, Linking } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      // Request foreground location permission
      const foregroundResult = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      console.log('Foreground Location permission request result:', foregroundResult);

      if (foregroundResult === RESULTS.GRANTED) {
        console.log('Foreground Location permission is granted');

        // Now, request background location permission
        const backgroundResult = await request(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
        console.log('Background Location permission request result:', backgroundResult);

        if (backgroundResult === RESULTS.GRANTED) {
          console.log('Background Location permission is granted');
        } else if (backgroundResult === RESULTS.DENIED || backgroundResult === RESULTS.BLOCKED) {
          // Handle denied or blocked background location permission
          console.log('Background Location permission is denied or blocked');
          Alert.alert('Location permission', 'XFeryFood app needs access to your location, including in the background, to provide better service. Please enable the option Allow all the time in your device settings.',
          [
            {
              text: 'Cancel',
              onPress: () => BackHandler.exitApp(),
            },
            {
              text: 'Open setting',
              onPress: () => {
                BackHandler.exitApp();
                Linking.openSettings();
              },
            },
          ]);
        }
      } else if (foregroundResult === RESULTS.DENIED || foregroundResult === RESULTS.BLOCKED) {
        // Handle denied or blocked foreground location permission
        console.log('Foreground Location permission is denied or blocked');
        Alert.alert('Location permission', 'XFeryFood app needs access to your location to provide better service.',
        [
          {
            text: 'Cancel',
            onPress: () => BackHandler.exitApp(),
          },
          {
            text: 'Open setting',
            onPress: () => {
              BackHandler.exitApp();
              Linking.openSettings();
            },
          },
        ]);
      } else {
        console.log('Foreground Location permission request failed');
      }
    } catch (error) {
      console.log('Error requesting location permission:', error);
    }
  } else if (Platform.OS === 'ios') {
    try {
      // Request location permission for iOS
      const result = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
      console.log('Location permission request result:', result);

      if (result === RESULTS.GRANTED) {
        console.log('Location permission is granted');
      } else if (result === RESULTS.DENIED) {
        console.log('Location permission is denied');
        Alert.alert('Location permission', 'XFeryFood app needs access to your location to provide better service.',
        [
          {
            text: 'Cancel',
            onPress: () => BackHandler.exitApp(),
          },
          {
            text: 'Open setting',
            onPress: () => {
              BackHandler.exitApp();
              Linking.openSettings();
            },
          },
        ]);
      } else if (result === RESULTS.BLOCKED) {
        console.log('Location permission is blocked');
        Alert.alert('Location permission', 'XFeryFood app needs access to your location to provide better service.',
        [
          {
            text: 'Cancel',
            onPress: () => BackHandler.exitApp(),
          },
          {
            text: 'Open setting',
            onPress: () => {
              BackHandler.exitApp();
              Linking.openSettings();
            },
          },
        ]);
      } else if (result === RESULTS.LIMITED) {
        console.log('Location permission is limited');
      } else {
        console.log('Location permission request failed');
      }
    } catch (error) {
      console.log('Error requesting location permission:', error);
    }
  }
};

export default requestLocationPermission;
