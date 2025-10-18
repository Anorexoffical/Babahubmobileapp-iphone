// app/screens/PaymentCancelledScreen.js
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
  Platform,
  ScrollView,
  Alert,
  Linking
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  info: '#3B82F6',
};

// MenuItem Component
const MenuItem = ({ icon, title, subtitle, color, onPress }) => {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
    </TouchableOpacity>
  );
};

const PaymentCancelledScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Track if navigation has been initiated
  const navigationInitiated = useRef(false);

  // Check if payment failed
  const isPaymentFailed = params.paymentFailed === 'true';

  // Prevent going back to payment screen - UPDATED
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Completely reset to home when back button is pressed
      handleGoHome();
      return true; // Prevent default back behavior
    });

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

  // Go back to Checkout screen - UPDATED with proper navigation reset
  const handleRetryPayment = () => {
    if (navigationInitiated.current) {
      return;
    }
    
    navigationInitiated.current = true;
    console.log('Navigating back to Checkout screen');

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
      // Use replace to prevent going back to this screen
      router.replace('/Checkout');
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
      // COMPLETELY reset navigation stack - this is the key fix
      // Navigate to root first, then replace with home screen
      router.dismissAll(); // Dismiss all modals and screens
      router.replace('/(tabs)/HomeScreen');
    });
  };

  // Navigate to Wishlist - UPDATED with proper reset
  const handleWishlistPress = () => {
    if (navigationInitiated.current) {
      return;
    }
    
    navigationInitiated.current = true;
    console.log('Navigating to Wishlist with reset');

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
      // Reset navigation and go to wishlist
      router.dismissAll();
      router.replace('/WishlistScreen');
    });
  };

  // Navigate to Store - UPDATED with proper reset
  const handleStorePress = () => {
    if (navigationInitiated.current) {
      return;
    }
    
    navigationInitiated.current = true;
    console.log('Navigating to Store with reset');

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
      // Reset navigation and go to store
      router.dismissAll();
      router.replace('/(tabs)/StoreScreen');
    });
  };

  // COMPLETELY RESET NAVIGATION - NEW FUNCTION
  const completelyResetNavigation = (targetRoute) => {
    if (navigationInitiated.current) return;
    
    navigationInitiated.current = true;
    
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
      // Method 1: Using dismissAll and replace (most effective)
      router.dismissAll(); // Clear all modals and stacked screens
      
      // Small delay to ensure dismiss completes
      setTimeout(() => {
        router.replace(targetRoute);
      }, 50);
    });
  };

  const handleContactSupport = async () => {
    const email = 'babahubsa@gmail.com';
    const subject = 'Payment Assistance Required';
    const body = 'Hello BabaHub Support,\n\nI need assistance with my payment. Here are the details:\n\n- Order ID: [Please specify]\n- Issue faced: [Please describe]\n\nThank you.';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          'Email Not Available',
          'Please email us at: babahubsa@gmail.com',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error opening email:', error);
      Alert.alert(
        'Error',
        'Could not open email app. Please contact us at: babahubsa@gmail.com',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCallSupport = async () => {
    const phoneNumber = 'tel:0845000000';
    
    try {
      const canOpen = await Linking.canOpenURL(phoneNumber);
      if (canOpen) {
        await Linking.openURL(phoneNumber);
      } else {
        Alert.alert(
          'Call Not Available',
          'Please call us at: 084 500 0000',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error making call:', error);
      Alert.alert(
        'Error',
        'Could not make a call. Please contact us at: 084 500 0000',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
          {/* Cancellation Icon */}
          <View style={styles.iconContainer}>
            <View style={[
              styles.iconCircle,
              isPaymentFailed ? styles.iconCircleError : styles.iconCircleWarning
            ]}>
              <Ionicons 
                name={isPaymentFailed ? "alert-circle" : "close"} 
                size={60} 
                color={COLORS.white} 
              />
            </View>
            <View style={[
              styles.iconRing,
              isPaymentFailed ? styles.iconRingError : styles.iconRingWarning
            ]} />
          </View>

          {/* Cancellation Title */}
          <Text style={styles.cancelledTitle}>
            {isPaymentFailed ? 'Payment Failed' : 'Payment Cancelled'}
          </Text>
          
          {/* Cancellation Message */}
          <Text style={styles.cancelledMessage}>
            {isPaymentFailed 
              ? 'We encountered an issue processing your payment. No charges have been made to your account. Please try again or use a different payment method.'
              : 'Your payment process was cancelled. No charges have been made to your account.'
            }
          </Text>

          {/* Reasons Card */}
          <View style={styles.reasonsCard}>
            <Text style={styles.reasonsTitle}>
              {isPaymentFailed ? 'Common reasons for failure:' : 'Common reasons for cancellation:'}
            </Text>
            <View style={styles.reasonsList}>
              {isPaymentFailed ? (
                <>
                  <View style={styles.reasonItem}>
                    <Ionicons name="card-outline" size={18} color={COLORS.error} />
                    <Text style={styles.reasonText}>Insufficient funds</Text>
                  </View>
                  <View style={styles.reasonItem}>
                    <Ionicons name="warning-outline" size={18} color={COLORS.error} />
                    <Text style={styles.reasonText}>Bank declined transaction</Text>
                  </View>
                  <View style={styles.reasonItem}>
                    <Ionicons name="time-outline" size={18} color={COLORS.error} />
                    <Text style={styles.reasonText}>Transaction timeout</Text>
                  </View>
                  <View style={styles.reasonItem}>
                    <Ionicons name="build-outline" size={18} color={COLORS.error} />
                    <Text style={styles.reasonText}>Technical issues</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.reasonItem}>
                    <Ionicons name="time-outline" size={18} color={COLORS.info} />
                    <Text style={styles.reasonText}>Changed your mind</Text>
                  </View>
                  <View style={styles.reasonItem}>
                    <Ionicons name="card-outline" size={18} color={COLORS.info} />
                    <Text style={styles.reasonText}>Payment method issues</Text>
                  </View>
                  <View style={styles.reasonItem}>
                    <Ionicons name="information-circle-outline" size={18} color={COLORS.info} />
                    <Text style={styles.reasonText}>Need more information</Text>
                  </View>
                  <View style={styles.reasonItem}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.info} />
                    <Text style={styles.reasonText}>Security concerns</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Next Steps */}
          <View style={styles.nextSteps}>
            <Text style={styles.nextStepsTitle}>What would you like to do?</Text>
            
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
                <Ionicons name="card" size={24} color={COLORS.white} />
                <View style={styles.primaryActionContent}>
                  <Text style={styles.primaryActionTitle}>
                    {isPaymentFailed ? 'Try Payment Again' : 'Retry Payment'}
                  </Text>
                  <Text style={styles.primaryActionSubtitle}>
                    Go back to checkout and try again
                  </Text>
                </View>
                <Ionicons name="arrow-back" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </Animated.View>

            {/* Home Action - UPDATED with complete reset */}
            <TouchableOpacity 
              style={styles.homeAction}
              onPress={() => completelyResetNavigation('/(tabs)/HomeScreen')}
              activeOpacity={0.7}
            >
              <Ionicons name="home" size={22} color={COLORS.primary} />
              <View style={styles.homeActionContent}>
                <Text style={styles.homeActionTitle}>Go to Home</Text>
                <Text style={styles.homeActionSubtitle}>Completely reset navigation - cannot go back</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

         
           

          {/* Support Information */}
          <View style={styles.supportContainer}>
            <Text style={styles.supportTitle}>Need help with your payment?</Text>
            <View style={styles.supportOptions}>
              <TouchableOpacity 
                style={styles.supportOption}
                onPress={handleContactSupport}
                activeOpacity={0.7}
              >
                <Ionicons name="mail" size={16} color={COLORS.primary} />
                <Text style={styles.supportText}>babahubsa@gmail.com</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.supportOption}
                onPress={handleCallSupport}
                activeOpacity={0.7}
              >
                <Ionicons name="call" size={16} color={COLORS.primary} />
                <Text style={styles.supportText}>084 500 0000</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Additional Help Section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Need Additional Help?</Text>
            <Text style={styles.helpDescription}>
              Our support team is available to assist you with any payment-related issues or questions you may have.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    minHeight: height - 100,
  },
  // Cancellation Icon
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
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
  iconRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    zIndex: 1,
  },
  iconRingWarning: {
    backgroundColor: COLORS.warning + '20',
  },
  iconRingError: {
    backgroundColor: COLORS.error + '20',
  },
  // Cancellation Text
  cancelledTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  cancelledMessage: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  // Reasons Card
  reasonsCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  reasonsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 12,
  },
  reasonsList: {
    gap: 10,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reasonText: {
    fontSize: 13,
    color: COLORS.gray,
    flex: 1,
  },
  // Next Steps
  nextSteps: {
    width: '100%',
    marginBottom: 20,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 16,
    textAlign: 'center',
  },
  primaryAction: {
    marginBottom: 12,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryActionContent: {
    flex: 1,
  },
  primaryActionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  primaryActionSubtitle: {
    color: COLORS.white + 'CC',
    fontSize: 12,
  },
  // Home Action
  homeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1.5,
    borderColor: COLORS.light,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  homeActionContent: {
    flex: 1,
  },
  homeActionTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  homeActionSubtitle: {
    color: COLORS.gray,
    fontSize: 12,
  },
  // Quick Actions Section
  quickActions: {
    width: '100%',
    marginBottom: 20,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 16,
    textAlign: 'center',
  },
  // Menu Item Styles
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: COLORS.light,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
  },
  // Support Information
  supportContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  supportTitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 10,
    textAlign: 'center',
  },
  supportOptions: {
    flexDirection: 'row',
    gap: 20,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 8,
    borderRadius: 6,
  },
  supportText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
  },
  // Help Section
  helpSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 20,
    paddingBottom: 10,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  helpDescription: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
});

export default PaymentCancelledScreen;