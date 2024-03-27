import messaging from '@react-native-firebase/messaging';

let deviceToken = null;

async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
    if (enabled) {
      console.log('Authorization status:', authStatus);
      deviceToken = await getDeviceToken();
      console.log("Token:", deviceToken);
    }
}

export const getDeviceToken = async () => {
    try {
        await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();
        return token;
    } catch (error) {
        console.log("Error getting device token:", error);
        return null;
    }
}

export { requestUserPermission, deviceToken };
