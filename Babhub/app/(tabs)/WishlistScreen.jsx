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
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getImageUrl, normalizeImageUrl } from '../../src/utils/image';
import { useAuthGuard } from '../contexts/useAuthGuard';
import AuthLoginModal from '../contexts/AuthLoginModal';

const { width, height } = Dimensions.get('window');

const rw = (p) => (width * p) / 100;
const rh = (p) => (height * p) / 100;
const rf = (size) => Math.max((Math.min(width, height) / 400) * size, 10);

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



const WishlistScreen = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const router = useRouter();
  const { guardAction, authModalProps } = useAuthGuard();
  
  const fadeAnim = useState(new Animated.Value(0))[0];

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
              category: item.category || 'General',
              // Add color and size defaults to match cart structure
              color: item.color || 'Default',
              size: item.size || 'Standard'
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

  const removeFromWishlist = async (productId, productTitle) => {
    try {
      const updatedWishlist = wishlistItems.filter(item => item.id !== productId);
      setWishlistItems(updatedWishlist);
      await AsyncStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      
      console.log('Item removed from wishlist:', productTitle);
      
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
    }
  };

  const handleAddToCartPress = (item) => {
    guardAction(() => router.push({ 
      pathname: 'ProductDetailPage', 
      params: { id: item.id } 
    }));
  };

  // FIXED: Navigation function for empty state
  const handleExploreProducts = () => {
    // Navigate to StoreScreen which is likely your main products page
    router.push('/(tabs)/StoreScreen');
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
              source={{ uri: normalizeImageUrl(item.image) }} 
              style={styles.image}
              resizeMode="cover"
              onError={(error) => {
                console.log('Image failed to load for:', item.title, 'URL:', item.image);
              }}
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
            onPress={handleExploreProducts} // FIXED: Using the corrected navigation function
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
      <AuthLoginModal {...authModalProps} />
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
    paddingTop: rh(6),
    paddingBottom: rh(2.5),
    borderBottomLeftRadius: rw(6),
    borderBottomRightRadius: rw(6),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: rh(1.2) },
    shadowOpacity: 0.1,
    shadowRadius: rw(5),
    elevation: 10,
    marginBottom: rh(1.2),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: rw(5),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(3),
  },
  title: {
    fontSize: rf(22),
    fontWeight: '800',
    color: COLORS.dark,
  },
  itemCount: {
    fontSize: rf(13),
    color: COLORS.gray,
    fontWeight: '600',
    backgroundColor: COLORS.light,
    paddingHorizontal: rw(3),
    paddingVertical: rh(0.7),
    borderRadius: rw(3),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rw(10),
  },
  emptyIconContainer: {
    marginBottom: rh(3),
  },
  emptyTitle: {
    fontSize: rf(22),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: rh(1.5),
    textAlign: 'center',
  },
  emptyText: {
    fontSize: rf(15),
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: rh(4),
    lineHeight: rf(22),
  },
  continueShoppingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: rh(2),
    paddingHorizontal: rw(8),
    borderRadius: rw(4),
    gap: rw(2),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: rh(1) },
    shadowOpacity: 0.3,
    shadowRadius: rw(4),
    elevation: 8,
  },
  continueShoppingText: {
    color: COLORS.white,
    fontSize: rf(15),
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: rw(4),
    paddingBottom: rh(4),
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: rw(5),
    marginVertical: rh(0.7),
    marginHorizontal: rw(1),
    padding: rw(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rh(0.5) },
    shadowOpacity: 0.08,
    shadowRadius: rw(3),
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
    marginRight: rw(4),
  },
  image: {
    width: rw(22),
    height: rw(22),
    borderRadius: rw(4),
  },
  wishlistBadge: {
    position: 'absolute',
    top: -rw(1.5),
    right: -rw(1.5),
    backgroundColor: COLORS.white,
    borderRadius: rw(2.5),
    padding: rw(1),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rh(0.25) },
    shadowOpacity: 0.1,
    shadowRadius: rw(1),
    elevation: 3,
  },
  info: {
    flex: 1,
  },
  brand: {
    fontSize: rf(11),
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: rh(0.5),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: rf(15),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: rh(1),
    lineHeight: rf(20),
  },
  ratingReviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rh(1.5),
    gap: rw(2),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    paddingHorizontal: rw(2),
    paddingVertical: rh(0.5),
    borderRadius: rw(2),
    gap: rw(1),
  },
  ratingText: {
    fontSize: rf(11),
    fontWeight: '600',
    color: COLORS.warning,
  },
  reviewText: {
    fontSize: rf(11),
    color: COLORS.gray,
  },
  priceActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: rf(17),
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
    width: rw(10),
    height: rw(10),
    borderRadius: rw(5),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: rh(0.5) },
    shadowOpacity: 0.3,
    shadowRadius: rw(2),
    elevation: 6,
  },
  cartButtonActive: {
    backgroundColor: COLORS.success,
  },
  quantityBadge: {
    position: 'absolute',
    top: -rw(1.5),
    right: -rw(1.5),
    backgroundColor: COLORS.error,
    borderRadius: rw(2.5),
    minWidth: rw(5),
    height: rw(5),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    zIndex: 1,
  },
  quantityText: {
    color: COLORS.white,
    fontSize: rf(10),
    fontWeight: '800',
  },
  removeButton: {
    padding: rw(2),
    marginLeft: rw(2),
  },
});

export default WishlistScreen;