import Geolocation from "react-native-geolocation-service";

const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        resolve({ latitude, longitude });
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
