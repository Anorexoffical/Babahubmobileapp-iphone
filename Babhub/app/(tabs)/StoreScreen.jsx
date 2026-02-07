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
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
import http from '../../src/api/http';

const { width, height } = Dimensions.get('window');

// Get status bar height for different devices
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 28;

// Responsive sizing functions
const responsiveWidth = (percentage) => (width * percentage) / 100;
const responsiveHeight = (percentage) => (height * percentage) / 100;
const responsiveFont = (size) => (width * size) / 400;

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



// Store banners data
const storeBanners = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    title: 'Summer Collection',
    subtitle: 'Up to 50% off on new arrivals',
    type: 'sale'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    title: 'Premium Brands',
    subtitle: 'Shop from top designers',
    type: 'premium'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    title: 'Flash Sale',
    subtitle: 'Limited time offers',
    type: 'flash'
  }
];

// New Middle Banner Data
const middleBanners = [
  {
    id: '1',
    title: 'Weekend Special',
    subtitle: 'Extra 20% OFF on all orders',
    code: 'WEEKEND20',
    gradient: ['#FF6B6B', '#FF8E53'],
    icon: 'flash'
  },
  {
    id: '2',
    title: 'Free Shipping',
    subtitle: 'On orders above $50',
    code: 'FREE50',
    gradient: ['#4FACFE', '#00F2FE'],
    icon: 'rocket'
  },
  {
    id: '3',
    title: 'New User Offer',
    subtitle: 'Get 30% off on first order',
    code: 'NEW30',
    gradient: ['#A8FF78', '#78FFD6'],
    icon: 'gift'
  }
];

// Featured brands with premium images
const featuredBrands = [
  {
    name: 'FashionHub',
    products: 265,
    image: 'https://images.unsplash.com/photo-1566206091558-7f218b696731?w=400&h=400&fit=crop&crop=center',
    discount: '30% OFF'
  },
  {
    name: 'UrbanStyle',
    products: 95,
    image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop&crop=center',
    discount: '25% OFF'
  },
  {
    name: 'EcoWear',
    products: 36,
    image: 'https://images.unsplash.com/photo-1569074187119-c87815b476da?w=400&h=400&fit=crop&crop=center',
    discount: '40% OFF'
  },
  {
    name: 'TechGear',
    products: 142,
    image: 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?w=400&h=400&fit=crop&crop=center',
    discount: '15% OFF'
  },
  {
    name: 'HomeEssentials',
    products: 89,
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop&crop=center',
    discount: '20% OFF'
  },
];

// New Trending Products Slider
const trendingProducts = [
  {
    id: '1',
    name: 'Wireless Earbuds Pro',
    brand: 'TechGear',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1566206091558-7f218b696731?w=400&h=400&fit=crop&crop=center',
    rating: 4.8,
    reviews: 234
  },
  {
    id: '2',
    name: 'Designer Sunglasses',
    brand: 'UrbanStyle',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop',
    rating: 4.6,
    reviews: 189
  },
  {
    id: '3',
    name: 'Smart Fitness Watch',
    brand: 'TechGear',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400&h=300&fit=crop',
    rating: 4.7,
    reviews: 312
  }
];

// Search suggestions based on actual products and brands
const searchSuggestions = [
  'T-Shirts',
  'Sneakers',
  'Watches',
  'Headphones',
  'Jackets',
  'Handbags',
  'Sunglasses',
  'Laptops',
  'Smartphones',
  'Home Decor',
  'FashionHub',
  'UrbanStyle',
  'EcoWear',
  'TechGear',
  'HomeEssentials'
];

// Popular searches
const popularSearches = [
  'Summer Collection',
  'Wireless Earbuds',
  'Designer Bags',
  'Fitness Gear',
  'Smart Home',
  'Premium Brands',
  'Flash Sale'
];

// Import image utilities
import { getImageUrl, normalizeImageUrl } from '../../src/utils/image';

// IMPROVED Internet Status Bar Component using NetInfo
const InternetStatusBar = ({ isOnline, onRetry }) => {
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
        <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
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

  // Show search results in suggestions if available
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
        {/* Search Results Count */}
        {hasSearchResults && (
          <View style={styles.resultsCountContainer}>
            <Text style={styles.resultsCountText}>
              Found {searchResults.length} products for "{searchText}"
            </Text>
          </View>
        )}

        {/* Recent/Matching Searches */}
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

        {/* Popular Searches */}
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

        {/* No Results Message */}
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

// Animated Banner Component
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

  const getBadgeColor = (type) => {
    switch (type) {
      case 'sale': return COLORS.secondary;
      case 'premium': return COLORS.primary;
      case 'flash': return COLORS.accent;
      default: return COLORS.primary;
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
            {item.type === 'sale' ? 'SALE' : item.type === 'premium' ? 'PREMIUM' : 'FLASH'}
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

// New Middle Banner Component
const MiddleBanner = ({ item }) => {
  const [isCopied, setIsCopied] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleCopyCode = () => {
    setIsCopied(true);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Animated.View 
      style={[
        styles.middleBanner,
        { 
          backgroundColor: item.gradient ? undefined : COLORS.primary,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      {item.gradient && (
        <View style={[styles.middleBannerGradient, {
          backgroundColor: item.gradient[0]
        }]} />
      )}
      
      <View style={styles.middleBannerContent}>
        <View style={styles.middleBannerIcon}>
          <Ionicons 
            name={item.icon} 
            size={responsiveFont(32)} 
            color={COLORS.white} 
          />
        </View>
        
        <View style={styles.middleBannerText}>
          <Text style={styles.middleBannerTitle}>{item.title}</Text>
          <Text style={styles.middleBannerSubtitle}>{item.subtitle}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.middleBannerCode}
          onPress={handleCopyCode}
        >
          <Text style={styles.middleBannerCodeText}>
            {isCopied ? 'Copied!' : item.code}
          </Text>
          <Ionicons 
            name={isCopied ? 'checkmark' : 'copy-outline'} 
            size={responsiveFont(16)} 
            color={COLORS.white} 
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// New Trending Product Card - REMOVED Add to Cart button
const TrendingProductCard = ({ item, index }) => {
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateX = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 200),
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateX, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ])
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.trendingCard,
        {
          opacity: cardOpacity,
          transform: [{ translateX: cardTranslateX }]
        }
      ]}
    >
      <TouchableOpacity style={styles.trendingCardInner} activeOpacity={0.9}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.trendingImage}
          resizeMode="cover"
        />
        
        <View style={styles.trendingBadge}>
          <Ionicons name="trending-up" size={responsiveFont(12)} color={COLORS.white} />
          <Text style={styles.trendingBadgeText}>TRENDING</Text>
        </View>
        
        <View style={styles.trendingContent}>
          <Text style={styles.trendingBrand}>{item.brand}</Text>
          <Text style={styles.trendingName} numberOfLines={2}>{item.name}</Text>
          
          <View style={styles.trendingPriceContainer}>
            <Text style={styles.trendingPrice}>R{item.price.toFixed(2)}</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons 
                    key={star} 
                    name="star" 
                    size={responsiveFont(12)} 
                    color={star <= Math.floor(item.rating) ? COLORS.secondary : COLORS.grayLight} 
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>{item.rating} ({item.reviews})</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// UPDATED Product Item Component - Only show NEW badge if isFeatured is true
const ProductItem = ({ item, onPress, onWishlistToggle, isInWishlist, index, onAddToCart, cartQuantity }) => {
  const price = item.variants?.[0]?.sizes?.[0]?.price || item.price || 0;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState(false);
  
  // Animation values
  const scaleValue = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    // Staggered animation for product cards
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
            
            {/* UPDATED: Heart icon moved to top right */}
            <View style={styles.heartContainer}>
              <TouchableOpacity
                style={[styles.heartIcon, isInWishlist && styles.heartIconActive]}
                onPress={handleWishlistPress}
              >
                <Ionicons
                  name={isInWishlist ? 'heart' : 'heart-outline'}
                  size={responsiveFont(20)}
                  color={isInWishlist ? COLORS.error : COLORS.white}
                />
              </TouchableOpacity>
            </View>

            {/* UPDATED: NEW badge only shown if isFeatured is true */}
            {item.isFeatured === true && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
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
                    size={responsiveFont(12)} 
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
                    size={responsiveFont(16)} 
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

// UPDATED Sticky Header Component - Bigger Cart Icon with Internet Status
const StickyHeader = ({ user, cartItems, router, scrollY, isOnline }) => {
  const headerHeight = responsiveHeight(10);
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
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </Text>
          </View>
          <Text style={styles.stickyUsername}>Store</Text>
          {!isOnline && (
            <View style={styles.offlineDot}>
              <Ionicons name="wifi-outline" size={responsiveFont(12)} color={COLORS.white} />
            </View>
          )}
        </View>
        
        <View style={styles.stickyIcons}>
          {/* Big Cart Icon */}
          <TouchableOpacity
            style={styles.stickyCartButton}
            onPress={() => router.push('../CartScreen')}
          >
            <View style={styles.bigCartIconContainer}>
              <Ionicons name="cart" size={responsiveFont(28)} color={COLORS.primary} />
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

// NEW: Dynamic Category Filter Component
const CategoryFilter = ({ categories, selectedCategory, onCategorySelect }) => {
  return (
    <View style={styles.categoriesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => onCategorySelect(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const StoreScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [categories, setCategories] = useState(['All Items']);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [currentMiddleBannerIndex, setCurrentMiddleBannerIndex] = useState(0);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [connectionChecking, setConnectionChecking] = useState(false);
  const [hasCachedData, setHasCachedData] = useState(false);
  
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const bannerRef = useRef(null);
  const middleBannerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Animation values
  const searchOpacity = useRef(new Animated.Value(0)).current;
  const categoriesOpacity = useRef(new Animated.Value(0)).current;
  const searchTranslateY = useRef(new Animated.Value(30)).current;
  const searchScale = useRef(new Animated.Value(0.95)).current;
  
  // Search mode animations
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;


  // IMPROVED: Internet connection check using NetInfo
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

  // NEW: Extract unique categories from products
  const extractCategoriesFromProducts = (products) => {
    const categorySet = new Set(['All Items']);
    
    products.forEach(product => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    
    return Array.from(categorySet);
  };

  // NEW: Filter products by category
  const filterProductsByCategory = (category, productsList = products) => {
    if (category === 'All Items') {
      return productsList;
    }
    return productsList.filter(product => product.category === category);
  };

  // Fetch wishlist and cart from AsyncStorage
  const fetchWishlistAndCart = async () => {
    try {
      // Fetch wishlist
      const wishlistData = await AsyncStorage.getItem('wishlist');
      if (wishlistData) {
        const parsedWishlist = JSON.parse(wishlistData);
        setWishlist(parsedWishlist);
        console.log('Wishlist updated:', parsedWishlist.length, 'items');
      } else {
        setWishlist([]);
      }

      // Fetch cart count
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        const cartItems = JSON.parse(cartData);
        setCartItems(cartItems);
        console.log('Cart updated:', cartItems.length, 'items');
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
      console.log('StoreScreen focused - refreshing wishlist and cart');
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
        
        // Extract categories from cached data
        const extractedCategories = extractCategoriesFromProducts(parsedProducts);
        setCategories(extractedCategories);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading cached products:', error);
      setLoading(false);
    }
  };

  // Fetch products from backend API - Get all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Get all products (not just featured ones)
      const {data} = await http.get('/products');
      
      const productsData = data.products || data;
      
      // Set all products (including both featured and non-featured)
      setProducts(productsData);
      setFilteredProducts(productsData);
      
      // NEW: Extract categories from all products and update state
      const extractedCategories = extractCategoriesFromProducts(productsData);
      setCategories(extractedCategories);
      console.log('All products loaded:', productsData.length);
      console.log('Featured products count:', productsData.filter(product => product.isFeatured === true).length);
      console.log('Categories extracted:', extractedCategories);
      
      // Cache all products for offline use
      await AsyncStorage.setItem('cached_products', JSON.stringify(productsData));
      setHasCachedData(true);
      
    } catch (err) {
      console.error('Error fetching products:', err);
      
      // Try to load cached products as fallback
      await loadCachedProducts();
      
      if (!hasCachedData) {
        // Fallback to mock data with mixed isFeatured status
        const mockProducts = [
          {
            _id: '1',
            name: 'Premium Cotton T-Shirt',
            brand: 'FashionHub',
            category: 'Clothing',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
            variants: [{ sizes: [{ price: 29.99 }] }],
            price: 29.99,
            isFeatured: true // Featured product - will show NEW badge
          },
          {
            _id: '2',
            name: 'Classic Denim Jacket',
            brand: 'UrbanStyle',
            category: 'Clothing',
            image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
            variants: [{ sizes: [{ price: 59.99 }] }],
            price: 59.99,
            isFeatured: false // Not featured - no NEW badge
          },
          {
            _id: '3',
            name: 'Smart Watch Pro',
            brand: 'TechGear',
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop',
            variants: [{ sizes: [{ price: 199.99 }] }],
            price: 199.99,
            isFeatured: true // Featured product - will show NEW badge
          },
          {
            _id: '4',
            name: 'Minimalist Sneakers',
            brand: 'EcoWear',
            category: 'Shoes',
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
            variants: [{ sizes: [{ price: 79.99 }] }],
            price: 79.99,
            isFeatured: false // Not featured - no NEW badge
          },
          {
            _id: '5',
            name: 'Designer Handbag',
            brand: 'LuxuryBrand',
            category: 'Accessories',
            image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop',
            variants: [{ sizes: [{ price: 299.99 }] }],
            price: 299.99,
            isFeatured: true // Featured product - will show NEW badge
          },
          {
            _id: '6',
            name: 'Wireless Headphones',
            brand: 'TechGear',
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop',
            variants: [{ sizes: [{ price: 149.99 }] }],
            price: 149.99,
            isFeatured: false // Not featured - no NEW badge
          },
          {
            _id: '7',
            name: 'Sports Running Shoes',
            brand: 'ActiveWear',
            category: 'Shoes',
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
            variants: [{ sizes: [{ price: 89.99 }] }],
            price: 89.99,
            isFeatured: true // Featured product - will show NEW badge
          },
          {
            _id: '8',
            name: 'Designer Watch',
            brand: 'LuxuryBrand',
            category: 'Accessories',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop',
            variants: [{ sizes: [{ price: 349.99 }] }],
            price: 349.99,
            isFeatured: false // Not featured - no NEW badge
          },
        ];
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
        
        // NEW: Extract categories from mock data
        const extractedCategories = extractCategoriesFromProducts(mockProducts);
        setCategories(extractedCategories);
        setHasCachedData(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Enhanced animations on mount
  useEffect(() => {
    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(searchOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(searchTranslateY, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(searchScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        })
      ]),
      Animated.timing(categoriesOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // NEW: Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    const filtered = filterProductsByCategory(category);
    setFilteredProducts(filtered);
    console.log(`Category selected: ${category}, Products: ${filtered.length}`);
  };

  // Auto-rotate middle banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMiddleBannerIndex(prev => 
        prev === middleBanners.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Search functionality - FIXED LOGIC
  const performSearch = (text) => {
    if (text.trim() === '') {
      // When search is cleared, show products for selected category
      const filtered = filterProductsByCategory(selectedCategory);
      setFilteredProducts(filtered);
      setSearchResults([]);
      setIsSearchActive(false);
      // Animate content back in
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(contentTranslateY, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      const filtered = products.filter(product =>
        product.name?.toLowerCase().includes(text.toLowerCase()) ||
        product.brand?.toLowerCase().includes(text.toLowerCase()) ||
        product.category?.toLowerCase().includes(text.toLowerCase())
      );
      
      console.log('Search results:', filtered.length);
      
      setSearchResults(filtered);
      
      // CRITICAL FIX: Always set isSearchActive to true when there's search text
      setIsSearchActive(true);
      
      if (filtered.length > 0) {
        // Show search results immediately without animating other content out
        setFilteredProducts(filtered);
      } else {
        // Keep showing regular products but indicate no search results
        setFilteredProducts([]);
      }
    }
    setSearchLoading(false);
  };

  const debouncedSearch = useCallback(
    debounce((text) => {
      performSearch(text);
    }, 300),
    [products, selectedCategory]
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
      // When search is cleared, show products for selected category
      const filtered = filterProductsByCategory(selectedCategory);
      setFilteredProducts(filtered);
      // Reset animations when search is cleared
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(contentTranslateY, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    }
    debouncedSearch(searchText);
  }, [searchText, debouncedSearch]);

  // NEW: Handle search submission (when user presses enter/search on keyboard)
  const handleSearchSubmit = () => {
    console.log('Search submitted:', searchText);
    // Hide suggestions when user submits search
    setShowSearchSuggestions(false);
    // Perform the search immediately
    performSearch(searchText);
    // Dismiss keyboard
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
      
      // FIXED: Use getImageUrl to ensure consistent image URLs
      const wishlistItem = {
        id: product._id,
        title: product.name,
        brand: product.brand,
        image: getImageUrl(product.image), // FIXED: Use the same URL function
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
      
      // Update local state immediately for better UX
      setWishlist(currentWishlist);
      
      console.log('Wishlist updated:', currentWishlist.length, 'items');
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

  const handleSuggestionPress = (suggestion) => {
    setSearchText(suggestion);
    searchInputRef.current?.focus();
    // Hide suggestions and perform search immediately when suggestion is pressed
    setShowSearchSuggestions(false);
    performSearch(suggestion);
  };

  const handleSearchFocus = () => {
    if (searchText.length > 0) {
      setShowSearchSuggestions(true);
    }
  };

  const handleSearchBlur = () => {
    // Don't hide suggestions immediately on blur to allow clicking on suggestions
    // The timeout gives time for the suggestion press to register
    setTimeout(() => {
      setShowSearchSuggestions(false);
    }, 200);
  };

  const clearSearch = () => {
    setSearchText('');
    setShowSearchSuggestions(false);
    setIsSearchActive(false);
    setSearchResults([]);
    // When search is cleared, show products for selected category
    const filtered = filterProductsByCategory(selectedCategory);
    setFilteredProducts(filtered);
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

  // UPDATED: Trending Product Card without Add to Cart button
  const renderTrendingProduct = ({ item, index }) => {
    return (
      <TrendingProductCard 
        item={item}
        index={index}
      />
    );
  };

  const renderBrandCard = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.brandCard,
        {
          opacity: categoriesOpacity,
          transform: [{
            translateX: categoriesOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })
          }]
        }
      ]}
    >
      <TouchableOpacity style={styles.brandCardInner} activeOpacity={0.8}>
        <View style={styles.brandImageContainer}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.brandImage} 
            resizeMode="cover"
          />
          <View style={styles.brandDiscount}>
            <Text style={styles.brandDiscountText}>{item.discount}</Text>
          </View>
        </View>
        <Text style={styles.brandName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.brandProducts}>{item.products} products</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* FIXED: White status bar */}
        <StatusBar 
          backgroundColor={COLORS.white} 
          barStyle="dark-content" 
          translucent={false}
        />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading store...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* FIXED: White status bar */}
      <StatusBar 
        backgroundColor={COLORS.white} 
        barStyle="dark-content" 
        translucent={false}
      />
      
      {/* IMPROVED Internet Status Bar using NetInfo */}
      <InternetStatusBar 
        isOnline={isOnline} 
        onRetry={checkConnection}
      />

      {/* UPDATED Sticky Header - Bigger Cart Icon with Internet Status */}
      <StickyHeader 
        user={{ name: 'Store' }}
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
              <Ionicons name="cloud-offline-outline" size={responsiveFont(16)} color={COLORS.warning} />
              <Text style={styles.offlineIndicatorText}>
                You're offline • Showing cached products
              </Text>
            </View>
          )}

          {/* Main Header */}
          <View style={styles.header}>
            <View style={styles.profileContainer}>
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcome}>Welcome to</Text>
                <Text style={styles.username}>Our Store! 🛍️</Text>
              </View>
            </View>
            <View style={styles.headerIcons}>
              {/* Big Cart Icon in Main Header */}
              <TouchableOpacity
                style={styles.bigHeaderCartButton}
                onPress={() => router.push('../CartScreen')}
              >
                <View style={styles.bigHeaderCartContainer}>
                  <Ionicons name="cart" size={responsiveFont(28)} color={COLORS.dark} />
                  {cartItems.length > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{cartItems.length}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Enhanced Search Bar with Suggestions */}
          <View style={styles.searchWrapper}>
            <Animated.View style={[
              styles.searchContainer,
              {
                opacity: searchOpacity,
                transform: [
                  { translateY: searchTranslateY },
                  { scale: searchScale }
                ]
              }
            ]}>
              <View style={styles.searchInnerContainer}>
                <View style={styles.searchIconContainer}>
                  <Ionicons name="search" size={responsiveFont(20)} color={COLORS.primary} />
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
                  onSubmitEditing={handleSearchSubmit} // NEW: Handle enter key press
                />
                
                {searchText ? (
                  <TouchableOpacity 
                    style={styles.searchClearButton}
                    onPress={clearSearch}
                  >
                    <Ionicons name="close-circle" size={responsiveFont(18)} color={COLORS.gray} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </Animated.View>

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

          {/* NEW: Dynamic Category Filter Buttons */}
          <CategoryFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />

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
                      initialNumToRender={12}
                      maxToRenderPerBatch={12}
                      windowSize={10}
                    />
                  </>
                ) : (
                  <View style={styles.noSearchResults}>
                    <Ionicons name="search-outline" size={responsiveFont(80)} color={COLORS.grayLight} />
                    <Text style={styles.noSearchResultsText}>No products found</Text>
                    <Text style={styles.noSearchResultsSubtext}>
                      We couldn't find any products matching "{searchText}"
                    </Text>
                    <Text style={styles.noSearchResultsTip}>
                      Try searching with different keywords or check out our popular categories
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
              /* Show regular content when not searching */
              <Animated.View 
                style={{
                  opacity: contentOpacity,
                  transform: [{ translateY: contentTranslateY }]
                }}
              >
                {/* Featured Brands Section */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Featured Brands</Text>
                    <TouchableOpacity style={styles.seeAllButton}>
                      <Text style={styles.seeAll}>See All</Text>
                      <Ionicons name="chevron-forward" size={responsiveFont(16)} color={COLORS.primary} />
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

                {/* First Set of Product Cards */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                      {selectedCategory === 'All Items' ? 'Popular Products' : selectedCategory}
                    </Text>
                    <Text style={styles.seeAll}>{Math.min(filteredProducts.length, 4)} items</Text>
                  </View>
                  
                  {!searchLoading && filteredProducts.length > 0 ? (
                    <FlatList
                      data={filteredProducts.slice(0, 4)}
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
                    <View style={styles.emptyState}>
                      <Ionicons name="grid-outline" size={responsiveFont(50)} color={COLORS.grayLight} />
                      <Text style={styles.emptyStateText}>No products found</Text>
                      <Text style={styles.emptyStateSubtext}>
                        {`No products available in ${selectedCategory} category`}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Summer Collection Banner - In the middle */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Summer Collection</Text>
                    <TouchableOpacity style={styles.seeAllButton}>
                      <Text style={styles.seeAll}>View All</Text>
                      <Ionicons name="chevron-forward" size={responsiveFont(16)} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.bannerContainer}>
                    <FlatList
                      ref={bannerRef}
                      data={storeBanners}
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
                      {storeBanners.map((_, index) => (
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
                </View>

                {/* Second Set of Product Cards */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Latest Arrivals</Text>
                    <Text style={styles.seeAll}>{Math.min(filteredProducts.length - 4, 4)} items</Text>
                  </View>
                  
                  {!searchLoading && filteredProducts.length > 4 ? (
                    <FlatList
                      data={filteredProducts.slice(4, 8)}
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
                  ) : null}
                </View>

                {/* Trending Now Section */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
                    <TouchableOpacity style={styles.seeAllButton}>
                      <Text style={styles.seeAll}>View All</Text>
                      <Ionicons name="chevron-forward" size={responsiveFont(16)} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={trendingProducts}
                    renderItem={renderTrendingProduct}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.trendingList}
                  />
                </View>

                {/* Third Set of Product Cards */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Best Sellers</Text>
                    <Text style={styles.seeAll}>{Math.min(filteredProducts.length - 8, 4)} items</Text>
                  </View>
                  
                  {!searchLoading && filteredProducts.length > 8 ? (
                    <FlatList
                      data={filteredProducts.slice(8, 12)}
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
                  ) : null}
                </View>

                {/* New User Offer Banner */}
                <View style={styles.middleBannerContainer}>
                  <MiddleBanner item={middleBanners[2]} />
                  <View style={styles.middleBannerPagination}>
                    {middleBanners.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.middlePaginationDot,
                          {
                            backgroundColor: index === 2 ? COLORS.primary : COLORS.grayLight,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>

                {/* Final Set of Product Cards */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>More to Explore</Text>
                    <Text style={styles.seeAll}>{Math.max(filteredProducts.length - 12, 0)} items</Text>
                  </View>
                  
                  {!searchLoading && filteredProducts.length > 12 ? (
                    <FlatList
                      data={filteredProducts.slice(12)}
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
                    !searchLoading && filteredProducts.length <= 12 && searchResults.length === 0 && (
                      <View style={styles.emptyState}>
                        <Ionicons name="heart-outline" size={responsiveFont(50)} color={COLORS.grayLight} />
                        <Text style={styles.emptyStateText}>You've reached the end!</Text>
                        <Text style={styles.emptyStateSubtext}>
                          Thanks for browsing our store
                        </Text>
                      </View>
                    )
                  )}
                </View>
              </Animated.View>
            )}
          </View>
        </View>
      </Animated.ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

// IMPROVED Styles for Android with better responsiveness and premium design
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
    paddingBottom: responsiveHeight(2),
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: responsiveHeight(2),
    fontSize: responsiveFont(16),
    color: COLORS.gray,
  },
  // IMPROVED Internet Status Bar Styles for Android
  internetStatusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.error,
    paddingVertical: responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(4),
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
    fontSize: responsiveFont(15),
    fontWeight: '600',
    marginLeft: responsiveWidth(2),
    marginRight: responsiveWidth(3),
  },
  retryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.white,
    fontSize: responsiveFont(13),
    fontWeight: '600',
  },
  // Offline Styles
  offlineContent: {
    paddingTop: responsiveHeight(6), // Extra padding to account for status bar
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.5),
    marginHorizontal: responsiveWidth(5),
    marginTop: responsiveHeight(1),
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  offlineIndicatorText: {
    color: COLORS.warning,
    fontSize: responsiveFont(14),
    fontWeight: '500',
    marginLeft: responsiveWidth(2),
  },
  offlineDot: {
    backgroundColor: COLORS.error,
    width: responsiveWidth(5),
    height: responsiveWidth(5),
    borderRadius: responsiveWidth(2.5),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: responsiveWidth(2),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
    paddingTop: Platform.OS === 'android' ? STATUS_BAR_HEIGHT + responsiveHeight(1) : responsiveHeight(8),
    paddingBottom: responsiveHeight(2),
    backgroundColor: COLORS.background,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeContainer: {
    marginLeft: responsiveWidth(3),
  },
  welcome: {
    fontSize: responsiveFont(14),
    color: COLORS.gray,
  },
  username: {
    fontSize: responsiveFont(20),
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bigHeaderCartButton: {
    padding: responsiveWidth(2),
    marginLeft: responsiveWidth(2),
  },
  bigHeaderCartContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -responsiveWidth(0.5),
    right: -responsiveWidth(0.5),
    backgroundColor: COLORS.error,
    borderRadius: responsiveWidth(3),
    minWidth: responsiveWidth(5),
    height: responsiveWidth(5),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
    elevation: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: responsiveFont(11),
    fontWeight: 'bold',
  },
  searchWrapper: {
    position: 'relative',
    zIndex: 1000,
  },
  searchContainer: {
    paddingHorizontal: responsiveWidth(5),
    marginBottom: responsiveHeight(1),
  },
  searchInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(4),
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.5),
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
    marginRight: responsiveWidth(3),
  },
  searchInput: {
    flex: 1,
    fontSize: responsiveFont(16),
    color: COLORS.dark,
    padding: 0,
    includeFontPadding: false, // Better text alignment on Android
  },
  searchClearButton: {
    padding: responsiveWidth(1),
  },
  searchSuggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: responsiveWidth(5),
    right: responsiveWidth(5),
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(4),
    marginTop: responsiveHeight(1),
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1001,
    maxHeight: responsiveHeight(40),
  },
  searchSuggestionsContent: {
    padding: responsiveWidth(4),
  },
  resultsCountContainer: {
    paddingVertical: responsiveHeight(1),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
    marginBottom: responsiveHeight(1.5),
  },
  resultsCountText: {
    fontSize: responsiveFont(14),
    color: COLORS.gray,
    fontWeight: '500',
  },
  suggestionSection: {
    marginBottom: responsiveHeight(2),
  },
  suggestionSectionTitle: {
    fontSize: responsiveFont(14),
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: responsiveHeight(1),
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: responsiveHeight(1.2),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  suggestionText: {
    fontSize: responsiveFont(15),
    color: COLORS.dark,
    marginLeft: responsiveWidth(3),
    flex: 1,
  },
  popularSearchesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: responsiveWidth(2),
  },
  popularSearchChip: {
    backgroundColor: COLORS.light,
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(1),
    borderRadius: responsiveWidth(5),
  },
  popularSearchText: {
    fontSize: responsiveFont(13),
    color: COLORS.dark,
    fontWeight: '500',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: responsiveHeight(4),
  },
  noResultsText: {
    fontSize: responsiveFont(18),
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: responsiveHeight(1.5),
    marginBottom: responsiveHeight(1),
  },
  noResultsSubtext: {
    fontSize: responsiveFont(14),
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: responsiveHeight(0.5),
  },
  noResultsTip: {
    fontSize: responsiveFont(12),
    color: COLORS.grayLight,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
  },
  searchResultsSection: {
    paddingHorizontal: responsiveWidth(5),
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: responsiveHeight(5),
  },
  noSearchResults: {
    alignItems: 'center',
    paddingVertical: responsiveHeight(8),
    paddingHorizontal: responsiveWidth(5),
  },
  noSearchResultsText: {
    fontSize: responsiveFont(20),
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(1),
  },
  noSearchResultsSubtext: {
    fontSize: responsiveFont(15),
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: responsiveHeight(1),
  },
  noSearchResultsTip: {
    fontSize: responsiveFont(13),
    color: COLORS.grayLight,
    textAlign: 'center',
    marginBottom: responsiveHeight(3),
  },
  tryAgainButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: responsiveWidth(6),
    paddingVertical: responsiveHeight(1.5),
    borderRadius: responsiveWidth(3),
  },
  tryAgainText: {
    color: COLORS.white,
    fontSize: responsiveFont(15),
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: responsiveWidth(5),
    marginBottom: responsiveHeight(3),
  },
  categoriesScroll: {
    paddingRight: responsiveWidth(5),
  },
  categoryButton: {
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1.2),
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(3),
    marginRight: responsiveWidth(3),
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: responsiveFont(14),
    fontWeight: '500',
    color: COLORS.gray,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  section: {
    marginBottom: responsiveHeight(4),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
    marginBottom: responsiveHeight(2),
  },
  sectionTitle: {
    fontSize: responsiveFont(20),
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAll: {
    fontSize: responsiveFont(14),
    color: COLORS.primary,
    fontWeight: '500',
  },
  brandList: {
    paddingHorizontal: responsiveWidth(5),
    gap: responsiveWidth(4),
  },
  brandCard: {
    width: responsiveWidth(35),
    marginRight: responsiveWidth(4),
  },
  brandCardInner: {
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(4),
    padding: responsiveWidth(3),
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  brandImageContainer: {
    position: 'relative',
    width: '100%',
    height: responsiveHeight(12),
    borderRadius: responsiveWidth(3),
    overflow: 'hidden',
    marginBottom: responsiveHeight(1.5),
  },
  brandImage: {
    width: '100%',
    height: '100%',
  },
  brandDiscount: {
    position: 'absolute',
    top: responsiveHeight(1),
    right: responsiveWidth(2),
    backgroundColor: COLORS.secondary,
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: responsiveWidth(2),
  },
  brandDiscountText: {
    color: COLORS.white,
    fontSize: responsiveFont(10),
    fontWeight: 'bold',
  },
  brandName: {
    fontSize: responsiveFont(16),
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: responsiveHeight(0.5),
  },
  brandProducts: {
    fontSize: responsiveFont(12),
    color: COLORS.gray,
  },
  list: {
    paddingHorizontal: responsiveWidth(5),
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: responsiveHeight(2),
  },
  // UPDATED Product Card Styles - Heart icon moved to top and NEW badge updated
  cardContainer: {
    width: '48%',
    marginBottom: responsiveHeight(2),
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: responsiveWidth(5),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.08)',
    elevation: 6,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: responsiveHeight(20),
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
  // UPDATED: Heart container moved to top right
  heartContainer: {
    position: 'absolute',
    top: responsiveHeight(1.5),
    right: responsiveWidth(3),
  },
  heartIcon: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: responsiveWidth(5),
    padding: responsiveWidth(2),
    elevation: 3,
  },
  heartIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  // UPDATED: NEW badge with brand-like design - Only shown if isFeatured is true
  newBadge: {
    position: 'absolute',
    top: responsiveHeight(1.5),
    left: responsiveWidth(3),
    backgroundColor: COLORS.primary,
    paddingHorizontal: responsiveWidth(2.5),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: responsiveWidth(12.5),
    alignSelf: 'flex-start',
  },
  newBadgeText: {
    fontSize: responsiveFont(11),
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: responsiveWidth(4),
    backgroundColor: COLORS.cardBackground,
  },
  title: {
    fontSize: responsiveFont(15),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: responsiveHeight(0.7),
    height: responsiveHeight(2.5),
    lineHeight: responsiveHeight(2.5),
  },
  brandContainer: {
    marginBottom: responsiveHeight(1),
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    alignSelf: 'flex-start',
    paddingHorizontal: responsiveWidth(2.5),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: responsiveWidth(2.5),
  },
  brandText: {
    fontSize: responsiveFont(11),
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: responsiveHeight(1.5),
  },
  stars: {
    flexDirection: 'row',
    gap: responsiveWidth(0.5),
  },
  ratingText: {
    fontSize: responsiveFont(11),
    color: COLORS.gray,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: responsiveFont(17),
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
    width: responsiveWidth(9),
    height: responsiveWidth(9),
    borderRadius: responsiveWidth(4.5),
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
    top: -responsiveHeight(1),
    right: -responsiveWidth(2),
    backgroundColor: COLORS.error,
    borderRadius: responsiveWidth(2.5),
    minWidth: responsiveWidth(5),
    height: responsiveWidth(5),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    zIndex: 1,
    elevation: 4,
  },
  quantityText: {
    color: COLORS.white,
    fontSize: responsiveFont(10),
    fontWeight: '800',
  },
  cartIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    height: responsiveHeight(22),
    marginHorizontal: responsiveWidth(5),
    borderRadius: responsiveWidth(4),
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
  },
  bannerItem: {
    width: width - responsiveWidth(10),
    height: responsiveHeight(22),
    borderRadius: responsiveWidth(4),
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
    bottom: responsiveHeight(2.5),
    left: responsiveWidth(5),
    right: responsiveWidth(5),
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(0.7),
    borderRadius: responsiveWidth(2),
    marginBottom: responsiveHeight(1.5),
  },
  bannerBadgeText: {
    color: COLORS.white,
    fontSize: responsiveFont(12),
    fontWeight: 'bold',
  },
  bannerTitle: {
    fontSize: responsiveFont(24),
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: responsiveHeight(1),
  },
  bannerSubtitle: {
    fontSize: responsiveFont(16),
    color: COLORS.white,
    marginBottom: responsiveHeight(2),
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1.5),
    borderRadius: responsiveWidth(3),
  },
  bannerButtonText: {
    color: COLORS.primary,
    fontSize: responsiveFont(14),
    fontWeight: '600',
  },
  bannerPagination: {
    position: 'absolute',
    bottom: responsiveHeight(2),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: responsiveWidth(2),
    height: responsiveWidth(2),
    borderRadius: responsiveWidth(1),
    marginHorizontal: responsiveWidth(1),
  },
  trendingList: {
    paddingHorizontal: responsiveWidth(5),
    gap: responsiveWidth(4),
  },
  trendingCard: {
    width: responsiveWidth(70),
    marginRight: responsiveWidth(4),
  },
  trendingCardInner: {
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(4),
    overflow: 'hidden',
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  trendingImage: {
    width: '100%',
    height: responsiveHeight(18),
  },
  trendingBadge: {
    position: 'absolute',
    top: responsiveHeight(1.5),
    left: responsiveWidth(3),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: responsiveWidth(1.5),
    gap: responsiveWidth(1),
  },
  trendingBadgeText: {
    color: COLORS.white,
    fontSize: responsiveFont(10),
    fontWeight: 'bold',
  },
  trendingContent: {
    padding: responsiveWidth(4),
  },
  trendingBrand: {
    fontSize: responsiveFont(12),
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: responsiveHeight(0.5),
  },
  trendingName: {
    fontSize: responsiveFont(16),
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: responsiveHeight(1.5),
    lineHeight: responsiveHeight(2.5),
  },
  trendingPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingPrice: {
    fontSize: responsiveFont(18),
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  middleBannerContainer: {
    paddingHorizontal: responsiveWidth(5),
    marginBottom: responsiveHeight(4),
  },
  middleBanner: {
    borderRadius: responsiveWidth(4),
    overflow: 'hidden',
    position: 'relative',
    minHeight: responsiveHeight(11),
    elevation: 4,
  },
  middleBannerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  middleBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveWidth(5),
  },
  middleBannerIcon: {
    marginRight: responsiveWidth(4),
  },
  middleBannerText: {
    flex: 1,
  },
  middleBannerTitle: {
    fontSize: responsiveFont(18),
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: responsiveHeight(0.5),
  },
  middleBannerSubtitle: {
    fontSize: responsiveFont(14),
    color: COLORS.white,
    opacity: 0.9,
  },
  middleBannerCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(1),
    borderRadius: responsiveWidth(2),
    gap: responsiveWidth(1.5),
  },
  middleBannerCodeText: {
    color: COLORS.white,
    fontSize: responsiveFont(14),
    fontWeight: '600',
  },
  middleBannerPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsiveHeight(1.5),
    gap: responsiveWidth(1.5),
  },
  middlePaginationDot: {
    width: responsiveWidth(1.5),
    height: responsiveWidth(1.5),
    borderRadius: responsiveWidth(0.75),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: responsiveHeight(8),
    paddingHorizontal: responsiveWidth(5),
  },
  emptyStateText: {
    fontSize: responsiveFont(18),
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(1),
  },
  emptyStateSubtext: {
    fontSize: responsiveFont(14),
    color: COLORS.gray,
    textAlign: 'center',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: responsiveHeight(10),
    backgroundColor: COLORS.white, // Changed to white
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
    zIndex: 1000,
    paddingTop: Platform.OS === 'android' ? STATUS_BAR_HEIGHT : responsiveHeight(5),
    elevation: 4,
  },
  stickyHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
    flex: 1,
  },
  stickyProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stickyProfileInitials: {
    width: responsiveWidth(9),
    height: responsiveWidth(9),
    borderRadius: responsiveWidth(4.5),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveWidth(3),
    elevation: 4,
  },
  stickyProfileInitialsText: {
    color: COLORS.white,
    fontSize: responsiveFont(16),
    fontWeight: 'bold',
  },
  stickyUsername: {
    fontSize: responsiveFont(18),
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  stickyIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stickyCartButton: {
    padding: responsiveWidth(2),
  },
  bigCartIconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyBadge: {
    position: 'absolute',
    top: -responsiveHeight(0.5),
    right: -responsiveWidth(1),
    backgroundColor: COLORS.error,
    borderRadius: responsiveWidth(3),
    minWidth: responsiveWidth(5),
    height: responsiveWidth(5),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white, // Changed to white
    elevation: 4,
  },
  stickyBadgeText: {
    color: COLORS.white,
    fontSize: responsiveFont(11),
    fontWeight: 'bold',
  },
});

export default StoreScreen;