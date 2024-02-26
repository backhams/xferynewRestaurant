import { Alert, Platform ,BackHandler,Linking} from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      console.log('Location permission request result:', result);

      if (result === RESULTS.GRANTED) {
        console.log('Location permission is granted');
      } else if (result === RESULTS.DENIED) {
        console.log('Location permission is denied');
        Alert.alert('Location permission', 'XFeryFood app needs access to your location to provide better service.',
        [
          {
            text: 'Cancel',
            onPress: () => {
              // Open app settings to enable the permission
              BackHandler.exitApp();
            },
          },
          {
            text: 'Open setting',
            onPress: ()=>{
              BackHandler.exitApp()
              Linking.openSettings();
            }
          },
        ],);
      } else if (result === RESULTS.BLOCKED) {
        console.log('Location permission is blocked');
        Alert.alert('Location permission', 'Your app needs access to your location to provide better service.',
        [
          {
            text: 'Cancle',
            onPress: () => {
              // Open app settings to enable the permission
              BackHandler.exitApp();
            },
          },
          {
            text: 'Open setting',
            onPress: ()=>{
              BackHandler.exitApp()
              Linking.openSettings();
            }
          },
        ],);
      } else if (result === RESULTS.LIMITED) {
        console.log('Location permission is limited');
      } else {
        console.log('Location permission request failed');
      }
    } catch (error) {
      console.log('Error requesting location permission:', error);
    }
  } else if (Platform.OS === 'ios') {
    try {
      const result = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
      console.log('Location permission request result:', result);

      if (result === RESULTS.GRANTED) {
        console.log('Location permission is granted');
      } else if (result === RESULTS.DENIED) {
        console.log('Location permission is denied');
        Alert.alert('Location permission', 'Your app needs access to your location to provide better service.',
        [
          {
            text: 'Cancle',
            onPress: () => {
              // Open app settings to enable the permission
              BackHandler.exitApp();
            },
          },
          {
            text: 'Open setting',
            onPress: ()=>{
              BackHandler.exitApp()
              Linking.openSettings();
            }
          },
        ],);
      } else if (result === RESULTS.BLOCKED) {
        console.log('Location permission is blocked');
        Alert.alert('Location permission', 'Your app needs access to your location to provide better service.',
        [
          {
            text: 'Cancel',
            onPress: () => {
              // Open app settings to enable the permission
              BackHandler.exitApp();
            },
          },
          {
            text: 'Open setting',
            onPress: ()=>{
              BackHandler.exitApp()
              Linking.openSettings();
            }
          },
        ],);
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