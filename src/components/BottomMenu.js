import React, {useState,useEffect} from 'react'
import { StyleSheet,View ,TouchableOpacity,Text } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Foundation from 'react-native-vector-icons/Foundation';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { decodeToken,userRole } from './LoginToken';

export default function BottomMenu() {
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState({ name: '', email: '',role:'' });

    
  useEffect(() => {
    const fetchData = async () => {
      const decodedToken = await decodeToken();
      if (decodedToken) {
        // Calling userRole function to get the role value
        const role = await userRole();
        setUserInfo({ name: decodedToken.name, email: decodedToken.email, role:role });
      }
    };

    fetchData();
  }, []);

    const dashboardNavigation = () =>{
        if(userInfo.role==="restaurant"){
          navigation.navigate("RestaurantDashboard")
        } else if (userInfo.role==="deliveryPartner"){
          navigation.navigate("DeliveryDashboard")
        } else if (userInfo.role==="customer"){
          navigation.navigate("CustomerProfile")
        } else{
          console.log("no role found")
        }
      }
  return (
    <View style={styles.bottomButtonsView}>
        <TouchableOpacity onPress={()=>{navigation.navigate("Menu")}}>
        <Foundation style={styles.buttomIcon} name="home" size={30} color="black" />
        <Text>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity>
        <FontAwesome style={styles.buttomIcon} name="search" size={25} color="black" />
        <Text>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity>
        <FontAwesome style={styles.buttomIcon} name="user" size={25} color="black" />
        <Text>Other</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>{dashboardNavigation()}}>
        <FontAwesome style={styles.buttomIcon} name="user-circle" size={25} color="black" />
        <Text>profile</Text>
        </TouchableOpacity>
        {/* Empty Center */}
      </View>
  )
}

const styles = StyleSheet.create({
    bottomButtonsView: {
        flexDirection: 'row',
        backgroundColor:'white',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 20,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        // backgroundColor: 'red',
        borderTopWidth: 1,
        borderTopColor: 'gray',
      },
      buttomIcon:{
        textAlign:'center'
      },
})
