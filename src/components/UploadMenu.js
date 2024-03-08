import React, { useState,useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, Alert, ScrollView,Modal,ActivityIndicator } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Feather from 'react-native-vector-icons/Feather';
import Tooltip from 'react-native-walkthrough-tooltip';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { utils } from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';
import { decodeToken } from './LoginToken';

export default function UploadMenu() {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [priceError, setPriceError] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [comparePriceError, setComparePriceError] = useState('');
  const [titleTooltipVisible, setTitleTooltipVisible] = useState(false);
  const [descriptionTooltipVisible, setDescriptionTooltipVisible] = useState(false);
  const [ImageRulesTooltipVisible, setImageRulesTooltipVisible] = useState(false);
  const [priceTooltipVisible, setPriceTooltipVisible] = useState(false);
  const [comparePriceTooltipVisible, setComparePriceTooltipVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Uploading');
  const [loadingEllipsis, setLoadingEllipsis] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      // Update loading ellipsis
      setLoadingEllipsis(prev => {
        if (prev.length < 3) {
          return prev + '.';
        } else {
          return '';
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const selectImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        cropping: true,
        cropperWidth: 400,
        cropperHeight: 400,
        // includeBase64: true,
        cropperToolbarTitle: 'Edit Image',
        cropperChooseText: 'Select',
        cropperCancelText: 'Cancel',
        cropperToolbarColor: '#FE5301',
        cropperToolbarWidgetColor: '#ffffff',
        cropperToolbarTitleColor: '#ffffff',
        cropperStatusBarColor: '#FE5301',
        cropperActiveWidgetColor: '#FE5301',
        showCropGuidelines: true,
        cropperCircleOverlay: false,
        freeStyleCropEnabled: true,
      });
      const aspectRatioTolerance = 0.03;
      if (Math.abs(image.width / image.height - 16 / 9) > aspectRatioTolerance) {
        Alert.alert(
          'Unsupported Ratio',
          'Only 16:9 ratio is supported.',
          [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
          { cancelable: false }
        );
      } else {
        setSelectedImage(image.path);
        console.log(image)
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };
  const handleUpload = async () => {
    setLoading(true);
    // Check if all required fields are present
    if (!selectedImage || !title || !description || !price || !comparePrice) {
      setLoading(false);
      Alert.alert(
        'Missing Fields',
        'Please fill in all required fields.',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false }
      );
      return;
    }
  
    // Check title length
    if (title.length > 30) {
      setLoading(false);
      Alert.alert(
        'Title Too Long',
        'Title length cannot exceed 30 characters.',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false }
      );
      return;
    }
    // Check description length
    if (description.length > 250) {
      setLoading(false);
      Alert.alert(
        'description Too Long',
        'Description length cannot exceed 250 characters.',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false }
      );
      return;
    }
    // Check title length
    if (description.length < 100) {
      setLoading(false);
      Alert.alert(
        'description Too Short',
        'Description length should be more then 100 characters.',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false }
      );
      return;
    }
  
    // Check price
    if (Number(price) < 90) {
      setLoading(false);
      Alert.alert(
        'Invalid Price',
        'Price must be at least ₹ 90.',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false }
      );
      return;
    }
  
    // Check compare price
    if (Number(comparePrice) < price) {
      setLoading(false);
      Alert.alert(
        'Invalid Compare Price',
        'Compare Price must be more then actual price.',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false }
      );
      return;
    }
  
   
    const timestamp = new Date().getTime();
    const uniqueFileName = `${timestamp}_xferyfood`;
  
    const reference = storage().ref(uniqueFileName);
    // uploads file
    await reference.putFile(selectedImage);
    const url = await storage().ref(uniqueFileName).getDownloadURL();
    console.log(url)


    try {
      if (url) {
        // Call your API with the download URL here
        const decodedToken = await decodeToken();
        if(decodedToken){
          const userEmail = await decodedToken.email;
          const responseOfAccount = await fetch(`http://192.168.1.2:5000/getAccount?email=${userEmail}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
      
          // Check if the API call was successful
          if (responseOfAccount.ok) {
            const accountData = await responseOfAccount.json();
            console.log('API Response:', accountData);
          const response = await fetch(`http://192.168.1.2:5000/menuUpload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title:title,
              description:description,
              price:price,
              comparePrice:comparePrice,
              email:accountData.email,
              phoneNumber:accountData.phoneNumber,
              restaurantName:accountData.restaurantName,
              latitude:accountData.latitude,
              longitude:accountData.longitude,
              url:url

            })
          });
         
        // Check if the API call was successful
        if (response.ok) {
          const data = await response.json();
          // Handle the API response as needed
          navigation.replace("MenuManager")
          console.log(data);
        } else {
          console.error('API request failed:', response.statusText);
          // Handle the API error
          
          // Delete the file if the API request failed
          const storageRef = storage().refFromURL(url);
          await storageRef.delete();
          console.log('File deleted successfully due to API request failure');
        }
      } else {
            console.error('API request failed:');
            // Handle the API error
              // Delete the file if the API request failed
          const storageRef = storage().refFromURL(url);
          await storageRef.delete();
          console.log('File deleted successfully due to APgggI request failure');
          }
        }
       
      } else {
        Alert.alert("Download URL is empty")
      }
    } catch (error) {
      Alert.alert(error.message)
    }
    finally {
      setLoading(false); // Set loading to false when the task completes (whether success or failure)
    }
    
  };
  

  const handleTitleChange = (text) => {
    setTitle(text);
    if (text.length > 30) {
      setTitleError('Title length cannot exceed 30 characters.');
    } else {
      setTitleError('');
    }
  };
  const handleDescriptionChange = (text) => {
    setDescription(text);
    if (text.length > 250) {
      setDescriptionError('Description length cannot exceed 250 characters.');
    } else if(text.length < 100){
      setDescriptionError('Description length should be more then 100 characters.');
    } else {
      setDescriptionError('');
    }
  };

  const handlePriceChange = (text) => {
    setPrice(text);
    if (Number(text) < 90) {
      setPriceError('Price must be at least ₹ 90.');
    } else {
      setPriceError('');
    }
  };

  const handleComparePriceChange = (text) => {
    setComparePrice(text);
    if (Number(text) < price) {
      setComparePriceError('Compare Price must be more then actual price.');
    } else {
      setComparePriceError('');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={loading && styles.disabledContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}  editable={!loading}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.content}>
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.image} />
          </View>
        ) : (
         
           <Image source={require('../../assets/image/cameraFrame.png')} style={{ width: 200, height: 200 }} />
        )}
        <TouchableOpacity style={styles.button} onPress={selectImage} disabled={loading}>
          <Text style={styles.buttonText}>Select Image</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{color:"black"}}>Image Upload Policies </Text>
          <Feather
            style={styles.infoIcon}
            name="info"
            size={20}
            color="gray"
            onPress={() => setImageRulesTooltipVisible(true)}
          />
          <Tooltip
            isVisible={ImageRulesTooltipVisible}
            content={
              <ScrollView>
                <Text style={{color:"black"}}>
                  <Text style={{ fontWeight: 'bold', color: 'black' }}>
                    Aspect Ratio:
                  </Text>{"\n"}
                  Please ensure that the image you upload has an aspect ratio of 16:9. Images with other aspect ratios may not display correctly on our platform.

                  {"\n\n"}
                  <Text style={{ fontWeight: 'bold', color: 'black' }}>
                    Image Quality:
                  </Text>{"\n"}
                  We only accept high-resolution images to ensure the best viewing experience for our users. Avoid uploading blurry or low-quality images.

                  {"\n\n"}
                  <Text style={{ fontWeight: 'bold', color: 'black' }}>
                    Blurry Images:
                  </Text>{"\n"}
                  Images that are blurry or pixelated will not be accepted. Make sure your image is clear and in focus before uploading.

                  {"\n\n"}
                  <Text style={{ fontWeight: 'bold', color: 'black' }}>
                    No Crop:
                  </Text>{"\n"}
                  Ensure that the important parts of your image are not cut off or cropped. Make adjustments to your image if necessary before uploading.

                  {"\n\n"}
                  <Text style={{ fontWeight: 'bold', color: 'black' }}>
                    Copyright:
                  </Text>{"\n"}
                  Only upload images that you have the right to use. Do not upload images from the internet unless you own the rights to them or they are copyright-free. Any images found to be copyrighted will not be accepted.

                  {"\n\n"}
                  <Text style={{ fontWeight: 'bold', color: 'black' }}>
                    Ownership:
                  </Text>{"\n"}
                  You must have ownership or the right to use the images you upload. Images that infringe on the rights of others will not be accepted.

                  {"\n\n"}
                  <Text style={{ fontWeight: 'bold', color: 'black' }}>
                    Accepted Formats:
                  </Text>{"\n"}
                  We accept images in common formats such as JPEG and PNG. Make sure your image is in one of these formats before uploading.

                  {"\n\n"}
                  <Text style={{ fontWeight: 'bold', color: 'black' }}>
                    Content Guidelines:
                  </Text>{"\n"}
                  Ensure that your image adheres to our content guidelines and does not contain any offensive, inappropriate, or misleading content.
                </Text>
              </ScrollView>
            }
            placement="bottom"
            onClose={() => setImageRulesTooltipVisible(false)}
          />
        </View>
      </View>
      <View style={styles.form}>
        <Tooltip
          isVisible={titleTooltipVisible}
          content={<Text style={{color:"black"}}> When naming your menu items, aim for descriptive titles that highlight key ingredients and flavors. For example, "Crispy Chicken Patty with Melted Cheese" can be enhanced with extra details like "Indulge in juicy chicken layered with gooey cheese and fresh lettuce". This approach entices customers while effectively showcasing your dish's unique qualities.</Text>}
          placement="bottom"
          onClose={() => setTitleTooltipVisible(false)}
        >
          <Feather
            style={styles.infoIcon}
            name="info"
            size={20}
            color="gray"
            onPress={() => setTitleTooltipVisible(true)}
          />
        </Tooltip>
        <TextInput
          placeholder="Menu name and Title"
          value={title}
          onChangeText={handleTitleChange}
          style={[styles.input, { height: Math.max(40, title.length > 85 ? 60 : 40) }]}
          multiline={true}
          numberOfLines={3}
          editable={!loading}
        />

        {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
        <Tooltip
          isVisible={descriptionTooltipVisible}
          content={<Text style={{color:"black"}}>
          Menu Description Policy:
          
          Clarity and Brevity: Keep descriptions concise, ideally 100-150 characters, ensuring quick comprehension.
          
          Highlight Ingredients: Emphasize main ingredients for flavor insight.
          
          Include Preparation Method: Briefly outline how the dish is cooked.
          
          Flavor Profile: Use descriptive language to convey taste.
          
          Origin or Inspiration: Mention culinary influences if applicable.
          
          Special Features: Highlight unique aspects or dietary accommodations.
          
          Consistency: Maintain a uniform tone, style, and length across all descriptions.
          
          Example for Chow:
          
          "Spicy Szechuan Chicken Stir-Fry: Fiery wok-tossed chicken with crisp veggies. Authentic heat and flavor in every bite! 🌶️ #SzechuanSpice"</Text>}
          placement="bottom"
          onClose={() => setDescriptionTooltipVisible(false)}
        >
          <Feather
            style={styles.infoIcon}
            name="info"
            size={20}
            color="gray"
            onPress={() => setDescriptionTooltipVisible(true)}
          />
        </Tooltip>
        <TextInput
          placeholder="Menu Description"
          value={description}
          onChangeText={handleDescriptionChange}
          style={[styles.input, { height: Math.max(40, title.length > 85 ? 60 : 40) }]}
          multiline={true}
          numberOfLines={3}
          editable={!loading}
        />

        {descriptionError ? <Text style={styles.errorText}>{descriptionError}</Text> : null}

        <Tooltip
          isVisible={priceTooltipVisible}
          content={<Text> As you set up your menu on our app, please keep in mind that we have implemented a minimum pricing policy. Each item you list must have a price of at least ₹ 90. This policy ensures that all offerings meet a baseline standard and helps maintain consistency in pricing across our platform. Thank you for your cooperation in adhering to this guideline.</Text>}
          placement="bottom"
          onClose={() => setPriceTooltipVisible(false)}
        >
          <Feather
            style={styles.infoIcon}
            name="info"
            size={20}
            color="gray"
            onPress={() => setPriceTooltipVisible(true)}
          />
        </Tooltip>
        <TextInput
          placeholder="Price"
          value={price}
          onChangeText={handlePriceChange}
          style={styles.input}
          keyboardType="numeric"
          editable={!loading}
        />
        {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}

        <Tooltip
          isVisible={comparePriceTooltipVisible}
          content={<Text><Text>
            The "Compare Price" feature is an important tool for restaurant owners using our platform. It helps you understand the difference between the listed price and the actual price of an item. For example, if you set a "Compare Price" of ₹ 130, it means that while the listed price visible to customers will be ₹ 130, the actual price they'll pay is ₹ 90. This transparency ensures customers are informed about the true cost upfront, aiding in their decision-making and building trust in your establishment.
          </Text>
          </Text>}
          placement="top"
          onClose={() => setComparePriceTooltipVisible(false)}
        >
          <Feather
            style={styles.infoIcon}
            name="info"
            size={20}
            color="gray"
            onPress={() => setComparePriceTooltipVisible(true)}
          />
        </Tooltip>
        <TextInput
          placeholder="Compare Price"
          value={comparePrice}
          onChangeText={handleComparePriceChange}
          style={styles.input}
          keyboardType="numeric"
          editable={!loading}
        />
        {comparePriceError ? (
          <Text style={styles.errorText}>{comparePriceError}</Text>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={handleUpload}>
          <Text style={styles.buttonText}>Upload</Text>
        </TouchableOpacity>
      </View>
        
      {/* Loading Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={loading}
        onRequestClose={() => { setLoading(false); }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.modalText}>{loadingText}{loadingEllipsis}</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'lightgray',
    padding: 10,
  },
  headerText: {
    fontSize: 18,
    color:'black'
  },
  headerSpacer: {
    width: 70,
  },
  content: {
    alignItems: 'center',
    marginTop: 70,
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    width: 350,
    height: 210,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  selectImageText: {
    fontSize: 18,
    marginBottom: 20,
    color:"black"
  },
  form: {
    paddingHorizontal: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 10,
    padding: 5,
    color:"black"
  },
  button: {
    backgroundColor: '#FE5301',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    marginBottom: 17
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
  disabledContainer: {
    opacity: 0.5, // Reduce opacity to visually indicate disabled state
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#333333',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    color: 'white',
    marginTop: 10,
  },
});
