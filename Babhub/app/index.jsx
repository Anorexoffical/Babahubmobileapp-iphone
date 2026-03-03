
// app/index.jsx
import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from './contexts/AuthContext';

const { width } = Dimensions.get('window');

// Responsive logo size for all screen widths
const LOGO_SIZE = Math.min(width * 0.45, 240);

const Index = () => {
  const [isSplashVisible, setSplashVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const router = useRouter();
  const { userToken, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Start the splash animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Wait and fade out
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            setSplashVisible(false);
            
            // Redirect based on authentication status
            if (userToken) {
              router.replace('/(tabs)/HomeScreen');
            } else {
              router.replace('/login');
            }
          });
        }, 1500);
      });
    }
  }, [isLoading]);

  if (isSplashVisible) {
    return (
      <View style={styles.container}>
        <Animated.Image
          source={require('../assets/images/logo.png')}
          style={[
            styles.logo,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
          resizeMode="contain"
        />
      </View>
    );
  }

  return null;
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#242323',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});