// app/screens/OrderSuccessScreen.js
import React, { useEffect, useRef, useState } from 'react';
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
  Platform,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

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
  const [showBackModal, setShowBackModal] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const confettiAnim = useRef(null);
  const modalScaleAnim = useRef(new Animated.Value(0)).current;

  // Handle back button press - FIXED
  const handleBackPress = () => {
    showModal();
    return true; // Prevent default back behavior
  };

  // Show modal animation - FIXED
  const showModal = () => {
    setShowBackModal(true);
    Animated.spring(modalScaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  // Hide modal animation
  const hideModal = () => {
    Animated.timing(modalScaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowBackModal(false);
    });
  };

  // Clear cart and handle navigation reset
  useEffect(() => {
    const initializeSuccessScreen = async () => {
      try {
        // 1. Clear the cart from AsyncStorage
        await AsyncStorage.setItem('cart', JSON.stringify([]));
        console.log('🛒 Cart cleared successfully');
        
        // 2. Clear any pending payment URLs
        await AsyncStorage.removeItem('latestPaymentUrl');
        
      } catch (error) {
        console.error('❌ Error initializing success screen:', error);
      }
    };

    // Handle Android back button - show custom modal - FIXED
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

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

    // Initialize the screen
    initializeSuccessScreen();

    // Cleanup
    return () => {
      backHandler.remove();
    };
  }, []);

  // Completely replace navigation stack and clear cart
  const navigateWithReset = async (targetRoute) => {
    try {
      // Ensure cart is cleared one more time
      await AsyncStorage.setItem('cart', JSON.stringify([]));
      
      // Use replace to completely remove current screen from history
      if (targetRoute === 'home') {
        router.replace('/(tabs)/HomeScreen');
      } else if (targetRoute === 'orders') {
        router.replace('/MyOrder');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      router.replace('/(tabs)/HomeScreen');
    }
  };

  const handleContinueShopping = () => {
    navigateWithReset('home');
  };

  const handleViewOrders = () => {
    navigateWithReset('orders');
  };

  const handleModalContinueShopping = () => {
    hideModal();
    setTimeout(() => handleContinueShopping(), 200);
  };

  const handleModalViewOrders = () => {
    hideModal();
    setTimeout(() => handleViewOrders(), 200);
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

      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.content,
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
              <Ionicons name="checkmark" size={moderateScale(50)} color={COLORS.white} />
            </View>
          </View>

          {/* Success Title */}
          <Text style={styles.successTitle}>Payment Successful!</Text>
          
          {/* Success Message */}
          <Text style={styles.successMessage}>
            Thank you for your purchase! Your order has been confirmed.
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleContinueShopping}
              activeOpacity={0.8}
            >
              <Ionicons name="home" size={moderateScale(18)} color={COLORS.white} />
              <Text style={styles.primaryButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleViewOrders}
              activeOpacity={0.8}
            >
              <Ionicons name="bag-handle" size={moderateScale(18)} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>View My Orders</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* Compact Square Back Press Modal */}
      <Modal
        visible={showBackModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={hideModal}
          >
            <Animated.View 
              style={[
                styles.modalContainer,
                {
                  transform: [{ scale: modalScaleAnim }]
                }
              ]}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="exit-outline" size={moderateScale(22)} color={COLORS.primary} />
                </View>
                <Text style={styles.modalTitle}>Leave This Screen?</Text>
              </View>

              {/* Modal Body */}
              <View style={styles.modalBody}>
                <Text style={styles.modalMessage}>
                  Your order is complete. Where would you like to go?
                </Text>
              </View>

              {/* Modal Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalPrimaryButton]}
                  onPress={handleModalContinueShopping}
                  activeOpacity={0.8}
                >
                  <Ionicons name="home-outline" size={moderateScale(16)} color={COLORS.white} />
                  <Text style={styles.modalPrimaryButtonText}>Home</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalSecondaryButton]}
                  onPress={handleModalViewOrders}
                  activeOpacity={0.8}
                >
                  <Ionicons name="bag-handle-outline" size={moderateScale(16)} color={COLORS.primary} />
                  <Text style={styles.modalSecondaryButtonText}>Orders</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={hideModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Modal>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(24),
  },
  content: {
    width: '100%',
    alignItems: 'center',
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
    marginBottom: verticalScale(20),
  },
  iconCircle: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: moderateScale(6) },
        shadowOpacity: 0.3,
        shadowRadius: moderateScale(12),
      },
      android: {
        elevation: 6,
      },
    }),
  },
  // Success Text
  successTitle: {
    fontSize: moderateScale(26),
    fontWeight: '800',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: verticalScale(8),
    includeFontPadding: false,
  },
  successMessage: {
    fontSize: moderateScale(14),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(30),
    paddingHorizontal: moderateScale(10),
    includeFontPadding: false,
  },
  // Action Buttons
  actionsContainer: {
    width: '100%',
    gap: moderateScale(12),
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    gap: moderateScale(8),
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: moderateScale(3) },
        shadowOpacity: 0.3,
        shadowRadius: moderateScale(6),
      },
      android: {
        elevation: 3,
      },
    }),
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontWeight: '700',
    includeFontPadding: false,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    borderWidth: moderateScale(2),
    borderColor: COLORS.primary,
    gap: moderateScale(8),
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: moderateScale(16),
    fontWeight: '700',
    includeFontPadding: false,
  },
  // Compact Square Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(30),
  },
  modalOverlayTouchable: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    maxWidth: moderateScale(280),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: moderateScale(8) },
        shadowOpacity: 0.25,
        shadowRadius: moderateScale(12),
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: verticalScale(20),
    paddingHorizontal: moderateScale(20),
    backgroundColor: COLORS.primary + '08',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary + '20',
  },
  modalIconContainer: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.dark,
    textAlign: 'center',
    includeFontPadding: false,
  },
  modalBody: {
    paddingVertical: verticalScale(20),
    paddingHorizontal: moderateScale(20),
  },
  modalMessage: {
    fontSize: moderateScale(14),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: moderateScale(20),
    includeFontPadding: false,
  },
  modalActions: {
    padding: moderateScale(16),
    gap: moderateScale(8),
    backgroundColor: COLORS.background,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    gap: moderateScale(6),
  },
  modalPrimaryButton: {
    backgroundColor: COLORS.primary,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: moderateScale(2) },
        shadowOpacity: 0.3,
        shadowRadius: moderateScale(4),
      },
      android: {
        elevation: 3,
      },
    }),
  },
  modalPrimaryButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(14),
    fontWeight: '600',
    includeFontPadding: false,
  },
  modalSecondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: moderateScale(1.5),
    borderColor: COLORS.primary,
  },
  modalSecondaryButtonText: {
    color: COLORS.primary,
    fontSize: moderateScale(14),
    fontWeight: '600',
    includeFontPadding: false,
  },
  modalCancelButton: {
    backgroundColor: 'transparent',
    marginTop: moderateScale(4),
  },
  modalCancelButtonText: {
    color: COLORS.gray,
    fontSize: moderateScale(14),
    fontWeight: '500',
    includeFontPadding: false,
  },
});

export default OrderSuccessScreen;