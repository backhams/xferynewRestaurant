import React, { useEffect, useState } from 'react';
import { View, Modal, ActivityIndicator, Text,StyleSheet } from 'react-native';

export default function ModalSpin({ loading,loadingText }) {
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
      visible={loading}
      onRequestClose={() => {
        setLoading(false);
      }}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.modalText}>{loadingText}{loadingEllipsis}</Text>
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
