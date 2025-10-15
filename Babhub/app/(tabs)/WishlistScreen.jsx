import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Dimensions,
  Animated,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Enhanced Brand Color Palette
const COLORS = {
  primary: '#6366F1',
  primaryLight: '#8B5CF6',
  primaryDark: '#4F46E5',
  secondary: '#EC4899',
  accent: '#10B981',
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

// Maximum unique items allowed in cart
const MAX_CART_ITEMS = 3;

// Function to correctly get full image URL for product images
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `https://account.babahub.co${normalizedPath}`;
};

const WishlistScreen = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [productToAdd, setProductToAdd] = useState(null);
  
  // Refs for animations
  const router = useRouter();
  
  // Enhanced Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(height))[0];
  const overlayOpacity = useState(new Animated.Value(0))[0];
  const buttonScaleAnim = useState(new Animated.Value(1))[0];
  const modalScaleAnim = useState(new Animated.Value(0.9))[0];

  useFocusEffect(
    React.useCallback(() => {
      loadWishlist();
      loadCart();
      animateHeader();
    }, [])
  );

  const animateHeader = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const animateModalIn = () => {
    // Reset animations
    slideAnim.setValue(height);
    overlayOpacity.setValue(0);
    modalScaleAnim.setValue(0.9);
    
    // Parallel animations for smooth opening
    Animated.parallel([
      // Overlay fade in
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Modal slide up with bounce
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }),
      // Modal scale effect
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      })
    ]).start();
  };

  const animateModalOut = () => {
    // Parallel animations for smooth closing
    Animated.parallel([
      // Overlay fade out
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      // Modal slide down
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      // Modal scale down
      Animated.timing(modalScaleAnim, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Reset state after animation completes
      setShowAddToCartModal(false);
      setProductToAdd(null);
    });
  };

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const loadWishlist = async () => {
    try {
      setRefreshing(true);
      const storedWishlist = await AsyncStorage.getItem('wishlist');
      if (storedWishlist) {
        const parsedWishlist = JSON.parse(storedWishlist);
        
        // Remove duplicates and ensure proper image URLs
        const uniqueWishlist = [];
        const seenIds = new Set();
        
        parsedWishlist.forEach(item => {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            uniqueWishlist.push({
              id: item.id || Math.random().toString(),
              title: item.title || 'Unknown Product',
              brand: item.brand || 'Unknown Brand',
              image: getImageUrl(item.image) || getRandomProductImage(),
              price: item.price || 0,
              rating: item.rating || 4.5,
              reviews: item.reviews || 0,
              description: item.description || 'No description available',
              category: item.category || 'General'
            });
          }
        });
        
        setWishlistItems(uniqueWishlist);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Failed to load wishlist', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem('cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Failed to load cart', error);
      setCartItems([]);
    }
  };

  const getRandomProductImage = () => {
    const images = [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    ];
    return images[Math.floor(Math.random() * images.length)];
  };

  const getCartQuantity = (productId) => {
    const cartItem = cartItems.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const getUniqueCartItemsCount = () => {
    return cartItems.length;
  };

  const canAddToCart = (productId) => {
    // If item already exists in cart, we can always add more quantity
    if (cartItems.find(item => item.id === productId)) {
      return true;
    }
    // Check if we haven't reached the maximum unique items limit
    return getUniqueCartItemsCount() < MAX_CART_ITEMS;
  };

  const addToCart = async (product) => {
    try {
      // Check if we can add this item to cart
      if (!canAddToCart(product.id)) {
        // Show modal with cart limit warning
        return;
      }

      const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
      let updatedCart = [...cartItems];

      if (existingItemIndex > -1) {
        updatedCart[existingItemIndex].quantity += 1;
      } else {
        updatedCart.push({
          id: product.id,
          title: product.title,
          brand: product.brand,
          image: product.image,
          price: product.price,
          rating: product.rating,
          reviews: product.reviews,
          description: product.description,
          category: product.category,
          quantity: 1,
          addedAt: new Date().toISOString()
        });
      }

      setCartItems(updatedCart);
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Simply close the modal without showing success message
      animateModalOut();

    } catch (error) {
      console.error('Failed to add to cart', error);
    }
  };

  const removeFromWishlist = async (productId, productTitle) => {
    try {
      const updatedWishlist = wishlistItems.filter(item => item.id !== productId);
      setWishlistItems(updatedWishlist);
      await AsyncStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      
      console.log('Item removed from wishlist:', productTitle);
      
      // No need to navigate back - the wishlist will update automatically
      // and the StoreScreen will sync when user navigates back
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
    }
  };

  const handleAddToCartPress = (item) => {
    setProductToAdd(item);
    setShowAddToCartModal(true);
    // Small delay to ensure state is updated before animation
    setTimeout(() => {
      animateModalIn();
    }, 10);
  };

  const confirmAddToCart = () => {
    animateButtonPress();
    if (productToAdd) {
      addToCart(productToAdd);
    }
  };

  const cancelAddToCart = () => {
    animateModalOut();
  };

  const renderRating = (rating) => {
    return (
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={14} color={COLORS.warning} />
        <Text style={styles.ratingText}>{rating}</Text>
      </View>
    );
  };

  const renderCartQuantityBadge = (quantity) => {
    if (quantity > 0) {
      return (
        <View style={styles.quantityBadge}>
          <Text style={styles.quantityText}>{quantity}</Text>
        </View>
      );
    }
    return null;
  };

  const renderWishlistItem = ({ item, index }) => {
    const cartQuantity = getCartQuantity(item.id);
    
    return (
      <Animated.View 
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            }],
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.productInfo}
          onPress={() => router.push({ 
            pathname: 'ProductDetailPage', 
            params: { id: item.id } 
          })}
          activeOpacity={0.7}
        >
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: item.image }} 
              style={styles.image}
              resizeMode="cover"
              onError={() => console.log('Image failed to load for:', item.title)}
            />
            <View style={styles.wishlistBadge}>
              <Ionicons name="heart" size={16} color={COLORS.error} />
            </View>
          </View>
          
          <View style={styles.info}>
            <Text style={styles.brand}>{item.brand}</Text>
            <Text style={styles.name} numberOfLines={2}>{item.title}</Text>
            
            <View style={styles.ratingReviewContainer}>
              {renderRating(item.rating)}
              <Text style={styles.reviewText}>({item.reviews} reviews)</Text>
            </View>
            
            <View style={styles.priceActionContainer}>
              <Text style={styles.price}>R{((item.price || 0) * 18).toFixed(2)}</Text>
              <View style={styles.cartButtonContainer}>
                <TouchableOpacity 
                  style={[
                    styles.cartButton,
                    cartQuantity > 0 && styles.cartButtonActive
                  ]}
                  onPress={() => handleAddToCartPress(item)}
                >
                  <Ionicons name="cart" size={16} color={COLORS.white} />
                </TouchableOpacity>
                {cartQuantity > 0 && renderCartQuantityBadge(cartQuantity)}
              </View>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.removeButton} 
          onPress={() => removeFromWishlist(item.id, item.title)}
        >
          <Ionicons name="trash-outline" size={22} color={COLORS.gray} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Enhanced Add to Cart Confirmation Modal with Smooth Animations
  const AddToCartModal = () => (
    <Modal
      visible={showAddToCartModal}
      transparent
      animationType="none"
      onRequestClose={cancelAddToCart}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={cancelAddToCart}>
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: overlayOpacity,
            }
          ]}
        >
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.modalContainer,
                {
                  transform: [
                    { translateY: slideAnim },
                    { scale: modalScaleAnim }
                  ]
                }
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add to Cart</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={cancelAddToCart}
                >
                  <Ionicons name="close" size={24} color={COLORS.gray} />
                </TouchableOpacity>
              </View>

              {productToAdd && (
                <View style={styles.modalProductInfo}>
                  <View style={styles.modalImageContainer}>
                    <Image 
                      source={{ uri: productToAdd.image }} 
                      style={styles.modalProductImage}
                      resizeMode="cover"
                      onError={(error) => console.log('Modal image failed to load:', error)}
                    />
                  </View>
                  <View style={styles.modalProductDetails}>
                    <Text style={styles.modalProductBrand}>{productToAdd.brand}</Text>
                    <Text style={styles.modalProductName} numberOfLines={2}>
                      {productToAdd.title}
                    </Text>
                    <Text style={styles.modalProductPrice}>
                      R{((productToAdd.price || 0) * 18).toFixed(2)}
                    </Text>
                    
                    {getCartQuantity(productToAdd.id) > 0 && (
                      <View style={styles.alreadyInCartBadge}>
                        <Ionicons name="information-circle" size={14} color={COLORS.white} />
                        <Text style={styles.alreadyInCartText}>
                          {getCartQuantity(productToAdd.id)} in cart
                        </Text>
                      </View>
                    )}

                    {!canAddToCart(productToAdd.id) && getCartQuantity(productToAdd.id) === 0 && (
                      <View style={styles.cartLimitWarning}>
                        <Ionicons name="warning" size={16} color={COLORS.white} />
                        <Text style={styles.cartLimitWarningText}>
                          Cart limit reached ({MAX_CART_ITEMS} unique items max)
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              <View style={styles.modalFeatures}>
                <View style={styles.featureItem}>
                  <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
                  <Text style={styles.featureText}>Authentic Product</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="return-up-back" size={20} color={COLORS.primary} />
                  <Text style={styles.featureText}>Easy Returns</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="rocket" size={20} color={COLORS.secondary} />
                  <Text style={styles.featureText}>Fast Delivery</Text>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={cancelAddToCart}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <Animated.View
                  style={{
                    transform: [{ scale: buttonScaleAnim }],
                    flex: 2
                  }}
                >
                  <TouchableOpacity 
                    style={[
                      styles.confirmButton,
                      !canAddToCart(productToAdd?.id) && getCartQuantity(productToAdd?.id) === 0 && styles.confirmButtonDisabled
                    ]}
                    onPress={confirmAddToCart}
                    disabled={!canAddToCart(productToAdd?.id) && getCartQuantity(productToAdd?.id) === 0}
                  >
                    <Ionicons name="cart" size={20} color={COLORS.white} />
                    <Text style={styles.confirmButtonText}>
                      {getCartQuantity(productToAdd?.id) > 0 ? 'Add One More' : 'Add to Cart'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>

              {/* Additional Info - Only show when limit is reached */}
              {!canAddToCart(productToAdd?.id) && getCartQuantity(productToAdd?.id) === 0 && (
                <View style={styles.modalFooter}>
                  <Text style={styles.modalFooterText}>
                    💡 You can add more quantity to existing items, but only {MAX_CART_ITEMS} unique items are allowed
                  </Text>
                </View>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your wishlist...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Ionicons name="heart" size={28} color={COLORS.primary} />
            <Text style={styles.title}>My Wishlist</Text>
          </View>
          <Text style={styles.itemCount}>{wishlistItems.length} items</Text>
        </View>
      </Animated.View>

      {wishlistItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animated.View style={[styles.emptyIconContainer, { opacity: fadeAnim }]}>
            <Ionicons name="heart-outline" size={80} color={COLORS.grayLight} />
          </Animated.View>
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptyText}>
            Start exploring our products and save your favorites for later!
          </Text>
          <TouchableOpacity 
            style={styles.continueShoppingButton} 
            onPress={() => router.push('/(tabs)/home')}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={20} color={COLORS.white} />
            <Text style={styles.continueShoppingText}>Explore Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={(item) => item.id}
          renderItem={renderWishlistItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={loadWishlist}
        />
      )}

      <AddToCartModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  header: {
    backgroundColor: COLORS.white,
    paddingTop: height * 0.06,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: '800',
    color: COLORS.dark,
  },
  itemCount: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '600',
    backgroundColor: COLORS.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  continueShoppingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  continueShoppingText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: width * 0.04,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginVertical: 6,
    marginHorizontal: 4,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 16,
  },
  wishlistBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  info: {
    flex: 1,
  },
  brand: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 8,
    lineHeight: 20,
  },
  ratingReviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warning,
  },
  reviewText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  priceActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cartButtonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButton: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cartButtonActive: {
    backgroundColor: COLORS.success,
  },
  quantityBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    zIndex: 1,
  },
  quantityText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  // Enhanced Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: height * 0.55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
  },
  closeButton: {
    padding: 4,
  },
  modalProductInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  modalImageContainer: {
    position: 'relative',
  },
  modalProductImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 16,
  },
  modalProductDetails: {
    flex: 1,
  },
  modalProductBrand: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  modalProductName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 8,
    lineHeight: 20,
  },
  modalProductPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
  },
  alreadyInCartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  alreadyInCartText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  cartLimitWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    marginTop: 4,
  },
  cartLimitWarningText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  modalFeatures: {
    marginBottom: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.light,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  cancelButtonText: {
    color: COLORS.dark,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.grayLight,
    shadowColor: COLORS.gray,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
  },
  modalFooterText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default WishlistScreen;