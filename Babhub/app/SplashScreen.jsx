// app/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Image, 
  Text, 
  StyleSheet, 
  Animated, 
  Easing,
  Dimensions 
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const { width, height } = Dimensions.get('window');

// Responsive sizing helpers for splash visuals
const LARGE_CIRCLE_SIZE = Math.min(width * 0.8, 320);
const MEDIUM_CIRCLE_SIZE = Math.min(width * 0.55, 240);
const SMALL_CIRCLE_SIZE = Math.min(width * 0.4, 180);
const TINY_CIRCLE_SIZE = Math.min(width * 0.3, 130);

const LOGO_BACKGROUND_SIZE = Math.min(width * 0.38, 160);
const LOGO_SIZE = LOGO_BACKGROUND_SIZE * 0.7;

// Enhanced Brand Color Palette
const COLORS = {
  primary: '#6366F1',
  primaryLight: '#8B5CF6',
  primaryDark: '#4F46E5',
  secondary: '#EC4899',
  secondaryLight: '#F472B6',
  accent: '#10B981',
  accentLight: '#34D399',
  dark: '#1F2937',
  darkLight: '#374151',
  gray: '#6B7280',
  grayLight: '#9CA3AF',
  light: '#F3F4F6',
  background: '#F9FAFB',
  white: '#FFFFFF',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
};

// Prevent auto-hide until we finish loading
SplashScreen.preventAutoHideAsync();

export default function CustomSplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for the loading indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Animated Background Elements */}
      <View style={styles.backgroundElements}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
        <View style={[styles.circle, styles.circle4]} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Animated Logo Container */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          {/* Logo with gradient background */}
          <View style={styles.logoBackground}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          {/* Decorative elements around logo */}
          <View style={styles.logoOrnament1} />
          <View style={styles.logoOrnament2} />
          <View style={styles.logoOrnament3} />
        </Animated.View>

        {/* App Title */}
        <Animated.View 
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.title}>BabaHub</Text>
          <Text style={styles.subtitle}>Your Shopping Companion</Text>
        </Animated.View>

        {/* Loading Indicator */}
        <Animated.View 
          style={[
            styles.loadingContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, styles.dot1]} />
            <Animated.View style={[styles.dot, styles.dot2]} />
            <Animated.View style={[styles.dot, styles.dot3]} />
          </View>
          <Text style={styles.loadingText}>Preparing your experience...</Text>
        </Animated.View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ for shoppers</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 500,
    opacity: 0.1,
  },
  circle1: {
    width: LARGE_CIRCLE_SIZE,
    height: LARGE_CIRCLE_SIZE,
    backgroundColor: COLORS.primary,
    top: -100,
    right: -100,
  },
  circle2: {
    width: MEDIUM_CIRCLE_SIZE,
    height: MEDIUM_CIRCLE_SIZE,
    backgroundColor: COLORS.secondary,
    bottom: -50,
    left: -50,
  },
  circle3: {
    width: SMALL_CIRCLE_SIZE,
    height: SMALL_CIRCLE_SIZE,
    backgroundColor: COLORS.accent,
    top: '30%',
    left: -50,
  },
  circle4: {
    width: TINY_CIRCLE_SIZE,
    height: TINY_CIRCLE_SIZE,
    backgroundColor: COLORS.primaryLight,
    bottom: '20%',
    right: -30,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  logoBackground: {
    width: LOGO_BACKGROUND_SIZE,
    height: LOGO_BACKGROUND_SIZE,
    borderRadius: LOGO_BACKGROUND_SIZE / 2,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 2,
    borderColor: COLORS.primary + '20',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  logoOrnament1: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    top: 10,
    right: 10,
    opacity: 0.6,
  },
  logoOrnament2: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: COLORS.secondaryLight,
    bottom: 15,
    left: 10,
    opacity: 0.4,
  },
  logoOrnament3: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accentLight,
    top: 50,
    left: 5,
    opacity: 0.5,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    textShadowColor: COLORS.primary + '40',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  dot1: {
    backgroundColor: COLORS.primary,
    animationDelay: '0s',
  },
  dot2: {
    backgroundColor: COLORS.secondary,
    animationDelay: '0.2s',
  },
  dot3: {
    backgroundColor: COLORS.accent,
    animationDelay: '0.4s',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.grayLight,
    fontWeight: '400',
  },
});