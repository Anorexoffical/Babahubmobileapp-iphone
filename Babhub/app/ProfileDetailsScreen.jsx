import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { useAuth } from './contexts/AuthContext';

const { width, height } = Dimensions.get('window');

// Enhanced responsive calculations
const responsive = {
  width: (percentage) => width * (percentage / 100),
  height: (percentage) => height * (percentage / 100),
  font: (size) => {
    const scale = width / 375; // Base width iPhone 6/7/8
    return Math.round(size * scale);
  },
};

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

const ProfileDetailsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // Generate monogram from user's name
  const getMonogram = () => {
    if (user?.name) {
      const names = user.name.split(' ');
      if (names.length === 1) return names[0].charAt(0).toUpperCase();
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return "U";
  };

  const handleCopy = async (value) => {
    await Clipboard.setStringAsync(value);
    Toast.show({
      type: 'success',
      text1: 'Copied to Clipboard',
      text2: value,
      position: 'bottom',
    });
  };

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('ProfileScreen');
    }
  };

  // Calculate dynamic spacer height based on screen size and platform
  const getNavigationBarHeight = () => {
    if (Platform.OS === 'ios') {
      return height > 800 ? 34 : 20; // For notch devices and older iPhones
    } else {
      // Android/Huawei devices - responsive calculation
      if (height < 600) return 16; // Small devices
      if (height < 700) return 20; // Medium devices
      if (height < 800) return 24; // Large devices
      return 28; // Extra large devices
    }
  };

  return (
    <View style={styles.fullContainer}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {/* Main Content */}
      <View style={styles.container}>
        {/* Premium Header */}
        <View style={styles.header}>
          <View style={styles.headerBackground}>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBack}
              >
                <Ionicons name="arrow-back" size={responsive.font(24)} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Profile Details</Text>
              <View style={styles.placeholder} />
            </View>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarGradient}>
                <Text style={styles.monogram}>{getMonogram()}</Text>
              </View>
            </View>
            <Text style={styles.userName}>{user?.name || "Not provided"}</Text>
            <Text style={styles.userEmail}>{user?.email || "Not provided"}</Text>
          </View>

          {/* Profile Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle-outline" size={responsive.font(22)} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Profile Information</Text>
            </View>
            
            <InfoItem 
              label="Full Name" 
              value={user?.name || "Not provided"} 
              icon="person-outline"
            />
            <InfoItem 
              label="Email Address" 
              value={user?.email || "Not provided"} 
              icon="mail-outline"
              copyable 
              onCopy={handleCopy}
            />
          </View>

          {/* Personal Details Card (DOB removed) */}

          {/* Account Status Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="shield-checkmark-outline" size={responsive.font(22)} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Account Status</Text>
            </View>
            
            <InfoItem 
              label="Account Status" 
              value="Active" 
              icon="checkmark-circle-outline"
              valueColor={COLORS.success}
            />
            <InfoItem 
              label="Member Since" 
              value="2024" 
              icon="calendar-outline"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>BabaHub</Text>
            <Text style={styles.footerSubtext}>Your trusted shopping companion</Text>
          </View>
        </ScrollView>
      </View>

      {/* Dynamic Navigation Bar Spacer */}
      <View style={[styles.navigationBarSpacer, { height: getNavigationBarHeight() }]} />
    </View>
  );
};

const InfoItem = ({ 
  label, 
  value, 
  icon, 
  copyable, 
  onCopy, 
  valueColor = COLORS.dark 
}) => (
  <View style={styles.infoItem}>
    <View style={styles.infoLeft}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={responsive.font(18)} color={COLORS.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: valueColor }]} numberOfLines={1}>{value}</Text>
      </View>
    </View>
    
    <View style={styles.infoRight}>
      {copyable && (
        <TouchableOpacity 
          style={styles.copyButton}
          onPress={() => onCopy(value)}
        >
          <Ionicons name="copy-outline" size={responsive.font(18)} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export default ProfileDetailsScreen;

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: responsive.width(6),
    borderBottomRightRadius: responsive.width(6),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: responsive.height(1) },
    shadowOpacity: 0.3,
    shadowRadius: responsive.width(5),
    elevation: 10,
    overflow: 'hidden',
  },
  headerBackground: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? responsive.height(8) : responsive.height(6),
    paddingBottom: responsive.height(3),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsive.width(5),
  },
  backButton: {
    padding: responsive.width(2),
    borderRadius: responsive.width(3),
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: responsive.font(18),
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: responsive.width(2),
  },
  placeholder: {
    width: responsive.width(10),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: responsive.height(2),
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: responsive.height(4),
    paddingHorizontal: responsive.width(5),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: responsive.height(2),
  },
  avatarGradient: {
    width: responsive.width(22),
    height: responsive.width(22),
    borderRadius: responsive.width(11),
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: responsive.height(1) },
    shadowOpacity: 0.3,
    shadowRadius: responsive.width(4),
    elevation: 8,
    borderWidth: responsive.width(1),
    borderColor: COLORS.white,
  },
  monogram: {
    fontSize: responsive.font(32),
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
  },
  userName: {
    fontSize: responsive.font(20),
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: responsive.height(0.5),
    textAlign: 'center',
  },
  userEmail: {
    fontSize: responsive.font(14),
    color: COLORS.gray,
    marginBottom: responsive.height(1),
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: responsive.width(5),
    borderRadius: responsive.width(5),
    padding: responsive.width(5),
    marginBottom: responsive.width(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: responsive.height(0.5) },
    shadowOpacity: 0.08,
    shadowRadius: responsive.width(3),
    elevation: 6,
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsive.height(2),
    gap: responsive.width(2),
  },
  sectionTitle: {
    fontSize: responsive.font(16),
    fontWeight: '700',
    color: COLORS.dark,
    letterSpacing: 0.3,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsive.height(1.5),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    width: responsive.width(9),
    height: responsive.width(9),
    borderRadius: responsive.width(2.5),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsive.width(3),
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: responsive.font(13),
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: responsive.height(0.3),
  },
  value: {
    fontSize: responsive.font(15),
    fontWeight: '600',
    color: COLORS.dark,
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsive.width(2),
  },
  copyButton: {
    padding: responsive.width(1.5),
    borderRadius: responsive.width(2),
    backgroundColor: COLORS.primary + '10',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: responsive.height(3),
    paddingHorizontal: responsive.width(5),
  },
  footerText: {
    fontSize: responsive.font(14),
    fontWeight: '700',
    color: COLORS.gray,
    marginBottom: responsive.height(0.5),
  },
  footerSubtext: {
    fontSize: responsive.font(12),
    color: COLORS.grayLight,
    fontWeight: '500',
  },
  // Dynamic Navigation Bar Spacer for all devices
  navigationBarSpacer: {
    backgroundColor: COLORS.white,
  },
});