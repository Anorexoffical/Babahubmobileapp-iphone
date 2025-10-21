import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Platform,
  Dimensions,
  Modal,
  StatusBar,
  KeyboardAvoidingView,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get('window');

const checkInternetConnection = () => {
  return new Promise((resolve) => {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 5000)
    );

    const request = fetch('https://www.google.com', { method: 'HEAD' });

    Promise.race([request, timeout])
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
};

// Enhanced responsive sizing functions for all devices
const responsiveWidth = (percentage) => {
  const baseWidth = 375; // iPhone 6/7/8 as base
  const scale = width / baseWidth;
  return (percentage / 100) * baseWidth * Math.min(scale, 1.8); // Limit maximum scaling
};

const responsiveHeight = (percentage) => {
  const baseHeight = 667; // iPhone 6/7/8 as base
  const scale = height / baseHeight;
  return (percentage / 100) * baseHeight * Math.min(scale, 1.8);
};

const responsiveFont = (size) => {
  const scale = Math.min(width, height) / 400;
  const scaledSize = size * scale;
  
  // Set minimum and maximum font sizes for readability
  if (Platform.OS === 'android') {
    return Math.max(Math.min(scaledSize, size * 1.3), size * 0.9);
  }
  return Math.max(Math.min(scaledSize, size * 1.2), size * 0.8);
};

// Safe area calculations optimized for all Android devices including Huawei
const getSafeAreaBottom = () => {
  if (Platform.OS === 'ios') {
    return responsiveHeight(2);
  } else {
    // Enhanced for Android devices including Huawei with navigation bars
    const hasPhysicalNavigation = height / width > 1.9; // Detect devices with physical navigation
    if (hasPhysicalNavigation) {
      return responsiveHeight(3);
    } else {
      return responsiveHeight(4);
    }
  }
};

const getSafeAreaTop = () => {
  if (Platform.OS === 'ios') {
    return responsiveHeight(6);
  } else {
    // Enhanced for Android with status bar consideration
    const statusBarHeight = StatusBar.currentHeight || responsiveHeight(3);
    return statusBarHeight + responsiveHeight(1.5);
  }
};

// Premium brand color palette
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
  black: '#000000',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  errorLight: '#FEE2E2',
};

const BASE_URL = 'https://account.babahub.co';

// Enhanced Premium Brand-Aligned Popup Modal Component
const CustomPopup = ({ visible, title, message, type = 'info', onClose, showCloseButton = true }) => {
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const slideAnim = useState(new Animated.Value(20))[0];

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
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
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

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { 
          icon: 'checkmark-circle', 
          color: COLORS.success,
          bgColor: COLORS.white,
          borderColor: COLORS.success,
          iconColor: COLORS.success
        };
      case 'warning':
        return { 
          icon: 'warning', 
          color: COLORS.warning,
          bgColor: COLORS.white,
          borderColor: COLORS.warning,
          iconColor: COLORS.warning
        };
      case 'info':
        return { 
          icon: 'information-circle', 
          color: COLORS.primary,
          bgColor: COLORS.white,
          borderColor: COLORS.primary,
          iconColor: COLORS.primary
        };
      default:
        return { 
          icon: 'alert-circle', 
          color: COLORS.error,
          bgColor: COLORS.white,
          borderColor: COLORS.error,
          iconColor: COLORS.error
        };
    }
  };

  const { icon, color, bgColor, borderColor, iconColor } = getIconAndColor();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.popupOverlay}>
        <TouchableOpacity 
          style={styles.popupBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.popupContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ],
              backgroundColor: bgColor,
              borderWidth: 2,
              borderColor: borderColor
            }
          ]}
        >
          <View style={styles.popupContent}>
            <View style={styles.popupIconContainer}>
              <View style={[styles.popupIconCircle, { backgroundColor: color }]}>
                <Ionicons name={icon} size={responsiveFont(22)} color={COLORS.white} />
              </View>
            </View>
            
            <View style={styles.popupTextContainer}>
              <Text style={styles.popupTitle}>{title}</Text>
              <Text style={styles.popupMessage}>{message}</Text>
            </View>
          </View>
          
          <View style={styles.popupActions}>
            <TouchableOpacity 
              style={[styles.popupButton, { backgroundColor: color }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.popupButtonText}>Continue</Text>
              <Ionicons name="chevron-forward" size={responsiveFont(16)} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Enhanced Premium Product Image Component
const ProductImage = ({ imageUrl, style }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (imageError || !imageUrl) {
    return (
      <View style={[style, styles.placeholderContainer]}>
        <Ionicons name="image-outline" size={responsiveFont(20)} color={COLORS.grayLight} />
      </View>
    );
  }

  return (
    <View style={style}>
      {!imageLoaded && (
        <View style={[StyleSheet.absoluteFill, styles.imageLoading]}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}
      <Image
        source={{ uri: imageUrl }}
        style={[
          style,
          styles.productImage,
          { opacity: imageLoaded ? 1 : 0 }
        ]}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        resizeMode="cover"
      />
    </View>
  );
};

const Checkout = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});

  // Popup state
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('info');

  // Internet connection state
  const [isConnected, setIsConnected] = useState(true);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const buttonScale = useState(new Animated.Value(1))[0];

  // Refs for scrolling to errors and input focus
  const scrollViewRef = useRef(null);
  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const addressInputRef = useRef(null);

  // Safe area values
  const safeAreaBottom = getSafeAreaBottom();
  const safeAreaTop = getSafeAreaTop();

  // Keyboard state
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
      (e) => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Check internet connection periodically
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await checkInternetConnection();
        setIsConnected(connected);
      } catch (error) {
        setIsConnected(false);
      }
    };

    // Check immediately
    checkConnection();

    // Check every 10 seconds
    const interval = setInterval(checkConnection, 10000);

    return () => clearInterval(interval);
  }, []);

  // Show custom popup
  const showPopup = (title, message, type = 'info') => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupType(type);
    setPopupVisible(true);
  };

  // Hide custom popup
  const hidePopup = () => {
    setPopupVisible(false);
  };

  // Load cart items and user data
  useEffect(() => {
    const loadCartAndUser = async () => {
      try {
        // Load cart items
        const storedCart = await AsyncStorage.getItem('cart');
        if (storedCart) {
          const cartData = JSON.parse(storedCart);
          setCartItems(cartData);
          
          // If cart is empty, automatically go back
          if (cartData.length === 0) {
            showPopup(
              'Empty Cart', 
              'Your cart is empty. Please add items to proceed with checkout.',
              'warning'
            );
            setTimeout(() => {
              router.back();
            }, 2000);
            return;
          }
        } else {
          // If no cart found, go back
          showPopup(
            'No Items Found', 
            'No cart items found. Please add items to proceed.',
            'warning'
          );
          setTimeout(() => {
            router.back();
          }, 2000);
          return;
        }

        // Load user data from authentication - try multiple storage keys
        let userData = await AsyncStorage.getItem('userData');
        
        if (!userData) {
          userData = await AsyncStorage.getItem('user');
        }
        
        if (!userData) {
          userData = await AsyncStorage.getItem('authUser');
        }
        
        if (!userData) {
          userData = await AsyncStorage.getItem('userInfo');
        }

        if (userData) {
          try {
            const parsedUserData = JSON.parse(userData);
            
            // Handle different user data structures
            if (parsedUserData.user && parsedUserData.user.email) {
              setUser(parsedUserData.user);
              // Pre-fill name if available
              if (parsedUserData.user.name) {
                setName(parsedUserData.user.name);
              }
            } else if (parsedUserData.email) {
              setUser(parsedUserData);
              if (parsedUserData.name) {
                setName(parsedUserData.name);
              }
            } else if (parsedUserData.data && parsedUserData.data.email) {
              setUser(parsedUserData.data);
              if (parsedUserData.data.name) {
                setName(parsedUserData.data.name);
              }
            } else {
              setUser({ email: 'user@example.com' });
            }
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            if (typeof userData === 'string' && userData.includes('@')) {
              setUser({ email: userData });
            }
          }
        }

        // Start animations
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
        console.error('Error loading data:', error);
        showPopup(
          'Loading Error',
          'There was an error loading your cart information. Please try again.',
          'error'
        );
      }
    };
    
    loadCartAndUser();
  }, []);

  // Calculate order totals with proper decimal formatting
  const calculateSubtotal = () => {
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    return parseFloat(subtotal.toFixed(2));
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const tax = subtotal * 0.1; // 10% tax
    return parseFloat(tax.toFixed(2));
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 50 ? 0 : 9.99;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  // Enhanced Phone validation for international numbers
  const validatePhone = (text) => {
    setPhone(text);
    const phoneRegex = /^[+]?[\d\s-()]{10,15}$/;
    if (text && !phoneRegex.test(text)) {
      setErrors(prev => ({ ...prev, phone: 'Please enter a valid phone number (10-15 digits)' }));
    } else {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  // Enhanced scroll to the first error field
  const scrollToFirstError = () => {
    setTimeout(() => {
      if (errors.name && nameInputRef.current) {
        nameInputRef.current.focus();
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else if (errors.phone && phoneInputRef.current) {
        phoneInputRef.current.focus();
        scrollViewRef.current?.scrollTo({ y: responsiveHeight(10), animated: true });
      } else if (errors.address && addressInputRef.current) {
        addressInputRef.current.focus();
        scrollViewRef.current?.scrollTo({ y: responsiveHeight(20), animated: true });
      }
    }, 100);
  };

  // Enhanced Handle checkout submission
  const handleCheckout = async () => {
    // Clear previous errors
    setErrors({});

    const newErrors = {};
    if (!user?.email) newErrors.email = 'Email address is required';
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!address.trim()) newErrors.address = 'Delivery address is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';

    // Enhanced phone validation
    const phoneRegex = /^[+]?[\d\s-()]{10,15}$/;
    if (phone.trim() && !phoneRegex.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showPopup(
        'Missing Information',
        'Please fill in all required fields to continue with your order. All fields marked with * are required.',
        'warning'
      );
      scrollToFirstError();
      return;
    }

    setLoading(true);

    // Button animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const orderData = {
      name: name.trim(),
      email: user?.email,
      phone: phone.trim(),
      address: address.trim(),
      items: cartItems,
      subtotal: calculateSubtotal().toFixed(2),
      tax: calculateTax().toFixed(2),
      shipping: calculateShipping().toFixed(2),
      total: calculateTotal().toFixed(2),
    };

    try {
      const response = await fetch("https://account.babahub.co/api/order/payfast/initiate-payment", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.paymentUrl) {
        await AsyncStorage.setItem("latestPaymentUrl", data.paymentUrl);
        
        // Clear cart on successful order creation
        await AsyncStorage.removeItem('cart');
        
        // Navigate directly to payment screen
        router.push("/PaymentScreen");
        
      } else {
        showPopup(
          'Payment Error',
          data.message || 'Payment initiation failed. Please check your information and try again.',
          'error'
        );
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showPopup(
        'Connection Error',
        'There was an error processing your order. Please check your internet connection and try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // If cart is empty, show nothing (will automatically navigate back)
  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your cart...</Text>
        </View>
        <CustomPopup
          visible={popupVisible}
          title={popupTitle}
          message={popupMessage}
          type={popupType}
          onClose={hidePopup}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      
      {/* Internet Connection Status Bar */}
      {!isConnected && (
        <View style={styles.offlineContainer}>
          <Ionicons name="wifi-outline" size={responsiveFont(16)} color={COLORS.white} />
          <Text style={styles.offlineText}>No internet connection</Text>
        </View>
      )}

      {/* Main Content Area */}
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <Animated.ScrollView 
          ref={scrollViewRef}
          style={[
            styles.scrollView,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: keyboardVisible ? keyboardHeight + responsiveHeight(15) : responsiveHeight(15) }
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header - Consistent with CartScreen */}
          <View style={[styles.header, { paddingTop: safeAreaTop }]}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <View style={styles.backButtonInner}>
                <Ionicons name="chevron-back" size={responsiveFont(18)} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Checkout</Text>
              <Text style={styles.headerSubtitle}>
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          {/* User Info Section */}
          <View style={styles.userInfoSection}>
            <View style={styles.userInfoHeader}>
              <Ionicons name="person-circle-outline" size={responsiveFont(20)} color={COLORS.primary} />
              <Text style={styles.userInfoTitle}>Account Information</Text>
            </View>
            <View style={styles.userEmailContainer}>
              <Ionicons name="mail-outline" size={responsiveFont(14)} color={COLORS.gray} />
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email || "Not logged in"}
              </Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={responsiveFont(12)} color={COLORS.success} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
          </View>

          {/* Contact Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={responsiveFont(18)} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Shipping Information</Text>
            </View>
            
            <View style={styles.twoColumnGrid}>
              {/* First Row - Two Columns */}
              <View style={styles.formRow}>
                <View style={styles.column}>
                  <Text style={styles.inputLabel}>Full name *</Text>
                  <TextInput
                    ref={nameInputRef}
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="Enter your full name"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (text.trim()) {
                        setErrors(prev => ({ ...prev, name: '' }));
                      }
                    }}
                    placeholderTextColor={COLORS.grayLight}
                    returnKeyType="next"
                    onSubmitEditing={() => phoneInputRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                  {errors.name && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="warning" size={responsiveFont(12)} color={COLORS.error} />
                      <Text style={styles.errorText}>{errors.name}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.column}>
                  <Text style={styles.inputLabel}>Phone number *</Text>
                  <TextInput
                    ref={phoneInputRef}
                    style={[styles.input, errors.phone && styles.inputError]}
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChangeText={validatePhone}
                    keyboardType="phone-pad"
                    placeholderTextColor={COLORS.grayLight}
                    returnKeyType="next"
                    onSubmitEditing={() => addressInputRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                  {errors.phone && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="warning" size={responsiveFont(12)} color={COLORS.error} />
                      <Text style={styles.errorText}>{errors.phone}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Second Row - Address (Full Width) */}
              <View style={styles.formRow}>
                <View style={styles.fullColumn}>
                  <Text style={styles.inputLabel}>Delivery address *</Text>
                  <TextInput
                    ref={addressInputRef}
                    style={[styles.input, styles.textArea, errors.address && styles.inputError]}
                    placeholder="Enter your complete delivery address including street, city, and zip code"
                    value={address}
                    onChangeText={(text) => {
                      setAddress(text);
                      if (text.trim()) {
                        setErrors(prev => ({ ...prev, address: '' }));
                      }
                    }}
                    multiline
                    numberOfLines={3}
                    placeholderTextColor={COLORS.grayLight}
                    returnKeyType="done"
                  />
                  {errors.address && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="warning" size={responsiveFont(12)} color={COLORS.error} />
                      <Text style={styles.errorText}>{errors.address}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Order Summary Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bag-outline" size={responsiveFont(18)} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Order Summary</Text>
              <View style={styles.totalBadge}>
                <Text style={styles.totalBadgeText}>R {calculateTotal().toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.orderItemsContainer}>
              {cartItems.map((item, index) => (
                <View key={`${item.id}-${index}`} style={styles.orderItem}>
                  <ProductImage 
                    imageUrl={`${BASE_URL}${item.image}`}
                    style={styles.orderItemImage}
                  />
                  
                  <View style={styles.orderItemDetails}>
                    <Text style={styles.orderItemTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    
                    <View style={styles.orderItemMeta}>
                      {item.color && (
                        <>
                          <View style={styles.variantContainer}>
                            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                            <Text style={styles.variantText}>{item.color}</Text>
                          </View>
                          <Text style={styles.variantText}>•</Text>
                        </>
                      )}
                      {item.size && (
                        <>
                          <Text style={styles.variantText}>Size: {item.size}</Text>
                          <Text style={styles.variantText}>•</Text>
                        </>
                      )}
                      <Text style={styles.variantText}>Qty: {item.quantity}</Text>
                    </View>

                    <View style={styles.orderItemBottom}>
                      <Text style={styles.orderItemPrice}>
                        R {item.price.toFixed(2)} each
                      </Text>
                      <Text style={styles.orderItemTotal}>
                        R {(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Premium Order Totals */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>R {calculateSubtotal().toFixed(2)}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Shipping</Text>
                  <Text style={[
                    styles.summaryValue,
                    calculateShipping() === 0 && styles.freeShipping
                  ]}>
                    {calculateShipping() === 0 ? 'FREE' : `R ${calculateShipping().toFixed(2)}`}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax (10%)</Text>
                  <Text style={styles.summaryValue}>R {calculateTax().toFixed(2)}</Text>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalAmount}>R {calculateTotal().toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Security & Payment Note */}
          <View style={styles.securityNote}>
            <View style={styles.securityHeader}>
              <Ionicons name="shield-checkmark" size={responsiveFont(18)} color={COLORS.success} />
              <Text style={styles.securityTitle}>Secure Payment</Text>
            </View>
            <Text style={styles.securityText}>
              • Your payment information is encrypted and secure{'\n'}
              • We never save your payment credentials{'\n'}
              • All transactions are processed through secure payment gateways
            </Text>
          </View>

          {/* Shipping Progress */}
          {calculateSubtotal() < 50 && (
            <View style={styles.shippingProgress}>
              <View style={styles.progressHeader}>
                <Ionicons name="rocket" size={responsiveFont(14)} color={COLORS.primary} />
                <Text style={styles.progressText}>
                  Add R {(50 - calculateSubtotal()).toFixed(2)} for free shipping
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${Math.min((calculateSubtotal() / 50) * 100, 100)}%` }
                  ]} 
                />
              </View>
            </View>
          )}
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      {/* Premium Checkout Footer - Fixed Pay Button */}
      {cartItems.length > 0 && (
        <View style={[
          styles.footer, 
          { 
            paddingBottom: safeAreaBottom,
            bottom: keyboardVisible ? keyboardHeight : 0
          }
        ]}>
          <View style={styles.footerContent}>
            <View style={styles.footerSummary}>
              <Text style={styles.footerTotalLabel}>Total Amount</Text>
              <Text style={styles.footerTotal}>R {calculateTotal().toFixed(2)}</Text>
              <Text style={styles.footerItems}>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</Text>
            </View>
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
                onPress={handleCheckout}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <View style={styles.checkoutButtonContent}>
                    <Ionicons name="lock-closed" size={responsiveFont(16)} color={COLORS.white} />
                    <Text style={styles.checkoutText}>Pay Now</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      )}

      {/* Custom Popup Modal */}
      <CustomPopup
        visible={popupVisible}
        title={popupTitle}
        message={popupMessage}
        type={popupType}
        onClose={hidePopup}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardAvoid: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: COLORS.white,
    paddingBottom: responsiveHeight(2),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: responsiveWidth(5),
  },
  loadingText: {
    marginTop: responsiveHeight(2),
    fontSize: responsiveFont(16),
    color: COLORS.gray,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Offline Status Bar
  offlineContainer: {
    backgroundColor: COLORS.error,
    padding: responsiveHeight(1),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: responsiveWidth(1.5),
  },
  offlineText: {
    color: COLORS.white,
    fontSize: responsiveFont(12),
    fontWeight: '600',
  },
  // Premium Popup Styles
  popupOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveWidth(5),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    borderRadius: responsiveWidth(5),
    width: '100%',
    maxWidth: responsiveWidth(90),
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: responsiveHeight(1) },
    shadowOpacity: 0.3,
    shadowRadius: responsiveWidth(3),
    elevation: 15,
    overflow: 'hidden',
  },
  popupContent: {
    flexDirection: 'row',
    padding: responsiveWidth(6),
    paddingBottom: responsiveWidth(4),
  },
  popupIconContainer: {
    marginRight: responsiveWidth(4),
  },
  popupIconCircle: {
    width: responsiveWidth(11),
    height: responsiveWidth(11),
    borderRadius: responsiveWidth(5.5),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: responsiveHeight(0.5) },
    shadowOpacity: 0.2,
    shadowRadius: responsiveWidth(2),
    elevation: 4,
  },
  popupTextContainer: {
    flex: 1,
  },
  popupTitle: {
    fontSize: responsiveFont(18),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: responsiveHeight(1),
    lineHeight: responsiveFont(22),
  },
  popupMessage: {
    fontSize: responsiveFont(14),
    color: COLORS.darkLight,
    lineHeight: responsiveFont(20),
  },
  popupActions: {
    padding: responsiveWidth(4),
    paddingTop: responsiveWidth(2),
  },
  popupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1.5),
    borderRadius: responsiveWidth(10),
    gap: responsiveWidth(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: responsiveHeight(0.5) },
    shadowOpacity: 0.2,
    shadowRadius: responsiveWidth(2),
    elevation: 4,
    minHeight: responsiveHeight(6),
  },
  popupButtonText: {
    color: COLORS.white,
    fontSize: responsiveFont(16),
    fontWeight: '700',
  },
  // Header - White Background
  header: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.5),
    borderBottomLeftRadius: responsiveWidth(3),
    borderBottomRightRadius: responsiveWidth(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: responsiveHeight(0.3) },
    shadowOpacity: 0.08,
    shadowRadius: responsiveWidth(2),
    elevation: 5,
    marginBottom: responsiveHeight(1),
  },
  backButton: {
    padding: responsiveWidth(2),
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
    marginBottom: responsiveHeight(0.3),
  },
  headerSubtitle: {
    fontSize: responsiveFont(13),
    color: COLORS.gray,
    fontWeight: '500',
  },
  headerRight: {
    width: responsiveWidth(9),
  },
  // User Info Section
  userInfoSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: responsiveWidth(4),
    marginTop: responsiveHeight(1),
    borderRadius: responsiveWidth(3),
    padding: responsiveWidth(4),
    borderWidth: 1,
    borderColor: COLORS.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveHeight(1),
    gap: responsiveWidth(2),
  },
  userInfoTitle: {
    fontSize: responsiveFont(16),
    fontWeight: '700',
    color: COLORS.dark,
  },
  userEmailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '08',
    padding: responsiveWidth(3),
    borderRadius: responsiveWidth(2),
    gap: responsiveWidth(2),
  },
  userEmail: {
    fontSize: responsiveFont(14),
    color: COLORS.dark,
    fontWeight: '600',
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: responsiveWidth(1.5),
    gap: responsiveWidth(1),
  },
  verifiedText: {
    fontSize: responsiveFont(10),
    color: COLORS.success,
    fontWeight: '700',
  },
  // Sections
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: responsiveWidth(4),
    marginTop: responsiveHeight(2),
    borderRadius: responsiveWidth(3),
    padding: responsiveWidth(4),
    borderWidth: 1,
    borderColor: COLORS.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveHeight(1.5),
    gap: responsiveWidth(2),
  },
  sectionTitle: {
    fontSize: responsiveFont(16),
    fontWeight: '700',
    color: COLORS.dark,
  },
  totalBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(0.7),
    borderRadius: responsiveWidth(3),
    marginLeft: 'auto',
  },
  totalBadgeText: {
    fontSize: responsiveFont(12),
    fontWeight: '700',
    color: COLORS.white,
  },
  // Two Column Form Layout
  twoColumnGrid: {
    gap: responsiveHeight(1.5),
  },
  formRow: {
    flexDirection: Platform.OS === 'ios' ? 'row' : 'column',
    gap: responsiveWidth(3),
  },
  column: {
    flex: 1,
    marginBottom: Platform.OS === 'android' ? responsiveHeight(1) : 0,
  },
  fullColumn: {
    flex: 1,
  },
  // Inputs
  inputGroup: {
    gap: responsiveHeight(0.5),
  },
  inputLabel: {
    fontSize: responsiveFont(14),
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: responsiveHeight(0.5),
  },
  input: {
    height: Platform.OS === 'ios' ? responsiveHeight(5.5) : responsiveHeight(6),
    borderWidth: 1.5,
    borderColor: COLORS.light,
    borderRadius: responsiveWidth(2.5),
    paddingHorizontal: responsiveWidth(3.5),
    fontSize: responsiveFont(14),
    color: COLORS.dark,
    backgroundColor: COLORS.white,
    textAlignVertical: 'center',
  },
  textArea: {
    height: responsiveHeight(12),
    textAlignVertical: 'top',
    paddingTop: responsiveHeight(1.5),
    paddingBottom: responsiveHeight(1.5),
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(1),
    marginTop: responsiveHeight(0.5),
  },
  errorText: {
    color: COLORS.error,
    fontSize: responsiveFont(11),
    fontWeight: '500',
  },
  // Order Items
  orderItemsContainer: {
    gap: responsiveHeight(1.5),
    marginBottom: responsiveHeight(2),
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveWidth(3),
    backgroundColor: COLORS.background,
    borderRadius: responsiveWidth(2.5),
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  orderItemImage: {
    width: responsiveWidth(14),
    height: responsiveWidth(14),
    borderRadius: responsiveWidth(2),
    marginRight: responsiveWidth(3),
  },
  placeholderContainer: {
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: responsiveWidth(2),
  },
  imageLoading: {
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: responsiveWidth(2),
  },
  productImage: {
    borderRadius: responsiveWidth(2),
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemTitle: {
    fontSize: responsiveFont(14),
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: responsiveHeight(0.5),
    lineHeight: responsiveFont(18),
  },
  orderItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: responsiveWidth(1),
    marginBottom: responsiveHeight(0.5),
  },
  variantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(1),
  },
  colorDot: {
    width: responsiveWidth(3),
    height: responsiveWidth(3),
    borderRadius: responsiveWidth(1.5),
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  variantText: {
    fontSize: responsiveFont(11),
    color: COLORS.gray,
    fontWeight: '500',
  },
  orderItemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: responsiveHeight(0.5),
  },
  orderItemPrice: {
    fontSize: responsiveFont(12),
    color: COLORS.gray,
    fontWeight: '500',
  },
  orderItemTotal: {
    fontSize: responsiveFont(14),
    fontWeight: '700',
    color: COLORS.primary,
  },
  // Order Summary
  summaryCard: {
    backgroundColor: COLORS.background,
    borderRadius: responsiveWidth(2.5),
    padding: responsiveWidth(4),
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  summaryGrid: {
    gap: responsiveHeight(1),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: responsiveFont(14),
    color: COLORS.gray,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: responsiveFont(14),
    fontWeight: '600',
    color: COLORS.dark,
  },
  freeShipping: {
    color: COLORS.success,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.light,
    marginVertical: responsiveHeight(0.5),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: responsiveFont(16),
    fontWeight: '700',
    color: COLORS.dark,
  },
  totalAmount: {
    fontSize: responsiveFont(20),
    fontWeight: '800',
    color: COLORS.primary,
  },
  // Security Note
  securityNote: {
    backgroundColor: COLORS.success + '08',
    marginHorizontal: responsiveWidth(4),
    marginTop: responsiveHeight(2),
    padding: responsiveWidth(4),
    borderRadius: responsiveWidth(2.5),
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    borderWidth: 1,
    borderColor: COLORS.success + '20',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(2),
    marginBottom: responsiveHeight(0.75),
  },
  securityTitle: {
    fontSize: responsiveFont(14),
    fontWeight: '700',
    color: COLORS.success,
  },
  securityText: {
    fontSize: responsiveFont(12),
    color: COLORS.darkLight,
    lineHeight: responsiveHeight(2.2),
  },
  // Shipping Progress
  shippingProgress: {
    marginHorizontal: responsiveWidth(4),
    marginTop: responsiveHeight(2),
    padding: responsiveWidth(3.5),
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(2.5),
    borderWidth: 1,
    borderColor: COLORS.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(1.5),
    marginBottom: responsiveHeight(1),
  },
  progressText: {
    fontSize: responsiveFont(12),
    color: COLORS.dark,
    fontWeight: '500',
  },
  progressBar: {
    height: responsiveHeight(0.6),
    backgroundColor: COLORS.light,
    borderRadius: responsiveHeight(0.3),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: responsiveHeight(0.3),
  },
  // Premium Footer - Fixed at Bottom
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: -responsiveHeight(0.3) },
        shadowOpacity: 0.1,
        shadowRadius: responsiveWidth(2),
      },
      android: {
        elevation: 8,
        borderTopWidth: 2,
      },
    }),
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.5),
    gap: responsiveWidth(3),
  },
  footerSummary: {
    flex: 1,
  },
  footerTotalLabel: {
    fontSize: responsiveFont(12),
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: responsiveHeight(0.3),
  },
  footerTotal: {
    fontSize: responsiveFont(22),
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: responsiveHeight(0.3),
  },
  footerItems: {
    fontSize: responsiveFont(13),
    color: COLORS.gray,
    fontWeight: '500',
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: responsiveWidth(8),
    paddingHorizontal: responsiveWidth(6),
    paddingVertical: responsiveHeight(1.8),
    minWidth: responsiveWidth(35),
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: responsiveHeight(0.5) },
        shadowOpacity: 0.3,
        shadowRadius: responsiveWidth(2),
      },
      android: {
        elevation: 6,
        shadowColor: COLORS.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
    }),
  },
  checkoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: responsiveWidth(2),
  },
  checkoutButtonDisabled: {
    backgroundColor: COLORS.grayLight,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gray,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  checkoutText: {
    color: COLORS.white,
    fontSize: responsiveFont(16),
    fontWeight: '700',
  },
});

export default Checkout;