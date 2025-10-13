import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Alert,
  SafeAreaView,
  Animated,
  Platform,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get('window');

// Premium color palette - Fixed with proper hex codes
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
        <Ionicons name="image-outline" size={28} color={COLORS.grayLight} />
        <Text style={styles.placeholderText}>No Image</Text>
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

const CartScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appIsReady, setAppIsReady] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const [itemAnimations] = useState({});

  useEffect(() => {
    const prepare = async () => {
      try {
        const storedCart = await AsyncStorage.getItem('cart');
        if (storedCart) {
          const items = JSON.parse(storedCart);
          setCartItems(items);
          
          // Initialize animations for each item
          items.forEach((_, index) => {
            itemAnimations[index] = new Animated.Value(0);
          });
        }
        
        // Artificial delay for demonstration
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        setLoading(false);
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  useEffect(() => {
    if (params.newCartItem) {
      const newItem = JSON.parse(params.newCartItem);

      setCartItems(prevItems => {
        const existingIndex = prevItems.findIndex(
          item => item.id === newItem.id && 
                   item.color === newItem.color && 
                   item.size === newItem.size
        );

        if (existingIndex >= 0) {
          const updatedItems = [...prevItems];
          updatedItems[existingIndex].quantity += newItem.quantity;
          AsyncStorage.setItem('cart', JSON.stringify(updatedItems));
          return updatedItems;
        } else {
          const updatedItems = [...prevItems, newItem];
          AsyncStorage.setItem('cart', JSON.stringify(updatedItems));
          return updatedItems;
        }
      });
    }
  }, [params.newCartItem]);

  // Start animations when app is ready
  useEffect(() => {
    if (appIsReady && cartItems.length > 0) {
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
        }),
        ...cartItems.map((_, index) => 
          Animated.spring(itemAnimations[index], {
            toValue: 1,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
            delay: index * 100,
          })
        )
      ]).start();
    }
  }, [appIsReady]);

  const removeItem = async (index) => {
    // Smooth removal animation
    Animated.parallel([
      Animated.timing(itemAnimations[index], {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      const updatedItems = cartItems.filter((_, i) => i !== index);
      setCartItems(updatedItems);
      AsyncStorage.setItem('cart', JSON.stringify(updatedItems));
      
      // Restore fade animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const updateQuantity = async (index, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(index);
      return;
    }
    
    const updatedItems = cartItems.map((item, i) =>
      i === index ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    await AsyncStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const calculateSubtotal = () => cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const calculateTax = () => calculateSubtotal() * 0.1;
  const calculateShipping = () => calculateSubtotal() > 50 ? 0 : 9.99;
  const calculateTotal = () => calculateSubtotal() + calculateTax() + calculateShipping();

  const getCartSummary = () => {
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const uniqueItems = cartItems.length;
    return { itemCount, uniqueItems };
  };

  const clearCart = async () => {
    Alert.alert(
      'Clear Cart',
      'Remove all items from your cart?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            setCartItems([]);
            await AsyncStorage.setItem('cart', JSON.stringify([]));
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { itemCount } = getCartSummary();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.ScrollView 
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
            <Text style={styles.headerTitle}>Shopping Cart</Text>
            {cartItems.length > 0 && (
              <Text style={styles.headerSubtitle}>
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </Text>
            )}
          </View>
          {cartItems.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearCart}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>

        {cartItems.length > 0 ? (
          <>
            {/* Premium Cart Items */}
            <View style={styles.cartSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Selection</Text>
                <View style={styles.totalBadge}>
                  <Text style={styles.totalBadgeText}>${calculateTotal().toFixed(2)}</Text>
                </View>
              </View>
              
              <View style={styles.cartItemsContainer}>
                {cartItems.map((item, index) => (
                  <Animated.View 
                    key={`${item.id}-${item.color}-${item.size}-${index}`} 
                    style={[
                      styles.cartItem,
                      {
                        opacity: itemAnimations[index] || 1,
                        transform: [
                          { 
                            translateX: (itemAnimations[index] || new Animated.Value(1)).interpolate({
                              inputRange: [0, 1],
                              outputRange: [-100, 0]
                            }) 
                          },
                          {
                            scale: itemAnimations[index] || 1
                          }
                        ]
                      }
                    ]}
                  >
                    <View style={styles.itemImageContainer}>
                      <ProductImage 
                        imageUrl={`${BASE_URL}${item.image}`}
                        style={styles.itemImage}
                      />
                      <View style={styles.itemBadge}>
                        <Text style={styles.itemBadgeText}>{item.quantity}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.itemDetails}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <TouchableOpacity 
                          onPress={() => removeItem(index)}
                          style={styles.removeButton}
                        >
                          <Ionicons name="close" size={20} color={COLORS.grayLight} />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.itemBrand}>
                        {item.brand || 'Generic Brand'}
                      </Text>

                      {/* Premium Variants Display */}
                      <View style={styles.variantsContainer}>
                        <View style={styles.variantPill}>
                          <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                          <Text style={styles.variantText}>{item.color}</Text>
                        </View>
                        <View style={styles.variantPill}>
                          <Text style={styles.variantText}>Size: {item.size}</Text>
                        </View>
                      </View>

                      {/* Premium Bottom Row */}
                      <View style={styles.itemBottomRow}>
                        <Text style={styles.itemPrice}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </Text>
                        
                        {/* Premium Quantity Controls */}
                        <View style={styles.quantityControl}>
                          <TouchableOpacity 
                            onPress={() => updateQuantity(index, item.quantity - 1)}
                            style={[
                              styles.quantityBtn,
                              item.quantity <= 1 && styles.quantityBtnDisabled
                            ]}
                            disabled={item.quantity <= 1}
                          >
                            <Ionicons 
                              name="remove" 
                              size={18} 
                              color={item.quantity <= 1 ? COLORS.grayLight : COLORS.primary} 
                            />
                          </TouchableOpacity>

                          <View style={styles.quantityDisplay}>
                            <Text style={styles.quantityNumber}>{item.quantity}</Text>
                          </View>

                          <TouchableOpacity 
                            onPress={() => updateQuantity(index, item.quantity + 1)}
                            style={styles.quantityBtn}
                          >
                            <Ionicons name="add" size={18} color={COLORS.primary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </View>

            {/* Premium Order Summary */}
            <View style={styles.summarySection}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Order Summary</Text>

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

            {/* Premium Shipping Progress */}
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
          </>
        ) : (
          /* Premium Empty State */
          <View style={styles.emptyState}>
            <View style={styles.emptyIllustration}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="cart-outline" size={80} color={COLORS.primaryLight} />
              </View>
              <View style={styles.emptySparkle}>
                <Ionicons name="sparkles" size={24} color={COLORS.primary} />
              </View>
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyDescription}>
              Discover amazing products and add them to your cart to get started with your shopping journey.
            </Text>
            <TouchableOpacity 
              style={styles.startShoppingButton}
              onPress={() => router.replace('/')}
            >
              <Ionicons name="search" size={20} color={COLORS.white} />
              <Text style={styles.startShoppingText}>Explore Products</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.ScrollView>

      {/* Premium Checkout Footer */}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerBackground}>
            <View style={styles.footerContent}>
              <View style={styles.footerSummary}>
                <Text style={styles.footerTotal}>${calculateTotal().toFixed(2)}</Text>
                <Text style={styles.footerItems}>{itemCount} items</Text>
              </View>
              <TouchableOpacity 
                style={styles.checkoutButton}
                onPress={() => router.push('/Checkout')}
              >
                <Text style={styles.checkoutText}>Checkout</Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },
  // Premium Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  backButton: {
    padding: 4,
  },
  backButtonInner: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    borderRadius: 14,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.gray,
    fontWeight: '500',
  },
  clearButton: {
    padding: 8,
  },
  // Cart Section
  cartSection: {
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
  },
  totalBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  totalBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  cartItemsContainer: {
    paddingHorizontal: 24,
  },
  // Premium Cart Item
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  itemImageContainer: {
    position: 'relative',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  itemBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  itemBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  placeholderContainer: {
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  placeholderText: {
    fontSize: 10,
    color: COLORS.grayLight,
    marginTop: 4,
  },
  imageLoading: {
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  productImage: {
    borderRadius: 16,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 20,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.dark,
    lineHeight: 22,
    flex: 1,
    marginRight: 12,
  },
  removeButton: {
    padding: 4,
  },
  itemBrand: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 12,
  },
  variantsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  variantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  variantText: {
    fontSize: 13,
    color: COLORS.dark,
    fontWeight: '500',
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 4,
  },
  quantityBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },
  quantityBtnDisabled: {
    opacity: 0.5,
  },
  quantityDisplay: {
    width: 40,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  // Premium Order Summary
  summarySection: {
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 20,
  },
  summaryGrid: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
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
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  // Shipping Progress
  shippingProgress: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.light,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  // Premium Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyIllustration: {
    marginBottom: 32,
    position: 'relative',
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  emptySparkle: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: COLORS.white,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 17,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  startShoppingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  startShoppingText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '600',
  },
  // Premium Footer
  footer: {
    paddingTop: 20,
  },
  footerBackground: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
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
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  footerItems: {
    fontSize: 15,
    color: COLORS.gray,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  checkoutText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '600',
  },
});

export default CartScreen;