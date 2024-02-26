import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { decode } from "base-64";
global.atob = decode;

// Function to decode the JWT token stored in AsyncStorage
export const decodeToken = async () => {
  try {
    const idToken = await AsyncStorage.getItem('idToken');
    if (idToken) {
      const decodedToken = jwtDecode(idToken);
      return decodedToken;
    }
    return null; // Or any other default value you prefer
  } catch (error) {
    console.error('Error decoding token:', error);
    return null; // Or handle the error according to your app's requirements
  }
};
export const userRole = async () => {
  try {
    const role = await AsyncStorage.getItem('role');
    if (role) {
      return role;
    }
    return null; // Or any other default value you prefer
  } catch (error) {
    console.error('Error decoding token:', error);
    return null; // Or handle the error according to your app's requirements
  }
};
