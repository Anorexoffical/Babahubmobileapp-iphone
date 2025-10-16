// app/screens/OrderSuccessScreen.js
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Animated,
  Dimensions,
  StatusBar,
  BackHandler,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Consistent color palette
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

const OrderSuccessScreen = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const confettiAnim = useRef(null);

  // Clear cart and prevent going back
  useEffect(() => {
    const clearCartAndPreventBack = async () => {
      try {
        // Clear the cart from AsyncStorage
        await AsyncStorage.setItem('cart', JSON.stringify([]));
        console.log('Cart cleared successfully');
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    };

    // Prevent hardware back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Force navigation to home screen
      router.replace('/(tabs)/HomeScreen');
      return true; // Prevent default back behavior
    });

    // Prevent gesture back navigation (Expo Router)
    const preventGestureBack = () => {
      // This prevents the swipe back gesture
      router.setParams({ preventBack: 'true' });
    };

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();

    // Start confetti animation
    if (confettiAnim.current) {
      confettiAnim.current.play();
    }

    // Clear cart and setup back prevention
    clearCartAndPreventBack();
    preventGestureBack();

    return () => {
      backHandler.remove();
    };
  }, []);

  // Handle navigation with animation - completely replace current route
  const navigateWithAnimation = (route) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Use replace to remove this screen from history
      router.replace(route);
    });
  };

  // Force user to select a button - no other way to navigate
  const handleContinueShopping = () => {
    navigateWithAnimation('/(tabs)/HomeScreen');
  };

  const handleViewOrders = () => {
    navigateWithAnimation('/MyOrder');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.success} barStyle="light-content" />
      
      {/* Confetti Background Animation */}
      <View style={styles.confettiContainer}>
        <LottieView
          ref={confettiAnim}
          source={require('../assets/animations/Confetti.json')}
          autoPlay
          loop={false}
          style={styles.confetti}
        />
      </View>

      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={60} color={COLORS.white} />
          </View>
          <View style={styles.iconRing} />
        </View>

        {/* Success Title */}
        <Text style={styles.successTitle}>Payment Successful!</Text>
        
        {/* Success Message */}
        <Text style={styles.successMessage}>
          Thank you for your purchase! Your order has been confirmed and will be processed shortly.
        </Text>

        {/* Cart Cleared Message */}
        <View style={styles.cartClearedCard}>
          <Ionicons name="cart" size={24} color={COLORS.success} />
          <View style={styles.cartClearedContent}>
            <Text style={styles.cartClearedTitle}>Cart Cleared</Text>
            <Text style={styles.cartClearedText}>
              Your cart has been emptied and is ready for new products
            </Text>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.nextSteps}>
          <Text style={styles.nextStepsTitle}>What's Next?</Text>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Your order is being processed
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                We'll notify you when your order ships
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Track your order from your account
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons - Only way to navigate forward */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleContinueShopping}
          >
            <Ionicons name="home" size={20} color={COLORS.white} />
            <Text style={styles.primaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleViewOrders}
          >
            <Ionicons name="bag-handle" size={20} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>View My Orders</Text>
          </TouchableOpacity>
        </View>

        {/* Instruction Text */}
        <Text style={styles.instructionText}>
          Please select an option to continue
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  confetti: {
    width: width,
    height: height,
  },
  // Success Icon
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.success + '20',
    zIndex: 1,
  },
  // Success Text
  successTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  successMessage: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  // Cart Cleared Card
  cartClearedCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.success + '08',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    width: '100%',
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  cartClearedContent: {
    flex: 1,
  },
  cartClearedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: 4,
  },
  cartClearedText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  // Next Steps
  nextSteps: {
    width: '100%',
    marginBottom: 32,
  },
  nextStepsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 16,
    textAlign: 'center',
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  // Action Buttons
  actionsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    gap: 8,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  // Instruction Text
  instructionText: {
    fontSize: 14,
    color: COLORS.grayLight,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default OrderSuccessScreen;