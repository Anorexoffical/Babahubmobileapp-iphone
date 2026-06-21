import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  Modal,
  Animated,
  SafeAreaView,
  Platform,
  Alert,
  Easing,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import http from '../src/api/http';
import { getImageUrl } from '../src/utils/image';
import { isTablet } from '../src/utils/responsive';
import { useAuthGuard } from './contexts/useAuthGuard';
import AuthLoginModal from './contexts/AuthLoginModal';

const { width, height } = Dimensions.get('window');

// Responsive sizing functions - Optimized for all Android devices
const responsiveWidth = (percentage) => (width * percentage) / 100;
const responsiveHeight = (percentage) => (height * percentage) / 100;
const responsiveFont = (size) => {
  const scale = Math.min(width, height) / 400;
  const scaledSize = size * scale;
  // Ensure minimum font size for readability
  return Math.max(scaledSize, 12);
};

// Safe area calculations for different devices
const getSafeAreaBottom = () => {
  if (Platform.OS === 'ios') {
    return responsiveHeight(2);
  } else {
    // For Android devices including Huawei - increased padding for navigation bar
    return responsiveHeight(4);
  }
};

const getSafeAreaTop = () => {
  if (Platform.OS === 'ios') {
    return responsiveHeight(6);
  } else {
    // For Android devices including Huawei
    return (StatusBar.currentHeight || responsiveHeight(4)) + responsiveHeight(1);
  }
};

// Consistent color palette from homepage
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
  cardBackground: '#FFFFFF',
};

// Function to determine if color is light or dark
const isLightColor = (color) => {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

const ProductDetailPage = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { guardAction, authModalProps } = useAuthGuard();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const buttonScale = useState(new Animated.Value(1))[0];
  const cartPulse = useState(new Animated.Value(1))[0];
  const successScale = useState(new Animated.Value(0.8))[0];
  const successOpacity = useState(new Animated.Value(0))[0];
  
  // Floating cart animation
  const floatingCartAnim = useState(new Animated.Value(0))[0];
  const floatingCartOpacity = useState(new Animated.Value(0))[0];

  // Stock alert animation
  const stockAlertAnim = useState(new Animated.Value(0))[0];

  // Safe area values
  const safeAreaBottom = getSafeAreaBottom();
  const safeAreaTop = getSafeAreaTop();

  useEffect(() => {
    if (id) {
      http.get(`/products/${id}`)
        .then(res => {
          const data = res.data;
          setProduct(data);
          setLoading(false);

          // Start animations when product data is loaded
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 800,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
              toValue: 0,
              tension: 60,
              friction: 8,
              useNativeDriver: true,
            })
          ]).start();

          // Start stock alert animation if low stock
          const sizes = data.variants[0]?.sizes || [];
          const stock = sizes[0]?.stock || 0;
          if (stock > 0 && stock <= 10) {
            Animated.loop(
              Animated.sequence([
                Animated.timing(stockAlertAnim, {
                  toValue: 1,
                  duration: 1000,
                  useNativeDriver: true,
                }),
                Animated.timing(stockAlertAnim, {
                  toValue: 0,
                  duration: 1000,
                  useNativeDriver: true,
                }),
              ])
            ).start();
          }
        })
        .catch(err => {
          console.error("Error fetching product detail:", err);
          setLoading(false);
        });
    }
  }, [id]);

  const playAddToCartAnimation = () => {
    // Button press animation
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

    // Cart icon pulse animation
    Animated.sequence([
      Animated.timing(cartPulse, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cartPulse, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating cart animation
    Animated.parallel([
      Animated.timing(floatingCartOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(floatingCartAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset floating cart animation
      setTimeout(() => {
        floatingCartOpacity.setValue(0);
        floatingCartAnim.setValue(0);
      }, 1000);
    });
  };

  const playSuccessAnimation = () => {
    successScale.setValue(0.8);
    successOpacity.setValue(0);
    
    Animated.parallel([
      Animated.timing(successScale, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBack = () => {
    if (router.canGoBack?.()) {
      router.back();
    } else {
      // Use the correct home route path
      router.replace('/(tabs)/HomeScreen');
    }
  };

  const handleBackToHome = () => {
    // Use the correct home route path
    router.replace('/(tabs)/HomeScreen');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingSpinner]} />
          <Text style={styles.loadingText}>Loading Product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Ionicons name="sad-outline" size={responsiveFont(60)} color={COLORS.grayLight} />
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity 
            style={styles.backHomeButton}
            onPress={handleBackToHome}
          >
            <Text style={styles.backHomeText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const colors = product.variants.map(v => v.colorCode);
  const sizes = product.variants[selectedColorIndex]?.sizes || [];
  const selectedColor = colors[selectedColorIndex];
  const selectedColorName = product.variants[selectedColorIndex]?.color;

  const selectedSizeObj = sizes[selectedSizeIndex] || { price: 0, stock: 0 };
  const price = selectedSizeObj.price;
  const stock = selectedSizeObj.stock;

  // Get text color based on selected color (for contrast)
  const getTextColorForBackground = (backgroundColor) => {
    return isLightColor(backgroundColor) ? COLORS.dark : COLORS.white;
  };

  const selectedColorTextColor = getTextColorForBackground(selectedColor);

  // Generate unique variant ID for cart identification
  const getVariantId = () => {
    const selectedVariant = product.variants[selectedColorIndex];
    const sizeObj = selectedVariant.sizes[selectedSizeIndex];
    return `${product._id}_${selectedVariant.color}_${sizeObj.size}`;
  };

  const handleAddToCart = async () => {
    const selectedVariant = product.variants[selectedColorIndex];
    const sizeObj = selectedVariant.sizes[selectedSizeIndex];

    const newItem = {
      id: product._id,
      variantId: getVariantId(), // Unique identifier for this specific variant
      title: product.name,
      image: product.image,
      color: selectedVariant.color,
      colorCode: selectedVariant.colorCode,
      size: sizeObj.size,
      price: sizeObj.price,
      quantity: quantity,
      maxStock: sizeObj.stock // Store max stock for validation
    };

    try {
      const storedCart = await AsyncStorage.getItem('cart');
      const cart = storedCart ? JSON.parse(storedCart) : [];

      // Check if this exact variant already exists in cart using variantId
      const existingItemIndex = cart.findIndex(
        item => item.variantId === newItem.variantId
      );

      if (existingItemIndex >= 0) {
        // If item exists, check if we can add more quantity
        const existingItem = cart[existingItemIndex];
        const newTotalQuantity = existingItem.quantity + newItem.quantity;
        
        if (newTotalQuantity > existingItem.maxStock) {
          Alert.alert(
            'Stock Limit', 
            `You can only add ${existingItem.maxStock} of this variant. You already have ${existingItem.quantity} in cart.`,
            [{ text: 'OK' }]
          );
          return;
        }
        
        // Update the quantity for existing variant
        cart[existingItemIndex].quantity = newTotalQuantity;
      } else {
        cart.push(newItem);
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      
      // Play animations
      playAddToCartAnimation();
      
      // Show success modal after a short delay
      setTimeout(() => {
        setShowSuccessModal(true);
        playSuccessAnimation();
      }, 600);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    }
  };

  const handleIncrement = () => {
    if (quantity < stock) {
      setQuantity(prev => prev + 1);
    } else {
      Alert.alert('Stock Limit', `Only ${stock} items available in stock.`);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const getStockStatus = () => {
    if (stock === 0) return { 
      text: 'Out of Stock', 
      color: COLORS.error, 
      icon: 'close-circle',
      message: 'Currently unavailable',
      bgColor: '#FEE2E2'
    };
    if (stock === 1) return { 
      text: 'Only 1 Left!', 
      color: COLORS.error, 
      icon: 'warning',
      message: 'Last item in stock',
      bgColor: '#FEF3C7'
    };
    if (stock <= 5) return { 
      text: `Only ${stock} Left!`, 
      color: COLORS.warning, 
      icon: 'flash',
      message: 'Selling fast',
      bgColor: '#FEF3C7'
    };
    if (stock <= 10) return { 
      text: `${stock} in Stock`, 
      color: COLORS.warning, 
      icon: 'trending-down',
      message: 'Limited quantity',
      bgColor: '#FEF3C7'
    };
    return { 
      text: `${stock}+ in Stock`, 
      color: COLORS.success, 
      icon: 'checkmark-circle',
      message: 'Available now',
      bgColor: '#D1FAE5'
    };
  };

  const stockStatus = getStockStatus();

  const handleContinueShopping = () => {
    setShowSuccessModal(false);
  };

  const handleViewCart = () => {
    setShowSuccessModal(false);
    router.push('/CartScreen');
  };

  // Floating cart animation interpolation
  const floatingCartTranslateY = floatingCartAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -responsiveHeight(15)],
  });

  const floatingCartScale = floatingCartAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 0.5],
  });

  // Stock alert animation interpolation
  const stockAlertOpacity = stockAlertAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      
      {/* Floating Cart Animation */}
      <Animated.View 
        style={[
          styles.floatingCart,
          {
            opacity: floatingCartOpacity,
            transform: [
              { translateY: floatingCartTranslateY },
              { scale: floatingCartScale }
            ]
          }
        ]}
      >
        <Ionicons name="cart" size={responsiveFont(30)} color={COLORS.primary} />
      </Animated.View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleContinueShopping}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              styles.successModalContent,
              {
                opacity: successOpacity,
                transform: [{ scale: successScale }]
              }
            ]}
          >
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={responsiveFont(60)} color={COLORS.success} />
            </View>
            <Text style={styles.successModalTitle}>Added to Cart! 🎉</Text>
            <Text style={styles.successModalText}>
              {quantity} {product.name} ({selectedColorName}, {sizes[selectedSizeIndex]?.size}) has been added to your shopping cart.
            </Text>
            <View style={styles.successModalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.continueShoppingButton]}
                onPress={handleContinueShopping}
              >
                <Text style={styles.continueShoppingText}>Continue Shopping</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.viewCartButton]}
                onPress={handleViewCart}
              >
                <Ionicons name="cart" size={responsiveFont(18)} color={COLORS.white} style={styles.buttonIcon} />
                <Text style={styles.viewCartText}>View Cart</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
      
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.image ? (
            <>
              {!imageLoaded && (
                <View style={styles.imagePlaceholder}>
                  <Animated.View style={[styles.loadingSpinner, styles.imageSpinner]} />
                </View>
              )}
              <Image
                source={{ uri: getImageUrl(product.image) }}
                style={[styles.productImage, { opacity: imageLoaded ? 1 : 0 }]}
                resizeMode="cover"
                onLoad={() => setImageLoaded(true)}
              />
            </>
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="image-outline" size={responsiveFont(60)} color={COLORS.grayLight} />
              <Text style={styles.noImageText}>No Image Available</Text>
            </View>
          )}

          {/* Back Button */}
          <TouchableOpacity 
            style={[styles.backButton, { top: safeAreaTop }]}
            onPress={handleBack}
          >
            <View style={styles.backButtonInner}>
              <Ionicons name="arrow-back" size={responsiveFont(20)} color={COLORS.primary} />
            </View>
          </TouchableOpacity>

          {/* Image Pagination Dots */}
          <View style={styles.imagePagination}>
            {[1, 2, 3].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === 0 && styles.paginationDotActive
                ]}
              />
            ))}
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.contentContainer}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.productTitle}>{product.name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={responsiveFont(16)} color={COLORS.warning} />
                <Text style={styles.ratingText}>4.8</Text>
                <Text style={styles.reviewsText}>(128 reviews)</Text>
              </View>
            </View>
            <View style={styles.brandContainer}>
              <Ionicons name="business" size={responsiveFont(16)} color={COLORS.primary} />
              <Text style={styles.productBrand}>{product.brand}</Text>
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.price}>R{price.toFixed(2)}</Text>
            </View>
            {stock > 0 && (
              <View style={styles.deliveryInfo}>
                <Ionicons name="rocket" size={responsiveFont(16)} color={COLORS.success} />
                <Text style={styles.deliveryText}>Free delivery</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Color Selection */}
          <View style={styles.optionSection}>
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>Select Color</Text>
              <Text style={[styles.selectedColorText, { color: selectedColor }]}>
                {selectedColorName}
              </Text>
            </View>
            <View style={styles.colorOptions}>
              {colors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColorIndex === index && styles.selectedColorOption
                  ]}
                  onPress={() => {
                    setSelectedColorIndex(index);
                    setSelectedSizeIndex(0);
                    setQuantity(1); // Reset quantity when color changes
                  }}
                >
                  {selectedColorIndex === index && (
                    <View style={styles.colorCheckmark}>
                      <Ionicons 
                        name="checkmark" 
                        size={responsiveFont(16)} 
                        color={isLightColor(color) ? COLORS.dark : COLORS.white} 
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Size Selection with Stock Status Opposite */}
          <View style={styles.sizeSection}>
            <View style={styles.sizeHeader}>
              <Text style={styles.optionTitle}>Select Size</Text>
              
              {/* Stock Status - POSITIONED OPPOSITE TO SELECT SIZE */}
              <Animated.View 
                style={[
                  styles.stockBadge,
                  { 
                    backgroundColor: stockStatus.bgColor,
                    opacity: stockAlertOpacity 
                  }
                ]}
              >
                <View style={styles.stockBadgeContent}>
                  <Ionicons 
                    name={stockStatus.icon} 
                    size={responsiveFont(16)} 
                    color={stockStatus.color} 
                  />
                  <Text style={[styles.stockBadgeText, { color: stockStatus.color }]}>
                    {stockStatus.text}
                  </Text>
                </View>
              </Animated.View>
            </View>
            
            <View style={styles.sizeOptions}>
              {sizes.map((sizeObj, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.sizeOption,
                    selectedSizeIndex === index && [styles.selectedSizeOption, { backgroundColor: selectedColor }],
                    sizeObj.stock === 0 && styles.outOfStockSizeOption
                  ]}
                  onPress={() => {
                    setSelectedSizeIndex(index);
                    setQuantity(1); // Reset quantity when size changes
                  }}
                  disabled={sizeObj.stock === 0}
                >
                  <Text style={[
                    styles.sizeText,
                    selectedSizeIndex === index && [styles.selectedSizeText, { color: selectedColorTextColor }],
                    sizeObj.stock === 0 && styles.outOfStockSizeText
                  ]}>
                    {sizeObj.size}
                  </Text>
                  {sizeObj.stock === 0 && (
                    <View style={styles.sizeOutOfStockOverlay} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <Text style={styles.description}>
              {product.description || 'No description available for this product.'}
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Why You'll Love It</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: selectedColor + '20' }]}>
                  <Ionicons name="checkmark-circle" size={responsiveFont(20)} color={selectedColor} />
                </View>
                <Text style={styles.featureText}>Premium Quality Material</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: selectedColor + '20' }]}>
                  <Ionicons name="checkmark-circle" size={responsiveFont(20)} color={selectedColor} />
                </View>
                <Text style={styles.featureText}>Free Shipping & Returns</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: selectedColor + '20' }]}>
                  <Ionicons name="checkmark-circle" size={responsiveFont(20)} color={selectedColor} />
                </View>
                <Text style={styles.featureText}>30-Day Return Policy</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: selectedColor + '20' }]}>
                  <Ionicons name="checkmark-circle" size={responsiveFont(20)} color={selectedColor} />
                </View>
                <Text style={styles.featureText}>1 Year Warranty</Text>
              </View>
            </View>
          </View>

          {/* Quantity Selector - IMPROVED: Better spacing and border fix */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity 
                onPress={handleDecrement} 
                disabled={quantity <= 1} 
                style={[
                  styles.quantityButton, 
                  styles.quantityMinus,
                  quantity <= 1 && styles.disabledQuantityButton
                ]}
              >
                <Ionicons name="remove" size={responsiveFont(20)} color={quantity <= 1 ? COLORS.grayLight : COLORS.white} />
              </TouchableOpacity>
              
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantity}</Text>
              </View>
              
              <TouchableOpacity 
                onPress={handleIncrement} 
                disabled={quantity >= stock}
                style={[
                  styles.quantityButton,
                  styles.quantityPlus,
                  quantity >= stock && styles.disabledQuantityButton
                ]}
              >
                <Ionicons name="add" size={responsiveFont(20)} color={quantity >= stock ? COLORS.grayLight : COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Reduced Spacer for Add to Cart Button */}
          <View style={[styles.bottomSpacer, { height: responsiveHeight(12) + safeAreaBottom }]} />
        </View>
      </Animated.ScrollView>

      {/* Add to Cart Button - FIXED: Proper spacing for navigation bar */}
      <View style={[styles.footer, { paddingBottom: safeAreaBottom }]}>
        <View style={styles.footerContent}>
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity 
              onPress={() => guardAction(handleAddToCart)}
              disabled={stock <= 0}
              style={[styles.addToCartButton, stock <= 0 && styles.disabledButton]}
            >
              <Animated.View style={{ transform: [{ scale: cartPulse }] }}>
                <Ionicons 
                  name="cart" 
                  size={responsiveFont(22)} 
                  color={COLORS.white} 
                  style={styles.cartIcon} 
                />
              </Animated.View>
              <Text style={styles.buttonText}>
                {stock <= 0 ? 'Out of Stock' : `Add to Cart • R${(price * quantity).toFixed(2)}`}
              </Text>
              {stock > 0 && (
                <View style={styles.buttonBadge}>
                  <Text style={styles.buttonBadgeText}>{quantity}</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
      {/* Auth Login Modal */}
      <AuthLoginModal {...authModalProps} />
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: responsiveHeight(6), // Reduced padding
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingSpinner: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    borderRadius: responsiveWidth(6),
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
    borderTopColor: 'transparent',
    marginBottom: responsiveHeight(3),
  },
  imageSpinner: {
    position: 'absolute',
  },
  loadingText: {
    fontSize: responsiveFont(18),
    color: COLORS.gray,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveWidth(8),
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: responsiveFont(20),
    color: COLORS.dark,
    fontWeight: '600',
    marginTop: responsiveHeight(3),
    marginBottom: responsiveHeight(4),
    textAlign: 'center',
  },
  backHomeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: responsiveWidth(8),
    paddingVertical: responsiveHeight(2),
    borderRadius: responsiveWidth(35),
  },
  backHomeText: {
    color: COLORS.white,
    fontSize: responsiveFont(16),
    fontWeight: '600',
  },
  // Floating Cart Animation
  floatingCart: {
    position: 'absolute',
    top: height * 0.5,
    right: responsiveWidth(7.5),
    zIndex: 1000,
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(6.25),
    padding: responsiveWidth(3),
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: responsiveHeight(0.5) },
        shadowOpacity: 0.3,
        shadowRadius: responsiveWidth(2),
      },
      android: {
        elevation: 8,
      },
    }),
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveWidth(5),
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(5),
    padding: responsiveWidth(6.25),
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: responsiveHeight(0.5) },
        shadowOpacity: 0.15,
        shadowRadius: responsiveWidth(3),
      },
      android: {
        elevation: 8,
      },
    }),
  },
  successModalContent: {
    padding: responsiveWidth(6.25),
  },
  modalIconContainer: {
    marginBottom: responsiveHeight(2),
  },
  successIconContainer: {
    marginBottom: responsiveHeight(2.5),
  },
  modalTitle: {
    fontSize: responsiveFont(20),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: responsiveHeight(1.5),
    textAlign: 'center',
  },
  successModalTitle: {
    fontSize: responsiveFont(22),
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: responsiveHeight(1.5),
    textAlign: 'center',
  },
  modalText: {
    fontSize: responsiveFont(14),
    textAlign: 'center',
    marginBottom: responsiveHeight(3),
    color: COLORS.gray,
    lineHeight: responsiveHeight(2.5),
  },
  successModalText: {
    fontSize: responsiveFont(14),
    textAlign: 'center',
    marginBottom: responsiveHeight(3),
    color: COLORS.gray,
    lineHeight: responsiveHeight(2.5),
  },
  modalButtons: {
    flexDirection: 'row',
    gap: responsiveWidth(3),
    width: '100%',
  },
  successModalButtons: {
    flexDirection: 'row',
    gap: isTablet ? responsiveWidth(4) : responsiveWidth(3),
    width: '100%',
  },
  modalButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: isTablet ? responsiveHeight(2) : responsiveHeight(1.5),
    paddingHorizontal: isTablet ? responsiveWidth(4) : 0,
    borderRadius: responsiveWidth(35),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isTablet ? responsiveHeight(7) : responsiveHeight(5.5),
  },
  modalSecondaryButton: {
    backgroundColor: COLORS.light,
  },
  continueShoppingButton: {
    backgroundColor: COLORS.light,
    flex: 1.2,
  },
  viewCartButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: responsiveFont(14),
    fontWeight: '600',
  },
  modalSecondaryButtonText: {
    color: COLORS.dark,
    fontSize: responsiveFont(14),
    fontWeight: '600',
  },
  continueShoppingText: {
    color: COLORS.dark,
    fontSize: responsiveFont(14),
    fontWeight: '600',
  },
  viewCartText: {
    color: COLORS.white,
    fontSize: responsiveFont(14),
    fontWeight: '600',
    marginLeft: responsiveWidth(1.5),
  },
  buttonIcon: {
    marginRight: responsiveWidth(1),
  },
  // Image Container
  imageContainer: {
    position: 'relative',
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: responsiveWidth(7.5),
    borderBottomRightRadius: responsiveWidth(7.5),
    overflow: 'hidden',
    marginBottom: responsiveHeight(1.25),
    height: isTablet ? Math.min(width * 0.55, 500) : width * 0.85,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: responsiveHeight(1) },
        shadowOpacity: 0.1,
        shadowRadius: responsiveWidth(4),
      },
      android: {
        elevation: 6,
      },
    }),
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light,
  },
  noImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light,
  },
  noImageText: {
    marginTop: responsiveHeight(1.5),
    fontSize: responsiveFont(16),
    color: COLORS.gray,
    fontWeight: '500',
  },
  // Back Button - IMPROVED: Dynamic positioning
  backButton: {
    position: 'absolute',
    left: responsiveWidth(5),
    zIndex: 3,
  },
  backButtonInner: {
    width: responsiveWidth(11),
    height: responsiveWidth(11),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: responsiveWidth(3),
  },
  imagePagination: {
    position: 'absolute',
    bottom: responsiveHeight(2.5),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: responsiveWidth(2),
  },
  paginationDot: {
    width: responsiveWidth(2.5),
    height: responsiveWidth(2.5),
    borderRadius: responsiveWidth(35),
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: {
    backgroundColor: COLORS.white,
    width: responsiveWidth(6),
  },
  // Content Container
  contentContainer: {
    padding: responsiveWidth(5),
    paddingBottom: responsiveHeight(6), // Reduced padding
  },
  header: {
    marginBottom: responsiveHeight(2),
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: responsiveHeight(1),
  },
  productTitle: {
    fontSize: isTablet ? 24 : responsiveFont(26),
    fontWeight: '700',
    color: COLORS.dark,
    flex: 1,
    marginRight: responsiveWidth(3),
    lineHeight: isTablet ? 32 : responsiveHeight(3.5),
    flexShrink: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(0.75),
    borderRadius: responsiveWidth(35),
  },
  ratingText: {
    fontSize: responsiveFont(14),
    fontWeight: '600',
    color: COLORS.dark,
    marginLeft: responsiveWidth(1),
  },
  reviewsText: {
    fontSize: responsiveFont(12),
    color: COLORS.gray,
    marginLeft: responsiveWidth(1),
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(1.5),
  },
  productBrand: {
    fontSize: responsiveFont(16),
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveHeight(1.25),
  },
  price: {
    fontSize: responsiveFont(30),
    fontWeight: '700',
    color: COLORS.primary,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(0.75),
    borderRadius: responsiveWidth(35),
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  deliveryText: {
    fontSize: responsiveFont(14),
    color: COLORS.success,
    fontWeight: '600',
    marginLeft: responsiveWidth(1.5),
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.light,
    marginVertical: responsiveHeight(2),
  },
  // Option Sections
  optionSection: {
    marginBottom: responsiveHeight(2),
  },
  sizeSection: {
    marginBottom: responsiveHeight(3),
  },
  // Size Header with Stock Badge
  sizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveHeight(1.5),
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveHeight(1.5),
  },
  optionTitle: {
    fontSize: responsiveFont(18),
    fontWeight: '600',
    color: COLORS.dark,
  },
  selectedColorText: {
    fontSize: responsiveFont(14),
    fontWeight: '500',
  },
  colorOptions: {
    flexDirection: 'row',
    gap: responsiveWidth(3),
    flexWrap: 'wrap',
  },
  colorOption: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    borderRadius: responsiveWidth(35),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: responsiveHeight(0.25) },
        shadowOpacity: 0.1,
        shadowRadius: responsiveWidth(0.75),
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectedColorOption: {
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  colorCheckmark: {
    width: responsiveWidth(5),
    height: responsiveWidth(5),
    borderRadius: responsiveWidth(35),
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Stock Badge - POSITIONED OPPOSITE TO SELECT SIZE
  stockBadge: {
    borderRadius: responsiveWidth(35),
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: responsiveHeight(0.25) },
        shadowOpacity: 0.1,
        shadowRadius: responsiveWidth(1),
      },
      android: {
        elevation: 2,
      },
    }),
  },
  stockBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(1.5),
  },
  stockBadgeText: {
    fontSize: responsiveFont(14),
    fontWeight: '600',
  },
  sizeOptions: {
    flexDirection: 'row',
    gap: responsiveWidth(3),
    flexWrap: 'wrap',
  },
  sizeOption: {
    minWidth: responsiveWidth(16),
    height: responsiveHeight(6.25),
    borderRadius: responsiveWidth(35),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.light,
    position: 'relative',
    paddingHorizontal: responsiveWidth(3),
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: responsiveHeight(0.25) },
        shadowOpacity: 0.05,
        shadowRadius: responsiveWidth(0.75),
      },
      android: {
        elevation: 1,
      },
    }),
  },
  selectedSizeOption: {
    borderColor: COLORS.primary,
  },
  outOfStockSizeOption: {
    backgroundColor: COLORS.light,
  },
  sizeText: {
    fontSize: responsiveFont(16),
    fontWeight: '600',
    color: COLORS.dark,
  },
  selectedSizeText: {
    fontWeight: '700',
  },
  outOfStockSizeText: {
    color: COLORS.grayLight,
  },
  sizeOutOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: responsiveWidth(35),
  },
  // Sections
  section: {
    marginBottom: responsiveHeight(2.5),
  },
  sectionTitle: {
    fontSize: responsiveFont(20),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: responsiveHeight(1.5),
  },
  description: {
    fontSize: responsiveFont(16),
    color: COLORS.gray,
    lineHeight: responsiveHeight(2.8),
  },
  featuresSection: {
    marginBottom: responsiveHeight(2.5),
  },
  featuresList: {
    gap: responsiveHeight(1.2),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(2.5),
  },
  featureIcon: {
    width: responsiveWidth(7),
    height: responsiveWidth(7),
    borderRadius: responsiveWidth(35),
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: responsiveFont(15),
    color: COLORS.dark,
    fontWeight: '500',
  },
  // Quantity Selector - IMPROVED: Fixed borders and better spacing
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: responsiveHeight(1.5), // Reduced margin
    paddingHorizontal: responsiveWidth(1),
  },
  quantityLabel: {
    fontSize: responsiveFont(18),
    fontWeight: '600',
    color: COLORS.dark,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: responsiveWidth(35),
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    // REMOVED borderWidth to fix white line issue on Android
    ...Platform.select({
      ios: {
        borderWidth: 2,
        borderColor: COLORS.light,
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: responsiveHeight(0.25) },
        shadowOpacity: 0.1,
        shadowRadius: responsiveWidth(1),
      },
      android: {
        elevation: 3,
        // Using elevation instead of border for Android to avoid white line issue
      },
    }),
  },
  quantityButton: {
    width: responsiveWidth(12),
    height: responsiveHeight(5.5),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  quantityMinus: {
    backgroundColor: COLORS.primary,
  },
  quantityPlus: {
    backgroundColor: COLORS.primary,
  },
  disabledQuantityButton: {
    backgroundColor: COLORS.grayLight,
  },
  quantityDisplay: {
    width: responsiveWidth(15),
    height: responsiveHeight(5.5),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  quantityText: {
    fontSize: responsiveFont(18),
    fontWeight: '700',
    color: COLORS.dark,
  },
  // Reduced Bottom Spacer for Add to Cart Button
  bottomSpacer: {
    // Height is set dynamically in the component - reduced from 18 to 12
  },
  // Footer & Add to Cart - FIXED: Proper spacing for navigation bar
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
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1.5), // Reduced padding
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    padding: responsiveHeight(1.8), // Reduced padding
    borderRadius: responsiveWidth(35),
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
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
  disabledButton: {
    backgroundColor: COLORS.grayLight,
  },
  cartIcon: {
    marginRight: responsiveWidth(2.5),
  },
  buttonText: {
    color: COLORS.white,
    fontSize: responsiveFont(17),
    fontWeight: '700',
    flex: 1,
  },
  buttonBadge: {
    backgroundColor: COLORS.secondary,
    width: responsiveWidth(5.5),
    height: responsiveWidth(5.5),
    borderRadius: responsiveWidth(35),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: responsiveWidth(3.5),
    top: -responsiveHeight(0.8),
  },
  buttonBadgeText: {
    color: COLORS.white,
    fontSize: responsiveFont(11),
    fontWeight: '800',
  },
});

export default ProductDetailPage;