import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet } from 'react-native';
import DocumentPicker from 'react-native-document-picker';

export default function UploadMenu() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  
  const selectDocument = async () => {
    try {
      const doc = await DocumentPicker.pickSingle({
          type: [DocumentPicker.types.images]
      })
      console.log(doc)
      setSelectedImage(doc.uri); // Set the selected image URI in the state
  } catch (err) {
      if (DocumentPicker.isCancel(err)) {
          alert("Document selection cancel")
      } else {
          alert(err)
      }
  }
}
  
  
  
  const handleUpload = () => {
    console.log(selectedImage)
    // Implement upload functionality here
    console.log('Upload button clicked');
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'lightgray', padding: 10 }}>
        <Text style={{ fontSize: 18 }}>Upload Menu</Text>
        <View style={{ width: 70 }} />
      </View>
      <View style={{ flex: 1, alignItems: 'center'}}>
        {selectedImage ? (
          <View style={{ alignItems: 'center' }}>
            <Image source={{ uri: selectedImage }} style={styles.image} />
          </View>
        ) : (
          <Text style={{ fontSize: 18, marginBottom: 20 }}>Select Image</Text>
        )}
        <Button
          title="Select Image"
          onPress={selectDocument}
        />
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <TextInput
          placeholder="Menu name and Title"
          value={title}
          onChangeText={text => setTitle(text)}
          style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginVertical: 10, padding: 5 }}
        />
        <TextInput
          placeholder="Price"
          value={price}
          onChangeText={text => setPrice(text)}
          style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginVertical: 10, padding: 5 }}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Compare Price"
          value={comparePrice}
          onChangeText={text => setComparePrice(text)}
          style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginVertical: 10, padding: 5 }}
          keyboardType="numeric"
        />
        <Button
          title="Upload"
          onPress={handleUpload}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 350,
    height: 210,
    marginBottom: 20,
    resizeMode: 'contain'
  }
});
