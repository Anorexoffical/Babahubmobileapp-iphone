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

// Premium color palette - Matching MyOrder screen
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
  whatsapp: '#25D366',
};

const BASE_URL = 'https://account.babahub.co';

// Product Image Component
const ProductImage = ({ imageUrl, style }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (imageError || !imageUrl) {
    return (
      <View style={[style, styles.placeholderContainer]}>
        <Ionicons name="image-outline" size={20} color={COLORS.grayLight} />
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

  useEffect(() => {
    const prepare = async () => {
      try {
        const storedCart = await AsyncStorage.getItem('cart');
        if (storedCart) {
          const items = JSON.parse(storedCart);
          setCartItems(items);
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

  const removeItem = async (index) => {
    const updatedItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedItems);
    await AsyncStorage.setItem('cart', JSON.stringify(updatedItems));
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

  const handleStartShopping = () => {
    router.replace('/(tabs)/HomeScreen');
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
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header - White with reduced height and rounded corners */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <View style={styles.backButtonInner}>
              <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
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
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>

        {cartItems.length > 0 ? (
          <>
            {/* Cart Items - Made smaller */}
            <View style={styles.cartItemsContainer}>
              {cartItems.map((item, index) => (
                <View key={`${item.id}-${item.color}-${item.size}-${index}`} style={styles.cartItem}>
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
                        <Ionicons name="close" size={16} color={COLORS.grayLight} />
                      </TouchableOpacity>
                    </View>

                    {/* Category Display */}
                    <View style={styles.categoryContainer}>
                      {item.category && (
                        <View style={styles.categoryPill}>
                          <Ionicons name="pricetag" size={10} color={COLORS.primary} />
                          <Text style={styles.itemCategory}>{item.category}</Text>
                        </View>
                      )}
                    </View>

                    {/* Variants Display */}
                    <View style={styles.variantsContainer}>
                      <View style={styles.variantPill}>
                        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                        <Text style={styles.variantText}>{item.color}</Text>
                      </View>
                      <View style={styles.variantPill}>
                        <Text style={styles.variantText}>Size: {item.size}</Text>
                      </View>
                    </View>

                    {/* Bottom Row */}
                    <View style={styles.itemBottomRow}>
                      <Text style={styles.itemPrice}>
                        R {(item.price * item.quantity).toFixed(2)}
                      </Text>
                      
                      {/* Quantity Controls */}
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
                            size={14} 
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
                          <Ionicons name="add" size={14} color={COLORS.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Order Summary */}
            <View style={styles.summarySection}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Order Summary</Text>

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
                    <Text style={styles.summaryLabel}>Tax</Text>
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

            {/* Shipping Progress */}
            {calculateSubtotal() < 50 && (
              <View style={styles.shippingProgress}>
                <View style={styles.progressHeader}>
                  <Ionicons name="rocket" size={14} color={COLORS.primary} />
                  <Text style={styles.progressText}>
                    Add R {(50 - calculateSubtotal()).toFixed(2)} for free shipping
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
          /* Empty State with addtocart.png */
          <View style={styles.emptyState}>
            <View style={styles.emptyIllustration}>
              <Image 
                source={require('../assets/images/addtocart.png')} 
                style={styles.emptyImage}
                resizeMode="contain"
              />
            </View>
            
            <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptyDescription}>
              Looks like you haven't added anything to your cart yet. Start shopping to discover amazing products!
            </Text>
            
            <TouchableOpacity 
              style={styles.startShoppingButton}
              onPress={handleStartShopping}
            >
              <Ionicons name="storefront-outline" size={18} color={COLORS.white} />
              <Text style={styles.startShoppingText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Checkout Footer */}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerBackground}>
            <View style={styles.footerContent}>
              <View style={styles.footerSummary}>
                <Text style={styles.footerTotal}>R {calculateTotal().toFixed(2)}</Text>
                <Text style={styles.footerItems}>{itemCount} items</Text>
              </View>
              <TouchableOpacity 
                style={styles.checkoutButton}
                onPress={() => router.push('/Checkout')}
              >
                <Text style={styles.checkoutText}>Checkout</Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
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
    backgroundColor: COLORS.white, // Changed to white
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white, // Changed to white
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: COLORS.white, // Changed to white
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white, // Changed to white
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },
  // Header - White with reduced height and rounded corners
  header: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    borderBottomLeftRadius: 20, // Rounded corners maintained
    borderBottomRightRadius: 20, // Rounded corners maintained
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 8,
  },
  backButton: {
    padding: 6,
  },
  backButtonInner: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)', // Light purple background
    borderRadius: 10,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark, // Changed to dark for white background
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  clearButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  // Cart Items Container
  cartItemsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  // Cart Item - Made smaller
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.light,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  itemImageContainer: {
    position: 'relative',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  itemBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.white,
  },
  placeholderContainer: {
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  placeholderText: {
    fontSize: 9,
    color: COLORS.grayLight,
    marginTop: 2,
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
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    lineHeight: 18,
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 2,
  },
  categoryContainer: {
    marginBottom: 6,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  itemCategory: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  variantsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  variantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  variantText: {
    fontSize: 10,
    color: COLORS.dark,
    fontWeight: '500',
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  quantityBtn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: COLORS.white,
  },
  quantityBtnDisabled: {
    opacity: 0.5,
  },
  quantityDisplay: {
    minWidth: 28,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  quantityNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
  },
  // Order Summary
  summarySection: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.light,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 12,
  },
  summaryGrid: {
    gap: 8,
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
    marginVertical: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  // Shipping Progress
  shippingProgress: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.light,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
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
    gap: 6,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
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
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: COLORS.white,
  },
  emptyIllustration: {
    marginBottom: 24,
    alignItems: 'center',
  },
emptyImage: {
  width: width * 3,
  height: width * 0.6,
  maxWidth: 1500,
  maxHeight: 400,
},
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  startShoppingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  startShoppingText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  // Footer
  footer: {
    paddingTop: 12,
  },
  footerBackground: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.light,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
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
    fontWeight: '800',
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
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  checkoutText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CartScreen;