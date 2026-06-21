import { Dimensions, Platform, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

// ─── Tablet detection ─────────────────────────────────────────────────────────
export const isTablet = width >= 768;
export const isLargeTablet = width >= 1024; // iPad Pro 12.9

// Number of product-grid columns based on screen width
export const numColumns = isLargeTablet ? 3 : isTablet ? 3 : 2;

// Card width for product grids (accounts for padding + gap)
// horizontalPadding: 20px each side = 40px; gap between columns varies
export const cardWidth = isLargeTablet
  ? (width - 80) / 3          // 3-col on large tablet
  : isTablet
    ? (width - 60) / 3        // 3-col on iPad Air / Android tablet
    : (width - 56) / 2;       // 2-col on phone

// Responsive image height for product cards — aspect-ratio ~1:1.1
export const cardImageHeight = cardWidth * 1.1;

// ─── iPhone screen dimensions reference ───────────────────────────────────────
const IPHONE_SCREENS = {
  // Small screens
  IPHONE_5: { width: 320, height: 568 },
  IPHONE_SE_1: { width: 320, height: 568 },
  
  // Medium screens
  IPHONE_6_7_8: { width: 375, height: 667 },
  IPHONE_SE_2_3: { width: 375, height: 667 },
  IPHONE_X_XS_11PRO: { width: 375, height: 812 },
  IPHONE_12_13_MINI: { width: 375, height: 812 },
  
  // Large screens
  IPHONE_6_7_8_PLUS: { width: 414, height: 736 },
  IPHONE_XR_11: { width: 414, height: 896 },
  IPHONE_XS_11PRO_MAX: { width: 414, height: 896 },
  IPHONE_12_13_14: { width: 390, height: 844 },
  IPHONE_12_13_14_PRO: { width: 390, height: 844 },
  
  // Extra large screens
  IPHONE_12_13_14_PLUS: { width: 428, height: 926 },
  IPHONE_12_13_14_PRO_MAX: { width: 428, height: 926 },
  IPHONE_15: { width: 393, height: 852 },
  IPHONE_15_PLUS: { width: 430, height: 932 },
  IPHONE_15_PRO: { width: 393, height: 852 },
  IPHONE_15_PRO_MAX: { width: 430, height: 932 },
  IPHONE_16: { width: 393, height: 852 },
  IPHONE_16_PLUS: { width: 430, height: 932 },
  IPHONE_16_PRO: { width: 402, height: 874 },
  IPHONE_16_PRO_MAX: { width: 440, height: 956 },
  IPHONE_17_PRO: { width: 402, height: 874 },
  IPHONE_17_PRO_MAX: { width: 440, height: 956 },
};

// Base dimensions (iPhone 6/7/8 as reference)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 667;

// Detect screen size category
const getScreenCategory = () => {
  if (width >= 1024) return 'largeTablet'; // iPad Pro 12.9
  if (width >= 768)  return 'tablet';      // iPad Air / Android tablet
  if (width <= 320)  return 'small';
  if (width <= 375)  return 'medium';
  if (width <= 414)  return 'large';
  return 'xlarge';
};

// Enhanced responsive width with better scaling
export const responsiveWidth = (percentage) => {
  const screenCategory = getScreenCategory();
  let scaleFactor = 1;

  switch (screenCategory) {
    case 'largeTablet': scaleFactor = 1.0; break; // percentages are already of a large canvas
    case 'tablet':      scaleFactor = 1.0; break;
    case 'small':       scaleFactor = 0.85; break;
    case 'medium':      scaleFactor = 1;    break;
    case 'large':       scaleFactor = 1.1;  break;
    case 'xlarge':      scaleFactor = 1.15; break;
  }

  return (width * percentage) / 100 * scaleFactor;
};

// Enhanced responsive height with better scaling
export const responsiveHeight = (percentage) => {
  const screenCategory = getScreenCategory();
  let scaleFactor = 1;

  switch (screenCategory) {
    case 'largeTablet': scaleFactor = 1.0;  break;
    case 'tablet':      scaleFactor = 1.0;  break;
    case 'small':       scaleFactor = 0.85; break;
    case 'medium':      scaleFactor = 1;    break;
    case 'large':       scaleFactor = 1.05; break;
    case 'xlarge':      scaleFactor = 1.1;  break;
  }

  return (height * percentage) / 100 * scaleFactor;
};

// Enhanced responsive font with better readability across all devices
export const responsiveFont = (size) => {
  const screenCategory = getScreenCategory();
  const scale = width / BASE_WIDTH;

  let minScale, maxScale;

  switch (screenCategory) {
    case 'largeTablet': minScale = 1.1; maxScale = 1.4; break;
    case 'tablet':      minScale = 1.0; maxScale = 1.3; break;
    case 'small':       minScale = 0.82; maxScale = 0.92; break;
    case 'medium':      minScale = 0.90; maxScale = 1.00; break;
    case 'large':       minScale = 0.95; maxScale = 1.05; break;
    case 'xlarge':      minScale = 0.98; maxScale = 1.10; break;
    default:            minScale = 0.88; maxScale = 1.00;
  }

  const scaledSize = size * Math.max(Math.min(scale, maxScale), minScale);
  return Math.max(scaledSize, 10);
};

// Compact font scale — use these named sizes everywhere for consistency
// xs=11  sm=12  base=14  md=15  lg=16  xl=18  2xl=20  3xl=22  4xl=26
export const fs = {
  xs:   responsiveFont(11),
  sm:   responsiveFont(12),
  base: responsiveFont(14),
  md:   responsiveFont(15),
  lg:   responsiveFont(16),
  xl:   responsiveFont(18),
  x2l:  responsiveFont(20),
  x3l:  responsiveFont(22),
  x4l:  responsiveFont(26),
};

// Moderate scale for elements that shouldn't scale too much
export const moderateScale = (size, factor = 0.5) => {
  const screenCategory = getScreenCategory();
  const baseScale = width / BASE_WIDTH;
  
  let adjustedFactor = factor;
  if (screenCategory === 'small') adjustedFactor = factor * 0.8;
  if (screenCategory === 'xlarge') adjustedFactor = factor * 1.1;
  
  return size + (baseScale - 1) * size * adjustedFactor;
};

// Safe area calculations for all devices
export const getSafeAreaTop = () => {
  if (Platform.OS === 'ios') {
    // Devices with notch
    if (height >= 812) {
      return responsiveHeight(6);
    }
    // Devices without notch
    return responsiveHeight(3);
  } else {
    // Android
    const statusBarHeight = StatusBar.currentHeight || 0;
    return statusBarHeight + responsiveHeight(1);
  }
};

export const getSafeAreaBottom = () => {
  if (Platform.OS === 'ios') {
    // Devices with home indicator
    if (height >= 812) {
      return responsiveHeight(3);
    }
    // Devices with home button
    return responsiveHeight(1);
  } else {
    // Android - account for gesture navigation
    const hasGestureNav = height / width > 1.9;
    return hasGestureNav ? responsiveHeight(2) : responsiveHeight(3);
  }
};

// Get appropriate padding for different screen sizes
export const getScreenPadding = () => {
  const screenCategory = getScreenCategory();
  
  switch (screenCategory) {
    case 'small':
      return {
        horizontal: responsiveWidth(4),
        vertical: responsiveHeight(1.5),
      };
    case 'medium':
      return {
        horizontal: responsiveWidth(5),
        vertical: responsiveHeight(2),
      };
    case 'large':
      return {
        horizontal: responsiveWidth(5.5),
        vertical: responsiveHeight(2.5),
      };
    case 'xlarge':
      return {
        horizontal: responsiveWidth(6),
        vertical: responsiveHeight(3),
      };
    default:
      return {
        horizontal: responsiveWidth(5),
        vertical: responsiveHeight(2),
      };
  }
};

// Get appropriate spacing for different screen sizes
export const getSpacing = (multiplier = 1) => {
  const screenCategory = getScreenCategory();
  const baseSpacing = 8;
  
  let scale = 1;
  switch (screenCategory) {
    case 'small':
      scale = 0.85;
      break;
    case 'medium':
      scale = 1;
      break;
    case 'large':
      scale = 1.1;
      break;
    case 'xlarge':
      scale = 1.15;
      break;
  }
  
  return baseSpacing * multiplier * scale;
};

// Check if device has notch
export const hasNotch = () => {
  return Platform.OS === 'ios' && height >= 812;
};

// Get screen dimensions
export const getScreenDimensions = () => ({
  width,
  height,
  category: getScreenCategory(),
  hasNotch: hasNotch(),
});

// Export screen info
export const SCREEN_INFO = {
  width,
  height,
  category: getScreenCategory(),
  hasNotch: hasNotch(),
  isTablet,
  isLargeTablet,
  isSmallScreen:  width <= 320,
  isMediumScreen: width > 320 && width <= 375,
  isLargeScreen:  width > 375 && width <= 414,
  isXLargeScreen: width > 414 && width < 768,
};

export default {
  responsiveWidth,
  responsiveHeight,
  responsiveFont,
  fs,
  moderateScale,
  getSafeAreaTop,
  getSafeAreaBottom,
  getScreenPadding,
  getSpacing,
  hasNotch,
  getScreenDimensions,
  SCREEN_INFO,
  isTablet,
  isLargeTablet,
  numColumns,
  cardWidth,
  cardImageHeight,
};
