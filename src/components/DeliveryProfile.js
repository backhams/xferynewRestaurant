import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert,ActivityIndicator,Modal } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ImagePicker from 'react-native-image-crop-picker';
import {API_URL} from '@env';
import storage from '@react-native-firebase/storage';
import ModalSpin from './ModalSpin';

export default function ProfileScreen({navigation,route}) {
  const {email} = route.params;
  console.log(email)
    const apiUrlBack = API_URL
    console.log(apiUrlBack)
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [userInfo, setUserInfo] = useState([]);
  const [reloadTrack, setReloadTrack] = useState(false);
  const [numberValidator, setNumberValidator] = useState('');
  const [nameValidator, setNameValidator] = useState('');
  const [profileUpdateLoader, setProfileUploadLoader] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [initialData, setInitialData] = useState({ name: '', phoneNumber: '', selectedImage: null });



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
        if(email){
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
            setReloadTrack(false)
            setUserInfo(data)
            setName(data.userName !== "not set" ? data.userName : '');
            setPhoneNumber(data.phoneNumber !== "not set" ? data.phoneNumber : '');
            setSelectedImage(data.profileImage !== "not set" ? data.profileImage : null);
             // Initialize initialData with fetched data
             setInitialData({ name: data.userName !== "not set" ? data.userName : '', phoneNumber: data.phoneNumber !== "not set" ? data.phoneNumber : '', selectedImage: data.profileImage !== "not set" ? data.profileImage : null });
          } else {
            Alert.alert(data.message);
          }
        }
        
      } catch (error) {
        setReloadTrack(false)
        console.log('Error:', error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfileData();
  }, [reloadTrack]);


  // Handlers for input changes
  const handleNameChange = (text) => {
    setName(text);
  
    const trimmedText = text.trim(); // Remove leading and trailing spaces
    const regexAlphabet = /^[a-zA-Z.,'"\s]+$/; // Regular expression to match only alphabet characters and allowed special characters
    
    if (text.length > 17) {
        setNameValidator('The name entered is too long.');
    } else if (trimmedText.replace(/\s/g, '').length < 3) { // Counting characters excluding spaces
        setNameValidator('The name entered is too short.');
    } else if (!regexAlphabet.test(trimmedText)) { // Checking for allowed characters
        setNameValidator('Please enter a name containing only alphabet characters and allowed special characters.');
    } else {
        setNameValidator('');
    }
};


const handlePhoneNumberChange = (text) => {
  setPhoneNumber(text);
  // Regular expression to match only digits (0-9)
  const digitRegex = /^[0-9]+$/;
  
  if (text.length < 10 || !digitRegex.test(text)) {
      setNumberValidator('Invalid Number.');
  } else {
      setNumberValidator('');
  }
};


  // Function to check if data has changed
  const hasDataChanged = () => {
    const isNameChanged = name !== initialData.name && !(name === '' && initialData.name === 'not set');
    const isPhoneNumberChanged = phoneNumber !== initialData.phoneNumber && !(phoneNumber === '' && initialData.phoneNumber === 'not set' || (phoneNumber.length < 10) || !/^[1234567890]+$/.test(phoneNumber));
    const isSelectedImageChanged = selectedImage !== initialData.selectedImage;

    // Check if the initial image name and phone number were "not set"
    const isInitialImageNotSet = initialData.selectedImage === 'not set';
    const isInitialPhoneNumberNotSet = initialData.phoneNumber === 'not set';

    // Keep button enabled if the initial image name or phone number was "not set"
    return isNameChanged || isPhoneNumberChanged || isSelectedImageChanged ||
           isInitialImageNotSet || isInitialPhoneNumberNotSet ||
           initialData.name === '' || initialData.phoneNumber === ''; 
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
      setProfileUploadLoader(true);
      const trimmedText = name.trim();
      const regexAlphabet = /^[a-zA-Z.,'"\s]+$/;
  
      if (!email || !name || !phoneNumber) {
        Alert.alert("Missing Field!", "Please fill in all the required fields.");
        setProfileUploadLoader(false);
      } else if (!selectedImage) { // Check if the selected image is empty
        Alert.alert("Missing Image!", "Please upload a profile picture.");
        setProfileUploadLoader(false);
    } else if (name.length>17){
      Alert.alert("Long Username","The name entered is too long.")
      setProfileUploadLoader(false);
    } else if (trimmedText.replace(/\s/g, '').length < 3) { // Counting characters excluding spaces
     Alert.alert('Short Username','The name entered is too short.');
     setProfileUploadLoader(false);
  } else if (!regexAlphabet.test(trimmedText)) { // Checking for allowed characters
    Alert.alert('Not Allowed!','Please enter a name containing only alphabet characters and allowed special characters.');
    setProfileUploadLoader(false);
} else if (phoneNumber.length<10 || !/^\d+$/.test(phoneNumber)) { // Checking for allowed characters
  Alert.alert('Invalid Number!','Please enter a phone number with at least 10 digits and containing only digits.');
  setProfileUploadLoader(false);
} else {
        let imageURL = null;
  
        // Check if the selected image is different from the image fetched from the server
        const imageChanged = selectedImage !== userInfo.profileImage;
  
        // Upload image to Firebase Storage only if it's different
        if (selectedImage && imageChanged) {
          const uploadTask = await storage().ref(`profileImages/delivery`).putFile(selectedImage);
          await uploadTask;
  
          // Get the download URL of the uploaded image
          imageURL = await storage().ref(`profileImages/delivery`).getDownloadURL();
        } else {
          // Use the existing image URL
          imageURL = userInfo.profileImage;
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
            profileImage: imageURL
          }),
        });
  
        // Handle API response
        const data = await response.json();
        console.log('API Response:', data);
  
        if (response.ok) {
          setResponseText("Updated successfully.");
          setTimeout(() => {
            setProfileUploadLoader(false);
            setResponseText('');
            setReloadTrack(true)
          }, 2000);
        } else {
          Alert.alert("Error", data.message || "Failed to update profile.");
          // If API call fails and the image was changed, delete the uploaded image from Firebase
          if (imageURL && imageChanged) {
            await storage().refFromURL(imageURL).delete();
          }
        }
      }
    } catch (error) {
      console.log('Error:', error.message);
      Alert.alert("Error", "An error occurred while updating the profile. Please try again later.");
      setProfileUploadLoader(false);
    }
  };
  
  

  const reload = async ()=>{
    setReloadTrack(true)
  }
  

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
      ): (userInfo.length===0)?(
        <View style={styles.loadingContainer}>
          <Text>Unable to fetch data.</Text>
          <TouchableOpacity onPress={reload} style={{marginTop:30}}>
          <AntDesign name="reload1" size={24} color="#FE5301" />
          </TouchableOpacity>
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
         {/* <AntDesign
           name="edit"
           size={24}
           color="white"
           style={styles.editIcon}
         /> */}
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
            <Text style={styles.label}>Username:</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={handleNameChange}
              placeholder="Enter your name"
            />
             {nameValidator ? <Text style={styles.errorText}>{nameValidator}</Text> : null}
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
          {numberValidator ? <Text style={styles.errorText}>{numberValidator}</Text> : null}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.input}>{userInfo.email}</Text>
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
      <TouchableOpacity
                style={[styles.saveButton, !hasDataChanged() && styles.disabledButton]}
                onPress={saveProfile}
                disabled={!hasDataChanged()}>
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
        </>
      )}
     <ModalSpin loading={profileUpdateLoader} loadingText={"Updating"} responseText={responseText} />
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
  disabledButton: {
    backgroundColor: 'lightgray',
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
  errorText: {
    color: 'red',
    fontSize: 12,
  },

});
