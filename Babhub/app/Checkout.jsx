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
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const BASE_URL = 'https://account.babahub.co';

// Premium Product Image Component
const ProductImage = ({ imageUrl, style }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (imageError || !imageUrl) {
    return (
      <View style={[style, styles.placeholderContainer]}>
        <Ionicons name="image-outline" size={20} color={COLORS.grayLight} />
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

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const buttonScale = useState(new Animated.Value(1))[0];

  // Refs for scrolling to errors and input focus
  const scrollViewRef = useRef(null);
  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const addressInputRef = useRef(null);

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
            router.back();
            return;
          }
        } else {
          // If no cart found, go back
          router.back();
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
            } else if (parsedUserData.email) {
              setUser(parsedUserData);
            } else if (parsedUserData.data && parsedUserData.data.email) {
              setUser(parsedUserData.data);
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
      }
    };
    
    loadCartAndUser();
  }, []);

  // Calculate order totals
  const calculateSubtotal = () => cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const calculateTax = () => calculateSubtotal() * 0.1;
  const calculateShipping = () => calculateSubtotal() > 50 ? 0 : 9.99;
  const calculateTotal = () => calculateSubtotal() + calculateTax() + calculateShipping();

  // Phone validation
  const validatePhone = (text) => {
    setPhone(text);
    const phoneRegex = /^[+]?[\d\s-()]{10,}$/;
    if (text && !phoneRegex.test(text)) {
      setErrors(prev => ({ ...prev, phone: 'Please enter a valid phone number' }));
    } else {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  // Scroll to the first error field
  const scrollToFirstError = () => {
    if (errors.name && nameInputRef.current) {
      nameInputRef.current.focus();
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (errors.phone && phoneInputRef.current) {
      phoneInputRef.current.focus();
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (errors.address && addressInputRef.current) {
      addressInputRef.current.focus();
      scrollViewRef.current?.scrollTo({ y: 200, animated: true });
    }
  };

  // Handle checkout submission
  const handleCheckout = async () => {
    const newErrors = {};
    if (!user?.email) newErrors.email = 'Email address is required';
    if (!name) newErrors.name = 'Full name is required';
    if (!address) newErrors.address = 'Delivery address is required';
    if (!phone) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Show simple alert without banner
      Alert.alert(
        'Missing Information',
        'Please fill in all required fields to continue.',
        [{ text: 'OK', style: 'default' }]
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
      name,
      email: user?.email,
      phone,
      address,
      items: cartItems,
      subtotal: calculateSubtotal().toFixed(2),
      tax: calculateTax().toFixed(2),
      shipping: calculateShipping().toFixed(2),
      total: calculateTotal().toFixed(2),
    };

    try {
      const response = await fetch("https://account.babahub.co/api/order/payfast/initiate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      if (data.paymentUrl) {
        await AsyncStorage.setItem("latestPaymentUrl", data.paymentUrl);
        router.push("PaymentScreen");
      } else {
        Alert.alert("Payment Error", "Payment initiation failed. Please try again.");
      }
    } catch (error) {
      Alert.alert('Connection Error', 'There was an error processing your order. Please check your connection and try again.');
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // If cart is empty, show nothing (will automatically navigate back)
  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Redirecting...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.ScrollView 
        ref={scrollViewRef}
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Premium Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <View style={styles.backButtonInner}>
              <Ionicons name="chevron-back" size={24} color={COLORS.dark} />
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
            <Ionicons name="person-circle-outline" size={24} color={COLORS.primary} />
            <Text style={styles.userInfoTitle}>Account Information</Text>
          </View>
          <View style={styles.userEmailContainer}>
            <Ionicons name="mail-outline" size={16} color={COLORS.gray} />
            <Text style={styles.userEmail}>{user?.email || "Not logged in"}</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
        </View>

        {/* Contact Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
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
                    if (text) {
                      setErrors(prev => ({ ...prev, name: '' }));
                    }
                  }}
                  placeholderTextColor={COLORS.grayLight}
                  returnKeyType="next"
                />
                {errors.name && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="warning" size={12} color={COLORS.error} />
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
                />
                {errors.phone && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="warning" size={12} color={COLORS.error} />
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
                    if (text) {
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
                    <Ionicons name="warning" size={12} color={COLORS.error} />
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
            <Ionicons name="bag-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>${calculateTotal().toFixed(2)}</Text>
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
                  <Text style={styles.orderItemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  
                  <View style={styles.orderItemMeta}>
                    <View style={styles.variantContainer}>
                      <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                      <Text style={styles.variantText}>{item.color}</Text>
                    </View>
                    <Text style={styles.variantText}>•</Text>
                    <Text style={styles.variantText}>Size: {item.size}</Text>
                    <Text style={styles.variantText}>•</Text>
                    <Text style={styles.variantText}>Qty: {item.quantity}</Text>
                  </View>

                  <View style={styles.orderItemBottom}>
                    <Text style={styles.orderItemPrice}>
                      ${item.price.toFixed(2)} each
                    </Text>
                    <Text style={styles.orderItemTotal}>
                      ${(item.price * item.quantity).toFixed(2)}
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
                <Text style={styles.summaryValue}>${calculateSubtotal().toFixed(2)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={[
                  styles.summaryValue,
                  calculateShipping() === 0 && styles.freeShipping
                ]}>
                  {calculateShipping() === 0 ? 'FREE' : `$${calculateShipping().toFixed(2)}`}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>${calculateTax().toFixed(2)}</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>${calculateTotal().toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Security & Payment Note */}
        <View style={styles.securityNote}>
          <View style={styles.securityHeader}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
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
              <Ionicons name="rocket" size={16} color={COLORS.primary} />
              <Text style={styles.progressText}>
                Add ${(50 - calculateSubtotal()).toFixed(2)} for free shipping
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${(calculateSubtotal() / 50) * 100}%` }
                ]} 
              />
            </View>
          </View>
        )}
      </Animated.ScrollView>

      {/* Premium Checkout Footer */}
      <View style={styles.footer}>
        <View style={styles.footerBackground}>
          <View style={styles.footerContent}>
            <View style={styles.footerSummary}>
              <Text style={styles.footerTotal}>${calculateTotal().toFixed(2)}</Text>
              <Text style={styles.footerItems}>{cartItems.length} items</Text>
            </View>
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
                onPress={handleCheckout}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="lock-closed" size={18} color={COLORS.white} />
                    <Text style={styles.checkoutText}>Pay Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray,
  },
  // Premium Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
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
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  headerRight: {
    width: 40,
  },
  // User Info Section
  userInfoSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  userInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
  },
  userEmailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '08',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '600',
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  verifiedText: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: '700',
  },
  // Sections
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
  },
  totalBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 'auto',
  },
  totalBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  // Two Column Form Layout
  twoColumnGrid: {
    gap: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
  },
  fullColumn: {
    flex: 1,
  },
  // Inputs
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORS.light,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '08',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 11,
    fontWeight: '500',
  },
  // Order Items - Compact Design
  orderItemsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  orderItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderContainer: {
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  imageLoading: {
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  productImage: {
    borderRadius: 8,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  orderItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  variantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  variantText: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: '500',
  },
  orderItemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderItemPrice: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  orderItemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  // Order Summary
  summaryCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
  },
  summaryGrid: {
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
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
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  // Security Note
  securityNote: {
    backgroundColor: COLORS.success + '08',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.success,
  },
  securityText: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 16,
  },
  // Shipping Progress
  shippingProgress: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.dark,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  // Premium Footer
  footer: {
    paddingTop: 16,
  },
  footerBackground: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerSummary: {
    flex: 1,
  },
  footerTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  footerItems: {
    fontSize: 13,
    color: COLORS.gray,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: COLORS.grayLight,
  },
  checkoutText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default Checkout;