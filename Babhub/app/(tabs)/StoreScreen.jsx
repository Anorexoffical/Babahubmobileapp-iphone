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
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import debounce from 'lodash.debounce';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

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
    image: 'https://images.unsplash.com/photo-1558769132-cb25c5d1f9cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80',
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
    image: 'https://images.unsplash.com/photo-1590658165737-15a047b8b5e3?w=400&h=300&fit=crop',
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

// Function to correctly get full image URL for product images
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `https://account.babahub.co${normalizedPath}`;
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
            size={32} 
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
            size={16} 
            color={COLORS.white} 
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// New Trending Product Card
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
          <Ionicons name="trending-up" size={12} color={COLORS.white} />
          <Text style={styles.trendingBadgeText}>TRENDING</Text>
        </View>
        
        <View style={styles.trendingContent}>
          <Text style={styles.trendingBrand}>{item.brand}</Text>
          <Text style={styles.trendingName} numberOfLines={2}>{item.name}</Text>
          
          <View style={styles.trendingPriceContainer}>
            <Text style={styles.trendingPrice}>${item.price.toFixed(2)}</Text>
            <TouchableOpacity style={styles.trendingCartButton}>
              <Ionicons name="cart" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// UPDATED Product Item Component - Heart icon moved to top and NEW badge updated
const ProductItem = ({ item, onPress, onWishlistToggle, isInWishlist, index }) => {
  const price = item.variants?.[0]?.sizes?.[0]?.price || item.price || 0;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
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
                  size={20}
                  color={isInWishlist ? COLORS.error : COLORS.white}
                />
              </TouchableOpacity>
            </View>

            {/* UPDATED: NEW badge with brand-like design */}
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
              <Text style={styles.price}>${price.toFixed(2)}</Text>
              <TouchableOpacity
                style={styles.cartButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onPress(item);
                }}
              >
                <View style={styles.cartIconContainer}>
                  <Ionicons name="bag-handle-outline" size={16} color={COLORS.white} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

// UPDATED Sticky Header Component - Bigger Cart Icon
const StickyHeader = ({ user, cartItems, router, scrollY }) => {
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
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </Text>
          </View>
          <Text style={styles.stickyUsername}>Store</Text>
        </View>
        
        <View style={styles.stickyIcons}>
          {/* Big Cart Icon */}
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
  const [cartItems, setCartItems] = useState(0);
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

  // API base URL
  const API_BASE_URL = 'https://account.babahub.co';

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

  // Fetch wishlist and cart count from AsyncStorage
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
        setCartItems(cartItems.length);
        console.log('Cart updated:', cartItems.length, 'items');
      } else {
        setCartItems(0);
      }
    } catch (error) {
      console.error('Error fetching wishlist or cart:', error);
    }
  };

  // Use focus effect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('StoreScreen focused - refreshing wishlist and cart');
      fetchWishlistAndCart();
    }, [])
  );

  // Initial data fetch
  useEffect(() => {
    fetchWishlistAndCart();
    fetchProducts();
  }, []);

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

  // Fetch products from backend API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/products`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setProducts(data);
      setFilteredProducts(data);
      
      // NEW: Extract categories from products and update state
      const extractedCategories = extractCategoriesFromProducts(data);
      setCategories(extractedCategories);
      console.log('Categories extracted:', extractedCategories);
      
    } catch (err) {
      console.error('Error fetching products:', err);
      
      // Fallback to mock data with categories
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
          name: 'Classic Denim Jacket',
          brand: 'UrbanStyle',
          category: 'Clothing',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
          variants: [{ sizes: [{ price: 59.99 }] }],
          price: 59.99
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
          name: 'Wireless Headphones',
          brand: 'TechGear',
          category: 'Electronics',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop',
          variants: [{ sizes: [{ price: 149.99 }] }],
          price: 149.99
        },
        {
          _id: '7',
          name: 'Sports Running Shoes',
          brand: 'ActiveWear',
          category: 'Shoes',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
          variants: [{ sizes: [{ price: 89.99 }] }],
          price: 89.99
        },
        {
          _id: '8',
          name: 'Designer Watch',
          brand: 'LuxuryBrand',
          category: 'Accessories',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop',
          variants: [{ sizes: [{ price: 349.99 }] }],
          price: 349.99
        },
      ];
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      
      // NEW: Extract categories from mock data
      const extractedCategories = extractCategoriesFromProducts(mockProducts);
      setCategories(extractedCategories);
      console.log('Categories from mock data:', extractedCategories);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
    fetchWishlistAndCart(); // Also refresh wishlist and cart on pull-to-refresh
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
      } else {
        currentWishlist.push(wishlistItem);
      }
      
      await AsyncStorage.setItem('wishlist', JSON.stringify(currentWishlist));
      
      // Update local state immediately for better UX
      setWishlist(currentWishlist);
      
      console.log('Wishlist updated:', currentWishlist.length, 'items');
    } catch (error) {
      console.error('Wishlist update failed', error);
      Alert.alert('Error', 'Failed to update wishlist');
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
    
    return (
      <ProductItem 
        item={item}
        onPress={handleProductPress}
        onWishlistToggle={toggleWishlist}
        isInWishlist={productInWishlist}
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
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading store...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.scrollContainer}>
      {/* UPDATED Sticky Header - Bigger Cart Icon */}
      <StickyHeader 
        user={{ name: 'Store' }}
        cartItems={cartItems}
        router={router}
        scrollY={scrollY}
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
      >
        <View style={styles.container}>
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
                  <Ionicons name="cart" size={28} color={COLORS.dark} />
                  {cartItems > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{cartItems}</Text>
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
                  onSubmitEditing={handleSearchSubmit} // NEW: Handle enter key press
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
                    <Ionicons name="search-outline" size={80} color={COLORS.grayLight} />
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
                      <Ionicons name="grid-outline" size={50} color={COLORS.grayLight} />
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
                      <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
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
                      <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={trendingProducts}
                    renderItem={({ item, index }) => (
                      <TrendingProductCard item={item} index={index} />
                    )}
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
                        <Ionicons name="heart-outline" size={50} color={COLORS.grayLight} />
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
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  searchWrapper: {
    position: 'relative',
    zIndex: 1000,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
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
  noSearchResultsTip: {
    fontSize: 13,
    color: COLORS.grayLight,
    textAlign: 'center',
    marginBottom: 24,
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
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoriesScroll: {
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginRight: 12,
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
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray,
  },
  categoryTextActive: {
    color: COLORS.white,
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
  brandList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  brandCard: {
    width: 140,
    marginRight: 16,
  },
  brandCardInner: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
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
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  brandImage: {
    width: '100%',
    height: '100%',
  },
  brandDiscount: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  brandDiscountText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  brandName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  brandProducts: {
    fontSize: 12,
    color: COLORS.gray,
  },
  list: {
    paddingHorizontal: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  // UPDATED Product Card Styles - Heart icon moved to top and NEW badge updated
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
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
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
    top: 12,
    right: 12,
  },
  heartIcon: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  heartIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  // UPDATED: NEW badge with brand-like design
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
    fontSize: 15,
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
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  cartButton: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cartIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    height: 200,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerItem: {
    width: width - 40,
    height: 200,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
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
  trendingList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  trendingCard: {
    width: 280,
    marginRight: 16,
  },
  trendingCardInner: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
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
    height: 160,
  },
  trendingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  trendingBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  trendingContent: {
    padding: 16,
  },
  trendingBrand: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: 4,
  },
  trendingName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
    lineHeight: 20,
  },
  trendingPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  trendingCartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleBannerContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  middleBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 100,
  },
  middleBannerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  middleBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  middleBannerIcon: {
    marginRight: 16,
  },
  middleBannerText: {
    flex: 1,
  },
  middleBannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  middleBannerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  middleBannerCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  middleBannerCodeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  middleBannerPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  middlePaginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
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
    borderColor: COLORS.background,
  },
  stickyBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default StoreScreen;