import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import http from '../../src/api/http';
import AuthLoginModal from '../contexts/AuthLoginModal';

const { width, height } = Dimensions.get('window');

// Tablet-safe responsive helpers.
// Cap the reference width at 500px so fonts/sizes never grow out of control on iPads.
const BASE = Math.min(width, 500);
const rw = (p) => (BASE * p) / 100;
const rh = (p) => (height * p) / 100;
const rf = (size) => {
  const scale = BASE / 375;
  const s = size * scale;
  // Clamp so nothing gets too small or too large on any device
  return Math.max(Math.min(s, size * 1.25), size * 0.85);
};

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
  const { user, signOut, userToken, isAuthenticated } = useAuth();
  const [deleting, setDeleting] = React.useState(false);
  const router = useRouter();
  const [loginModalVisible, setLoginModalVisible] = React.useState(false);

  if (!isAuthenticated()) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        <View style={styles.guestIconWrap}>
          <Ionicons name="person-outline" size={rf(52)} color={COLORS.primary} />
        </View>
        <Text style={styles.guestTitle}>You're not logged in</Text>
        <Text style={styles.guestSubtitle}>
          Login to access your profile, orders, wishlist, and more.
        </Text>
        <TouchableOpacity
          style={styles.guestLoginButton}
          onPress={() => setLoginModalVisible(true)}
        >
          <Text style={styles.guestLoginText}>Login / Create Account</Text>
        </TouchableOpacity>
        <AuthLoginModal
          visible={loginModalVisible}
          onLoginSuccess={() => setLoginModalVisible(false)}
          onDismiss={() => setLoginModalVisible(false)}
        />
      </View>
    );
  }

  const getMonogram = () => {
    if (user?.name) {
      const names = user.name.split(' ');
      if (names.length === 1) return names[0].charAt(0).toUpperCase();
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return 'U';
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBackground}>
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Welcome to BabaHub</Text>
              <Text style={styles.userName} numberOfLines={1}>{user?.name || 'Valued Customer!'}</Text>
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
                  <Ionicons name="checkmark" size={rf(12)} color={COLORS.white} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            subtitle="How we handle your information"
            color={COLORS.success}
            onPress={() => navigation.navigate('PrivacyPolicyScreen')}
          />
          <MenuItem
            icon="refresh-circle-outline"
            title="Return Policy"
            subtitle="Returns, refunds & delivery information"
            color={COLORS.warning}
            onPress={() => navigation.navigate('ReturnPolicyScreen')}
          />
          <MenuItem
            icon="headset-outline"
            title="Customer Support"
            subtitle="Contact our support team"
            color={COLORS.primary}
            onPress={() => navigation.navigate('CustomerSupport')}
          />
          <MenuItem
            icon="trash-outline"
            title="Delete Account"
            subtitle="Permanently delete your account"
            color={COLORS.error}
            onPress={() => {
              if (!userToken) {
                Alert.alert('Not Signed In', 'You must be signed in to delete your account.');
                return;
              }
              Alert.alert(
                'Delete Account',
                'Are you sure you want to delete your account? This action cannot be undone. Your account will be removed and you will no longer be able to sign in.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete Account', style: 'destructive', onPress: async () => {
                      if (deleting) return;
                      try {
                        setDeleting(true);
                        const res = await http.delete('/users/delete-account', {
                          headers: { Authorization: `Bearer ${userToken}` },
                        });
                        if (res && res.data && res.data.success) {
                          await signOut();
                          await AsyncStorage.multiRemove(['wishlist', 'cart', 'cached_products']);
                          router.replace('/(tabs)/HomeScreen');
                        } else {
                          const message = (res && res.data && res.data.message) ? res.data.message : 'Unable to delete account';
                          Alert.alert('Delete Failed', message);
                        }
                      } catch (err) {
                        if (err.response) {
                          Alert.alert('Delete Failed', err.response.data?.message || 'Server rejected the request');
                        } else if (err.request) {
                          Alert.alert('Network Error', 'No response from server. Check your connection.');
                        } else {
                          Alert.alert('Error', err.message || 'Unable to delete account.');
                        }
                      } finally {
                        setDeleting(false);
                      }
                    },
                  },
                ],
                { cancelable: true }
              );
            }}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await signOut();
            router.replace('/(tabs)/HomeScreen');
          }}
        >
          <Ionicons name="log-out-outline" size={rf(22)} color={COLORS.error} />
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

// MenuItem — key fix: alignItems:'flex-start' on the row so title and subtitle
// stack naturally without overlapping, and no minHeight forcing a single-line layout.
const MenuItem = ({ icon, title, subtitle, color = COLORS.primary, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={rf(22)} color={color} />
    </View>
    <View style={styles.menuText}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </View>
    <View style={styles.arrowContainer}>
      <Ionicons name="chevron-forward" size={rf(18)} color={COLORS.grayLight} />
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

  // ── Header ──────────────────────────────────────────────
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
    paddingTop: Platform.OS === 'android'
      ? (StatusBar.currentHeight || rh(3)) + rh(1.5)
      : rh(6),
    paddingBottom: rh(3.5),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: rw(6),
  },
  welcomeSection: {
    flex: 1,
    marginRight: rw(4),
  },
  welcomeText: {
    color: COLORS.white + 'CC',
    fontSize: rf(14),
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  userName: {
    color: COLORS.white,
    fontSize: rf(22),
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
    width: rw(16),
    height: rw(16),
    borderRadius: rw(8),
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
    fontSize: rf(22),
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.success,
    width: rf(18),
    height: rf(18),
    borderRadius: rf(9),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  // ── Menu ─────────────────────────────────────────────────
  menuContainer: {
    // Use fixed horizontal padding — not width-based — so items stay consistent on tablets
    paddingHorizontal: Math.min(rw(5), 24),
    marginTop: rh(3),
  },
  menuItem: {
    flexDirection: 'row',
    // Use flex-start so the text column can grow vertically without clipping
    alignItems: 'flex-start',
    marginBottom: rh(1.5),
    paddingVertical: rh(1.8),
    paddingHorizontal: Math.min(rw(4), 20),
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
    // Fixed 48×48 — never scales with width so it stays compact on tablets
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    // Align icon circle with the top of the text block
    marginTop: 2,
    flexShrink: 0,
  },
  menuText: {
    flex: 1,
    // Let this column determine its own height — no justifyContent that compresses lines
  },
  menuTitle: {
    fontSize: rf(15),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 5,
    letterSpacing: 0.3,
    // Allow wrapping on very long titles on small screens, but normally single line
    flexShrink: 1,
  },
  menuSubtitle: {
    fontSize: rf(13),
    color: COLORS.gray,
    fontWeight: '500',
    // Critical: use a line-height that gives enough room and allow wrapping
    lineHeight: rf(19),
    flexShrink: 1,
  },
  arrowContainer: {
    paddingLeft: 8,
    paddingTop: 4,
    flexShrink: 0,
  },

  // ── Logout ───────────────────────────────────────────────
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Math.min(rw(5), 24),
    marginTop: rh(3),
    marginBottom: rh(2),
    paddingVertical: rh(2),
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
    fontSize: rf(16),
    fontWeight: '700',
    color: COLORS.error,
    letterSpacing: 0.5,
  },

  // ── Footer ───────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    paddingVertical: rh(3),
    paddingHorizontal: rw(5),
  },
  footerText: {
    fontSize: rf(14),
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: rf(12),
    color: COLORS.grayLight,
    fontWeight: '500',
  },

  // ── Guest state ──────────────────────────────────────────
  guestIconWrap: {
    width: rw(22),
    height: rw(22),
    borderRadius: rw(11),
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: rh(3),
  },
  guestTitle: {
    fontSize: rf(22),
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: rh(1.5),
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: rf(15),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: rf(22),
    marginBottom: rh(4),
  },
  guestLoginButton: {
    backgroundColor: COLORS.primary,
    height: rh(7),
    paddingHorizontal: rw(10),
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  guestLoginText: {
    color: COLORS.white,
    fontSize: rf(16),
    fontWeight: '700',
  },
});
