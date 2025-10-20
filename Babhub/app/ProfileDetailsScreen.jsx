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
                <Ionicons name="arrow-back" size={24} color={COLORS.white} />
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
              <Ionicons name="person-circle-outline" size={22} color={COLORS.primary} />
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

          {/* Personal Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle-outline" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Personal Details</Text>
            </View>
            
            <InfoItem 
              label="Date of Birth" 
              value={formatDate(user?.dob)} 
              icon="calendar-outline"
            />
          </View>

          {/* Account Status Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.primary} />
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

      {/* White Navigation Bar Spacer for iOS */}
      {Platform.OS === 'ios' && <View style={styles.navigationBarSpacer} />}
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
        <Ionicons name={icon} size={18} color={COLORS.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      </View>
    </View>
    
    <View style={styles.infoRight}>
      {copyable && (
        <TouchableOpacity 
          style={styles.copyButton}
          onPress={() => onCopy(value)}
        >
          <Ionicons name="copy-outline" size={18} color={COLORS.primary} />
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
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  headerBackground: {
    backgroundColor: COLORS.primary,
    paddingTop: height * 0.06,
    paddingBottom: height * 0.03,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: width * 0.045,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: height * 0.04,
    paddingHorizontal: width * 0.05,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatarGradient: {
    width: width * 0.22,
    height: width * 0.22,
    borderRadius: width * 0.11,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  monogram: {
    fontSize: width * 0.08,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
  },
  userName: {
    fontSize: width * 0.06,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: width * 0.035,
    color: COLORS.gray,
    marginBottom: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: width * 0.05,
    borderRadius: 20,
    padding: width * 0.05,
    marginBottom: width * 0.04,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: width * 0.04,
    fontWeight: '700',
    color: COLORS.dark,
    letterSpacing: 0.3,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: width * 0.032,
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: 2,
  },
  value: {
    fontSize: width * 0.038,
    fontWeight: '600',
    color: COLORS.dark,
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copyButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '10',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.05,
  },
  footerText: {
    fontSize: width * 0.035,
    fontWeight: '700',
    color: COLORS.gray,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: width * 0.03,
    color: COLORS.grayLight,
    fontWeight: '500',
  },
  // White Navigation Bar Spacer for iOS
  navigationBarSpacer: {
    height: Platform.OS === 'ios' ? 34 : 0, // Height of iOS home indicator
    backgroundColor: COLORS.white,
  },
});