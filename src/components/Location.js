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

const liveLocation = (callback) => {
  return new Promise((resolve, reject) => {
    const watchId = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        callback({ latitude, longitude }); // Invoke the callback with the updated position data
        resolve({ latitude, longitude });
      },
      error => {
        console.log(error.message);
        reject(error);
      },
      { enableHighAccuracy: true, distanceFilter: 20 } // Set distanceFilter to 20 meters
    );

    // Return the watchId so that it can be used to clear the watch later if needed
    return watchId;
  });
};

const clearLiveLocation = (watchId) => {
  Geolocation.clearWatch(watchId);
};

export { getCurrentLocation, liveLocation, clearLiveLocation };
