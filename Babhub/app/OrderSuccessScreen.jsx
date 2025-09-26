// app/screens/OrderSuccessScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const OrderSuccessScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.successText}>✅ Payment Successful!</Text>
      <Text style={styles.message}>Thank you for your order.</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.replace('/(tabs)/HomeScreen')}
      >
        <Text style={styles.buttonText}>Continue Shopping</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.outlineButton]}
        onPress={() => router.replace('/MyOrder')}
      >
        <Text style={styles.outlineButtonText}>View Orders</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white'
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'green'
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666'
  },
  button: {
    backgroundColor: '#3366FF',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3366FF'
  },
  outlineButtonText: {
    color: '#3366FF',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default OrderSuccessScreen;