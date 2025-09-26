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
  StyleSheet
} from "react-native";
import { WebView } from 'react-native-webview';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';

const PaymentScreen = () => {
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [hasError, setHasError] = useState(false);
  const webViewRef = useRef(null);
  const router = useRouter();

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (paymentUrl) {
        Alert.alert(
          "Cancel Payment",
          "Are you sure you want to cancel this payment?",
          [
            { text: "Continue Payment", style: "cancel" },
            { 
              text: "Cancel Payment", 
              style: "destructive",
              onPress: () => router.back()
            }
          ]
        );
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [paymentUrl, router]);

  // Load payment URL
  useEffect(() => {
    const loadPaymentUrl = async () => {
      try {
        const storedUrl = await AsyncStorage.getItem("latestPaymentUrl");
        console.log("Loaded PayFast URL:", storedUrl);

        if (!storedUrl) {
          Alert.alert("Error", "No payment URL found!");
          router.back();
          return;
        }

        setPaymentUrl(storedUrl);
      } catch (error) {
        console.error("Error loading payment URL:", error);
        Alert.alert("Error", "Failed to load payment page");
        router.back();
      }
    };

    loadPaymentUrl();
  }, [router]);

  // Reset error state when paymentUrl changes
  useEffect(() => {
    setHasError(false);
  }, [paymentUrl]);

  // Updated navigation state handler
  const onNavigationStateChange = (navState) => {
    const { url, title } = navState;
    
    console.log("Current URL:", url);
    console.log("Page Title:", title);

    // Improved URL pattern matching
    const isSuccessUrl = 
      url.includes('/success') || 
      url.includes('payment/success') ||
      url.includes('payfast/success') ||
      (title && title.toLowerCase().includes('success')) ||
      (title && title.toLowerCase().includes('thank you'));

    const isCancelUrl = 
      url.includes('/cancel') || 
      url.includes('payment/cancel') ||
      url.includes('payfast/cancel') ||
      (title && title.toLowerCase().includes('cancel'));

    // Check for success URL
    if (isSuccessUrl) {
      setLoading(false);
      AsyncStorage.removeItem("latestPaymentUrl");
      router.replace({
        pathname: '/OrderSuccessScreen',
        params: { paymentStatus: 'success' }
      });
      return;
    }
    
    // Check for cancel URL
    if (isCancelUrl) {
      setLoading(false);
      AsyncStorage.removeItem("latestPaymentUrl");
      Alert.alert(
        "Payment Cancelled", 
        "Your payment was cancelled.",
        [{ 
          text: "OK", 
          onPress: () => router.replace('/(tabs)/CartScreen') 
        }]
      );
      return;
    }

    // Hide loader when page loads
    if (!navState.loading) {
      setLoading(false);
    }
  };

  // Handle message posting from WebView
  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Message from WebView:', data);
      
      if (data.type === 'payment_success') {
        AsyncStorage.removeItem("latestPaymentUrl");
        router.replace('/OrderSuccessScreen');
      } else if (data.type === 'payment_cancel') {
        AsyncStorage.removeItem("latestPaymentUrl");
        router.back();
      }
    } catch (error) {
      console.log('Non-JSON message:', event.nativeEvent.data);
    }
  };

  // Handle WebView errors
  const onError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setLoading(false);
    setHasError(true);
    
    Alert.alert(
      "Payment Error",
      "Failed to load payment page. Please check your internet connection.",
      [
        { text: "Try Again", onPress: () => {
          setHasError(false);
          webViewRef.current?.reload();
        }},
        { text: "Cancel", onPress: () => router.back() }
      ]
    );
  };

  // Handle HTTP errors
  const onHttpError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('HTTP error:', nativeEvent);
    setHasError(true);
    Alert.alert("Error", "Payment page not available");
  };

  // Error UI
  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Error</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.errorContent}>
          <Text style={styles.errorText}>Payment failed to load</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setHasError(false);
              webViewRef.current?.reload();
            }}
          >
            <Text style={styles.retryText}>Retry Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.backButtonError}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>Go Back to Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Loader component
  if (loading && !paymentUrl) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3366FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color="#3366FF" />
        </View>
      )}

      {/* --- UPDATED WEBVIEW --- */}
      <WebView
        ref={webViewRef}
        source={{ uri: paymentUrl }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={onNavigationStateChange}
        onError={onError}
        onHttpError={onHttpError}
        onMessage={onMessage}
        allowsBackForwardNavigationGestures={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.webviewLoader}>
            <ActivityIndicator size="large" color="#3366FF" />
            <Text style={styles.loadingText}>Loading payment gateway...</Text>
          </View>
        )}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        injectedJavaScript={`
          setTimeout(function() {
            if (window.location.href.includes('/success') || 
                window.location.href.includes('payment/success') ||
                window.location.href.includes('payfast/success') ||
                document.title.toLowerCase().includes('success') ||
                document.title.toLowerCase().includes('thank you')) {
              window.ReactNativeWebView.postMessage(JSON.stringify({type: 'payment_success'}));
            }
            if (window.location.href.includes('/cancel') || 
                window.location.href.includes('payment/cancel') ||
                window.location.href.includes('payfast/cancel') ||
                document.title.toLowerCase().includes('cancel')) {
              window.ReactNativeWebView.postMessage(JSON.stringify({type: 'payment_cancel'}));
            }
          }, 1000);
          const originalPushState = history.pushState;
          history.pushState = function() {
            originalPushState.apply(this, arguments);
            setTimeout(() => {
              if (window.location.href.includes('/success') || 
                  window.location.href.includes('payment/success')) {
                window.ReactNativeWebView.postMessage(JSON.stringify({type: 'payment_success'}));
              }
            }, 500);
          };
        `}
        userAgent={
          Platform.OS === 'ios' 
            ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
            : 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center", 
    alignItems: "center"
  },
  header: {
    height: 60,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 10 : 0
  },
  backButton: {
    padding: 5
  },
  backButtonText: {
    color: '#3366FF',
    fontSize: 16,
    fontWeight: '600'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  headerSpacer: {
    flex: 1
  },
  loadingBar: {
    height: 3,
    backgroundColor: '#3366FF',
    position: 'absolute',
    top: 60,
    right: 0,
    left: 0
  },
  webviewLoader: {
    flex: 1,
    justifyContent: "center", 
    alignItems: "center"
  },
  webview: {
    flex: 1,
    zIndex: 1000
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10
  },
  // --- Error UI styles ---
  errorContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center'
  },
  retryButton: {
    backgroundColor: '#3366FF',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  backButtonError: {
    padding: 15,
    width: '100%',
    alignItems: 'center'
  },
  backText: {
    color: '#3366FF',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default PaymentScreen;