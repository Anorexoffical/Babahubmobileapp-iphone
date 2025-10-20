// app/screens/PaymentCancelledScreen.js
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  info: '#3B82F6',
};

const PaymentCancelledScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showBackModal, setShowBackModal] = useState(false);
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  
  // Track if navigation has been initiated
  const navigationInitiated = useRef(false);

  // Check if payment failed
  const isPaymentFailed = params.paymentFailed === 'true';

  // Handle back button press
  const handleBackPress = () => {
    // When back button pressed, go back to checkout (same instance)
    handleRetryPayment();
    return true; // Prevent default back behavior
  };

  // Show modal animation
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

  // Prevent going back to payment screen - UPDATED
  useEffect(() => {
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

    // Start pulse animation for CTA button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Clear payment URL if still exists
    const clearPaymentData = async () => {
      try {
        await AsyncStorage.removeItem('latestPaymentUrl');
        console.log('Payment data cleared after cancellation');
      } catch (error) {
        console.error('Error clearing payment data:', error);
      }
    };

    clearPaymentData();

    return () => {
      backHandler.remove();
    };
  }, []);

  // Go back to Checkout screen - UPDATED to go back to existing instance
  const handleRetryPayment = () => {
    if (navigationInitiated.current) {
      return;
    }
    
    navigationInitiated.current = true;
    console.log('Going back to existing Checkout screen');

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
      // Use back navigation to return to existing checkout instance
      router.back();
    });
  };

  // Completely reset navigation stack and go to home - UPDATED
  const handleGoHome = () => {
    if (navigationInitiated.current) {
      return;
    }
    
    navigationInitiated.current = true;
    console.log('Completely resetting navigation stack to home');

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
      // COMPLETELY reset navigation stack
      router.dismissAll();
      router.replace('/(tabs)/HomeScreen');
    });
  };

  const handleContactSupport = () => {
    // Show contact modal instead of email
    showModal();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      
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
          {/* Cancellation Icon */}
          <View style={styles.iconContainer}>
            <View style={[
              styles.iconCircle,
              isPaymentFailed ? styles.iconCircleError : styles.iconCircleWarning
            ]}>
              <Ionicons 
                name={isPaymentFailed ? "alert-circle" : "close"} 
                size={moderateScale(50)} 
                color={COLORS.white} 
              />
            </View>
          </View>

          {/* Cancellation Title */}
          <Text style={styles.cancelledTitle}>
            {isPaymentFailed ? 'Payment Failed' : 'Payment Cancelled'}
          </Text>
          
          {/* Cancellation Message */}
          <Text style={styles.cancelledMessage}>
            {isPaymentFailed 
              ? 'We encountered an issue processing your payment. No charges have been made.'
              : 'Your payment was cancelled. No charges have been made.'
            }
          </Text>

          {/* Quick Reasons */}
          <View style={styles.reasonsCard}>
            <Text style={styles.reasonsTitle}>Common issues:</Text>
            <View style={styles.reasonsList}>
              {isPaymentFailed ? (
                <>
                  <View style={styles.reasonItem}>
                    <Ionicons name="card-outline" size={14} color={COLORS.error} />
                    <Text style={styles.reasonText}>Insufficient funds</Text>
                  </View>
                  <View style={styles.reasonItem}>
                    <Ionicons name="warning-outline" size={14} color={COLORS.error} />
                    <Text style={styles.reasonText}>Bank declined</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.reasonItem}>
                    <Ionicons name="time-outline" size={14} color={COLORS.info} />
                    <Text style={styles.reasonText}>Changed your mind</Text>
                  </View>
                  <View style={styles.reasonItem}>
                    <Ionicons name="card-outline" size={14} color={COLORS.info} />
                    <Text style={styles.reasonText}>Payment issues</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* Primary Action - Retry Payment */}
            <Animated.View 
              style={[
                styles.primaryAction,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <TouchableOpacity 
                style={styles.primaryActionButton}
                onPress={handleRetryPayment}
                activeOpacity={0.8}
              >
                <Ionicons name="card" size={20} color={COLORS.white} />
                <Text style={styles.primaryActionText}>
                  {isPaymentFailed ? 'Try Again' : 'Retry Payment'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Home Action */}
            <TouchableOpacity 
              style={styles.homeAction}
              onPress={handleGoHome}
              activeOpacity={0.7}
            >
              <Ionicons name="home" size={20} color={COLORS.primary} />
              <Text style={styles.homeActionText}>Go to Home</Text>
            </TouchableOpacity>

            {/* Support Action */}
            <TouchableOpacity 
              style={styles.supportAction}
              onPress={handleContactSupport}
              activeOpacity={0.7}
            >
              <Ionicons name="help-circle" size={18} color={COLORS.gray} />
              <Text style={styles.supportActionText}>Need Help?</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* Compact Support Modal */}
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
                <Ionicons name="headset" size={moderateScale(20)} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Contact Support</Text>
              </View>

              {/* Modal Body */}
              <View style={styles.modalBody}>
                <Text style={styles.modalMessage}>
                  Our support team is here to help you with any payment issues.
                </Text>
                
                <View style={styles.contactInfo}>
                  <View style={styles.contactItem}>
                    <Ionicons name="mail" size={14} color={COLORS.primary} />
                    <Text style={styles.contactText}>babahubsa@gmail.com</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Ionicons name="call" size={14} color={COLORS.primary} />
                    <Text style={styles.contactText}>084 500 0000</Text>
                  </View>
                </View>
              </View>

              {/* Modal Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalPrimaryButton]}
                  onPress={hideModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalPrimaryButtonText}>Got It</Text>
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
  // Cancellation Icon
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
  },
  iconCircle: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: moderateScale(4) },
        shadowOpacity: 0.3,
        shadowRadius: moderateScale(8),
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconCircleWarning: {
    backgroundColor: COLORS.warning,
    shadowColor: COLORS.warning,
  },
  iconCircleError: {
    backgroundColor: COLORS.error,
    shadowColor: COLORS.error,
  },
  // Cancellation Text
  cancelledTitle: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: verticalScale(8),
    includeFontPadding: false,
  },
  cancelledMessage: {
    fontSize: moderateScale(14),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(20),
    paddingHorizontal: moderateScale(10),
    includeFontPadding: false,
  },
  // Reasons Card
  reasonsCard: {
    backgroundColor: COLORS.white,
    padding: moderateScale(12),
    borderRadius: moderateScale(10),
    width: '100%',
    marginBottom: verticalScale(20),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: moderateScale(1) },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(3),
      },
      android: {
        elevation: 1,
      },
    }),
  },
  reasonsTitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: verticalScale(8),
    textAlign: 'center',
    includeFontPadding: false,
  },
  reasonsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: moderateScale(12),
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
  },
  reasonText: {
    fontSize: moderateScale(12),
    color: COLORS.gray,
    includeFontPadding: false,
  },
  // Actions Container
  actionsContainer: {
    width: '100%',
    gap: moderateScale(12),
  },
  primaryAction: {
    width: '100%',
  },
  primaryActionButton: {
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
  primaryActionText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontWeight: '700',
    includeFontPadding: false,
  },
  homeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    gap: moderateScale(8),
    borderWidth: moderateScale(1.5),
    borderColor: COLORS.primary,
  },
  homeActionText: {
    color: COLORS.primary,
    fontSize: moderateScale(15),
    fontWeight: '600',
    includeFontPadding: false,
  },
  supportAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: verticalScale(12),
    gap: moderateScale(6),
  },
  supportActionText: {
    color: COLORS.gray,
    fontSize: moderateScale(13),
    fontWeight: '500',
    includeFontPadding: false,
  },
  // Compact Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(40),
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
    borderRadius: moderateScale(14),
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: moderateScale(6) },
        shadowOpacity: 0.25,
        shadowRadius: moderateScale(10),
      },
      android: {
        elevation: 6,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(16),
    paddingHorizontal: moderateScale(16),
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
    gap: moderateScale(8),
  },
  modalTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.dark,
    textAlign: 'center',
    includeFontPadding: false,
  },
  modalBody: {
    paddingVertical: verticalScale(16),
    paddingHorizontal: moderateScale(16),
  },
  modalMessage: {
    fontSize: moderateScale(13),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: moderateScale(18),
    marginBottom: verticalScale(12),
    includeFontPadding: false,
  },
  contactInfo: {
    gap: verticalScale(8),
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
  },
  contactText: {
    fontSize: moderateScale(12),
    color: COLORS.primary,
    fontWeight: '500',
    includeFontPadding: false,
  },
  modalActions: {
    padding: moderateScale(12),
    backgroundColor: COLORS.background,
  },
  modalButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
  },
  modalPrimaryButton: {
    backgroundColor: COLORS.primary,
  },
  modalPrimaryButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(14),
    fontWeight: '600',
    includeFontPadding: false,
  },
});

export default PaymentCancelledScreen;