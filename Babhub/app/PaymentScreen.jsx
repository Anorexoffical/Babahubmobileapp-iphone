// app/screens/PaymentScreen.js
import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  ActivityIndicator, 
  Alert, 
  BackHandler,
  Platform,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  StatusBar,
  Modal
} from "react-native";
import { WebView } from 'react-native-webview';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Responsive sizing functions
const responsiveWidth = (percentage) => (width * percentage) / 100;
const responsiveHeight = (percentage) => (height * percentage) / 100;
const responsiveFont = (size) => {
  const scale = Math.min(width, height) / 400;
  const scaledSize = size * scale;
  return Math.max(scaledSize, 12);
};

// Safe area calculations for different devices
const getSafeAreaBottom = () => {
  if (Platform.OS === 'ios') {
    return responsiveHeight(2);
  } else {
    // For Android devices including Huawei - increased padding for navigation bar
    return responsiveHeight(6);
  }
};

const getSafeAreaTop = () => {
  if (Platform.OS === 'ios') {
    return responsiveHeight(6);
  } else {
    // For Android devices including Huawei
    return (StatusBar.currentHeight || responsiveHeight(4)) + responsiveHeight(2);
  }
};

// Consistent color palette matching your brand
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

// Custom Popup Component
const CustomBackPopup = ({ visible, onContinue, onCancel }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 70,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onContinue}
    >
      <View style={styles.popupOverlay}>
        <TouchableOpacity 
          style={styles.popupBackdrop}
          activeOpacity={1}
          onPress={onContinue}
        />
        <Animated.View 
          style={[
            styles.popupContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.popupIconContainer}>
            <View style={styles.popupIconCircle}>
              <Ionicons name="help-circle" size={responsiveFont(24)} color={COLORS.white} />
            </View>
          </View>
          
          <View style={styles.popupTextContainer}>
            <Text style={styles.popupTitle}>Cancel Payment?</Text>
            <Text style={styles.popupMessage}>
              Are you sure you want to cancel this payment? Your transaction will be interrupted and you'll be returned to checkout.
            </Text>
          </View>
          
          <View style={styles.popupActions}>
            <TouchableOpacity 
              style={styles.popupContinueButton}
              onPress={onContinue}
              activeOpacity={0.8}
            >
              <Ionicons name="card" size={responsiveFont(16)} color={COLORS.primary} />
              <Text style={styles.popupContinueText}>Continue Payment</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.popupCancelButton}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={responsiveFont(16)} color={COLORS.white} />
              <Text style={styles.popupCancelText}>Yes, Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const PaymentScreen = () => {
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showBackPopup, setShowBackPopup] = useState(false);
  const webViewRef = useRef(null);
  const router = useRouter();

  // Track redirection to prevent multiple redirects
  const redirectInitiated = useRef(false);
  const paymentStatusDetected = useRef(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Safe area values
  const safeAreaBottom = getSafeAreaBottom();
  const safeAreaTop = getSafeAreaTop();

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (paymentUrl) {
        handleBackButtonPress();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [paymentUrl, router]);

  // Handle back button press (both hardware and header back button)
  const handleBackButtonPress = () => {
    setShowBackPopup(true);
  };

  // Show custom popup for cancellation
  const showCancelConfirmation = () => {
    setShowBackPopup(true);
  };

  // Handle continue payment (close popup)
  const handleContinuePayment = () => {
    setShowBackPopup(false);
  };

  // Handle back to checkout (without showing payment cancelled screen)
  const handleBackToCheckout = () => {
    if (redirectInitiated.current) return;
    
    console.log("BACK BUTTON - Returning to checkout");
    setShowBackPopup(false);
    redirectInitiated.current = true;
    paymentStatusDetected.current = true;
    setLoading(false);
    
    // Clear payment URL immediately
    AsyncStorage.removeItem("latestPaymentUrl");
    
    // Simply go back to previous screen (checkout)
    router.back();
  };

  // Handle manual cancellation (for other cancellation scenarios)
  const handleManualCancellation = () => {
    if (redirectInitiated.current) return;
    
    console.log("MANUAL CANCELLATION - Redirecting to PaymentCancelledScreen");
    redirectInitiated.current = true;
    paymentStatusDetected.current = true;
    setLoading(false);
    
    // Clear payment URL immediately
    AsyncStorage.removeItem("latestPaymentUrl");
    
    // Redirect to cancellation page (for non-back-button cancellations)
    router.replace({
      pathname: '/PaymentCancelledScreen',
      params: { 
        manualCancellation: 'true',
        timestamp: Date.now()
      }
    });
  };

  // Load payment URL
  useEffect(() => {
    const loadPaymentUrl = async () => {
      try {
        setLoading(true);
        const storedUrl = await AsyncStorage.getItem("latestPaymentUrl");
        console.log("Loaded PayFast URL:", storedUrl);

        if (!storedUrl) {
          Alert.alert(
            "Payment Error", 
            "No payment session found. Please try checking out again.",
            [{ 
              text: "OK", 
              onPress: () => router.back() 
            }]
          );
          return;
        }

        setPaymentUrl(storedUrl);
        
        // Start entrance animations
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
          })
        ]).start();

      } catch (error) {
        console.error("Error loading payment URL:", error);
        Alert.alert(
          "Connection Error", 
          "Failed to load payment page. Please check your connection.",
          [{ 
            text: "OK", 
            onPress: () => router.back() 
          }]
        );
      }
    };

    loadPaymentUrl();
  }, [router]);

  // Reset error state when paymentUrl changes
  useEffect(() => {
    setHasError(false);
    setProgress(0);
    redirectInitiated.current = false;
    paymentStatusDetected.current = false;
  }, [paymentUrl]);

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Handle payment status redirection
  const handlePaymentSuccess = () => {
    if (redirectInitiated.current) return;
    
    console.log("SUCCESS DETECTED - Immediate redirect to OrderSuccessScreen");
    redirectInitiated.current = true;
    paymentStatusDetected.current = true;
    setLoading(false);
    
    // Clear payment URL immediately
    AsyncStorage.removeItem("latestPaymentUrl");
    
    // IMMEDIATE redirect without delay
    router.replace({
      pathname: '/OrderSuccessScreen',
      params: { 
        paymentStatus: 'success',
        timestamp: Date.now(),
        clearCart: 'true'
      }
    });
  };

  const handlePaymentCancelled = () => {
    if (redirectInitiated.current) return;
    
    console.log("CANCELLATION DETECTED - Redirecting to PaymentCancelledScreen");
    redirectInitiated.current = true;
    paymentStatusDetected.current = true;
    setLoading(false);
    
    // Clear payment URL immediately
    AsyncStorage.removeItem("latestPaymentUrl");
    
    // Redirect to dedicated cancellation page
    router.replace({
      pathname: '/PaymentCancelledScreen',
      params: { 
        timestamp: Date.now(),
        autoDetected: 'true'
      }
    });
  };

  const handlePaymentFailed = () => {
    if (redirectInitiated.current) return;
    
    console.log("FAILURE DETECTED - Redirecting to cancellation page");
    redirectInitiated.current = true;
    paymentStatusDetected.current = true;
    setLoading(false);
    
    // Clear payment URL immediately
    AsyncStorage.removeItem("latestPaymentUrl");
    
    // Redirect to cancellation page with failure context
    router.replace({
      pathname: '/PaymentCancelledScreen',
      params: { 
        paymentFailed: 'true',
        timestamp: Date.now()
      }
    });
  };

  // Enhanced navigation state handler
  const onNavigationStateChange = (navState) => {
    const { url, title, loading: navLoading } = navState;
    
    console.log("Payment Page URL:", url);
    console.log("Page Title:", title);

    // Update progress for loading bar
    if (navLoading) {
      setProgress(0.7);
    } else {
      setProgress(1);
      setTimeout(() => setProgress(0), 500);
    }

    // CRITICAL FIX: Prevent multiple redirects
    if (redirectInitiated.current || paymentStatusDetected.current) {
      return;
    }

    // Enhanced URL pattern matching for success
    const isSuccessUrl = 
      url.includes('/success') || 
      url.includes('payment/success') ||
      url.includes('payfast/success') ||
      url.includes('return?status=success') ||
      url.includes('complete') ||
      url.includes('approved') ||
      url.includes('thank-you') ||
      url.includes('order-received') ||
      url.includes('payment-complete') ||
      (title && (
        title.toLowerCase().includes('success') ||
        title.toLowerCase().includes('thank you') ||
        title.toLowerCase().includes('payment successful') ||
        title.toLowerCase().includes('approved') ||
        title.toLowerCase().includes('complete') ||
        title.toLowerCase().includes('order confirmed') ||
        title.toLowerCase().includes('transaction successful')
      ));

    // Enhanced URL pattern matching for cancellation - MORE AGGRESSIVE
    const isCancelUrl = 
      url.includes('/cancel') || 
      url.includes('payment/cancel') ||
      url.includes('payfast/cancel') ||
      url.includes('return?status=cancel') ||
      url.includes('cancelled') ||
      url.includes('payment-cancelled') ||
      url.includes('user_cancel') ||
      url.includes('abort') ||
      url.includes('payment_aborted') ||
      (title && (
        title.toLowerCase().includes('cancel') ||
        title.toLowerCase().includes('cancelled') ||
        title.toLowerCase().includes('payment cancelled') ||
        title.toLowerCase().includes('transaction cancelled') ||
        title.toLowerCase().includes('aborted') ||
        title.toLowerCase().includes('payment aborted')
      ));

    // Check for failure URLs
    const isFailureUrl = 
      url.includes('/failure') || 
      url.includes('payment/failure') ||
      url.includes('payfast/failure') ||
      url.includes('return?status=failure') ||
      url.includes('declined') ||
      url.includes('failed') ||
      url.includes('error') ||
      (title && (
        title.toLowerCase().includes('failed') ||
        title.toLowerCase().includes('failure') ||
        title.toLowerCase().includes('declined') ||
        title.toLowerCase().includes('error') ||
        title.toLowerCase().includes('unsuccessful') ||
        title.toLowerCase().includes('could not process')
      ));

    // Handle success URL - IMMEDIATE REDIRECTION
    if (isSuccessUrl) {
      handlePaymentSuccess();
      return;
    }
    
    // Handle cancel URL - MORE AGGRESSIVE
    if (isCancelUrl) {
      handlePaymentCancelled();
      return;
    }

    // Handle failure URL
    if (isFailureUrl) {
      handlePaymentFailed();
      return;
    }

    // Update loading state
    setLoading(navLoading);
  };

  // Enhanced WebView loading progress
  const onLoadProgress = ({ nativeEvent }) => {
    setProgress(nativeEvent.progress);
  };

  // Enhanced WebView error handling
  const onError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setLoading(false);
    setHasError(true);
    
    Alert.alert(
      "Connection Error",
      "We're having trouble loading the payment page. Please check your internet connection and try again.",
      [
        { 
          text: "Try Again", 
          onPress: () => {
            setHasError(false);
            setProgress(0);
            webViewRef.current?.reload();
          }
        },
        { 
          text: "Cancel", 
          style: "destructive",
          onPress: () => {
            showCancelConfirmation();
          }
        }
      ]
    );
  };

  // Handle HTTP errors
  const onHttpError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('HTTP error:', nativeEvent);
    setHasError(true);
    Alert.alert(
      "Payment Unavailable", 
      "The payment gateway is currently unavailable. Please try again later.",
      [
        { 
          text: "OK", 
          onPress: () => {
            showCancelConfirmation();
          }
        }
      ]
    );
  };

  // Enhanced Error UI
  if (hasError) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
        <Animated.View 
          style={[
            styles.errorContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={[styles.header, { paddingTop: safeAreaTop }]}>
            <TouchableOpacity 
              onPress={showCancelConfirmation}
              style={styles.backButton}
            >
              <View style={styles.backButtonInner}>
                <Ionicons name="chevron-back" size={responsiveFont(18)} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment Error</Text>
            <View style={styles.headerRight} />
          </View>
          
          <View style={styles.errorContent}>
            <View style={styles.errorIllustration}>
              <View style={styles.errorIconContainer}>
                <Ionicons name="warning" size={60} color={COLORS.error} />
              </View>
            </View>
            
            <Text style={styles.errorTitle}>Payment Failed to Load</Text>
            <Text style={styles.errorDescription}>
              We encountered an issue while connecting to the payment gateway. This could be due to network issues or temporary service unavailability.
            </Text>
            
            <View style={styles.errorActions}>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  setHasError(false);
                  setProgress(0);
                  webViewRef.current?.reload();
                }}
              >
                <Ionicons name="refresh" size={20} color={COLORS.white} />
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.backButtonError}
                onPress={showCancelConfirmation}
              >
                <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
                <Text style={styles.backText}>Back to Checkout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Custom Back Popup */}
        <CustomBackPopup
          visible={showBackPopup}
          onContinue={handleContinuePayment}
          onCancel={handleBackToCheckout}
        />
      </View>
    );
  }

  // Enhanced Loader component
  if (!paymentUrl) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
        <View style={styles.loaderContainer}>
          <View style={styles.loaderContent}>
            <ActivityIndicator size={60} color={COLORS.primary} />
            <Text style={styles.loaderTitle}>Preparing Payment</Text>
            <Text style={styles.loaderSubtitle}>
              Setting up secure payment gateway...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Premium Header */}
        <View style={[styles.header, { paddingTop: safeAreaTop }]}>
          <TouchableOpacity 
            onPress={handleBackButtonPress}
            style={styles.backButton}
          >
            <View style={styles.backButtonInner}>
              <Ionicons name="chevron-back" size={responsiveFont(18)} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Secure Payment</Text>
            <Text style={styles.headerSubtitle}>Powered by PayFast</Text>
          </View>
          
          <View style={styles.secureBadge}>
            <Ionicons name="lock-closed" size={responsiveFont(14)} color={COLORS.white} />
            <Text style={styles.secureText}>Secure</Text>
          </View>
        </View>

        {/* Animated Progress Bar */}
        {loading && (
          <View style={styles.progressContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]} 
            />
          </View>
        )}

        {/* Security Status Bar */}
        <View style={styles.securityBar}>
          <Ionicons name="shield-checkmark" size={responsiveFont(14)} color={COLORS.success} />
          <Text style={styles.securityText}>
            Your payment is secured with 256-bit SSL encryption
          </Text>
        </View>

        {/* Enhanced WebView */}
        <View style={styles.webviewContainer}>
          <WebView
            ref={webViewRef}
            source={{ uri: paymentUrl }}
            style={styles.webview}
            onLoadStart={() => {
              setLoading(true);
              setProgress(0.1);
            }}
            onLoadProgress={onLoadProgress}
            onLoadEnd={() => {
              setLoading(false);
              setProgress(1);
            }}
            onNavigationStateChange={onNavigationStateChange}
            onError={onError}
            onHttpError={onHttpError}
            allowsBackForwardNavigationGestures={false}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webviewLoader}>
                <View style={styles.loadingContent}>
                  <ActivityIndicator size={50} color={COLORS.primary} />
                  <Text style={styles.loadingTitle}>Loading Payment Gateway</Text>
                  <Text style={styles.loadingSubtitle}>
                    Please wait while we connect to our secure payment partner...
                  </Text>
                </View>
              </View>
            )}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            injectedJavaScript={`
              // Enhanced payment detection - More aggressive cancellation detection
              let paymentStatusChecked = false;
              
              function checkPaymentStatus() {
                if (paymentStatusChecked) return;
                
                const currentUrl = window.location.href.toLowerCase();
                const pageTitle = document.title.toLowerCase();
                const pageContent = document.body.innerText.toLowerCase();
                
                console.log('Checking payment status:', currentUrl);
                
                // Enhanced Success detection
                const isSuccess = 
                  currentUrl.includes('/success') || 
                  currentUrl.includes('payment/success') ||
                  currentUrl.includes('payfast/success') ||
                  currentUrl.includes('return?status=success') ||
                  currentUrl.includes('complete') ||
                  currentUrl.includes('approved') ||
                  currentUrl.includes('thank-you') ||
                  currentUrl.includes('order-received') ||
                  currentUrl.includes('payment-complete') ||
                  pageTitle.includes('success') ||
                  pageTitle.includes('thank you') ||
                  pageTitle.includes('payment successful') ||
                  pageTitle.includes('approved') ||
                  pageTitle.includes('complete') ||
                  pageTitle.includes('order confirmed') ||
                  pageTitle.includes('transaction successful') ||
                  pageContent.includes('payment successful') ||
                  pageContent.includes('thank you for your payment') ||
                  pageContent.includes('transaction approved') ||
                  pageContent.includes('order has been received') ||
                  pageContent.includes('your payment was successful');

                // Enhanced Cancel detection - MORE AGGRESSIVE
                const isCancel = 
                  currentUrl.includes('/cancel') || 
                  currentUrl.includes('payment/cancel') ||
                  currentUrl.includes('payfast/cancel') ||
                  currentUrl.includes('return?status=cancel') ||
                  currentUrl.includes('cancelled') ||
                  currentUrl.includes('payment-cancelled') ||
                  currentUrl.includes('user_cancel') ||
                  currentUrl.includes('abort') ||
                  currentUrl.includes('payment_aborted') ||
                  pageTitle.includes('cancel') ||
                  pageTitle.includes('cancelled') ||
                  pageTitle.includes('payment cancelled') ||
                  pageTitle.includes('transaction cancelled') ||
                  pageTitle.includes('aborted') ||
                  pageTitle.includes('payment aborted') ||
                  pageContent.includes('payment cancelled') ||
                  pageContent.includes('transaction cancelled') ||
                  pageContent.includes('you have cancelled') ||
                  pageContent.includes('payment was cancelled') ||
                  pageContent.includes('cancelled by user');

                // Enhanced Failure detection
                const isFailure = 
                  currentUrl.includes('/failure') || 
                  currentUrl.includes('payment/failure') ||
                  currentUrl.includes('payfast/failure') ||
                  currentUrl.includes('return?status=failure') ||
                  currentUrl.includes('declined') ||
                  currentUrl.includes('failed') ||
                  currentUrl.includes('error') ||
                  pageTitle.includes('failed') ||
                  pageTitle.includes('failure') ||
                  pageTitle.includes('declined') ||
                  pageTitle.includes('error') ||
                  pageTitle.includes('unsuccessful') ||
                  pageTitle.includes('could not process') ||
                  pageContent.includes('payment failed') ||
                  pageContent.includes('transaction declined') ||
                  pageContent.includes('unsuccessful payment') ||
                  pageContent.includes('could not process your payment');

                // Success detection
                if (isSuccess) {
                  paymentStatusChecked = true;
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'payment_success',
                    url: window.location.href,
                    title: document.title,
                    timestamp: Date.now(),
                    detectedBy: 'javascript'
                  }));
                  return;
                }
                
                // Cancel detection - HIGH PRIORITY
                if (isCancel) {
                  paymentStatusChecked = true;
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'payment_cancel',
                    url: window.location.href,
                    title: document.title,
                    timestamp: Date.now(),
                    detectedBy: 'javascript'
                  }));
                  return;
                }
                
                // Failure detection
                if (isFailure) {
                  paymentStatusChecked = true;
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'payment_failure',
                    url: window.location.href,
                    title: document.title,
                    timestamp: Date.now(),
                    detectedBy: 'javascript'
                  }));
                  return;
                }
              }
              
              // Initial check - more frequent for cancellation
              setTimeout(checkPaymentStatus, 500);
              setTimeout(checkPaymentStatus, 1000);
              setTimeout(checkPaymentStatus, 1500);
              setTimeout(checkPaymentStatus, 2000);
              setTimeout(checkPaymentStatus, 3000);
              
              // Monitor URL changes more aggressively
              let currentUrl = window.location.href;
              const urlCheckInterval = setInterval(() => {
                if (window.location.href !== currentUrl) {
                  currentUrl = window.location.href;
                  console.log('URL changed to:', currentUrl);
                  setTimeout(checkPaymentStatus, 200); // Faster detection on URL change
                }
              }, 200);
              
              // Override history methods for instant detection
              const originalPushState = history.pushState;
              history.pushState = function() {
                originalPushState.apply(this, arguments);
                setTimeout(checkPaymentStatus, 200);
              };
              
              const originalReplaceState = history.replaceState;
              history.replaceState = function() {
                originalReplaceState.apply(this, arguments);
                setTimeout(checkPaymentStatus, 200);
              };
              
              // Enhanced event listeners
              window.addEventListener('hashchange', () => {
                setTimeout(checkPaymentStatus, 200);
              });
              
              window.addEventListener('popstate', () => {
                setTimeout(checkPaymentStatus, 200);
              });
              
              // Also check on any click (for forms that might redirect)
              document.addEventListener('click', () => {
                setTimeout(checkPaymentStatus, 500);
              }, true);
              
              // Check when page becomes visible (for tab switching)
              document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                  setTimeout(checkPaymentStatus, 300);
                }
              });
              
              // Cleanup interval when page unloads
              window.addEventListener('beforeunload', () => {
                clearInterval(urlCheckInterval);
              });
            `}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                console.log('Message from WebView:', data);
                
                if (data.type === 'payment_success' && !redirectInitiated.current) {
                  handlePaymentSuccess();
                } else if (data.type === 'payment_cancel' && !redirectInitiated.current) {
                  handlePaymentCancelled();
                } else if (data.type === 'payment_failure' && !redirectInitiated.current) {
                  handlePaymentFailed();
                }
              } catch (error) {
                console.log('Non-JSON message:', event.nativeEvent.data);
              }
            }}
            userAgent={
              Platform.OS === 'ios' 
                ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
                : 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
            }
          />
        </View>

        {/* Payment Tips Footer */}
        <View style={[styles.footer, { paddingBottom: safeAreaBottom }]}>
          <View style={styles.tipsContainer}>
            <Ionicons name="information-circle" size={responsiveFont(16)} color={COLORS.primary} />
            <Text style={styles.tipsText}>
              • Ensure all payment details are correct{'\n'}
              • Do not close the app during payment{'\n'}
              • You'll be redirected automatically upon completion
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Custom Back Popup */}
      <CustomBackPopup
        visible={showBackPopup}
        onContinue={handleContinuePayment}
        onCancel={handleBackToCheckout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Header Styles - White Background
  header: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.5),
    borderBottomLeftRadius: responsiveWidth(5),
    borderBottomRightRadius: responsiveWidth(5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: responsiveHeight(0.5) },
    shadowOpacity: 0.08,
    shadowRadius: responsiveWidth(3),
    elevation: 5,
    marginBottom: responsiveHeight(1),
  },
  backButton: {
    padding: responsiveWidth(1.5),
  },
  backButtonInner: {
    width: responsiveWidth(9),
    height: responsiveWidth(9),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: responsiveWidth(2.5),
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: responsiveFont(18),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: responsiveFont(13),
    color: COLORS.gray,
    fontWeight: '500',
  },
  headerRight: {
    width: responsiveWidth(9),
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: responsiveWidth(2.5),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: responsiveWidth(3),
    gap: responsiveWidth(1),
  },
  secureText: {
    fontSize: responsiveFont(11),
    fontWeight: '700',
    color: COLORS.white,
  },
  // Progress Bar
  progressContainer: {
    height: responsiveHeight(0.3),
    backgroundColor: COLORS.light,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  // Security Bar
  securityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success + '15',
    paddingVertical: responsiveHeight(0.75),
    paddingHorizontal: responsiveWidth(4),
    gap: responsiveWidth(2),
  },
  securityText: {
    fontSize: responsiveFont(12),
    color: COLORS.success,
    fontWeight: '600',
  },
  // WebView Styles
  webviewContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  webview: {
    flex: 1,
  },
  webviewLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingContent: {
    alignItems: 'center',
    padding: responsiveWidth(7.5),
  },
  loadingTitle: {
    fontSize: responsiveFont(18),
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(0.75),
  },
  loadingSubtitle: {
    fontSize: responsiveFont(14),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: responsiveHeight(2.25),
  },
  // Footer Tips
  footer: {
    padding: responsiveWidth(4),
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: responsiveWidth(3),
  },
  tipsText: {
    flex: 1,
    fontSize: responsiveFont(12),
    color: COLORS.gray,
    lineHeight: responsiveHeight(2),
  },
  // Loader Styles
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loaderContent: {
    alignItems: 'center',
    padding: responsiveWidth(10),
  },
  loaderTitle: {
    fontSize: responsiveFont(20),
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(0.75),
  },
  loaderSubtitle: {
    fontSize: responsiveFont(15),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: responsiveHeight(2.5),
  },
  // Error Styles
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(10),
    paddingVertical: responsiveHeight(7.5),
  },
  errorIllustration: {
    marginBottom: responsiveHeight(3),
  },
  errorIconContainer: {
    width: responsiveWidth(30),
    height: responsiveWidth(30),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
    borderRadius: responsiveWidth(15),
  },
  errorTitle: {
    fontSize: responsiveFont(22),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: responsiveHeight(1.5),
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: responsiveFont(15),
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: responsiveHeight(4),
    lineHeight: responsiveHeight(2.5),
  },
  errorActions: {
    width: '100%',
    gap: responsiveHeight(1.5),
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: responsiveWidth(6),
    paddingVertical: responsiveHeight(1.5),
    borderRadius: responsiveWidth(3),
    gap: responsiveWidth(2),
  },
  retryText: {
    color: COLORS.white,
    fontSize: responsiveFont(16),
    fontWeight: '600',
  },
  backButtonError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: responsiveWidth(6),
    paddingVertical: responsiveHeight(1.5),
    borderRadius: responsiveWidth(3),
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    gap: responsiveWidth(2),
  },
  backText: {
    color: COLORS.primary,
    fontSize: responsiveFont(16),
    fontWeight: '600',
  },
  // Custom Popup Styles
  popupOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: responsiveWidth(5),
  },
  popupBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  popupContainer: {
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(4),
    padding: responsiveWidth(6),
    width: '100%',
    maxWidth: responsiveWidth(85),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: responsiveHeight(1) },
    shadowOpacity: 0.25,
    shadowRadius: responsiveWidth(3),
    elevation: 10,
  },
  popupIconContainer: {
    alignItems: 'center',
    marginBottom: responsiveHeight(2),
  },
  popupIconCircle: {
    width: responsiveWidth(16),
    height: responsiveWidth(16),
    borderRadius: responsiveWidth(8),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupTextContainer: {
    alignItems: 'center',
    marginBottom: responsiveHeight(3),
  },
  popupTitle: {
    fontSize: responsiveFont(20),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: responsiveHeight(1),
    textAlign: 'center',
  },
  popupMessage: {
    fontSize: responsiveFont(14),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: responsiveHeight(2.25),
  },
  popupActions: {
    gap: responsiveHeight(1.5),
  },
  popupContinueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.5),
    borderRadius: responsiveWidth(3),
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    gap: responsiveWidth(2),
  },
  popupContinueText: {
    color: COLORS.primary,
    fontSize: responsiveFont(16),
    fontWeight: '600',
  },
  popupCancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.5),
    borderRadius: responsiveWidth(3),
    gap: responsiveWidth(2),
  },
  popupCancelText: {
    color: COLORS.white,
    fontSize: responsiveFont(16),
    fontWeight: '600',
  },
});

export default PaymentScreen;