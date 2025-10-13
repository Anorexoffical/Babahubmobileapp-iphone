import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

// Enhanced Brand Color Palette
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
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();

  // Generate monogram from user's name
  const getMonogram = () => {
    if (user?.name) {
      const names = user.name.split(' ');
      if (names.length === 1) return names[0].charAt(0).toUpperCase();
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return "U"; // User initial
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.headerBackground}>
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Welcome to BabaHub</Text>
              <Text style={styles.userName}>{user?.name || "Valued Customer!"}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.profileCard}
              onPress={() => navigation.navigate('ProfileDetailsScreen')}
            >
              <View style={styles.avatarContainer}>
                <View style={styles.avatarGradient}>
                  <Text style={styles.monogram}>{getMonogram()}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={14} color={COLORS.white} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Menu Items without sections */}
        <View style={styles.menuContainer}>
          <MenuItem
            icon="person-outline"
            title="Profile Information"
            subtitle="Update your personal details"
            color={COLORS.primary}
            onPress={() => navigation.navigate('ProfileDetailsScreen')}
          />

          <MenuItem
            icon="cart-outline"
            title="My Cart"
            subtitle="Add, remove products and move to checkout"
            color={COLORS.primary}
            onPress={() => navigation.navigate('CartScreen')}
          />

          <MenuItem
            icon="reorder-three-outline"
            title="My Orders"
            subtitle="In-progress and Completed Orders"
            color={COLORS.success}
            onPress={() => navigation.navigate('MyOrder')}
          />

          <MenuItem
            icon="heart-outline"
            title="Wishlist"
            subtitle="Your saved favorite items"
            color={COLORS.secondary}
            onPress={() => navigation.navigate('WishlistScreen')}
          />

          <MenuItem
            icon="headset-outline"
            title="Customer Support"
            subtitle="Contact our support team"
            color={COLORS.primary}
            onPress={() => navigation.navigate('CustomerSupport')}
          />

          <MenuItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            subtitle="How we handle your information"
            color={COLORS.success}
            onPress={() => navigation.navigate('PrivacyPolicyScreen')}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await signOut(); 
            navigation.replace("login");
          }}
        >
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>BabaHub v1.0.0</Text>
          <Text style={styles.footerSubtext}>Premium Shopping Experience</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const MenuItem = ({ icon, title, subtitle, color = COLORS.primary, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View style={styles.menuText}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </View>
    <View style={styles.arrowContainer}>
      <Ionicons name="chevron-forward" size={18} color={COLORS.grayLight} />
    </View>
  </TouchableOpacity>
);

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    paddingBottom: height * 0.04,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.06,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    color: COLORS.white + 'CC',
    fontSize: width * 0.038,
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  userName: { 
    color: COLORS.white, 
    fontSize: width * 0.06, 
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  profileCard: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGradient: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: width * 0.09,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  monogram: {
    fontSize: width * 0.06,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.success,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  menuContainer: {
    paddingHorizontal: width * 0.05,
    marginTop: height * 0.04,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
    paddingVertical: height * 0.016,
    paddingHorizontal: width * 0.04,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.04,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: { 
    fontSize: width * 0.04, 
    fontWeight: '700', 
    color: COLORS.dark,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  menuSubtitle: { 
    fontSize: width * 0.033, 
    color: COLORS.gray,
    fontWeight: '500',
    lineHeight: 18,
  },
  arrowContainer: {
    padding: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: width * 0.05,
    marginTop: height * 0.04,
    marginBottom: height * 0.02,
    paddingVertical: height * 0.02,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.error + '30',
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 10,
  },
  logoutText: { 
    fontSize: width * 0.04, 
    fontWeight: '700', 
    color: COLORS.error,
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.05,
  },
  footerText: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: width * 0.03,
    color: COLORS.grayLight,
    fontWeight: '500',
  },
});