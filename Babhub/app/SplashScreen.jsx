// app/SplashScreen.js
import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Prevent auto-hide until we finish loading
SplashScreen.preventAutoHideAsync();

export default function CustomSplashScreen() {
  useEffect(() => {
    // We keep this here in case you want to hide it manually from app/_layout.js
  }, []);

  return (
    <View style={styles.container}>
      {/* Your logo */}
      <Image
        source={require('../assets/images/logo.png')} // <- replace with your logo path
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>BabaHub</Text>
      <ActivityIndicator size="large" color="#3366FF" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3366FF',
  },
});
