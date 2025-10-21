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
  Dimensions,
  StatusBar,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

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
        <Ionicons name="image-outline" size={responsiveFont(16)} color={COLORS.grayLight} />
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

// Custom Clear Cart Modal Component
const ClearCartModal = ({ visible, onClose, onConfirm }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="trash-outline" size={responsiveFont(24)} color={COLORS.white} />
            </View>
            <Text style={styles.modalTitle}>Clear Cart</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to remove all items from your cart?
            </Text>
          </View>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Ionicons name="trash" size={responsiveFont(16)} color={COLORS.white} />
              <Text style={styles.confirmButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const CartScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appIsReady, setAppIsReady] = useState(false);
  const [productStock, setProductStock] = useState({});
  const [clearCartModalVisible, setClearCartModalVisible] = useState(false);

  // Safe area values
  const safeAreaBottom = getSafeAreaBottom();
  const safeAreaTop = getSafeAreaTop();

  useEffect(() => {
    const prepare = async () => {
      try {
        const storedCart = await AsyncStorage.getItem('cart');
        if (storedCart) {
          const items = JSON.parse(storedCart);
          setCartItems(items);
          
          // Fetch stock information for all cart items
          await fetchStockForCartItems(items);
        }
        
        // Artificial delay for demonstration
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        setLoading(false);
        // Only hide splash screen if app is ready and we're not unmounting
        if (!loading) {
          try {
            await SplashScreen.hideAsync();
          } catch (error) {
            console.log('Splash screen already hidden');
          }
        }
      }
    };

    prepare();

    // Cleanup function to prevent splash screen errors
    return () => {
      setAppIsReady(false);
    };
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

  // Fetch stock information for cart items
  const fetchStockForCartItems = async (items) => {
    const stockData = {};
    
    try {
      for (const item of items) {
        if (!stockData[item.id]) {
          const response = await fetch(`${BASE_URL}/api/products/${item.id}`);
          const product = await response.json();
          
          // Find the stock for this specific variant
          const variant = product.variants?.find(v => v.color === item.color);
          const sizeObj = variant?.sizes?.find(s => s.size === item.size);
          
          if (sizeObj) {
            stockData[item.id] = {
              ...stockData[item.id],
              [`${item.color}-${item.size}`]: sizeObj.stock
            };
          }
        }
      }
      
      setProductStock(stockData);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  };

  // Get available stock for a specific cart item
  const getAvailableStock = (item) => {
    const stockKey = `${item.color}-${item.size}`;
    return productStock[item.id]?.[stockKey] || 0;
  };

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
    
    const item = cartItems[index];
    const availableStock = getAvailableStock(item);
    
    // Only check stock limit when increasing quantity, not when decreasing
    if (newQuantity > item.quantity && newQuantity > availableStock) {
      Alert.alert(
        'Stock Limit Reached',
        `Only ${availableStock} items available in stock. You cannot add more than the available quantity.`,
        [
          { 
            text: 'OK', 
            style: 'default' 
          }
        ]
      );
      return;
    }
    
    const updatedItems = cartItems.map((item, i) =>
      i === index ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    await AsyncStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const calculateSubtotal = () => cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const calculateTax = () => 0; // Changed to zero tax
  const calculateShipping = () => calculateSubtotal() > 50 ? 0 : 9.99;
  const calculateTotal = () => calculateSubtotal() + calculateTax() + calculateShipping();

  const getCartSummary = () => {
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const uniqueItems = cartItems.length;
    return { itemCount, uniqueItems };
  };

  const showClearCartModal = () => {
    setClearCartModalVisible(true);
  };

  const hideClearCartModal = () => {
    setClearCartModalVisible(false);
  };

  const clearCart = async () => {
    setCartItems([]);
    await AsyncStorage.setItem('cart', JSON.stringify([]));
    hideClearCartModal();
  };

  const handleStartShopping = () => {
    router.replace('/(tabs)/HomeScreen');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { itemCount } = getCartSummary();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Improved Header - Clean and centered */}
        <View style={[styles.header, { paddingTop: safeAreaTop }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <View style={styles.backButtonInner}>
              <Ionicons name="chevron-back" size={responsiveFont(18)} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Shopping Cart</Text>
          </View>
          
          {cartItems.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={showClearCartModal}
            >
              <Ionicons name="trash-outline" size={responsiveFont(16)} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>

        {cartItems.length > 0 ? (
          <>
            {/* Cart Items */}
            <View style={styles.cartItemsContainer}>
              {cartItems.map((item, index) => {
                const availableStock = getAvailableStock(item);
                const isMaxQuantity = item.quantity >= availableStock;
                
                return (
                  <View key={`${item.id}-${item.color}-${item.size}-${index}`} style={styles.cartItem}>
                    <View style={styles.itemImageContainer}>
                      <ProductImage 
                        imageUrl={`${BASE_URL}${item.image}`}
                        style={styles.itemImage}
                      />
                      {/* Improved Quantity Badge - Bigger and more visible */}
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
                          <Ionicons name="close" size={responsiveFont(14)} color={COLORS.grayLight} />
                        </TouchableOpacity>
                      </View>

                      {/* Category Display */}
                      <View style={styles.categoryContainer}>
                        {item.category && (
                          <View style={styles.categoryPill}>
                            <Ionicons name="pricetag" size={responsiveFont(10)} color={COLORS.primary} />
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

                      {/* Stock Information */}
                      {availableStock > 0 && (
                        <View style={styles.stockInfo}>
                          <Text style={[
                            styles.stockText,
                            availableStock <= 10 && styles.lowStockText
                          ]}>
                            {availableStock <= 10 
                              ? `Only ${availableStock} left in stock` 
                              : `${availableStock} in stock`
                            }
                          </Text>
                        </View>
                      )}

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
                              styles.quantityMinus,
                              item.quantity <= 1 && styles.quantityBtnDisabled
                            ]}
                            disabled={item.quantity <= 1}
                          >
                            <Ionicons 
                              name="remove" 
                              size={responsiveFont(14)} 
                              color={item.quantity <= 1 ? COLORS.grayLight : COLORS.white} 
                            />
                          </TouchableOpacity>

                          <View style={styles.quantityDisplay}>
                            <Text style={styles.quantityNumber}>{item.quantity}</Text>
                          </View>

                          <TouchableOpacity 
                            onPress={() => updateQuantity(index, item.quantity + 1)}
                            style={[
                              styles.quantityBtn, 
                              styles.quantityPlus,
                              isMaxQuantity && styles.quantityBtnDisabled
                            ]}
                            disabled={isMaxQuantity}
                          >
                            <Ionicons 
                              name="add" 
                              size={responsiveFont(14)} 
                              color={isMaxQuantity ? COLORS.grayLight : COLORS.white} 
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
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
                  <Ionicons name="rocket" size={responsiveFont(14)} color={COLORS.primary} />
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

            {/* Extra Spacer for Footer */}
            <View style={[styles.bottomSpacer, { height: responsiveHeight(12) + safeAreaBottom }]} />
          </>
        ) : (
          /* Empty State */
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
              <Ionicons name="storefront-outline" size={responsiveFont(16)} color={COLORS.white} />
              <Text style={styles.startShoppingText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Improved Checkout Footer - Fixed positioning with safe area */}
      {cartItems.length > 0 && (
        <View style={[styles.footer, { paddingBottom: safeAreaBottom }]}>
          <View style={styles.footerContent}>
            <View style={styles.footerSummary}>
              <Text style={styles.footerTotalLabel}>Total Amount</Text>
              <Text style={styles.footerTotal}>R {calculateTotal().toFixed(2)}</Text>
              <Text style={styles.footerItems}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={() => router.push('/Checkout')}
            >
              <View style={styles.checkoutButtonContent}>
                <Text style={styles.checkoutText}>Checkout</Text>
                <View style={styles.checkoutIconContainer}>
                  <Ionicons name="arrow-forward" size={responsiveFont(16)} color={COLORS.white} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Custom Clear Cart Modal */}
      <ClearCartModal
        visible={clearCartModalVisible}
        onClose={hideClearCartModal}
        onConfirm={clearCart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
  },
  loadingText: {
    marginTop: responsiveHeight(2),
    fontSize: responsiveFont(16),
    color: COLORS.gray,
    fontWeight: '500',
  },
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
  },
  clearButton: {
    padding: responsiveWidth(2),
    borderRadius: responsiveWidth(2.5),
    backgroundColor: COLORS.primary,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: responsiveHeight(0.25) },
        shadowOpacity: 0.3,
        shadowRadius: responsiveWidth(1.5),
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cartItemsContainer: {
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(1),
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(3),
    padding: responsiveWidth(3),
    marginBottom: responsiveHeight(1),
    borderWidth: 1,
    borderColor: COLORS.light,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: responsiveHeight(0.25) },
        shadowOpacity: 0.06,
        shadowRadius: responsiveWidth(2),
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
    width: responsiveWidth(15),
    height: responsiveWidth(15),
    borderRadius: responsiveWidth(2),
  },
  // Improved Quantity Badge - Bigger and more visible
  itemBadge: {
    position: 'absolute',
    top: -responsiveWidth(2),
    right: -responsiveWidth(2),
    backgroundColor: COLORS.primary,
    width: responsiveWidth(7),
    height: responsiveWidth(7),
    borderRadius: responsiveWidth(3.5),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: responsiveHeight(0.25) },
        shadowOpacity: 0.3,
        shadowRadius: responsiveWidth(1.5),
      },
      android: {
        elevation: 4,
      },
    }),
  },
  itemBadgeText: {
    fontSize: responsiveFont(12),
    fontWeight: '800',
    color: COLORS.white,
  },
  placeholderContainer: {
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: responsiveWidth(2),
  },
  placeholderText: {
    fontSize: responsiveFont(9),
    color: COLORS.grayLight,
    marginTop: responsiveHeight(0.5),
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
  itemDetails: {
    flex: 1,
    marginLeft: responsiveWidth(3),
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: responsiveHeight(0.75),
  },
  itemTitle: {
    fontSize: responsiveFont(14),
    fontWeight: '600',
    color: COLORS.dark,
    lineHeight: responsiveHeight(2.25),
    flex: 1,
    marginRight: responsiveWidth(2),
  },
  removeButton: {
    padding: responsiveWidth(0.5),
  },
  categoryContainer: {
    marginBottom: responsiveHeight(0.75),
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: responsiveWidth(2),
    alignSelf: 'flex-start',
    gap: responsiveWidth(1),
  },
  itemCategory: {
    fontSize: responsiveFont(11),
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  variantsContainer: {
    flexDirection: 'row',
    gap: responsiveWidth(1.5),
    marginBottom: responsiveHeight(0.5),
  },
  variantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: responsiveWidth(1.5),
    gap: responsiveWidth(1),
  },
  colorDot: {
    width: responsiveWidth(2),
    height: responsiveWidth(2),
    borderRadius: responsiveWidth(1),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  variantText: {
    fontSize: responsiveFont(10),
    color: COLORS.dark,
    fontWeight: '500',
  },
  stockInfo: {
    marginBottom: responsiveHeight(0.75),
  },
  stockText: {
    fontSize: responsiveFont(11),
    color: COLORS.success,
    fontWeight: '500',
  },
  lowStockText: {
    color: COLORS.warning,
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontSize: responsiveFont(15),
    fontWeight: '700',
    color: COLORS.primary,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(35),
    borderWidth: 1,
    borderColor: COLORS.light,
    padding: responsiveWidth(0.5),
    gap: responsiveWidth(0.5),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: responsiveHeight(0.125) },
        shadowOpacity: 0.1,
        shadowRadius: responsiveWidth(0.5),
      },
      android: {
        elevation: 2,
      },
    }),
  },
  quantityBtn: {
    width: responsiveWidth(7),
    height: responsiveWidth(7),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: responsiveWidth(35),
  },
  quantityMinus: {
    backgroundColor: COLORS.primary,
  },
  quantityPlus: {
    backgroundColor: COLORS.primary,
  },
  quantityBtnDisabled: {
    backgroundColor: COLORS.grayLight,
  },
  quantityDisplay: {
    minWidth: responsiveWidth(8),
    height: responsiveWidth(7),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(35),
    paddingHorizontal: responsiveWidth(1),
  },
  quantityNumber: {
    fontSize: responsiveFont(13),
    fontWeight: '700',
    color: COLORS.dark,
  },
  summarySection: {
    paddingHorizontal: responsiveWidth(4),
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(2),
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(3),
    padding: responsiveWidth(4),
    borderWidth: 1,
    borderColor: COLORS.light,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: responsiveHeight(0.5) },
        shadowOpacity: 0.06,
        shadowRadius: responsiveWidth(2),
      },
      android: {
        elevation: 3,
      },
    }),
  },
  summaryTitle: {
    fontSize: responsiveFont(16),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: responsiveHeight(1.5),
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
    marginVertical: responsiveHeight(0.75),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: responsiveFont(15),
    fontWeight: '700',
    color: COLORS.dark,
  },
  totalAmount: {
    fontSize: responsiveFont(18),
    fontWeight: '800',
    color: COLORS.primary,
  },
  shippingProgress: {
    marginHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
    padding: responsiveWidth(3),
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(2.5),
    borderWidth: 1,
    borderColor: COLORS.light,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: responsiveHeight(0.25) },
        shadowOpacity: 0.04,
        shadowRadius: responsiveWidth(1.5),
      },
      android: {
        elevation: 2,
      },
    }),
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
    height: responsiveHeight(0.5),
    backgroundColor: COLORS.light,
    borderRadius: responsiveHeight(0.25),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: responsiveHeight(0.25),
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(6),
    paddingVertical: responsiveHeight(5),
    backgroundColor: COLORS.white,
  },
  emptyIllustration: {
    marginBottom: responsiveHeight(3),
    alignItems: 'center',
  },
  emptyImage: {
    width: width * 0.6,
    height: width * 0.4,
    maxWidth: 300,
    maxHeight: 200,
  },
  emptyTitle: {
    fontSize: responsiveFont(20),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: responsiveHeight(1.5),
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: responsiveFont(14),
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: responsiveHeight(4),
    lineHeight: responsiveHeight(2.5),
  },
  startShoppingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: responsiveWidth(6),
    paddingVertical: responsiveHeight(1.5),
    borderRadius: responsiveWidth(35),
    gap: responsiveWidth(2),
  },
  startShoppingText: {
    color: COLORS.white,
    fontSize: responsiveFont(15),
    fontWeight: '600',
  },
  // Bottom Spacer for Footer
  bottomSpacer: {
    // Height is set dynamically in the component
  },
  // Improved Footer with safe area handling
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: -responsiveHeight(0.5) },
        shadowOpacity: 0.1,
        shadowRadius: responsiveWidth(2),
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
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1.5),
  },
  footerSummary: {
    flex: 1,
  },
  footerTotalLabel: {
    fontSize: responsiveFont(12),
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: responsiveHeight(0.25),
  },
  footerTotal: {
    fontSize: responsiveFont(22),
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: responsiveHeight(0.25),
  },
  footerItems: {
    fontSize: responsiveFont(13),
    color: COLORS.gray,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: responsiveWidth(35),
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1.5),
    marginLeft: responsiveWidth(4),
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: responsiveHeight(0.5) },
        shadowOpacity: 0.3,
        shadowRadius: responsiveWidth(2),
      },
      android: {
        elevation: 6,
      },
    }),
  },
  checkoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: responsiveWidth(2),
  },
  checkoutText: {
    color: COLORS.white,
    fontSize: responsiveFont(16),
    fontWeight: '700',
  },
  checkoutIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: responsiveWidth(6),
    height: responsiveWidth(6),
    borderRadius: responsiveWidth(35),
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Custom Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(4),
    width: '100%',
    maxWidth: responsiveWidth(85),
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: responsiveHeight(1) },
        shadowOpacity: 0.25,
        shadowRadius: responsiveWidth(4),
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalHeader: {
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(6),
    paddingTop: responsiveHeight(4),
    paddingBottom: responsiveHeight(3),
  },
  modalIconContainer: {
    width: responsiveWidth(16),
    height: responsiveWidth(16),
    borderRadius: responsiveWidth(8),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveHeight(2),
  },
  modalTitle: {
    fontSize: responsiveFont(20),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: responsiveHeight(1),
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: responsiveFont(14),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: responsiveHeight(2.25),
  },
  modalActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: responsiveHeight(2),
    gap: responsiveWidth(2),
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    borderRightWidth: 1,
    borderRightColor: COLORS.light,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    fontSize: responsiveFont(16),
    fontWeight: '600',
    color: COLORS.gray,
  },
  confirmButtonText: {
    fontSize: responsiveFont(16),
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default CartScreen;