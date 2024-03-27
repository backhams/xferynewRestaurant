import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert,ActivityIndicator } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ImagePicker from 'react-native-image-crop-picker';
import {API_URL} from '@env';
import storage from '@react-native-firebase/storage';
import { utils } from '@react-native-firebase/app';

export default function ProfileScreen({navigation}) {
    const apiUrlBack = API_URL
    console.log(apiUrlBack)
    const email = "b.jacksmusic@gmail.com"
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true);
        const info = {
          deviceName: await DeviceInfo.getDeviceName(),
          deviceId: await DeviceInfo.getUniqueId(),
          deviceOS: await DeviceInfo.getSystemName(),
          deviceOSVersion: await DeviceInfo.getSystemVersion(),
          ipAddress: await DeviceInfo.getIpAddress(),
        };
        setDeviceInfo(info);

        const response = await fetch(`${apiUrlBack}deliveryProfile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email
          }),
        });

        const data = await response.json();
        console.log(data);
        if (response.ok) {
          setName(data.userName !== "not set" ? data.userName : '');
          setPhoneNumber(data.phoneNumber !== "not set" ? data.phoneNumber : '');
          setSelectedImage(data.profileImage !== "not set" ? data.profileImage : null);
        } else {
          Alert.alert(data.message);
        }
      } catch (error) {
        console.log('Error:', error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfileData();
  }, []);

  const handleNameChange = (text) => {
    setName(text);
  };

  const handlePhoneNumberChange = (text) => {
    setPhoneNumber(text);
  };


  const selectImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        cropping: true,
        width: 300,
        height: 300,
        cropperToolbarTitle: 'Edit Image',
        cropperChooseText: 'Select',
        cropperCancelText: 'Cancel',
        cropperToolbarColor: '#FE5301',
        cropperToolbarWidgetColor: '#ffffff',
        cropperToolbarTitleColor: '#ffffff',
        cropperStatusBarColor: '#FE5301',
        cropperActiveWidgetColor: '#FE5301',
       
      });
  
      setSelectedImage(image.path);
      console.log(image);
    } catch (error) {
      console.log('Error:', error);
    }
  };
  
  // Function to handle image loading
  const handleImageLoadStart = () => {
    setImageLoading(true);
  };

  const handleImageLoadEnd = () => {
    setImageLoading(false);
  };


  const saveProfile = async () => {
    try {
      // Upload image to Firebase Storage
      let imageURL = null;
      if (selectedImage) {
        const uploadTask = await storage().ref(`profileImages/delivery`).putFile(selectedImage);
        // Wait for the upload task to complete
      await uploadTask;

     // Get the download URL of the uploaded image
     imageURL = await storage().ref(`profileImages/delivery`).getDownloadURL();
      }
  
      // Call API with image URL
      const response = await fetch(`${apiUrlBack}updateDeliveryProfileInfo`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: name,
          phoneNumber: phoneNumber,
          email: email,
          profileImage:imageURL // Include image URL in the request payload
        }),
      });
  
      // Handle API response
      const data = await response.json();
      console.log(data);
      console.log(imageURL)
      if (response.ok) {
        // Profile updated successfully
        // You can navigate or show success message here
      } else {
        Alert.alert(data.message);
        // If API call fails, delete the uploaded image from Firebase
        if (imageURL) {
          await storage().refFromURL(imageURL).delete();
        }
      }
    } catch (error) {
      console.log('Error:', error.message);
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
      <AntDesign  onPress={() => navigation.goBack()} name="arrowleft" size={24} color="black" />
        <View style={{flex:1}}>
        <Text style={styles.navbarText}>Edit Profile</Text>
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FE5301" />
      </View>
      ):(
        <>
         <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.profile}>
        {selectedImage ? (
       <TouchableOpacity onPress={selectImage}>
       {selectedImage ? (
         <>
           {imageLoading && ( 
             <View style={{height:150,width:150,backgroundColor:"lightgray",justifyContent:"center",alignItems:"center",borderRadius:100}}>
               <ActivityIndicator size="large" color="#FE5301" style={styles.imageLoader} />
             <View style={styles.editIconContainer}>
         <AntDesign
           name="edit"
           size={24}
           color="white"
           style={styles.editIcon}
         />
       </View>
           </View>
            
       
          
           )}
           <Image
             source={{ uri: selectedImage }}
             style={styles.profileSelectedImage}
             onLoadStart={handleImageLoadStart}
             onLoadEnd={handleImageLoadEnd}
           />
         </>
       ) : (
         <Image
           source={require('../../assets/image/profile.png')}
           style={styles.profileImagePlaceholder}
         />
       )}
       <View style={styles.editIconContainer}>
         <AntDesign
           name="edit"
           size={24}
           color="white"
           style={styles.editIcon}
         />
       </View>
     </TouchableOpacity>
    ) : (
        <TouchableOpacity onPress={selectImage}>
            <Image
                source={require('../../assets/image/profile.png')}
                style={styles.profileImagePlaceholder}
            />
        </TouchableOpacity>
    )}
            
          <View style={styles.profileInfo}>
            <Text style={styles.label}>Name:</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={handleNameChange}
              placeholder="Enter your name"
            />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.label}>Phone Number:</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              placeholder="Enter your phone number"
              maxLength={10}
              keyboardType='numeric'
            />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.input}>{'example@example.com'}</Text>
          </View>
          <View style={styles.deviceInfo}>
            <Text style={styles.label}>Device Name:</Text>
            <Text style={styles.deviceValue}>{deviceInfo ? deviceInfo.deviceName : '-'}</Text>
          </View>
          <View style={styles.deviceInfo}>
            <Text style={styles.label}>Device ID:</Text>
            <Text style={styles.deviceValue}>{deviceInfo ? deviceInfo.deviceId : '-'}</Text>
          </View>
          <View style={styles.deviceInfo}>
            <Text style={styles.label}>OS:</Text>
            <Text style={styles.deviceValue}>{deviceInfo ? deviceInfo.deviceOS : '-'}</Text>
          </View>
          <View style={styles.deviceInfo}>
            <Text style={styles.label}>OS Version:</Text>
            <Text style={styles.deviceValue}>{deviceInfo ? deviceInfo.deviceOSVersion : '-'}</Text>
          </View>
          <View style={styles.deviceInfo}>
            <Text style={styles.label}>IP Address:</Text>
            <Text style={styles.deviceValue}>{deviceInfo ? deviceInfo.ipAddress : '-'}</Text>
          </View>
          <TouchableOpacity style={styles.termsContainer}>
        <Text style={styles.termsText}>Terms and Conditions</Text>
      </TouchableOpacity>
          {/* Add more device info here if needed */}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.saveButton} onPress={()=>{saveProfile()}}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
        </>
      )}
     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  navbar: {
    flexDirection: "row",
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    zIndex: 2,
    paddingRight:30,
  },
  navbarText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: "center"
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: 70, 
    paddingBottom: 100,
  },
  profile: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  profileImagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 75,
    marginBottom: 20,
  },
  profileSelectedImage: {
    width: 150,
    height: 150,
    borderRadius: 100,
    marginBottom: 20,
  },
  profileInfo: {
    marginBottom: 20,
    width: '80%',
  },
  deviceInfo: {
    marginBottom: 10,
    width: '80%',
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  deviceValue: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  saveButton: {
    position: 'absolute',
    bottom: 5,
    left: 10,
    right: 10,
    backgroundColor: '#FE5301',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  termsContainer: {
    marginTop:30,
    alignSelf: 'center',
  },
  termsText: {
    color: '#007bff',
    fontSize: 16,
    textDecorationLine:"underline"
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 5,
},
editIcon: {
    paddingHorizontal: 3,
    paddingVertical: 2,
},
loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

});
