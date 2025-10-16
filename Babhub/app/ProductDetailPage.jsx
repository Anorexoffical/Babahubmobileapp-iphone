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
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

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

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const buttonScale = useState(new Animated.Value(1))[0];
  const heartScale = useState(new Animated.Value(1))[0];
  const cartPulse = useState(new Animated.Value(1))[0];
  const successScale = useState(new Animated.Value(0.8))[0];
  const successOpacity = useState(new Animated.Value(0))[0];
  
  // Floating cart animation
  const floatingCartAnim = useState(new Animated.Value(0))[0];
  const floatingCartOpacity = useState(new Animated.Value(0))[0];

  // Stock alert animation
  const stockAlertAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (id) {
      fetch(`https://account.babahub.co/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
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

  // Check if product is in wishlist
  useEffect(() => {
    checkWishlistStatus();
  }, [product]);

  const checkWishlistStatus = async () => {
    if (!product) return;
    
    try {
      const wishlistData = await AsyncStorage.getItem('wishlist');
      if (wishlistData) {
        const wishlist = JSON.parse(wishlistData);
        const isWishlisted = wishlist.some(item => item.id === product._id);
        setIsInWishlist(isWishlisted);
      }
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;

    try {
      const wishlistData = await AsyncStorage.getItem('wishlist');
      let wishlist = wishlistData ? JSON.parse(wishlistData) : [];
      
      const productData = {
        id: product._id,
        title: product.name,
        brand: product.brand,
        image: product.image,
        price: product.variants?.[0]?.sizes?.[0]?.price || product.price || 0
      };

      const existingIndex = wishlist.findIndex(item => item.id === product._id);
      
      if (existingIndex >= 0) {
        // Remove from wishlist
        wishlist.splice(existingIndex, 1);
        setIsInWishlist(false);
      } else {
        // Add to wishlist
        wishlist.push(productData);
        setIsInWishlist(true);
        
        // Heart animation
        Animated.sequence([
          Animated.timing(heartScale, {
            toValue: 1.3,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(heartScale, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(heartScale, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
          }),
        ]).start();
      }
      
      await AsyncStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
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
        <View style={styles.errorContainer}>
          <Ionicons name="sad-outline" size={60} color={COLORS.grayLight} />
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity 
            style={styles.backHomeButton}
            onPress={() => router.replace('/')}
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

  const handleAddToCart = async () => {
    const selectedVariant = product.variants[selectedColorIndex];
    const sizeObj = selectedVariant.sizes[selectedSizeIndex];

    const newItem = {
      id: product._id,
      title: product.name,
      image: product.image,
      color: selectedVariant.color,
      size: sizeObj.size,
      price: sizeObj.price,
      quantity
    };

    try {
      const storedCart = await AsyncStorage.getItem('cart');
      const cart = storedCart ? JSON.parse(storedCart) : [];

      // Check if this exact variant already exists in cart
      const existingItemIndex = cart.findIndex(
        item => item.id === newItem.id && 
               item.color === newItem.color && 
               item.size === newItem.size
      );

      if (existingItemIndex >= 0) {
        // If item exists, just update the quantity (no limit for same item)
        cart[existingItemIndex].quantity += newItem.quantity;
      } else {
        // Check if adding a new product would exceed the 4 unique product limit
        if (cart.length >= 4) {
          setShowLimitModal(true);
          return;
        }
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
      message: 'Currently unavailable'
    };
    if (stock === 1) return { 
      text: 'Only 1 Left!', 
      color: COLORS.error, 
      icon: 'warning',
      message: 'Last item in stock'
    };
    if (stock <= 5) return { 
      text: `Only ${stock} Left!`, 
      color: COLORS.warning, 
      icon: 'flash',
      message: 'Selling fast'
    };
    if (stock <= 10) return { 
      text: `${stock} in Stock`, 
      color: COLORS.warning, 
      icon: 'trending-down',
      message: 'Limited quantity'
    };
    return { 
      text: `${stock}+ in Stock`, 
      color: COLORS.success, 
      icon: 'checkmark-circle',
      message: 'Available now'
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
    outputRange: [0, -100],
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
    <SafeAreaView style={styles.safeArea}>
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
        <Ionicons name="cart" size={30} color={COLORS.primary} />
      </Animated.View>

      {/* Limit Modal */}
      <Modal
        visible={showLimitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLimitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="alert-circle" size={50} color={COLORS.error} />
            </View>
            <Text style={styles.modalTitle}>Cart Limit Reached</Text>
            <Text style={styles.modalText}>
              You can only add up to 4 different products to your cart. Please remove some items to add new ones.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSecondaryButton]}
                onPress={() => setShowLimitModal(false)}
              >
                <Text style={styles.modalSecondaryButtonText}>Continue Shopping</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  setShowLimitModal(false);
                  router.push('/CartScreen');
                }}
              >
                <Text style={styles.modalButtonText}>View Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
              <Ionicons name="checkmark-circle" size={60} color={COLORS.success} />
            </View>
            <Text style={styles.successModalTitle}>Added to Cart! 🎉</Text>
            <Text style={styles.successModalText}>
              {quantity} {product.name} has been added to your shopping cart.
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
                <Ionicons name="cart" size={20} color={COLORS.white} style={styles.buttonIcon} />
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
                source={{ uri: `https://account.babahub.co${product.image}` }}
                style={[styles.productImage, { opacity: imageLoaded ? 1 : 0 }]}
                resizeMode="cover"
                onLoad={() => setImageLoaded(true)}
              />
            </>
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="image-outline" size={60} color={COLORS.grayLight} />
              <Text style={styles.noImageText}>No Image Available</Text>
            </View>
          )}

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.canGoBack?.() ? router.back() : router.replace('/')}
          >
            <View style={styles.backButtonInner}>
              <Ionicons name="chevron-back" size={24} color={COLORS.dark} />
            </View>
          </TouchableOpacity>

          {/* Wishlist Button */}
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <TouchableOpacity 
              style={styles.wishlistButton}
              onPress={toggleWishlist}
            >
              <View style={[
                styles.wishlistButtonInner,
                isInWishlist && styles.wishlistButtonActive
              ]}>
                <Ionicons 
                  name={isInWishlist ? "heart" : "heart-outline"} 
                  size={22} 
                  color={isInWishlist ? COLORS.secondary : COLORS.dark} 
                />
              </View>
            </TouchableOpacity>
          </Animated.View>

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
                <Ionicons name="star" size={16} color={COLORS.warning} />
                <Text style={styles.ratingText}>4.8</Text>
                <Text style={styles.reviewsText}>(128 reviews)</Text>
              </View>
            </View>
            <View style={styles.brandContainer}>
              <Ionicons name="business" size={16} color={COLORS.primary} />
              <Text style={styles.productBrand}>{product.brand}</Text>
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.price}>${price.toFixed(2)}</Text>
            </View>
            {stock > 0 && (
              <View style={styles.deliveryInfo}>
                <Ionicons name="rocket" size={16} color={COLORS.success} />
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
                  }}
                >
                  {selectedColorIndex === index && (
                    <View style={styles.colorCheckmark}>
                      <Ionicons 
                        name="checkmark" 
                        size={16} 
                        color={isLightColor(color) ? COLORS.dark : COLORS.white} 
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stock Status - Small, light background, dark text, placed opposite to Select Color */}
          <View style={styles.stockContainer}>
            <Animated.View 
              style={[
                styles.stockBadge,
                { 
                  backgroundColor: stockStatus.color + '15', // Light background with opacity
                  opacity: stockAlertOpacity 
                }
              ]}
            >
              <View style={styles.stockBadgeContent}>
                <Ionicons 
                  name={stockStatus.icon} 
                  size={16} 
                  color={stockStatus.color} 
                />
                <Text style={styles.stockBadgeText}>{stockStatus.text}</Text>
              </View>
            </Animated.View>
          </View>

          {/* Size Selection */}
          <View style={styles.sizeSection}>
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>Select Size</Text>
              {/* Removed the selected size text from the right side */}
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
                  onPress={() => setSelectedSizeIndex(index)}
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
                  <Ionicons name="checkmark-circle" size={20} color={selectedColor} />
                </View>
                <Text style={styles.featureText}>Premium Quality Material</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: selectedColor + '20' }]}>
                  <Ionicons name="checkmark-circle" size={20} color={selectedColor} />
                </View>
                <Text style={styles.featureText}>Free Shipping & Returns</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: selectedColor + '20' }]}>
                  <Ionicons name="checkmark-circle" size={20} color={selectedColor} />
                </View>
                <Text style={styles.featureText}>30-Day Return Policy</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: selectedColor + '20' }]}>
                  <Ionicons name="checkmark-circle" size={20} color={selectedColor} />
                </View>
                <Text style={styles.featureText}>1 Year Warranty</Text>
              </View>
            </View>
          </View>

          {/* Quantity Selector */}
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
                <Ionicons name="remove" size={20} color={quantity <= 1 ? COLORS.grayLight : COLORS.white} />
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
                <Ionicons name="add" size={20} color={quantity >= stock ? COLORS.grayLight : COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity 
            onPress={handleAddToCart}
            disabled={stock <= 0}
            style={[styles.addToCartButton, stock <= 0 && styles.disabledButton]}
          >
            <Animated.View style={{ transform: [{ scale: cartPulse }] }}>
              <Ionicons 
                name="cart" 
                size={22} 
                color={COLORS.white} 
                style={styles.cartIcon} 
              />
            </Animated.View>
            <Text style={styles.buttonText}>
              {stock <= 0 ? 'Out of Stock' : `Add to Cart • $${(price * quantity).toFixed(2)}`}
            </Text>
            {stock > 0 && (
              <View style={styles.buttonBadge}>
                <Text style={styles.buttonBadgeText}>{quantity}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
    borderTopColor: 'transparent',
    marginBottom: 16,
  },
  imageSpinner: {
    position: 'absolute',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.dark,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  backHomeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backHomeText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Floating Cart Animation
  floatingCart: {
    position: 'absolute',
    top: height * 0.5,
    right: 30,
    zIndex: 1000,
    backgroundColor: COLORS.white,
    borderRadius: 25,

    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
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
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '90%',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  successModalContent: {
    padding: 25,
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 12,
    textAlign: 'center',
  },
  successModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: COLORS.gray,
    lineHeight: 22,
  },
  successModalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: COLORS.gray,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  successModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSecondaryButton: {
    backgroundColor: COLORS.light,
  },
  continueShoppingButton: {
    backgroundColor: COLORS.light,
    flex: 1.5,
  },
  viewCartButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
        borderRadius: 140,
  },
  modalSecondaryButtonText: {
    color: COLORS.dark,
    fontSize: 16,
    fontWeight: '600',
  },
  continueShoppingText: {
    color: COLORS.dark,
    fontSize: 16,
    fontWeight: '600',
  },
  viewCartText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  buttonIcon: {
    marginRight: 4,
  },
  // Image Container
  imageContainer: {
    position: 'relative',
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    marginBottom: 10,
    height: width * 0.85,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
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
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 3,
  },
  backButtonInner: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 10,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  wishlistButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 3,
  },
  wishlistButtonInner: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 10,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  wishlistButtonActive: {
    backgroundColor: COLORS.secondary + '20',
  },
  // Stock Badge - Small, light background, dark text, placed opposite to Select Color
  stockContainer: {
    alignItems: 'flex-end',
    marginBottom: 15,
    marginTop: -15,
  },
  stockBadge: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-end',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  stockBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stockBadgeText: {
    color: COLORS.dark,
    fontSize: 14,
    fontWeight: '600',
  },
  imagePagination: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: {
    backgroundColor: COLORS.white,
    width: 20,
  },
  // Content Container
  contentContainer: {
    padding: 25,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.dark,
    flex: 1,
    marginRight: 12,
    lineHeight: 34,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 4,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  productBrand: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deliveryText: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '600',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.light,
    marginVertical: 20,
  },
  // Option Sections
  optionSection: {
    marginBottom: 20,
  },
  sizeSection: {
    marginBottom: 30,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
  },
  selectedColorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Removed selectedSizeText style since it's no longer used
  colorOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeOptions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  sizeOption: {
    width: 60,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.light,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
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
    fontSize: 16,
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
    borderRadius: 10,
  },
  // Sections
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: COLORS.gray,
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 30,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    color: COLORS.dark,
    fontWeight: '500',
  },
  // Quantity Selector
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  quantityLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.light,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  quantityButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 70,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
  },
  // Footer & Add to Cart
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
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
    marginRight: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  buttonBadge: {
    backgroundColor: COLORS.secondary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 16,
    top: -8,
  },
  buttonBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
});

export default ProductDetailPage;