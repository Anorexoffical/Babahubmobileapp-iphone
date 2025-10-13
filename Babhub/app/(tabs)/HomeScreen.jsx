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
  Animated,
  Easing,
  RefreshControl,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');

// Premium color palette
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

// Function to correctly get full image URL for product images
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `https://account.babahub.co${normalizedPath}`;
};

const banners = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    title: 'New Collection',
    subtitle: 'Fresh styles just arrived',
    type: 'gradient',
    gradient: ['#6366F1', '#8B5CF6']
  },
  {
    id: '2', 
    image: 'https://images.unsplash.com/photo-1558769132-cb25c5d1f9cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80',
    title: 'Trending Now',
    subtitle: 'Shop the latest trends',
    type: 'video',
    videoThumbnail: 'https://images.unsplash.com/photo-1558769132-cb25c5d1f9cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    title: 'Exclusive Deals',
    subtitle: 'Limited time offers',
    type: '3d',
    effect: 'parallax'
  },
];

// Middle banner data
const middleBanner = {
  id: 'middle',
  image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  title: 'Summer Sale',
  subtitle: 'Up to 50% off on selected items',
  buttonText: 'Shop Now',
  type: 'animated'
};

// Voice Search Component
const VoiceSearchModal = ({ visible, onClose, onResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      startPulseAnimation();
      simulateVoiceInput();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const simulateVoiceInput = async () => {
    try {
      // Simulate voice recognition
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTranscript('Show me running shoes');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      onResult('running shoes');
      onClose();
    } catch (error) {
      console.error('Voice recognition error:', error);
    }
  };

  const startListening = () => {
    setIsListening(true);
    setTranscript('');
  };

  const stopListening = () => {
    setIsListening(false);
    Speech.stop();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.voiceModalOverlay}>
        <View style={styles.voiceModalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.dark} />
          </TouchableOpacity>

          <Animated.View 
            style={[
              styles.voiceCircle,
              {
                transform: [{ scale: pulseAnim }],
                backgroundColor: isListening ? COLORS.primary : COLORS.grayLight
              }
            ]}
          >
            <Ionicons 
              name="mic" 
              size={40} 
              color={COLORS.white} 
            />
          </Animated.View>

          <Text style={styles.voiceTitle}>
            {isListening ? 'Listening...' : 'Tap to Start Voice Search'}
          </Text>

          {transcript ? (
            <Text style={styles.transcriptText}>"{transcript}"</Text>
          ) : (
            <Text style={styles.voiceSubtitle}>
              Speak clearly to search for products
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.voiceActionButton,
              isListening && styles.voiceActionButtonActive
            ]}
            onPress={isListening ? stopListening : startListening}
          >
            <Text style={styles.voiceActionText}>
              {isListening ? 'Stop Listening' : 'Start Voice Search'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Enhanced Banner Item with advanced animations
const BannerItem = ({ item, router, index, currentIndex }) => {
  const translateX = useRef(new Animated.Value(width)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const parallaxAnim = useRef(new Animated.Value(0)).current;

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

  const handleParallax = (event) => {
    const { x } = event.nativeEvent.contentOffset;
    parallaxAnim.setValue(x * 0.3);
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
      <Animated.Image 
        source={{ uri: item.image }} 
        style={[
          styles.bannerImage,
          {
            transform: [{
              translateX: parallaxAnim.interpolate({
                inputRange: [-width, width],
                outputRange: [-30, 30]
              })
            }]
          }
        ]} 
      />
      
      {item.type === 'gradient' && (
        <Animated.View 
          style={[
            styles.bannerGradient,
            {
              opacity: opacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.6]
              })
            }
          ]}
        />
      )}
      
      <View style={styles.bannerContent}>
        <Animated.Text 
          style={[
            styles.bannerTitle,
            {
              transform: [{
                translateY: opacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }],
              opacity: opacity.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 0.5, 1]
              })
            }
          ]}
        >
          {item.title}
        </Animated.Text>
        
        <Animated.Text 
          style={[
            styles.bannerSubtitle,
            {
              transform: [{
                translateY: opacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0]
                })
              }],
              opacity: opacity.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [0, 0.3, 1]
              })
            }
          ]}
        >
          {item.subtitle}
        </Animated.Text>
        
        <Animated.View
          style={{
            transform: [{
              translateY: opacity.interpolate({
                inputRange: [0, 1],
                outputRange: [40, 0]
              })
            }],
            opacity: opacity.interpolate({
              inputRange: [0, 0.8, 1],
              outputRange: [0, 0.2, 1]
            })
          }}
        >
          <TouchableOpacity
            style={styles.bannerButton}
            onPress={() => router.push('StoreScreen')}
          >
            <Text style={styles.bannerButtonText}>Discover</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Banner Type Indicator */}
      <View style={styles.bannerTypeIndicator}>
        <View style={[
          styles.typeBadge,
          { backgroundColor: 
            item.type === 'gradient' ? COLORS.primary :
            item.type === 'video' ? COLORS.secondary :
            COLORS.accent
          }
        ]}>
          <Text style={styles.typeBadgeText}>
            {item.type === 'gradient' ? 'NEW' : 
             item.type === 'video' ? 'VIDEO' : '3D'}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

// Animated Middle Banner Component
const MiddleBanner = ({ banner, router }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const translateYValue = useRef(new Animated.Value(50)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(translateYValue, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      )
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

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View 
      style={[
        styles.middleBannerContainer,
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
        onPress={() => router.push('StoreScreen')}
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Image source={{ uri: banner.image }} style={styles.middleBannerImage} />
        
        {/* Animated Floating Elements */}
        <Animated.View 
          style={[
            styles.floatingElement1,
            { transform: [{ rotate }] }
          ]}
        >
          <Ionicons name="sparkles" size={20} color={COLORS.white} />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.floatingElement2,
            { transform: [{ rotate: rotateValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '-360deg']
            }) }] }
          ]}
        >
          <Ionicons name="flash" size={16} color={COLORS.white} />
        </Animated.View>

        <View style={styles.middleBannerOverlay} />
        <View style={styles.middleBannerContent}>
          <Text style={styles.middleBannerTitle}>{banner.title}</Text>
          <Text style={styles.middleBannerSubtitle}>{banner.subtitle}</Text>
          <TouchableOpacity style={styles.middleBannerButton}>
            <Text style={styles.middleBannerButtonText}>{banner.buttonText}</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Enhanced Product Item Component
const ProductItem = ({ item, onPress, onWishlistToggle, isInWishlist, index }) => {
  const price = item.variants?.[0]?.sizes?.[0]?.price || 0;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Animation values
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
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.stickyProfileImage} />
          ) : (
            <View style={styles.stickyProfileInitials}>
              <Text style={styles.stickyProfileInitialsText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
              </Text>
            </View>
          )}
          <Text style={styles.stickyUsername}>{user?.name || "Guest"}</Text>
        </View>
        
        <View style={styles.stickyIcons}>
          <TouchableOpacity
            style={styles.stickyIconButton}
            onPress={() => router.push('WishlistScreen')}
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
            onPress={() => router.push('CartScreen')}
          >
            <Ionicons name="bag-outline" size={22} color={COLORS.dark} />
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

const HomeScreen = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const router = useRouter();
  const bannerRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const searchInputRef = useRef(null);

  // Animation values
  const searchOpacity = useRef(new Animated.Value(0)).current;
  const categoriesOpacity = useRef(new Animated.Value(0)).current;
  const searchTranslateY = useRef(new Animated.Value(30)).current;
  const searchScale = useRef(new Animated.Value(0.95)).current;

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

  // Focus animation for search
  useEffect(() => {
    if (isSearchFocused) {
      Animated.spring(searchScale, {
        toValue: 1.02,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(searchScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [isSearchFocused]);

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
      if (reset && !refreshing) {
        setLoading(true);
      } else if (!reset) {
        setLoadingMore(true);
      }
      
      const limit = 8;
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
      
      if (reset) {
        const mockProducts = [
          {
            _id: '1',
            name: 'Modern Leather Jacket',
            brand: 'Fashion Co',
            image: '/uploads/products/1755327400526.jpg',
            variants: [{ sizes: [{ price: 299.99 }] }]
          },
          {
            _id: '2',
            name: 'Designer Handbag',
            brand: 'Style Accessories',
            image: '/uploads/products/1756720696531.jpg',
            variants: [{ sizes: [{ price: 199.99 }] }]
          },
          {
            _id: '3',
            name: 'Classic Watch',
            brand: 'Timepiece Co',
            image: '/uploads/products/1756720696532.jpg',
            variants: [{ sizes: [{ price: 399.99 }] }]
          },
          {
            _id: '4',
            name: 'Comfort Sweater',
            brand: 'Cozy Wear',
            image: '/uploads/products/1756720696533.jpg',
            variants: [{ sizes: [{ price: 149.99 }] }]
          },
          {
            _id: '5',
            name: 'Running Shoes',
            brand: 'Active Gear',
            image: '/uploads/products/1756720696534.jpg',
            variants: [{ sizes: [{ price: 129.99 }] }]
          },
          {
            _id: '6',
            name: 'Sunglasses',
            brand: 'Sun Style',
            image: '/uploads/products/1756720696535.jpg',
            variants: [{ sizes: [{ price: 89.99 }] }]
          }
        ];
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchProducts(1, true);
  }, []);

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

  const handleVoiceResult = (result) => {
    setSearchQuery(result);
    setShowVoiceModal(false);
    // Navigate to search screen with voice result
    router.push({
      pathname: 'SearchScreen',
      params: { query: result }
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: 'SearchScreen',
        params: { query: searchQuery }
      });
    }
  };

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
          {hasMore ? 'Load More' : 'View All Products'}
        </Text>
        <Ionicons 
          name={hasMore ? "chevron-down" : "arrow-forward"} 
          size={20} 
          color={COLORS.primary} 
        />
      </TouchableOpacity>
    );
  };

  const categories = ['All Items', 'New', 'Popular', 'Trending', 'Bestsellers', 'Featured'];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  // Split products for before and after middle banner
  const firstHalfProducts = filteredProducts.slice(0, 4);
  const secondHalfProducts = filteredProducts.slice(4);

  return (
    <View style={styles.scrollContainer}>
      {/* Sticky Header */}
      <StickyHeader 
        user={user}
        cartItems={cartItems}
        wishlist={wishlist}
        router={router}
        scrollY={scrollY}
      />

      {/* Voice Search Modal */}
      <VoiceSearchModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onResult={handleVoiceResult}
      />

      <Animated.ScrollView 
        ref={scrollViewRef}
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
            progressBackgroundColor={COLORS.white}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          {/* Main Header */}
          <View style={styles.header}>
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
                <Text style={styles.username}>{user?.name || "Guest"}! 👋</Text>
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
                onPress={() => router.push('CartScreen')}
              >
                <Ionicons name="bag-outline" size={24} color={COLORS.dark} />
                {cartItems > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartItems}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Enhanced Search Bar with Voice - FIXED VISIBILITY */}
          <View style={styles.searchSection}>
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
                  placeholder="Search for products, brands..."
                  placeholderTextColor={COLORS.gray}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                />
                
                {searchQuery ? (
                  <TouchableOpacity 
                    style={styles.searchClearButton}
                    onPress={() => setSearchQuery('')}
                  >
                    <Ionicons name="close-circle" size={18} color={COLORS.gray} />
                  </TouchableOpacity>
                ) : null}
                
                <TouchableOpacity 
                  style={styles.searchMicContainer}
                  onPress={() => setShowVoiceModal(true)}
                >
                  <Ionicons name="mic-outline" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>

          {/* Animated Categories - FIXED VISIBILITY */}
          <View style={styles.categoriesSection}>
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
          </View>

          {/* Enhanced Main Banner */}
          <View style={styles.bannerContainer}>
            <FlatList
              ref={bannerRef}
              data={banners}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <BannerItem 
                  item={item} 
                  router={router} 
                  index={index}
                  currentIndex={currentBannerIndex}
                />
              )}
              keyExtractor={(item) => item.id}
              onViewableItemsChanged={onViewRef.current}
              viewabilityConfig={viewConfigRef.current}
            />
            <View style={styles.bannerPagination}>
              {banners.map((_, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.paginationDot,
                    {
                      backgroundColor: currentBannerIndex === index ? COLORS.white : 'rgba(255,255,255,0.6)',
                      transform: [{
                        scale: currentBannerIndex === index ? 1.3 : 1
                      }]
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Arrivals</Text>
            <Text style={styles.sectionSubtitle}>Fresh products just for you</Text>
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
              <Ionicons name="cube-outline" size={60} color={COLORS.grayLight} />
              <Text style={styles.noProductsText}>No products available</Text>
              <Text style={styles.noProductsSubtext}>Check back soon for new arrivals</Text>
            </View>
          )}

          {/* Beautiful Middle Banner */}
          <MiddleBanner banner={middleBanner} router={router} />

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

          {/* Enhanced Show More Button */}
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
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.gray,
    fontSize: 16,
    fontWeight: '500',
  },
  noProductsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },
  noProductsText: {
    marginTop: 16,
    color: COLORS.gray,
    fontSize: 18,
    fontWeight: '600',
  },
  noProductsSubtext: {
    marginTop: 8,
    color: COLORS.grayLight,
    fontSize: 14,
  },
  // Voice Search Modal Styles
  voiceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  voiceCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  voiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 10,
    textAlign: 'center',
  },
  voiceSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  transcriptText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  voiceActionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  voiceActionButtonActive: {
    backgroundColor: COLORS.error,
  },
  voiceActionText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
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
  stickyProfileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
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
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  stickyBadge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  stickyBadgeText: {
    color: COLORS.white,
    fontSize: 9,
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
  profileImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
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
    fontSize: 22,
    fontWeight: 'bold',
  },
  welcomeContainer: {
    flexDirection: 'column',
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
  // Search Section - FIXED
  searchSection: {
    marginBottom: 16,
  },
  searchContainer: {
    width: '100%',
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
  searchMicContainer: {
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(99, 102, 241, 0.1)',
  },
  // Categories Section - FIXED
  categoriesSection: {
    marginBottom: 20,
  },
  categoriesContainer: {
    height: 50,
  },
  categoriesScroll: {
    paddingVertical: 8,
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
  // Enhanced Banner Styles
  bannerContainer: {
    height: 220,
    marginBottom: 32,
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
    height: 220,
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  bannerSubtitle: {
    color: COLORS.white,
    fontSize: 16,
    marginBottom: 20,
    opacity: 0.95,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bannerButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  bannerButtonText: {
    color: COLORS.primary,
    fontSize: 15,
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
    transition: 'all 0.3s ease',
  },
  bannerTypeIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
  typeBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  sectionHeader: {
    marginBottom: 20,
    marginTop: 8,
  },
  sectionTitle: {
    color: COLORS.dark,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: COLORS.gray,
    fontSize: 15,
    fontWeight: '500',
  },
  // Middle Banner Styles
  middleBannerContainer: {
    height: 160,
    marginVertical: 24,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  middleBannerImage: {
    width: '100%',
    height: 160,
  },
  middleBannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },
  middleBannerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 24,
  },
  middleBannerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  middleBannerSubtitle: {
    color: COLORS.white,
    fontSize: 15,
    marginBottom: 16,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  middleBannerButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  middleBannerButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  floatingElement1: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingElement2: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Enhanced Product Card Styles
  cardContainer: {
    width: '48%',
    marginBottom: 20,
  },
  card: {
    width: '100%',
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
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
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
    transition: 'transform 0.3s ease',
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
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  newBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heartContainer: {
    position: 'absolute',
    bottom: 12,
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
  columnWrapper: {
    justifyContent: 'space-between',
  },
  list: {
    paddingBottom: 20,
  },
  showMoreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  showMoreText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    marginLeft: 12,
    color: COLORS.gray,
    fontSize: 14,
    fontWeight: '500',
  },
});
export default HomeScreen;