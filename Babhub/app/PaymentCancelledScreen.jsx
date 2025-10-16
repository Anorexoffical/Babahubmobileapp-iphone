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
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
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

const PaymentCancelledScreen = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Track if navigation has been initiated
  const navigationInitiated = useRef(false);

  // Prevent going back to payment screen
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Always prevent going back to payment screen
      return true;
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
      } catch (error) {
        console.error('Error clearing payment data:', error);
      }
    };

    clearPaymentData();

    return () => {
      backHandler.remove();
    };
  }, []);

  // Enhanced navigation function with safety checks
  const navigateWithReplacement = (route) => {
    if (navigationInitiated.current) {
      return;
    }
    
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
      router.replace(route);
    });
  };

  const handleRetryPayment = () => {
    navigateWithReplacement('/Checkout');
  };

  const handleContinueShopping = () => {
    navigateWithReplacement('/(tabs)/StoreScreen');
  };

  const handleViewCart = () => {
    navigateWithReplacement('/CartScreen');
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
            <View style={styles.iconCircle}>
              <Ionicons name="close" size={60} color={COLORS.white} />
            </View>
            <View style={styles.iconRing} />
          </View>

          {/* Cancellation Title */}
          <Text style={styles.cancelledTitle}>Payment Cancelled</Text>
          
          {/* Cancellation Message */}
          <Text style={styles.cancelledMessage}>
            Your payment process was cancelled. No charges have been made to your account.
          </Text>

          {/* Reasons Card */}
          <View style={styles.reasonsCard}>
            <Text style={styles.reasonsTitle}>Common reasons for cancellation:</Text>
            <View style={styles.reasonsList}>
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
            </View>
          </View>

          {/* Next Steps */}
          <View style={styles.nextSteps}>
            <Text style={styles.nextStepsTitle}>What would you like to do?</Text>
            
            <Animated.View 
              style={[
                styles.primaryAction,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <TouchableOpacity 
                style={styles.primaryActionButton}
                onPress={handleRetryPayment}
              >
                <Ionicons name="card" size={24} color={COLORS.white} />
                <View style={styles.primaryActionContent}>
                  <Text style={styles.primaryActionTitle}>Retry Payment</Text>
                  <Text style={styles.primaryActionSubtitle}>
                    Complete your purchase with secure payment
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.secondaryActions}>
              <TouchableOpacity 
                style={styles.secondaryAction}
                onPress={handleViewCart}
              >
                <Ionicons name="cart" size={20} color={COLORS.primary} />
                <Text style={styles.secondaryActionText}>View Cart</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryAction}
                onPress={handleContinueShopping}
              >
                <Ionicons name="storefront" size={20} color={COLORS.primary} />
                <Text style={styles.secondaryActionText}>Continue Shopping</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Security Assurance */}
          {/* <View style={styles.securityAssurance}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
            <Text style={styles.securityText}>
              Your financial information is always protected with 256-bit SSL encryption
            </Text>
          </View> */}

          {/* Support Information */}
          <View style={styles.supportContainer}>
            <Text style={styles.supportTitle}>Need help with your payment?</Text>
            <View style={styles.supportOptions}>
              <View style={styles.supportOption}>
                <Ionicons name="mail" size={16} color={COLORS.primary} />
                <Text style={styles.supportText}>babahubsa@gmail.com</Text>
              </View>
              <View style={styles.supportOption}>
                <Ionicons name="call" size={16} color={COLORS.primary} />
                <Text style={styles.supportText}>0845000000</Text>
              </View>
            </View>
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
    backgroundColor: COLORS.warning,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.warning,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  iconRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.warning + '20',
    zIndex: 1,
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
    marginBottom: 16,
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
  secondaryActions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.light,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  secondaryActionText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  // Security Assurance
  securityAssurance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success + '10',
    padding: 10,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
    width: '100%',
  },
  securityText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  // Support Information
  supportContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
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
  },
  supportText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default PaymentCancelledScreen;