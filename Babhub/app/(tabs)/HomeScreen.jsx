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
  Animated,
  Easing,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import debounce from 'lodash.debounce';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
import http from '../../src/api/http';

const { width, height } = Dimensions.get('window');

// Get status bar height for different devices
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 28;

// Consistent color palette from store page
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

// Maximum unique items allowed in cart
const MAX_CART_ITEMS = 3;

// UPDATED: Home banners data with attractive images and better text
const homeBanners = [

  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    title: 'New Arrivals',
    subtitle: 'Fresh styles just for you',
    type: 'new'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    title: 'Premium Collection',
    subtitle: 'Luxury items at great prices',
    type: 'premium'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    title: 'Tech Deals',
    subtitle: 'Latest gadgets with amazing offers',
    type: 'tech'
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    title: 'Flash Sale',
    subtitle: 'Limited time offers - Shop now!',
    type: 'flash'
  }
];

// Featured categories for home
const featuredCategories = [
  {
    name: 'Electronics',
    products: 156,
    image: 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?w=400&h=400&fit=crop&crop=center',
    icon: 'phone-portrait'
  },
  {
    name: 'Fashion',
    products: 289,
    image: 'https://images.unsplash.com/photo-1566206091558-7f218b696731?w=400&h=400&fit=crop&crop=center',
    icon: 'shirt'
  },
  {
    name: 'Home',
    products: 134,
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop&crop=center',
    icon: 'home'
  },
  {
    name: 'Beauty',
    products: 98,
    image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop&crop=center',
    icon: 'sparkles'
  },
  {
    name: 'Sports',
    products: 76,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center',
    icon: 'basketball'
  },
];

// Quick access items
const quickAccess = [
  { id: '1', title: 'Flash Sale', icon: 'flash', color: '#FF6B6B' },
  { id: '2', title: 'New Arrivals', icon: 'sparkles', color: '#4FACFE' },
  { id: '3', title: 'Best Sellers', icon: 'trophy', color: '#A8FF78' },
  { id: '4', title: 'Deals', icon: 'pricetag', color: '#FF8E53' },
];

// Search suggestions for home
const searchSuggestions = [
  'Smartphones',
  'Laptops',
  'Headphones',
  'Watches',
  'Shoes',
  'T-Shirts',
  'Home Decor',
  'Beauty Products',
  'Sports Gear',
  'Books'
];

// Popular searches for home
const popularSearches = [
  'iPhone 15',
  'MacBook Pro',
  'Wireless Earbuds',
  'Running Shoes',
  'Summer Dresses',
  'Home Theater',
  'Skincare',
  'Fitness Trackers'
];


// Import image utilities
import { getImageUrl, normalizeImageUrl } from '../../src/utils/image';

// UPDATED: Internet Status Bar Component for Android - Removed Retry Button
const InternetStatusBar = ({ isOnline }) => {
  const translateY = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isOnline ? -60 : 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [isOnline]);

  if (isOnline) return null;

  return (
    <Animated.View 
      style={[
        styles.internetStatusBar,
        {
          transform: [{ translateY }]
        }
      ]}
    >
      <View style={styles.internetStatusContent}>
        <Ionicons name="wifi-outline" size={18} color={COLORS.white} />
        <Text style={styles.internetStatusText}>No internet connection</Text>
      </View>
    </Animated.View>
  );
};

// Search Suggestions Component
const SearchSuggestions = ({ suggestions, popularSearches, onSuggestionPress, searchText, visible, searchResults }) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible && searchText.length > 0) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, searchText]);

  if (!visible || searchText.length === 0) return null;

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(searchText.toLowerCase())
  );

  const hasSearchResults = searchResults && searchResults.length > 0;

  return (
    <Animated.View 
      style={[
        styles.searchSuggestionsContainer,
        {
          opacity: opacityAnim,
          transform: [{ translateY: translateYAnim }]
        }
      ]}
    >
      <View style={styles.searchSuggestionsContent}>
        {hasSearchResults && (
          <View style={styles.resultsCountContainer}>
            <Text style={styles.resultsCountText}>
              Found {searchResults.length} products for "{searchText}"
            </Text>
          </View>
        )}

        {filteredSuggestions.length > 0 && (
          <View style={styles.suggestionSection}>
            <Text style={styles.suggestionSectionTitle}>Quick Suggestions</Text>
            {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
              <TouchableOpacity
                key={suggestion}
                style={styles.suggestionItem}
                onPress={() => onSuggestionPress(suggestion)}
              >
                <Ionicons name="search-outline" size={16} color={COLORS.gray} />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!hasSearchResults && (
          <View style={styles.suggestionSection}>
            <Text style={styles.suggestionSectionTitle}>Popular Searches</Text>
            <View style={styles.popularSearchesContainer}>
              {popularSearches.map((search, index) => (
                <TouchableOpacity
                  key={search}
                  style={styles.popularSearchChip}
                  onPress={() => onSuggestionPress(search)}
                >
                  <Text style={styles.popularSearchText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {searchText.length > 2 && !hasSearchResults && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={40} color={COLORS.grayLight} />
            <Text style={styles.noResultsText}>No products found</Text>
            <Text style={styles.noResultsSubtext}>
              We couldn't find any products matching "{searchText}"
            </Text>
            <Text style={styles.noResultsTip}>
              Try searching with different keywords or browse our categories
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// UPDATED: Banner Item Component with new badge colors and shorter text
const BannerItem = ({ item, index, currentIndex }) => {
  const translateX = useRef(new Animated.Value(width)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (index === currentIndex) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      translateX.setValue(width);
      opacity.setValue(0);
      scale.setValue(0.9);
    }
  }, [currentIndex]);

  // UPDATED: Better badge colors for different banner types
  const getBadgeColor = (type) => {
    switch (type) {
      case 'sale': return '#FF6B6B'; // Red for sales
      case 'new': return '#4FACFE'; // Blue for new arrivals
      case 'premium': return '#FFD700'; // Gold for premium
      case 'tech': return '#10B981'; // Green for tech
      case 'flash': return '#EC4899'; // Pink for flash sales
      default: return COLORS.primary;
    }
  };

  // UPDATED: Better badge text
  const getBadgeText = (type) => {
    switch (type) {
      case 'sale': return 'HOT DEAL';
      case 'new': return 'NEW';
      case 'premium': return 'PREMIUM';
      case 'tech': return 'TECH';
      case 'flash': return 'FLASH';
      default: return 'FEATURED';
    }
  };

  return (
    <Animated.View 
      style={[
        styles.bannerItem,
        {
          transform: [{ translateX }, { scale }],
          opacity,
        }
      ]}
    >
      <Image source={{ uri: item.image }} style={styles.bannerImage} />
      
      <View style={styles.bannerOverlay} />
      
      <View style={styles.bannerContent}>
        <View style={[styles.bannerBadge, { backgroundColor: getBadgeColor(item.type) }]}>
          <Text style={styles.bannerBadgeText}>
            {getBadgeText(item.type)}
          </Text>
        </View>
        
        <Text style={styles.bannerTitle}>{item.title}</Text>
        <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        
        <TouchableOpacity style={styles.bannerButton}>
          <Text style={styles.bannerButtonText}>Shop Now</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.white} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Category Card Component
const CategoryCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
      <View style={styles.categoryImageContainer}>
        <Image source={{ uri: item.image }} style={styles.categoryImage} />
        <View style={styles.categoryIconContainer}>
          <Ionicons name={item.icon} size={20} color={COLORS.white} />
        </View>
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryProducts}>{item.products} products</Text>
    </TouchableOpacity>
  );
};

// Quick Access Item Component
const QuickAccessItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.quickAccessItem} onPress={onPress}>
      <View style={[styles.quickAccessIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={24} color={COLORS.white} />
      </View>
      <Text style={styles.quickAccessText}>{item.title}</Text>
    </TouchableOpacity>
  );
};

// UPDATED Product Item Component - Add to cart now navigates to product detail
const ProductItem = ({ item, onPress, onWishlistToggle, isInWishlist, index, onAddToCart, cartQuantity }) => {
  const price = item.variants?.[0]?.sizes?.[0]?.price || item.price || 0;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState(false);
  
  const scaleValue = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    const delay = index * 150;
    
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ])
    ]).start();
  }, []);

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

  const handleWishlistPress = (e) => {
    e.stopPropagation();
    onWishlistToggle(item);
  };

  // CHANGED: Add to cart now navigates to product detail page
  const handleAddToCartPress = (e) => {
    e.stopPropagation();
    // Navigate to product detail page instead of adding to cart
    onPress(item);
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
  
  const imageUrl = getImageUrl(item.image);

  return (
    <Animated.View 
      style={[
        styles.cardContainer, 
        {
          opacity: cardOpacity,
          transform: [{ translateY: cardTranslateY }]
        }
      ]}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
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
                style={[
                  styles.image, 
                  { 
                    opacity: imageLoaded ? 1 : 0,
                  }
                ]}
                resizeMode="cover"
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
              />
            )}
            
            <View style={styles.heartContainer}>
              <TouchableOpacity
                style={[styles.heartIcon, isInWishlist && styles.heartIconActive]}
                onPress={handleWishlistPress}
              >
                <Ionicons
                  name={isInWishlist ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isInWishlist ? COLORS.error : COLORS.white}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.title} numberOfLines={2}>{item.name || 'New Product'}</Text>
            
            <View style={styles.brandContainer}>
              <Text style={styles.brandText}>{item.brand || 'Popular Brand'}</Text>
            </View>
            
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons 
                    key={star} 
                    name="star" 
                    size={12} 
                    color={star <= 4 ? COLORS.secondary : COLORS.grayLight} 
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>4.8 (248)</Text>
            </View>
            
            <View style={styles.priceContainer}>
              <Text style={styles.price}>R{price.toFixed(2)}</Text>
              <View style={styles.cartButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.cartButton,
                    cartQuantity > 0 && styles.cartButtonActive,
                    recentlyAdded && styles.cartButtonPulse
                  ]}
                  onPress={handleAddToCartPress} // CHANGED: Now navigates to product detail
                >
                  <Ionicons 
                    name="cart" // CHANGED: Always show cart icon, no checkmark
                    size={16} 
                    color={COLORS.white} 
                  />
                </TouchableOpacity>
                {cartQuantity > 0 && renderCartQuantityBadge(cartQuantity)}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

// Sticky Header Component
const StickyHeader = ({ user, cartItems, router, scrollY, isOnline }) => {
  const headerHeight = 80;
  const headerTranslate = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight - 20],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[
      styles.stickyHeader,
      {
        transform: [{ translateY: headerTranslate }],
        opacity: headerOpacity,
      }
    ]}>
      <View style={styles.stickyHeaderContent}>
        <View style={styles.stickyProfile}>
          <View style={styles.stickyProfileInitials}>
            <Text style={styles.stickyProfileInitialsText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.stickyUsername}>Home</Text>
          {!isOnline && (
            <View style={styles.offlineDot}>
              <Ionicons name="wifi-outline" size={12} color={COLORS.white} />
            </View>
          )}
        </View>
        
        <View style={styles.stickyIcons}>
          <TouchableOpacity
            style={styles.stickyCartButton}
            onPress={() => router.push('../CartScreen')}
          >
            <View style={styles.bigCartIconContainer}>
              <Ionicons name="cart" size={28} color={COLORS.primary} />
              {cartItems > 0 && (
                <View style={styles.stickyBadge}>
                  <Text style={styles.stickyBadgeText}>{cartItems}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

// UPDATED: Special Offer Banner Component with better text
const SpecialOfferBanner = () => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const translateYValue = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(translateYValue, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

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

  return (
    <Animated.View 
      style={[
        styles.specialOfferBanner,
        {
          opacity: opacityValue,
          transform: [
            { translateY: translateYValue }, 
            { scale: scaleValue }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.specialOfferContent}
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.specialOfferTextContainer}>
          <Text style={styles.specialOfferTitle}>Special Offer! 🎉</Text>
          <Text style={styles.specialOfferSubtitle}>Get 20% off on your first order</Text>
        </View>
        <View style={styles.specialOfferButton}>
          <Text style={styles.specialOfferButtonText}>Claim Now</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.primary} style={{ marginLeft: 6 }} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const HomeScreen = () => {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [connectionChecking, setConnectionChecking] = useState(false);
  const [hasCachedData, setHasCachedData] = useState(false);
  
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const bannerRef = useRef(null);
  const searchInputRef = useRef(null);

  // IMPROVED Internet connection check using NetInfo
  const checkConnection = useCallback(async () => {
    setConnectionChecking(true);
    try {
      const netInfoState = await NetInfo.fetch();
      const connected = netInfoState.isConnected && netInfoState.isInternetReachable;
      setIsOnline(connected);
      
      if (!connected && products.length > 0) {
        setHasCachedData(true);
        Toast.show({
          type: 'info',
          text1: 'Offline Mode',
          text2: 'Showing cached products',
        });
      }
      
      return connected;
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsOnline(false);
      return false;
    } finally {
      setConnectionChecking(false);
    }
  }, [products.length]);

  // Set up network listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable;
      setIsOnline(connected);
      
      if (!connected && products.length > 0) {
        setHasCachedData(true);
        Toast.show({
          type: 'info',
          text1: 'Offline Mode',
          text2: 'Showing cached products',
        });
      }
    });

    return () => unsubscribe();
  }, [products.length]);

  // Fetch wishlist and cart from AsyncStorage
  const fetchWishlistAndCart = async () => {
    try {
      const wishlistData = await AsyncStorage.getItem('wishlist');
      if (wishlistData) {
        const parsedWishlist = JSON.parse(wishlistData);
        setWishlist(parsedWishlist);
      } else {
        setWishlist([]);
      }

      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        const cartItems = JSON.parse(cartData);
        setCartItems(cartItems);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist or cart:', error);
    }
  };

  // Get cart quantity for a specific product
  const getCartQuantity = (productId) => {
    const cartItem = cartItems.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Enhanced Add to Cart function
  const handleAddToCart = async (product) => {
    try {
      // Check cart limit
      const uniqueItems = new Set(cartItems.map(item => item.id));
      if (uniqueItems.size >= MAX_CART_ITEMS && !uniqueItems.has(product._id)) {
        Toast.show({
          type: 'error',
          text1: 'Cart Limit Reached',
          text2: `Maximum ${MAX_CART_ITEMS} unique items allowed in cart`,
        });
        return;
      }

      const price = product.variants?.[0]?.sizes?.[0]?.price || product.price || 0;
      
      const cartItem = {
        id: product._id,
        title: product.name,
        brand: product.brand,
        image: normalizeImageUrl(product.image),
        price: price,
        quantity: 1,
        color: 'Default',
        size: 'Standard'
      };

      const storedCart = await AsyncStorage.getItem('cart');
      let currentCart = storedCart ? JSON.parse(storedCart) : [];
      
      // Check if item already exists in cart
      const existingItemIndex = currentCart.findIndex(item => item.id === cartItem.id);
      
      if (existingItemIndex > -1) {
        // Update quantity if item exists
        currentCart[existingItemIndex].quantity += 1;
      } else {
        // Add new item to cart
        currentCart.push(cartItem);
      }
      
      await AsyncStorage.setItem('cart', JSON.stringify(currentCart));
      setCartItems(currentCart);
      
      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${cartItem.title} added to your cart`,
      });
      
    } catch (error) {
      console.error('Failed to add to cart', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add item to cart',
      });
    }
  };

  // Use focus effect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('HomeScreen focused - refreshing wishlist and cart');
      fetchWishlistAndCart();
      checkConnection();
    }, [])
  );

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      const connected = await checkConnection();
      if (connected) {
        await fetchWishlistAndCart();
        await fetchProducts();
      } else {
        // Load cached products if available
        await loadCachedProducts();
      }
    };
    
    initializeData();
  }, []);

  // Load cached products from AsyncStorage
  const loadCachedProducts = async () => {
    try {
      const cachedProducts = await AsyncStorage.getItem('cached_products');
      if (cachedProducts) {
        const parsedProducts = JSON.parse(cachedProducts);
        setProducts(parsedProducts);
        setFilteredProducts(parsedProducts);
        setHasCachedData(true);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading cached products:', error);
      setLoading(false);
    }
  };

  // Fetch products from backend API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const {data} = await http.get('/products/featured');
      
      
      const productsData = data.products || data;
      setProducts(productsData);
      setFilteredProducts(productsData);
      
      // Cache products for offline use
      await AsyncStorage.setItem('cached_products', JSON.stringify(productsData));
      setHasCachedData(true);
      
    } catch (err) {
      console.error('Error fetching products:', err);
      
      // Try to load cached products as fallback
      await loadCachedProducts();
      
      if (!hasCachedData) {
        // Fallback to mock data only if no cached data available
        const mockProducts = [
          {
            _id: '1',
            name: 'Premium Cotton T-Shirt',
            brand: 'FashionHub',
            category: 'Clothing',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
            variants: [{ sizes: [{ price: 29.99 }] }],
            price: 29.99
          },
          {
            _id: '2',
            name: 'Wireless Bluetooth Headphones',
            brand: 'TechGear',
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop',
            variants: [{ sizes: [{ price: 149.99 }] }],
            price: 149.99
          },
          {
            _id: '3',
            name: 'Smart Watch Pro',
            brand: 'TechGear',
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop',
            variants: [{ sizes: [{ price: 199.99 }] }],
            price: 199.99
          },
          {
            _id: '4',
            name: 'Minimalist Sneakers',
            brand: 'EcoWear',
            category: 'Shoes',
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
            variants: [{ sizes: [{ price: 79.99 }] }],
            price: 79.99
          },
          {
            _id: '5',
            name: 'Designer Handbag',
            brand: 'LuxuryBrand',
            category: 'Accessories',
            image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop',
            variants: [{ sizes: [{ price: 299.99 }] }],
            price: 299.99
          },
          {
            _id: '6',
            name: 'Running Shoes',
            brand: 'ActiveWear',
            category: 'Shoes',
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
            variants: [{ sizes: [{ price: 89.99 }] }],
            price: 89.99
          },
          {
            _id: '7',
            name: 'Gaming Laptop',
            brand: 'TechGear',
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=500&fit=crop',
            variants: [{ sizes: [{ price: 1299.99 }] }],
            price: 1299.99
          },
          {
            _id: '8',
            name: 'Designer Sunglasses',
            brand: 'LuxuryBrand',
            category: 'Accessories',
            image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop',
            variants: [{ sizes: [{ price: 199.99 }] }],
            price: 199.99
          },
        ];
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
        setHasCachedData(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Search functionality
  const performSearch = (text) => {
    if (text.trim() === '') {
      setFilteredProducts(products);
      setSearchResults([]);
      setIsSearchActive(false);
    } else {
      const filtered = products.filter(product =>
        product.name?.toLowerCase().includes(text.toLowerCase()) ||
        product.brand?.toLowerCase().includes(text.toLowerCase()) ||
        product.category?.toLowerCase().includes(text.toLowerCase())
      );
      
      setSearchResults(filtered);
      setIsSearchActive(true);
      
      if (filtered.length > 0) {
        setFilteredProducts(filtered);
      } else {
        setFilteredProducts([]);
      }
    }
    setSearchLoading(false);
  };

  const debouncedSearch = useCallback(
    debounce((text) => {
      performSearch(text);
    }, 300),
    [products]
  );

  // Handle search text changes
  useEffect(() => {
    if (searchText.trim() !== '') {
      setSearchLoading(true);
      setShowSearchSuggestions(true);
      setIsSearchActive(true);
    } else {
      setShowSearchSuggestions(false);
      setIsSearchActive(false);
      setSearchResults([]);
      setFilteredProducts(products);
    }
    debouncedSearch(searchText);
  }, [searchText, debouncedSearch]);

  // Handle search submission
  const handleSearchSubmit = () => {
    setShowSearchSuggestions(false);
    performSearch(searchText);
    searchInputRef.current?.blur();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const connected = await checkConnection();
    if (connected) {
      await fetchProducts();
      await fetchWishlistAndCart();
    } else {
      // Reload cached data when offline
      await loadCachedProducts();
    }
    setRefreshing(false);
  };

  const toggleWishlist = async (product) => {
    try {
      const price = product.variants?.[0]?.sizes?.[0]?.price || product.price || 0;
      
      const wishlistItem = {
        id: product._id,
        title: product.name,
        brand: product.brand,
        image: getImageUrl(product.image),
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
        });
      } else {
        currentWishlist.push(wishlistItem);
        Toast.show({
          type: 'success',
          text1: 'Added to Wishlist',
          text2: `${wishlistItem.title} added`,
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
      });
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

  const handleCategoryPress = (category) => {
    router.push({
      pathname: '../StoreScreen',
      params: { category: category.name }
    });
  };

  const handleQuickAccessPress = (item) => {
    router.push({
      pathname: '../StoreScreen',
      params: { filter: item.title }
    });
  };

  const handleSuggestionPress = (suggestion) => {
    setSearchText(suggestion);
    searchInputRef.current?.focus();
    setShowSearchSuggestions(false);
    performSearch(suggestion);
  };

  const handleSearchFocus = () => {
    if (searchText.length > 0) {
      setShowSearchSuggestions(true);
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowSearchSuggestions(false);
    }, 200);
  };

  const clearSearch = () => {
    setSearchText('');
    setShowSearchSuggestions(false);
    setIsSearchActive(false);
    setSearchResults([]);
    setFilteredProducts(products);
    searchInputRef.current?.focus();
  };

  const onViewRef = useRef(({ changed }) => {
    if (changed && changed[0]?.index !== undefined) {
      setCurrentBannerIndex(changed[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const renderProductItem = ({ item, index }) => {
    const productInWishlist = isInWishlist(item._id);
    const cartQuantity = getCartQuantity(item._id);
    
    return (
      <ProductItem 
        item={item}
        onPress={handleProductPress}
        onWishlistToggle={toggleWishlist}
        isInWishlist={productInWishlist}
        index={index}
        onAddToCart={handleAddToCart}
        cartQuantity={cartQuantity}
      />
    );
  };

  // Split products for before and after special offer
  const firstHalfProducts = filteredProducts.slice(0, 4);
  const secondHalfProducts = filteredProducts.slice(4);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* FIXED: Status bar with white background */}
        <StatusBar 
          backgroundColor={COLORS.white} 
          barStyle="dark-content" 
          translucent={false}
        />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading home...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* FIXED: Status bar with white background */}
      <StatusBar 
        backgroundColor={COLORS.white} 
        barStyle="dark-content" 
        translucent={false}
      />
      
      {/* UPDATED: Internet Status Bar without Retry Button */}
      <InternetStatusBar 
        isOnline={isOnline} 
      />

      {/* Sticky Header */}
      <StickyHeader 
        user={user}
        cartItems={cartItems.length}
        router={router}
        scrollY={scrollY}
        isOnline={isOnline}
      />

      <Animated.ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={!isOnline ? styles.offlineContent : {}}
      >
        <View style={styles.container}>
          {/* Offline Indicator in Content */}
          {!isOnline && hasCachedData && (
            <View style={styles.offlineIndicator}>
              <Ionicons name="cloud-offline-outline" size={16} color={COLORS.warning} />
              <Text style={styles.offlineIndicatorText}>
                You're offline • Showing cached products
              </Text>
            </View>
          )}

          {/* Main Header */}
          <View style={styles.header}>
            <View style={styles.profileContainer}>
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcome}>Welcome back,</Text>
                <Text style={styles.username}>{user?.name || "Guest"}! 👋</Text>
              </View>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.bigHeaderCartButton}
                onPress={() => router.push('../CartScreen')}
              >
                <View style={styles.bigHeaderCartContainer}>
                  <Ionicons name="cart" size={28} color={COLORS.dark} />
                  {cartItems.length > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{cartItems.length}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar with Suggestions */}
          <View style={styles.searchWrapper}>
            <View style={styles.searchContainer}>
              <View style={styles.searchInnerContainer}>
                <View style={styles.searchIconContainer}>
                  <Ionicons name="search" size={20} color={COLORS.primary} />
                </View>
                
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search products, brands, categories..."
                  placeholderTextColor={COLORS.gray}
                  value={searchText}
                  onChangeText={setSearchText}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  returnKeyType="search"
                  onSubmitEditing={handleSearchSubmit}
                />
                
                {searchText ? (
                  <TouchableOpacity 
                    style={styles.searchClearButton}
                    onPress={clearSearch}
                  >
                    <Ionicons name="close-circle" size={18} color={COLORS.gray} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Search Suggestions Dropdown */}
            <SearchSuggestions
              suggestions={searchSuggestions}
              popularSearches={popularSearches}
              onSuggestionPress={handleSuggestionPress}
              searchText={searchText}
              visible={showSearchSuggestions}
              searchResults={searchResults}
            />
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Show search results when search is active */}
            {isSearchActive && searchText.length > 0 ? (
              <View style={styles.searchResultsSection}>
                {searchLoading ? (
                  <View style={styles.loadingState}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Searching...</Text>
                  </View>
                ) : searchResults.length > 0 ? (
                  <>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>
                        Search Results ({searchResults.length})
                      </Text>
                      <Text style={styles.seeAll}>"{searchText}"</Text>
                    </View>
                    
                    <FlatList
                      data={searchResults}
                      renderItem={renderProductItem}
                      keyExtractor={(item) => item._id}
                      numColumns={2}
                      scrollEnabled={false}
                      columnWrapperStyle={styles.columnWrapper}
                      contentContainerStyle={styles.list}
                    />
                  </>
                ) : (
                  <View style={styles.noSearchResults}>
                    <Ionicons name="search-outline" size={80} color={COLORS.grayLight} />
                    <Text style={styles.noSearchResultsText}>No products found</Text>
                    <Text style={styles.noSearchResultsSubtext}>
                      We couldn't find any products matching "{searchText}"
                    </Text>
                    <TouchableOpacity 
                      style={styles.tryAgainButton}
                      onPress={clearSearch}
                    >
                      <Text style={styles.tryAgainText}>Clear Search</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              /* Show regular home content when not searching */
              <View>
                {/* UPDATED: Main Banner with new images and text */}
                <View style={styles.bannerContainer}>
                  <FlatList
                    ref={bannerRef}
                    data={homeBanners}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                      <BannerItem 
                        item={item} 
                        index={index}
                        currentIndex={currentBannerIndex}
                      />
                    )}
                    keyExtractor={(item) => item.id}
                    onViewableItemsChanged={onViewRef.current}
                    viewabilityConfig={viewConfigRef.current}
                  />
                  <View style={styles.bannerPagination}>
                    {homeBanners.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.paginationDot,
                          {
                            backgroundColor: currentBannerIndex === index ? COLORS.white : 'rgba(255,255,255,0.6)',
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>

                {/* Quick Access Section */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Quick Access</Text>
                  </View>
                  <View style={styles.quickAccessContainer}>
                    {quickAccess.map((item) => (
                      <QuickAccessItem 
                        key={item.id} 
                        item={item} 
                        onPress={() => handleQuickAccessPress(item)}
                      />
                    ))}
                  </View>
                </View>

                {/* Featured Categories */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Shop by Category</Text>
                    <TouchableOpacity style={styles.seeAllButton}>
                      <Text style={styles.seeAll}>See All</Text>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={featuredCategories}
                    renderItem={({ item }) => (
                      <CategoryCard 
                        item={item} 
                        onPress={() => handleCategoryPress(item)}
                      />
                    )}
                    keyExtractor={(item) => item.name}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                  />
                </View>

                {/* Featured Products */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Featured Products</Text>
                    <Text style={styles.seeAll}>{filteredProducts.length} items</Text>
                  </View>
                  
                  {filteredProducts.length > 0 ? (
                    <>
                      {/* First Half of Products */}
                      <FlatList
                        data={firstHalfProducts}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => item._id}
                        numColumns={2}
                        scrollEnabled={false}
                        columnWrapperStyle={styles.columnWrapper}
                        contentContainerStyle={styles.list}
                      />

                      {/* Special Offer Banner in the Middle */}
                      <SpecialOfferBanner />

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
                        />
                      )}
                    </>
                  ) : (
                    <View style={styles.emptyState}>
                      <Ionicons name="grid-outline" size={50} color={COLORS.grayLight} />
                      <Text style={styles.emptyStateText}>No products found</Text>
                      <Text style={styles.emptyStateSubtext}>
                        Check back soon for new arrivals
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </Animated.ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

// UPDATED: Styles for Android with better responsiveness and removed retry button styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white, // Changed to white to match status bar
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
  },
  // UPDATED: Internet Status Bar Styles for Android - Removed Retry Button
  internetStatusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.error,
    paddingVertical: 14,
    paddingHorizontal: 16,
    zIndex: 2000,
    elevation: 8,
  },
  internetStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  internetStatusText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Removed retryButton and retryText styles
  // Offline Styles
  offlineContent: {
    paddingTop: 50, // Extra padding to account for status bar
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  offlineIndicatorText: {
    color: COLORS.warning,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  offlineDot: {
    backgroundColor: COLORS.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? STATUS_BAR_HEIGHT + 10 : 60,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeContainer: {
    marginLeft: 12,
  },
  welcome: {
    fontSize: 14,
    color: COLORS.gray,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bigHeaderCartButton: {
    padding: 8,
    marginLeft: 8,
  },
  bigHeaderCartContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
    elevation: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  searchWrapper: {
    position: 'relative',
    zIndex: 1000,
    marginBottom: 16,
  },
  searchContainer: {
    paddingHorizontal: 20,
  },
  searchInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  searchIconContainer: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.dark,
    padding: 0,
    includeFontPadding: false, // Better text alignment on Android
  },
  searchClearButton: {
    padding: 4,
  },
  searchSuggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 20,
    right: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1001,
    maxHeight: 400,
  },
  searchSuggestionsContent: {
    padding: 16,
  },
  resultsCountContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
    marginBottom: 12,
  },
  resultsCountText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  suggestionSection: {
    marginBottom: 16,
  },
  suggestionSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  suggestionText: {
    fontSize: 15,
    color: COLORS.dark,
    marginLeft: 12,
    flex: 1,
  },
  popularSearchesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularSearchChip: {
    backgroundColor: COLORS.light,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  popularSearchText: {
    fontSize: 13,
    color: COLORS.dark,
    fontWeight: '500',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 12,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 4,
  },
  noResultsTip: {
    fontSize: 12,
    color: COLORS.grayLight,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
  },
  searchResultsSection: {
    paddingHorizontal: 20,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noSearchResults: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noSearchResultsText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  noSearchResultsSubtext: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 8,
  },
  tryAgainButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  tryAgainText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  // Quick Access Styles
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  quickAccessItem: {
    alignItems: 'center',
    width: width * 0.21, // Responsive width
  },
  quickAccessIcon: {
    width: width * 0.14, // Responsive icon size
    height: width * 0.14,
    borderRadius: width * 0.07,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 4,
  },
  quickAccessText: {
    fontSize: width * 0.03, // Responsive font size
    fontWeight: '600',
    color: COLORS.dark,
    textAlign: 'center',
  },
  // Category Card Styles
  categoriesList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  categoryCard: {
    width: width * 0.35, // Responsive width
    marginRight: 16,
  },
  categoryImageContainer: {
    position: 'relative',
    width: '100%',
    height: width * 0.25, // Responsive height
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 4,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 6,
  },
  categoryName: {
    fontSize: width * 0.04, // Responsive font size
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  categoryProducts: {
    fontSize: width * 0.03, // Responsive font size
    color: COLORS.gray,
  },
  // Special Offer Banner Styles
  specialOfferBanner: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
  },
  specialOfferContent: {
    flexDirection: width > 400 ? 'row' : 'column', // Responsive layout
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  specialOfferTextContainer: {
    flex: 1,
    marginRight: width > 400 ? 16 : 0,
    marginBottom: width > 400 ? 0 : 12,
  },
  specialOfferTitle: {
    fontSize: width * 0.045, // Responsive font size
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  specialOfferSubtitle: {
    fontSize: width * 0.035, // Responsive font size
    color: COLORS.white,
    opacity: 0.9,
    lineHeight: 18,
  },
  specialOfferButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialOfferButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  // Product Card Styles
  cardContainer: {
    width: '48%',
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.08)',
    elevation: 6,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: width * 0.45, // Responsive height
    backgroundColor: COLORS.light,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  heartIcon: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    padding: 8,
    elevation: 3,
  },
  heartIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
    alignSelf: 'flex-start',
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 16,
    backgroundColor: COLORS.cardBackground,
  },
  title: {
    fontSize: width * 0.035, // Responsive font size
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 6,
    height: 20,
    lineHeight: 20,
  },
  brandContainer: {
    marginBottom: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: width * 0.04, // Responsive font size
    fontWeight: 'bold',
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
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  cartButtonActive: {
    backgroundColor: COLORS.success,
  },
  cartButtonPulse: {
    backgroundColor: COLORS.success,
    transform: [{ scale: 1.1 }],
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
    elevation: 4,
  },
  quantityText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  cartIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    height: width * 0.5, // Responsive height
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
  },
  bannerItem: {
    width: width - 40,
    height: width * 0.5,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  bannerBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  bannerTitle: {
    fontSize: width * 0.06, // Responsive font size
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: width * 0.04, // Responsive font size
    color: COLORS.white,
    marginBottom: 16,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bannerButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  bannerPagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  list: {
    paddingHorizontal: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: COLORS.white, // Changed to white
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
    zIndex: 1000,
    paddingTop: Platform.OS === 'android' ? STATUS_BAR_HEIGHT : 40,
    elevation: 4,
  },
  stickyHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    flex: 1,
  },
  stickyProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stickyProfileInitials: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 4,
  },
  stickyProfileInitialsText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  stickyUsername: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  stickyIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stickyCartButton: {
    padding: 8,
  },
  bigCartIconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white, // Changed to white
    elevation: 4,
  },
  stickyBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default HomeScreen;