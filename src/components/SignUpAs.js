import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity,Dimensions,Image,useColorScheme  } from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function SignUpAs() {
  const navigation = useNavigation();
  return (
    <View style={styles.container} >
      <View>
      <Text style={styles.title} >Welcome to XferyFood</Text>
      <View style={styles.titleDescriptionView}>
      <Text style={styles.titleDescription} >Book a Ride, Reach Anywhere, Track Your Ride, Every Step of the Way</Text>
      </View>
      </View>
      {/* <Image
         source={require('/assets/image/xferylogo.png')}
        style={styles.image}
      /> */}

      <View style={styles.linkView}>
      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login', { role: "restaurant" })}>
        <Text style={styles.linkTitle}>Sign Up As Restaurant</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={() => navigation.replace('Menu', { role: "deliveryPartner" })}>
        <Text style={styles.linkTitle} >Sign Up As Delivery Partner</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={()=>{navigation.replace("DeliveryDashboard",{
        role:"customer"
      })}}>
        <Text style={styles.linkTitle} >Sign Up As Customer</Text>
      </TouchableOpacity>
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    height: '100%',
    flexDirection:'column',
    justifyContent:'space-between',
    alignItems: 'center',
    backgroundColor:'#F9F5FF',
  },
  title: {
    fontSize:35,
    fontFamily:'Roboto-Black',
    width: Dimensions.get('window').width,
    textAlign:'center',
    color:'#FE5301',
    marginTop:30
  },
  titleDescriptionView:{
    justifyContent:'center',
    alignItems:"center",
    marginTop:30,
  },
  titleDescription:{
    fontSize:16,
    width: Dimensions.get('window').width -130,
    textAlign:'center',
    color:'black',
    fontFamily:'Roboto-Regular'
  },
  image:{
    width:200,
    height:200
  },
  linkView:{
    marginBottom:30
  },
  link: {
    alignItems:'center',
    justifyContent:'center',
    backgroundColor: '#FE5301',
    marginVertical: 10,
    width: Dimensions.get('window').width - 50,
    height: Dimensions.get('window').height - 750,
    borderRadius: 5,
  },
  linkTitle:{
    color:'white',
    fontSize:16,
    fontFamily:'Roboto-Regular'
  }
})