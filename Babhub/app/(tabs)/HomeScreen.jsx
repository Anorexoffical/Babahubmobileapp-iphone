import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
  ActivityIndicator,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

// Updated color palette with consistent e-commerce colors
const COLORS = {
  primary: '#4575ddff',       // Vibrant blue (main brand color)
  primaryLight: '#93C5FD',  // Lighter blue
  primaryDark: '#1D4ED8',   // Darker blue
  secondary: '#2283f2ff',     // Amber accent
  secondaryLight: '#FBBF24', // Lighter amber
  accent: '#43c01aff',        // Purple accent
  accentLight: '#A78BFA',   // Lighter purple
  dark: '#1E293B',          // Dark blue-gray
  darkLight: '#334155',     // Lighter dark
  gray: '#64748B',          // Medium gray
  grayLight: '#4a7be5ff',     // Light gray
  light: '#000000ff',         // Very light blue-gray
  background: '#f3f3f3ff',    // White background
  white: '#ffffffff',         // White
  success: '#4a7be5ff',       // Green
  warning: '#3c4f4eff',       // Amber (same as secondary)
  error: '#EF4444',        // Red
  cardBackground: '#00000004', // White card background
};

// Function to correctly get full image URL for product images
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  
  // Ensure the path starts with a slash
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `https://account.babahub.co${normalizedPath}`;
};

const banners = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    title: 'Summer Collection',
    subtitle: 'Up to 40% off on selected items',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    title: 'New Arrivals',
    subtitle: 'Discover the latest trends',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    title: 'Exclusive Deals',
    subtitle: 'Limited time offers only for you',
  },
];

// Banner item component
const BannerItem = ({ item, router }) => (
  <View style={styles.bannerItem}>
    <Image source={{ uri: item.image }} style={styles.bannerImage} />
    <View style={styles.bannerOverlay}>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>{item.title}</Text>
        <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        <TouchableOpacity
          style={styles.bannerButton}
          onPress={() => router.push('StoreScreen')}
        >
          <Text style={styles.bannerButtonText}>Explore Now</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.white} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// Product Item Component - Enhanced UI with consistent colors
const ProductItem = ({ item, onPress, onWishlistToggle, isInWishlist }) => {
  const price = item.variants?.[0]?.sizes?.[0]?.price || 0;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const scaleValue = new Animated.Value(1);
  
  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };
  
  // Get the image URL
  const imageUrl = getImageUrl(item.image);
  
  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(item)}
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.imageContainer}>
          {(!imageLoaded || imageError) && (
            <View style={styles.imagePlaceholder}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          )}
          {!imageError && (
            <Image
              source={{ uri: imageUrl }}
              style={[styles.image, { opacity: imageLoaded ? 1 : 0 }]}
              resizeMode="cover"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.log('Image load error for:', imageUrl);
                setImageError(true);
                setImageLoaded(true);
              }}
            />
          )}
          
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>NEW</Text>
          </View>

          <TouchableOpacity
            style={[styles.heartIcon, isInWishlist && styles.heartIconActive]}
            onPress={(e) => {
              e.stopPropagation();
              onWishlistToggle(item);
            }}
          >
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={20}
              color={isInWishlist ? COLORS.secondary : COLORS.dark}
            />
          </TouchableOpacity>
        </View>
        
       <View style={styles.cardContent}>
      <Text style={styles.title} numberOfLines={2}>{item.name || 'Unnamed Product'}</Text>
      <View style={styles.brandContainer}>
        <Text style={styles.brandText}>{item.brand || 'Unknown Brand'}</Text>
      </View>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={COLORS.secondary} />
            <Text style={styles.ratingText}>4.8 (120)</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${price.toFixed(2)}</Text>
            <TouchableOpacity
              style={styles.cartButton}
              onPress={(e) => {
                e.stopPropagation();
                onPress(item);
              }}
            >
              <View style={styles.cartIconContainer}>
                <Ionicons name="add" size={18} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const HomeScreen = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();
  const bannerRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const cartData = await AsyncStorage.getItem('cart');
        if (cartData) {
          const cartItems = JSON.parse(cartData);
          setCartItems(cartItems.length);
        }
      } catch (error) {
        console.error('Error fetching cart count:', error);
      }
    };

    fetchCartCount();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const wishlistData = await AsyncStorage.getItem('wishlist');
        if (wishlistData) {
          setWishlist(JSON.parse(wishlistData));
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    fetchWishlist();
  }, []);

  useEffect(() => {
    fetchProducts(1, true);
  }, []);

  const fetchProducts = async (pageNum = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const limit = 8; // Number of products per page
      const response = await fetch(
        `https://account.babahub.co/api/products/featured?page=${pageNum}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (reset) {
        setProducts(data.products || data);
        setFilteredProducts(data.products || data);
      } else {
        setProducts(prev => [...prev, ...(data.products || data)]);
        setFilteredProducts(prev => [...prev, ...(data.products || data)]);
      }
      
      // Check if there are more products to load
      if (data.products && data.products.length < limit) {
        setHasMore(false);
      } else if (Array.isArray(data) && data.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Fallback to mock data only on first load
      if (reset) {
        const mockProducts = [
          {
            _id: '1',
            name: 'Sample Product',
            brand: 'Sample Brand',
            image: '/uploads/products/1755327400526.jpg',
            variants: [{ sizes: [{ price: 29.99 }] }]
          },
          {
            _id: '2',
            name: 'Another Product',
            brand: 'Test Brand',
            image: '/uploads/products/1756720696531.jpg',
            variants: [{ sizes: [{ price: 49.99 }] }]
          },
          {
            _id: '3',
            name: 'Premium Jacket',
            brand: 'Outdoor Gear',
            image: '/uploads/products/1756720696532.jpg',
            variants: [{ sizes: [{ price: 89.99 }] }]
          },
          {
            _id: '4',
            name: 'Casual T-Shirt',
            brand: 'Comfort Wear',
            image: '/uploads/products/1756720696533.jpg',
            variants: [{ sizes: [{ price: 24.99 }] }]
          }
        ];
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreProducts = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(page + 1);
    }
  };

  const onViewRef = useRef(({ changed }) => {
    if (changed && changed[0]?.index !== undefined) {
      setCurrentBannerIndex(changed[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const handleProductPress = (product) => {
    router.push({
      pathname: 'ProductDetailPage',
      params: { id: product._id },
    });
  };

  const toggleWishlist = async (product) => {
    try {
      const price = product.variants?.[0]?.sizes?.[0]?.price || 0;
      
      const wishlistItem = {
        id: product._id,
        title: product.name,
        brand: product.brand,
        image: product.image,
        price: price
      };

      const storedWishlist = await AsyncStorage.getItem('wishlist');
      let currentWishlist = storedWishlist ? JSON.parse(storedWishlist) : [];

      const isInWishlist = currentWishlist.some(item => item.id === wishlistItem.id);
      
      if (isInWishlist) {
        currentWishlist = currentWishlist.filter(item => item.id !== wishlistItem.id);
        Toast.show({
          type: 'info',
          text1: 'Removed from Wishlist',
          text2: `${wishlistItem.title} removed`,
          visibilityTime: 2000,
        });
      } else {
        currentWishlist.push(wishlistItem);
        Toast.show({
          type: 'success',
          text1: 'Added to Wishlist',
          text2: `${wishlistItem.title} added`,
          visibilityTime: 2000,
        });
      }
      
      await AsyncStorage.setItem('wishlist', JSON.stringify(currentWishlist));
      setWishlist(currentWishlist);
    } catch (error) {
      console.error('Wishlist update failed', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update wishlist',
        visibilityTime: 2000,
      });
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const renderProductItem = ({ item, index }) => {
    const productInWishlist = isInWishlist(item._id);
    
    return (
      <ProductItem 
        item={item}
        onPress={handleProductPress}
        onWishlistToggle={toggleWishlist}
        isInWishlist={productInWishlist}
      />
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>Loading more products...</Text>
      </View>
    );
  };

  const renderShowMoreButton = () => {
    if (loadingMore) return null;
    
    return (
      <TouchableOpacity 
        style={styles.showMoreButton}
        onPress={hasMore ? loadMoreProducts : () => router.push('StoreScreen')}
      >
        <Text style={styles.showMoreText}>
          {hasMore ? 'Show More' : 'Explore More'}
        </Text>
        <Ionicons 
          name={hasMore ? "chevron-down" : "arrow-forward"} 
          size={20} 
          color={COLORS.primary} 
        />
      </TouchableOpacity>
    );
  };

  const categories = ['All Items', 'Dress', 'T-Shirt', 'Jackets', 'Accessories', 'Shoes'];

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  // Split products into two parts for the special offers section
  const firstHalfProducts = filteredProducts.slice(0, 4);
  const secondHalfProducts = filteredProducts.slice(4);

  return (
    <View style={styles.scrollContainer}>
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.container}>
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
            <View style={styles.profileContainer}>
              <TouchableOpacity
                onPress={() => router.push(user?.isLoggedIn ? 'ProfileScreen' : 'ProfileScreen')}
              >
                <View style={styles.profileImageContainer}>
                  {user?.profileImage ? (
                    <Image
                      source={{ uri: user.profileImage }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.profileInitialsContainer}>
                      <Text style={styles.profileInitials}>
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcome}>Welcome back,</Text>
                <Text style={styles.username}>{user?.name || "Guest"}!</Text>
              </View>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push('WishlistScreen')}
              >
                <Ionicons
                  name={wishlist.length > 0 ? 'heart' : 'heart-outline'}
                  size={24}
                  color={wishlist.length > 0 ? COLORS.secondary : COLORS.dark}
                />
                {wishlist.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{wishlist.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push('CartScreen')}
              >
                <Ionicons name="cart-outline" size={24} color={COLORS.dark} />
                {cartItems > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartItems}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Search Bar */}
          <TouchableOpacity 
            style={styles.searchContainer}
            onPress={() => router.push('SearchScreen')}
          >
            <Ionicons name="search" size={20} color={COLORS.gray} />
            <Text style={styles.searchPlaceholder}>Search for products...</Text>
          </TouchableOpacity>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((cat, i) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive
                ]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Banner */}
          <View style={styles.bannerContainer}>
            <FlatList
              ref={bannerRef}
              data={banners}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <BannerItem item={item} router={router} />}
              keyExtractor={(item) => item.id}
              onViewableItemsChanged={onViewRef.current}
              viewabilityConfig={viewConfigRef.current}
            />
            <View style={styles.bannerPagination}>
              {banners.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    {
                      backgroundColor: currentBannerIndex === index ? COLORS.primary : COLORS.white,
                      opacity: currentBannerIndex === index ? 1 : 0.6,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Featured Title */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
          </View>

          {/* First Half of Products */}
          {firstHalfProducts.length > 0 ? (
            <FlatList
              data={firstHalfProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item._id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.list}
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={5}
            />
          ) : (
            <View style={styles.noProductsContainer}>
              <Ionicons name="alert-circle-outline" size={50} color={COLORS.grayLight} />
              <Text style={styles.noProductsText}>No products available</Text>
            </View>
          )}

          {/* Special Offers Section - Placed in the middle */}
          <View style={styles.specialOffersContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Special Offers</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAll}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.specialOfferCard}>
              <View style={[styles.specialOfferGradient, { backgroundColor: COLORS.primary }]}>
                <View style={styles.specialOfferContent}>
                  <View style={styles.specialOfferTextContainer}>
                    <Text style={styles.specialOfferTitle}>Weekend Sale</Text>
                    <Text style={styles.specialOfferSubtitle}>Up to 50% off on selected items</Text>
                    <TouchableOpacity style={styles.specialOfferButton}>
                      <Text style={styles.specialOfferButtonText}>Shop Now</Text>
                    </TouchableOpacity>
                  </View>
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
                    style={styles.specialOfferImage}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Second Half of Products */}
          {secondHalfProducts.length > 0 && (
            <FlatList
              data={secondHalfProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item._id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.list}
              ListFooterComponent={renderFooter}
            />
          )}

          {/* Show More / Explore More Button */}
          {renderShowMoreButton()}
        </View>
      </Animated.ScrollView>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.gray,
    fontSize: 16,
  },
  noProductsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noProductsText: {
    marginTop: 12,
    color: COLORS.gray,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 55,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileInitialsContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  profileInitials: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  welcomeContainer: {
    flexDirection: 'column',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    position: 'relative',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
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
  badge: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  welcome: {
    fontSize: 14,
    color: COLORS.gray,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  searchPlaceholder: {
    marginLeft: 10,
    color: COLORS.gray,
    fontSize: 16,
  },
  categoriesScroll: {
    paddingBottom: 8,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.gray,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  bannerContainer: {
    height: 200,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  bannerItem: {
    width: width - 32,
    position: 'relative',
  },
  bannerImage: {
    width: width - 32,
    height: 200,
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  bannerContent: {
    maxWidth: '70%',
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: COLORS.white,
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.9,
  },
  bannerButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  bannerPagination: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    color: COLORS.dark,
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAll: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  cardContainer: {
    width: '48%',
    marginBottom: 16,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.1,
    borderColor: COLORS.grayLight,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    overflow: 'hidden',
    backgroundColor: COLORS.light,
  },
  image: {
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
  cardBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 50,
    backgroundColor: COLORS.success,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cardBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  heartIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 6,
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
  heartIconActive: {
    backgroundColor: COLORS.white,
  },
  cardContent: {
    padding: 14,
    backgroundColor: COLORS.cardBackground,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
    height: 20,
  },
 brandContainer: {
  marginBottom: 6,
  backgroundColor: COLORS.white,
  alignSelf: 'flex-start',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
  borderWidth: 0.1,
  borderColor: COLORS.primaryLight,
},
brandText: {
  fontSize: 12,
  fontWeight: '500',
  color: COLORS.primary,
  textTransform: 'uppercase',
},
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 11,
    color: COLORS.gray,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  cartButton: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cartIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  list: {
    paddingBottom: 16,
  },
  specialOffersContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  specialOfferCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  specialOfferGradient: {
    padding: 20,
  },
  specialOfferContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specialOfferTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  specialOfferTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  specialOfferSubtitle: {
    color: COLORS.white,
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.9,
  },
  specialOfferButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  specialOfferButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  specialOfferImage: {
    width: 100,
    height: 100,
    borderRadius: 15,
  },
  showMoreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
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
  showMoreText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    marginLeft: 8,
    color: COLORS.gray,
    fontSize: 14,
  },
});

export default HomeScreen;