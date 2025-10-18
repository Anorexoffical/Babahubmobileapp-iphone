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
  StatusBar
} from "react-native";
import { WebView } from 'react-native-webview';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

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

const PaymentScreen = () => {
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const webViewRef = useRef(null);
  const router = useRouter();

  // Track redirection to prevent multiple redirects
  const redirectInitiated = useRef(false);
  const paymentStatusDetected = useRef(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (paymentUrl) {
        Alert.alert(
          "Cancel Payment",
          "Are you sure you want to cancel this payment?",
          [
            { 
              text: "Continue Payment", 
              style: "cancel",
              onPress: () => {}
            },
            { 
              text: "Cancel Payment", 
              style: "destructive",
              onPress: () => {
                handleManualCancellation();
              }
            }
          ]
        );
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [paymentUrl, router]);

  // Handle manual cancellation
  const handleManualCancellation = () => {
    if (redirectInitiated.current) return;
    
    console.log("MANUAL CANCELLATION - Redirecting to PaymentCancelledScreen");
    redirectInitiated.current = true;
    paymentStatusDetected.current = true;
    setLoading(false);
    
    // Clear payment URL immediately
    AsyncStorage.removeItem("latestPaymentUrl");
    
    // Redirect to cancellation page
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
            handleManualCancellation();
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
            handleManualCancellation();
          }
        }
      ]
    );
  };

  // Enhanced Error UI
  if (hasError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        <Animated.View 
          style={[
            styles.errorContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={handleManualCancellation}
              style={styles.backButton}
            >
              <View style={styles.backButtonInner}>
                <Ionicons name="chevron-back" size={24} color={COLORS.dark} />
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
                onPress={handleManualCancellation}
              >
                <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
                <Text style={styles.backText}>Back to Checkout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Enhanced Loader component
  if (!paymentUrl) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        <View style={styles.loaderContainer}>
          <View style={styles.loaderContent}>
            <ActivityIndicator size={60} color={COLORS.primary} />
            <Text style={styles.loaderTitle}>Preparing Payment</Text>
            <Text style={styles.loaderSubtitle}>
              Setting up secure payment gateway...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Premium Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleManualCancellation}
            style={styles.backButton}
          >
            <View style={styles.backButtonInner}>
              <Ionicons name="chevron-back" size={24} color={COLORS.dark} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Secure Payment</Text>
            <Text style={styles.headerSubtitle}>Powered by PayFast</Text>
          </View>
          
          <View style={styles.secureBadge}>
            <Ionicons name="lock-closed" size={16} color={COLORS.white} />
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
          <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
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
        <View style={styles.footer}>
          <View style={styles.tipsContainer}>
            <Ionicons name="information-circle" size={18} color={COLORS.primary} />
            <Text style={styles.tipsText}>
              • Ensure all payment details are correct{'\n'}
              • Do not close the app during payment{'\n'}
              • You'll be redirected automatically upon completion
            </Text>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

// ... keep your existing styles exactly the same ...
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 4,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    borderRadius: 12,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  headerRight: {
    width: 40,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  secureText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  // Progress Bar
  progressContainer: {
    height: 3,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  securityText: {
    fontSize: 12,
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
    padding: 30,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Footer Tips
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipsText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 16,
  },
  // Loader Styles
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loaderContent: {
    alignItems: 'center',
    padding: 40,
  },
  loaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 20,
    marginBottom: 8,
  },
  loaderSubtitle: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Error Styles
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  errorIllustration: {
    marginBottom: 24,
  },
  errorIconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
    borderRadius: 60,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  errorActions: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    gap: 8,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentScreen;