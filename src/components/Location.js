import Geolocation from "react-native-geolocation-service";

const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude, accuracy } = position.coords;
        const roundedAccuracy = accuracy.toFixed(2); // Round to two decimal places
        console.log('Location accuracy:', roundedAccuracy, 'meters');
        resolve({ latitude, longitude, accuracy: roundedAccuracy });
      },
      error => {
        console.log(error.message);
        reject(error);
      },
      { enableHighAccuracy: true }
    );
  });
};

export default getCurrentLocation;
