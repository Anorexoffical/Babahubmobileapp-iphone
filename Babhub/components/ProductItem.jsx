import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from '../src/utils/image';
import {
  isTablet,
  cardWidth,
  cardImageHeight,
  responsiveFont,
} from '../src/utils/responsive';

// ─── Shared color palette ────────────────────────────────────────────────────
const COLORS = {
  primary: '#6366F1',
  secondary: '#EC4899',
  dark: '#1F2937',
  gray: '#6B7280',
  grayLight: '#9CA3AF',
  light: '#F3F4F6',
  white: '#FFFFFF',
  success: '#059669',
  error: '#DC2626',
  cardBackground: '#FFFFFF',
};

// ─── Shared ProductItem ───────────────────────────────────────────────────────
const ProductItem = ({
  item,
  index,
  onPress,
  onWishlistToggle,
  isInWishlist,
  onAddToCart,
  cartQuantity,
  // showNewBadge: true  → always show (HomeScreen behaviour)
  //               false → only show when item.isFeatured (StoreScreen behaviour)
  showNewBadge = true,
}) => {
  const price = item.variants?.[0]?.sizes?.[0]?.price || item.price || 0;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [recentlyAdded] = useState(false);

  const scaleValue = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 150),
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
      ]),
    ]).start();
  }, []);

  const handlePressIn = () =>
    Animated.spring(scaleValue, { toValue: 0.95, useNativeDriver: true }).start();

  const handlePressOut = () =>
    Animated.spring(scaleValue, { toValue: 1, friction: 3, useNativeDriver: true }).start();

  const handleWishlistPress = (e) => {
    e.stopPropagation();
    onWishlistToggle(item);
  };

  const handleAddToCartPress = (e) => {
    e.stopPropagation();
    onPress(item);
  };

  const imageUrl = getImageUrl(item.image);
  const displayBadge = showNewBadge ? true : item.isFeatured === true;

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] },
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
          {/* ── Image area ── */}
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
                onError={() => { setImageError(true); setImageLoaded(true); }}
              />
            )}

            {/* Heart */}
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

            {/* NEW badge */}
            {displayBadge && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
          </View>

          {/* ── Content area ── */}
          <View style={styles.cardContent}>
            <Text style={styles.title} numberOfLines={2}>
              {item.name || 'New Product'}
            </Text>

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
                    recentlyAdded && styles.cartButtonPulse,
                  ]}
                  onPress={handleAddToCartPress}
                >
                  <Ionicons name="cart" size={16} color={COLORS.white} />
                </TouchableOpacity>
                {cartQuantity > 0 && (
                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>{cartQuantity}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

// ─── Styles — single source of truth ─────────────────────────────────────────
const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.08)',
    elevation: 6,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: cardImageHeight,
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
    padding: isTablet ? 14 : 14,
    backgroundColor: COLORS.cardBackground,
  },
  title: {
    fontSize: isTablet ? 14 : 13,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 6,
    lineHeight: 20,
    flexShrink: 1,
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
    fontSize: isTablet ? 15 : 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    flexShrink: 1,
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
});

export default ProductItem;
