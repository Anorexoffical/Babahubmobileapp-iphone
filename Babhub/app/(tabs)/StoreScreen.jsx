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

// ENHANCED Product Item Component with Premium Animations (From Homepage)
const ProductItem = ({ item, onPress, onWishlistToggle, isInWishlist, index }) => {
  const price = item.variants?.[0]?.sizes?.[0]?.price || item.price || 0;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Animation values (From Homepage)
  const scaleValue = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(50)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const imageScale = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Staggered animation for product cards
    const delay = index * 150;
    
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 800,
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

    // Glow animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 0.92,
        useNativeDriver: true,
      }),
      Animated.spring(imageScale, {
        toValue: 1.08,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(imageScale, {
        toValue: 1,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleWishlistPress = (e) => {
    e.stopPropagation();
    
    // Enhanced heart animation
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.5,
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
    
    onWishlistToggle(item);
  };
  
  const imageUrl = getImageUrl(item.image);
  
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8]
  });

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
          {/* Glow Effect */}
          <Animated.View 
            style={[
              styles.cardGlow,
              { opacity: glowOpacity }
            ]}
          />
          
          <View style={styles.imageContainer}>
            {(!imageLoaded || imageError) && (
              <View style={styles.imagePlaceholder}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )}
            {!imageError && (
              <Animated.Image
                source={{ uri: imageUrl }}
                style={[
                  styles.image, 
                  { 
                    opacity: imageLoaded ? 1 : 0,
                    transform: [{ scale: imageScale }]
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
            
            {/* New Badge with Animation */}
            <Animated.View 
              style={[
                styles.newBadge,
                {
                  transform: [{
                    scale: cardOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1]
                    })
                  }]
                }
              ]}
            >
              <Text style={styles.newBadgeText}>NEW</Text>
            </Animated.View>

            {/* Wishlist Button */}
            <Animated.View style={[styles.heartContainer, { transform: [{ scale: heartScale }] }]}>
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
            </Animated.View>
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
                <Animated.View 
                  style={[
                    styles.cartIconContainer,
                    {
                      transform: [{
                        scale: scaleValue.interpolate({
                          inputRange: [0.92, 1],
                          outputRange: [0.9, 1]
                        })
                      }]
                    }
                  ]}
                >
                  <Ionicons name="bag-handle-outline" size={16} color={COLORS.white} />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

// Sticky Header Component
const StickyHeader = ({ user, cartItems, wishlist, router, scrollY }) => {
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
          <TouchableOpacity
            style={styles.stickyIconButton}
            onPress={() => router.push('../WishlistScreen')}
          >
            <Ionicons
              name={wishlist.length > 0 ? 'heart' : 'heart-outline'}
              size={22}
              color={wishlist.length > 0 ? COLORS.error : COLORS.dark}
            />
            {wishlist.length > 0 && (
              <View style={styles.stickyBadge}>
                <Text style={styles.stickyBadgeText}>{wishlist.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.stickyIconButton}
            onPress={() => router.push('../CartScreen')}
          >
            <Ionicons name="cart-outline" size={22} color={COLORS.dark} />
            {cartItems > 0 && (
              <View style={styles.stickyBadge}>
                <Text style={styles.stickyBadgeText}>{cartItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
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

  useEffect(() => {
    // Enhanced animations on mount
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

  // API base URL
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
      
      const response = await fetch(`${API_BASE_URL}/api/products`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      
      // Fallback to mock data
      const mockProducts = [
        {
          _id: '1',
          name: 'Premium Cotton T-Shirt',
          brand: 'FashionHub',
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
          variants: [{ sizes: [{ price: 29.99 }] }],
          price: 29.99
        },
        {
          _id: '2',
          name: 'Classic Denim Jacket',
          brand: 'UrbanStyle',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
          variants: [{ sizes: [{ price: 59.99 }] }],
          price: 59.99
        },
        {
          _id: '3',
          name: 'Smart Watch Pro',
          brand: 'TechGear',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop',
          variants: [{ sizes: [{ price: 199.99 }] }],
          price: 199.99
        },
        {
          _id: '4',
          name: 'Minimalist Sneakers',
          brand: 'EcoWear',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
          variants: [{ sizes: [{ price: 79.99 }] }],
          price: 79.99
        },
        {
          _id: '5',
          name: 'Designer Handbag',
          brand: 'LuxuryBrand',
          image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop',
          variants: [{ sizes: [{ price: 299.99 }] }],
          price: 299.99
        },
        {
          _id: '6',
          name: 'Wireless Headphones',
          brand: 'TechGear',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop',
          variants: [{ sizes: [{ price: 149.99 }] }],
          price: 149.99
        },
        {
          _id: '7',
          name: 'Sports Running Shoes',
          brand: 'ActiveWear',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
          variants: [{ sizes: [{ price: 89.99 }] }],
          price: 89.99
        },
        {
          _id: '8',
          name: 'Designer Watch',
          brand: 'LuxuryBrand',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop',
          variants: [{ sizes: [{ price: 349.99 }] }],
          price: 349.99
        },
      ];
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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
      setFilteredProducts(products);
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
        product.brand?.toLowerCase().includes(text.toLowerCase())
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
  };

  const toggleWishlist = async (product) => {
    try {
      const price = product.variants?.[0]?.sizes?.[0]?.price || product.price || 0;
      
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

  const categories = ['All Items', 'Clothing', 'Electronics', 'Home', 'Sports', 'Accessories', 'Beauty', 'Books'];

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
      {/* Sticky Header */}
      <StickyHeader 
        user={{ name: 'Store' }}
        cartItems={cartItems}
        wishlist={wishlist}
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
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push('../WishlistScreen')}
              >
                <Ionicons
                  name={wishlist.length > 0 ? 'heart' : 'heart-outline'}
                  size={24}
                  color={wishlist.length > 0 ? COLORS.error : COLORS.dark}
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
                {/* Animated Categories */}
                <Animated.View style={[styles.categoriesContainer, { opacity: categoriesOpacity }]}>
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
                </Animated.View>

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
                    <Text style={styles.sectionTitle}>Popular Products</Text>
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
                  ) : null}
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
    padding: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  // Search Wrapper
  searchWrapper: {
    marginBottom: 20,
    zIndex: 100,
  },
  // Search Suggestions
  searchSuggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
    maxHeight: 400,
  },
  searchSuggestionsContent: {
    padding: 16,
  },
  resultsCountContainer: {
    backgroundColor: COLORS.primaryLight + '20',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  resultsCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
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
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.dark,
    marginLeft: 12,
  },
  popularSearchesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularSearchChip: {
    backgroundColor: COLORS.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  popularSearchText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 12,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultsTip: {
    fontSize: 12,
    color: COLORS.grayLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Main Content
  mainContent: {
    flex: 1,
  },
  searchResultsSection: {
    marginTop: 10,
  },
  noSearchResults: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginTop: 20,
  },
  noSearchResultsText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  noSearchResultsSubtext: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 8,
  },
  noSearchResultsTip: {
    fontSize: 14,
    color: COLORS.grayLight,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  // Sticky Header Styles
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: COLORS.white,
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99, 102, 241, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  stickyHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 40 : 20,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  stickyIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stickyIconButton: {
    position: 'relative',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    borderRadius: 12,
  },
  stickyBadge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  stickyBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Main Header
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
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  badge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
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
    fontWeight: '500',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  // Enhanced Search Bar
  searchContainer: {
    marginBottom: 0,
  },
  searchInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.1)',
    height: 56,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchIconContainer: {
    padding: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.dark,
    height: '100%',
  },
  searchClearButton: {
    padding: 8,
    marginRight: 8,
  },
  // Categories
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesScroll: {
    paddingBottom: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
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
    fontWeight: '600',
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  // Banner Styles
  bannerContainer: {
    height: 200,
    marginBottom: 0,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bannerItem: {
    width: width - 40,
    position: 'relative',
  },
  bannerImage: {
    width: width - 40,
    height: 200,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
  },
  bannerBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  bannerSubtitle: {
    color: COLORS.white,
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.95,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bannerButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  bannerPagination: {
    position: 'absolute',
    bottom: 16,
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
  },
  // NEW: Middle Banner Styles
  middleBannerContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  middleBanner: {
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  middleBannerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  middleBannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  middleBannerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  middleBannerText: {
    flex: 1,
  },
  middleBannerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  middleBannerSubtitle: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.9,
  },
  middleBannerCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  middleBannerCodeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  middleBannerPagination: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  middlePaginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // NEW: Trending Products Styles
  trendingList: {
    paddingVertical: 5,
  },
  trendingCard: {
    marginRight: 16,
    width: width * 0.7,
  },
  trendingCardInner: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
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
  trendingImage: {
    width: '100%',
    height: 150,
  },
  trendingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendingBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  trendingContent: {
    padding: 12,
  },
  trendingBrand: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  trendingName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
    height: 20,
  },
  trendingPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  trendingCartButton: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Sections
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
  // Brand Cards
  brandList: {
    paddingVertical: 5,
  },
  brandCard: {
    marginRight: 12,
  },
  brandCardInner: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    width: width * 0.36,
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
  brandImageContainer: {
    width: 70,
    height: 70,
    backgroundColor: COLORS.light,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  brandImage: {
    width: '100%',
    height: '100%',
  },
  brandDiscount: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
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
    textAlign: 'center',
    maxWidth: '100%',
  },
  brandProducts: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
  // ENHANCED Product Cards (From Homepage)
  cardContainer: {
    width: '48%',
    marginBottom: 16,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
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
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    zIndex: -1,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
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
  newBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
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
  },
  heartIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    marginBottom: 4,
  },
  brandText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 6,
  },
  ratingText: {
    fontSize: 11,
    color: COLORS.gray,
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
    marginBottom: 16,
  },
  tryAgainButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  tryAgainText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginTop: 10,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
  },
});

export default StoreScreen;