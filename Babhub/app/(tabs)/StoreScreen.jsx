import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Platform,
  Alert,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import debounce from 'lodash.debounce';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Updated color palette with consistent e-commerce colors
const COLORS = {
  primary: '#4575ddff',       // Vibrant blue (main brand color)
  primaryLight: '#93C5FD',  // Lighter blue
  primaryDark: '#1D4ED8',   // Darker blue
  secondary: '#F59E0B',     // Amber accent
  secondaryLight: '#FBBF24', // Lighter amber
  accent: '#8B5CF6',        // Purple accent
  accentLight: '#A78BFA',   // Lighter purple
  dark: '#1E293B',          // Dark blue-gray
  darkLight: '#334155',     // Lighter dark
  gray: '#64748B',          // Medium gray
  grayLight: '#1c5deaff',     // Light gray
  light: '#0f69c2ff',         // Very light blue-gray
  background: '#f3f3f3ff',    // White background
  white: '#ffffffff',         // White
  success: '#000000ff',       // Green
  warning: '#F59E0B',       // Amber (same as secondary)
  error: '#EF4444',        // Red
  cardBackground: '#0021f504', // White card background
};

// Free copyright-friendly brand logos
const featuredBrands = [
  {
    name: 'FashionHub',
    products: 265,
    image: 'https://images.unsplash.com/photo-1566206091558-7f218b696731?w=400&h=400&fit=crop&crop=center',
  },
  {
    name: 'UrbanStyle',
    products: 95,
    image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop&crop=center',
  },
  {
    name: 'EcoWear',
    products: 36,
    image: 'https://images.unsplash.com/photo-1569074187119-c87815b476da?w=400&h=400&fit=crop&crop=center',
  },
  {
    name: 'TechGear',
    products: 142,
    image: 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?w=400&h=400&fit=crop&crop=center',
  },
  {
    name: 'HomeEssentials',
    products: 89,
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop&crop=center',
  },
];

// Function to correctly get full image URL for product images
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  
  // Ensure the path starts with a slash
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `https://account.babahub.co${normalizedPath}`;
};

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
                <Ionicons name="eye-outline" size={18} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const StoreScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [cartItems, setCartItems] = useState(0);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  // API base URL - use HTTPS
  const API_BASE_URL = 'https://account.babahub.co';

  // Fetch cart count
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

  // Fetch wishlist
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

  // Fetch products from backend API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products from:', `${API_BASE_URL}/api/products`);
      
      const response = await fetch(`${API_BASE_URL}/api/products`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Products fetched:', data.length);
      
      // Debug: Check the first product's image path
      if (data.length > 0) {
        console.log('First product image path:', data[0].image);
        console.log('Full image URL:', getImageUrl(data[0].image));
      }
      
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      Alert.alert('Error', 'Failed to load products. Please try again later.');
      
      // Fallback to mock data
      const mockProducts = [
        {
          _id: '1',
          name: 'Premium Cotton T-Shirt',
          brand: 'FashionHub',
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
          variants: [{ sizes: [{ price: 29.99 }] }]
        },
        {
          _id: '2',
          name: 'Classic Denim Jacket',
          brand: 'UrbanStyle',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
          variants: [{ sizes: [{ price: 59.99 }] }]
        },
        {
          _id: '3',
          name: 'Smart Watch Pro',
          brand: 'TechGear',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop',
          variants: [{ sizes: [{ price: 199.99 }] }]
        },
        {
          _id: '4',
          name: 'Minimalist Sneakers',
          brand: 'EcoWear',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
          variants: [{ sizes: [{ price: 79.99 }] }]
        },
      ];
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Search functionality
  const debouncedSearch = useCallback(
    debounce((text) => {
      if (text.trim() === '') {
        setFilteredProducts(products);
      } else {
        const filtered = products.filter(product =>
          product.name?.toLowerCase().includes(text.toLowerCase()) ||
          product.brand?.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredProducts(filtered);
      }
      setSearchLoading(false);
    }, 300),
    [products]
  );

  useEffect(() => {
    if (searchText.trim() !== '') {
      setSearchLoading(true);
    }
    debouncedSearch(searchText);
  }, [searchText, debouncedSearch]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
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
      } else {
        currentWishlist.push(wishlistItem);
      }
      
      await AsyncStorage.setItem('wishlist', JSON.stringify(currentWishlist));
      setWishlist(currentWishlist);
    } catch (error) {
      console.error('Wishlist update failed', error);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const handleProductPress = (product) => {
    router.push({
      pathname: '../ProductDetailPage',
      params: { id: product._id },
    });
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

  const renderBrandCard = ({ item }) => (
    <TouchableOpacity style={styles.brandCard} activeOpacity={0.8}>
      <View style={styles.brandImageContainer}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.brandImage} 
          resizeMode="cover"
        />
      </View>
      <Text style={styles.brandName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.brandProducts}>{item.products} products</Text>
    </TouchableOpacity>
  );

  const categories = ['All Items', 'Clothing', 'Electronics', 'Home', 'Sports', 'Accessories'];

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
            <View style={styles.profileContainer}>
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcome}>Welcome to</Text>
                <Text style={styles.username}>Our Store!</Text>
              </View>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push('../WishlistScreen')}
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
                onPress={() => router.push('../CartScreen')}
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
            onPress={() => router.push('../SearchScreen')}
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

          {/* Featured Brands Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Brands</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAll}>See All</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={featuredBrands}
              renderItem={renderBrandCard}
              keyExtractor={(item) => item.name}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandList}
            />
          </View>

          {/* Products Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Products</Text>
              <Text style={styles.seeAll}>{filteredProducts.length} items</Text>
            </View>
            
            {searchLoading && (
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            )}
            
            {!searchLoading && filteredProducts.length > 0 ? (
              <FlatList
                data={filteredProducts}
                renderItem={renderProductItem}
                keyExtractor={(item) => item._id}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.list}
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                windowSize={5}
              />
            ) : (
              !searchLoading && (
                <View style={styles.emptyState}>
                  <Ionicons name="alert-circle-outline" size={50} color={COLORS.grayLight} />
                  <Text style={styles.emptyStateText}>No products found</Text>
                  <Text style={styles.emptyStateSubtext}>
                    {searchText ? `No results for "${searchText}"` : 'Try refreshing the page'}
                  </Text>
                </View>
              )
            )}
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
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
  section: {
    marginBottom: 25,
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
  brandList: {
    paddingVertical: 5,
  },
  brandCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
    width: width * 0.36,
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
  brandImageContainer: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.light,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  brandImage: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
    textAlign: 'center',
    maxWidth: '100%',
  },
  brandProducts: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginTop: 10,
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
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginTop: 10,
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
  loadingText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
  },
});

export default StoreScreen;