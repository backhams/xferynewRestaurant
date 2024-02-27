import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Dimensions, TouchableOpacity,Alert } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { Linking } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from 'react-native-vector-icons/FontAwesome';


const getDescription = (role ) => {
  switch (role) {
    case 'driver':
      return 'Welcome, delivery partners! 🚚 Join our team to deliver smiles and satisfy appetites across town. With flexible schedules and great earnings, delivering with us is not just a job, its a rewarding journey. Sign up now and become a part of our delivery family!';
      case 'customer':
      return 'Welcome, foodies! 🍴 Sign in to discover a feast of flavors and order your favorites effortlessly. From comfort classics to gourmet delights, satisfy your cravings with just a click. Join us now and let the culinary adventure begin!';
      case 'restaurant':
        return 'Welcome, restaurant partners! 🍽️ Sign in to manage your restaurant and receive online orders from eager customers. Join our delivery network to elevate your dining experience.';
    default:
      return 'Welcome! Sign in to continue.';
  }
};

const LoginForm = ({ route }) => {
  const navigation = useNavigation();
  const [userdata,setUserData] = useState();
  const { role } = route.params;
  const [isChecked, setIsChecked] = useState(false);
  const [description, setDescription] = useState('');
  const [currentText, setCurrentText] = useState('');

  useEffect(()=>{
    GoogleSignin.configure({
      webClientId: '612637497149-pvai8ums43qikvqllloq2s7v8np184vt.apps.googleusercontent.com',
    });
  })

  const saveUserDataToBackend = async (userdata) => {
    const { name, email } = userdata.user;
  
    try {
      const response = await fetch('http://192.168.1.6:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({name,email,role}),
      });
      const data = await response.json();
      if (response.status===201) {
        navigation.replace('Menu');
      } else {
        // Handle other status codes or errors
        Alert.alert(data)
      }
    } catch (error) {
      console.error('Error while saving user data to backend:', error);
    }
  };
  


  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      setUserData(userInfo)
      
      // Proceed with other logic like saving user data to backend
      if (userInfo.idToken) {
        console.log(userInfo)
        await saveUserDataToBackend(userInfo);
         // Save the ID token to AsyncStorage
      await AsyncStorage.setItem('idToken', userInfo.idToken);
      await AsyncStorage.setItem('role', role);
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        console.log(error)
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
        console.log(error)
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        console.log(error)
      } else {
        // some other error happened
        console.log(error)
      }
    }
  };
  
  

  useEffect(() => {
    setDescription(getDescription(role));
  }, [role]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (description.length > currentText.length) {
        setCurrentText(description.substring(0, currentText.length + 1));
      } else {
        clearInterval(interval);
      }
    }, 0.1);
    return () => clearInterval(interval);
  }, [description, currentText]);

  const handleSignIn = () => {
    if (isChecked) {
      // Proceed with sign-in logic
    } else {
      // Show error message or alert
    }
  };

  const handleTermsPress = () => {
    Linking.openURL('https://food.xfery.com/terms&conditions');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.description}>{currentText}</Text>
      <TouchableOpacity
       onPress={()=>{signIn()}}
        disabled={!isChecked}
        style={[styles.button, { backgroundColor: isChecked ? '#6A36D1' : 'darkgray' }]}
      >
         <FontAwesome style={styles.googleIcon} name="google" size={30} color="black" />
        <Text>SIGN UP/IN WITH GOOGLE</Text>
      </TouchableOpacity>
      <View style={styles.checkboxContainer}>
        <CheckBox
          value={isChecked}
          onValueChange={setIsChecked}
          style={styles.checkbox}
        />
        <TouchableOpacity onPress={handleTermsPress}>
          <Text style={styles.linkText}>I agree to the <Text style={styles.link}>terms and conditions</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  title: {
    fontSize: 24,
    width: Dimensions.get('window').width,
    marginBottom: 30,
    textAlign: 'center'
  },
  description: {
    fontSize: 16,
    marginBottom: 90,
    textAlign: 'center'
  },
  googleIcon:{
    marginRight:10
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6A36D1',
    flexDirection:'row',
    justifyContent:'center',
    marginVertical: 10,
    width: Dimensions.get('window').width - 90,
    height: Dimensions.get('window').height - 755,
    borderRadius: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkbox: {
    marginRight: 10
  },
  linkText: {
    fontSize: 16
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline'
  }
});

export default LoginForm;
