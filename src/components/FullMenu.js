import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Rating } from 'react-native-ratings';

export default function FullMenu({ route, navigation }) {
  // Extract the itemData from route params
  const { item, distance, unit } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const combinedRatingValue = 30; // Example combined rating value
const totalNumberOfRatings = 5; // Example total number of ratings

const averageRating = combinedRatingValue / totalNumberOfRatings;
console.log(averageRating)

  // Calculate discount percentage
  const discountPercentage = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Menu</Text>
        <View style={{ flex: 1 }} />
      </View>

      {/* Main Content */}
      <Image source={{ uri: item.url }} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.price}>₹ {item.price}</Text>
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>Restaurant Name: {item.restaurantName}</Text>
        <Text style={styles.extraInfo}> | {distance} {unit} Away</Text>
      </View>
      <Text style={styles.description}>Description: {item.description}</Text>

      {/* Rating */}
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingTitle}>Rating:</Text>
        <Rating
        fractions={1} 
          showRating
          type="star"
          startingValue={averageRating}
          imageSize={20}
          readonly
        />
      </View>

      {/* Write a Review */}
      <TouchableOpacity style={styles.writeReviewButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.writeReviewButtonText}>Write a Review</Text>
      </TouchableOpacity>

      {/* Review Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Write a Review</Text>
            <Rating
              showRating
              type="star"
              imageSize={30}
            />
            <TextInput
              placeholder="Enter your review"
              style={styles.input}
              multiline
            />
            <TouchableOpacity style={styles.submitButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Menu */}
      <TouchableOpacity style={styles.bottomMenu}>
        <Text style={styles.orderButton}>Place Order</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
    paddingHorizontal: 20,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 5,
  },
  restaurantName: {
    fontSize: 16,
  },
  extraInfo: {
    fontSize: 14,
    color: '#888',
  },
  description: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  ratingTitle: {
    fontSize: 16,
    marginRight: 10,
  },
  writeReviewButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  writeReviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 20,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ff9800',
    paddingVertical: 15,
    alignItems: 'center',
  },
  orderButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
