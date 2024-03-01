import React, { useEffect, useState } from 'react';
import { View, Modal, ActivityIndicator, Text, StyleSheet } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign'; // Import AntDesign icon

export default function ModalSpin({ loading, loadingText, responseText }) {
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

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={loading || !!responseText} // Show modal if loading or responseText is not empty
      onRequestClose={() => {
        // Do nothing on request close
      }}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {responseText ? ( // Render check mark and response text if responseText exists
            <>
              <AntDesign name="checkcircle" size={50} color="green" />
              <Text style={styles.modalText}>{responseText}</Text>
            </>
          ) : ( // Otherwise, render loading spinner and loading text
            <>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.modalText}>{loadingText}{loadingEllipsis}</Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  }
});
