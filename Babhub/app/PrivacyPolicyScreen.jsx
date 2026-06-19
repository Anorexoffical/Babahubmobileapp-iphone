import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Responsive sizing — consistent with login/profile/CustomerSupport
const rw = (p) => (width * p) / 100;
const rh = (p) => (height * p) / 100;
const rf = (size) => {
  const scale = Math.min(width, height) / 400;
  const s = size * scale;
  return Platform.OS === 'android'
    ? Math.max(Math.min(s, size * 1.3), size * 0.9)
    : Math.max(Math.min(s, size * 1.2), size * 0.8);
};

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

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('ProfileScreen');
    }
  };

  const handleEmailPress = () => {
    Linking.openURL(
      'mailto:babahubsa@gmail.com?subject=Privacy Policy Inquiry&body=Hello BabaHub Support Team,'
    );
  };

  return (
    <View style={styles.fullContainer}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBackground}>
            <View style={styles.headerContent}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={rf(22)} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Privacy Policy</Text>
              <View style={styles.placeholder} />
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="shield-checkmark" size={rf(36)} color={COLORS.primary} />
            </View>
            <Text style={styles.heroTitle}>Privacy Policy</Text>
            <Text style={styles.heroSubtitle}>Your Privacy Matters to Us</Text>
          </View>

          <View style={styles.content}>

            {/* Introduction */}
            <View style={styles.card}>
              <Text style={styles.introText}>
                At <Text style={styles.brandText}>BabaHub</Text>, we are committed to protecting
                your privacy and ensuring the security of your personal information. This Privacy
                Policy explains how we collect, use, disclose, and safeguard your information
                when you use our e-commerce application.
              </Text>
            </View>

            {/* Section 1 */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconWrap}>
                  <Ionicons name="person-circle" size={rf(20)} color={COLORS.primary} />
                </View>
                <Text style={styles.sectionTitle}>1. Information We Collect</Text>
              </View>

              <Text style={styles.subsectionTitle}>Personal Information for Account Creation:</Text>
              <BulletItem label="Full Name" desc="For order processing and personalization" />
              <BulletItem label="Email Address" desc="For account verification and communication" />
              <BulletItem label="Date of Birth" desc="For age verification and personalized offers" />

              <Text style={[styles.subsectionTitle, { marginTop: rh(1.5) }]}>Checkout Information:</Text>
              <BulletItem label="Shipping Address" desc="For product delivery" />
              <BulletItem label="Phone Number" desc="For delivery coordination and updates" />

              <Text style={[styles.subsectionTitle, { marginTop: rh(1.5) }]}>Payment Information:</Text>
              <View style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.highlight}>Card Details</Text>
                  {' '}— Processed securely through PayFast,{' '}
                  <Text style={styles.emphasis}>NOT stored</Text> on our servers
                </Text>
              </View>
            </View>

            {/* Section 2 */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconWrap}>
                  <Ionicons name="lock-closed" size={rf(20)} color={COLORS.primary} />
                </View>
                <Text style={styles.sectionTitle}>2. Data Security & Encryption</Text>
              </View>

              <Text style={styles.bodyText}>
                We implement industry-standard security measures to protect your data:
              </Text>

              <View style={styles.gridRow}>
                <GridCard
                  icon="shield-checkmark"
                  iconColor={COLORS.success}
                  title="End-to-End Encryption"
                  desc="All personal data encrypted using AES-256"
                />
                <GridCard
                  icon="server"
                  iconColor={COLORS.primary}
                  title="Secure Storage"
                  desc="Data stored in secure, access-controlled databases"
                />
              </View>
              <View style={styles.gridRow}>
                <GridCard
                  icon="card"
                  iconColor={COLORS.warning}
                  title="Payment Security"
                  desc="Card details processed externally via PayFast"
                />
                <GridCard
                  icon="eye-off"
                  iconColor={COLORS.error}
                  title="No Third-Party Sharing"
                  desc="We do not sell or share your personal data"
                />
              </View>
            </View>

            {/* Section 3 */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconWrap}>
                  <Ionicons name="business" size={rf(20)} color={COLORS.primary} />
                </View>
                <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
              </View>

              <UsageItem icon="cart" text="Order processing and fulfillment" />
              <UsageItem icon="navigate" text="Order tracking and delivery updates" />
              <UsageItem icon="chatbubble" text="Customer support and communication" />
              <UsageItem icon="notifications" text="Order status notifications" />
              <UsageItem icon="trending-up" text="Service improvement and analytics" />
            </View>

            {/* Section 4 */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconWrap}>
                  <Ionicons name="git-network" size={rf(20)} color={COLORS.primary} />
                </View>
                <Text style={styles.sectionTitle}>4. Third-Party Services</Text>
              </View>

              <Text style={styles.bodyText}>
                We work with trusted partners to provide our services:
              </Text>

              <View style={styles.partnerCard}>
                <View style={styles.partnerRow}>
                  <Ionicons name="card" size={rf(22)} color={COLORS.success} />
                  <View style={styles.partnerInfo}>
                    <Text style={styles.partnerName}>PayFast Payment Gateway</Text>
                    <Text style={styles.partnerDesc}>
                      Secure payment processing — card details never stored with us
                    </Text>
                  </View>
                </View>
                <View style={[styles.partnerRow, { marginBottom: 0 }]}>
                  <Ionicons name="cube" size={rf(22)} color={COLORS.warning} />
                  <View style={styles.partnerInfo}>
                    <Text style={styles.partnerName}>Shipping Partners</Text>
                    <Text style={styles.partnerDesc}>
                      Delivery services receive only necessary delivery information
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.warningNote}>
                <Ionicons name="warning" size={rf(18)} color={COLORS.warning} />
                <Text style={styles.warningNoteText}>
                  We do NOT share your personal data with advertisers or marketing companies
                </Text>
              </View>
            </View>

            {/* Section 5 */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconWrap}>
                  <Ionicons name="people" size={rf(20)} color={COLORS.primary} />
                </View>
                <Text style={styles.sectionTitle}>5. Your Rights & Control</Text>
              </View>

              <View style={styles.gridRow}>
                <GridCard icon="eye" iconColor={COLORS.primary} title="Right to Access" desc="View your personal data" />
                <GridCard icon="create" iconColor={COLORS.primary} title="Right to Update" desc="Modify your information" />
              </View>
              <View style={styles.gridRow}>
                <GridCard icon="trash" iconColor={COLORS.primary} title="Right to Delete" desc="Request account deletion" />
                <GridCard icon="download" iconColor={COLORS.primary} title="Data Portability" desc="Export your data" />
              </View>
            </View>

            {/* Contact Section */}
            <View style={styles.card}>
              <Text style={styles.contactTitle}>Contact Us</Text>
              <Text style={styles.contactSubtext}>
                For privacy-related questions or to exercise your rights, please contact our
                support team via email:
              </Text>

              <TouchableOpacity style={styles.emailButton} onPress={handleEmailPress} activeOpacity={0.85}>
                <View style={styles.emailButtonInner}>
                  <View style={styles.emailIconWrap}>
                    <Ionicons name="mail" size={rf(22)} color={COLORS.white} />
                  </View>
                  <View style={styles.emailButtonText}>
                    <Text style={styles.emailButtonTitle}>Email Support</Text>
                    <Text style={styles.emailButtonSubtitle}>babahubsa@gmail.com</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={rf(20)} color={COLORS.white} />
                </View>
              </TouchableOpacity>

              <Text style={styles.responseNote}>
                We typically respond to all privacy-related inquiries within 24–48 hours.
              </Text>
            </View>

            {/* Final Note */}
            <View style={styles.finalNote}>
              <Ionicons name="information-circle" size={rf(22)} color={COLORS.primary} />
              <Text style={styles.finalNoteText}>
                By using BabaHub, you acknowledge that you have read and understood this Privacy
                Policy. We are committed to continuously improving our privacy practices.
              </Text>
            </View>

            {/* Last Updated */}
            <View style={styles.updateSection}>
              <Text style={styles.updateText}>Last updated: October 21, 2024</Text>
            </View>

          </View>
        </ScrollView>
      </View>

      {Platform.OS === 'ios' && <View style={styles.navigationBarSpacer} />}
    </View>
  );
};

/* ── Small reusable sub-components ── */

const BulletItem = ({ label, desc }) => (
  <View style={styles.bulletRow}>
    <View style={styles.bulletDot} />
    <Text style={styles.bulletText}>
      <Text style={styles.highlight}>{label}</Text>
      {' '}— {desc}
    </Text>
  </View>
);

const UsageItem = ({ icon, text }) => (
  <View style={styles.usageRow}>
    <View style={styles.usageIconWrap}>
      <Ionicons name={icon} size={rf(18)} color={COLORS.primary} />
    </View>
    <Text style={styles.usageText}>{text}</Text>
  </View>
);

const GridCard = ({ icon, iconColor, title, desc }) => (
  <View style={styles.gridCard}>
    <Ionicons name={icon} size={rf(24)} color={iconColor} />
    <Text style={styles.gridCardTitle}>{title}</Text>
    <Text style={styles.gridCardDesc}>{desc}</Text>
  </View>
);

/* ── Styles ── */

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: rw(6),
    borderBottomRightRadius: rw(6),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  headerBackground: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'android'
      ? (StatusBar.currentHeight || rh(3)) + rh(1.5)
      : rh(6),
    paddingBottom: rh(3),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: rw(5),
  },
  backButton: {
    padding: rw(2),
    borderRadius: rw(2.5),
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: rf(18),
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.4,
  },
  placeholder: {
    width: rw(10),
  },

  // Scroll
  scrollContainer: { flex: 1 },
  contentContainer: { paddingBottom: rh(4) },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingVertical: rh(3.5),
    paddingHorizontal: rw(5),
    backgroundColor: COLORS.white,
    marginHorizontal: rw(4),
    marginTop: rh(2.5),
    borderRadius: rw(5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  heroIconWrap: {
    width: rw(18),
    height: rw(18),
    borderRadius: rw(9),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: rh(1.5),
  },
  heroTitle: {
    fontSize: rf(20),
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: rh(0.5),
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: rf(14),
    color: COLORS.gray,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Content wrapper
  content: {
    paddingHorizontal: rw(4),
    paddingTop: rh(2),
  },

  // Card (replaces section / introSection / contactSection)
  card: {
    backgroundColor: COLORS.white,
    borderRadius: rw(4),
    padding: rw(4),
    marginBottom: rh(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.light,
  },

  // Intro
  introText: {
    fontSize: rf(14),
    color: COLORS.dark,
    lineHeight: rf(22),
    textAlign: 'center',
  },
  brandText: {
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rh(1.5),
    gap: rw(3),
  },
  sectionIconWrap: {
    width: rw(10),
    height: rw(10),
    borderRadius: rw(5),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: rf(16),
    fontWeight: '700',
    color: COLORS.dark,
    flex: 1,
    letterSpacing: 0.2,
  },

  // Body text
  bodyText: {
    fontSize: rf(14),
    color: COLORS.darkLight,
    lineHeight: rf(22),
    marginBottom: rh(1.5),
  },

  // Subsection
  subsectionTitle: {
    fontSize: rf(13),
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: rh(0.8),
  },

  // Bullet
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: rh(1),
  },
  bulletDot: {
    width: rw(1.5),
    height: rw(1.5),
    borderRadius: rw(0.75),
    backgroundColor: COLORS.primary,
    marginRight: rw(3),
    marginTop: rf(8),
  },
  bulletText: {
    fontSize: rf(14),
    color: COLORS.darkLight,
    flex: 1,
    lineHeight: rf(22),
  },
  highlight: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  emphasis: {
    fontWeight: '700',
    color: COLORS.error,
  },

  // Grid (2-col)
  gridRow: {
    flexDirection: 'row',
    gap: rw(3),
    marginBottom: rw(3),
  },
  gridCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: rw(3),
    padding: rw(3.5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  gridCardTitle: {
    fontSize: rf(12),
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: rh(0.8),
    textAlign: 'center',
  },
  gridCardDesc: {
    fontSize: rf(11),
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: rh(0.4),
    lineHeight: rf(16),
  },

  // Usage list
  usageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rh(0.8),
    gap: rw(3),
  },
  usageIconWrap: {
    width: rw(8),
    height: rw(8),
    borderRadius: rw(2),
    backgroundColor: COLORS.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  usageText: {
    fontSize: rf(14),
    color: COLORS.darkLight,
    flex: 1,
    lineHeight: rf(20),
  },

  // Partner card
  partnerCard: {
    backgroundColor: COLORS.background,
    borderRadius: rw(3),
    padding: rw(4),
    marginVertical: rh(1),
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: rh(1.5),
    gap: rw(3),
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: rf(14),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: rh(0.4),
  },
  partnerDesc: {
    fontSize: rf(13),
    color: COLORS.gray,
    lineHeight: rf(19),
  },

  // Warning note
  warningNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    padding: rw(3.5),
    borderRadius: rw(2.5),
    marginTop: rh(0.5),
    gap: rw(2.5),
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  warningNoteText: {
    fontSize: rf(13),
    color: COLORS.dark,
    fontWeight: '500',
    flex: 1,
    lineHeight: rf(19),
  },

  // Contact
  contactTitle: {
    fontSize: rf(18),
    fontWeight: '800',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: rh(0.8),
  },
  contactSubtext: {
    fontSize: rf(14),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: rf(22),
    marginBottom: rh(2),
  },

  // Email button — pill-shaped, matches app button style
  emailButton: {
    backgroundColor: COLORS.primary,
    borderRadius: rw(35),
    paddingVertical: rh(1.8),
    paddingHorizontal: rw(4),
    marginBottom: rh(1.5),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emailButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailIconWrap: {
    width: rw(10),
    height: rw(10),
    borderRadius: rw(5),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: rw(3),
  },
  emailButtonText: {
    flex: 1,
  },
  emailButtonTitle: {
    fontSize: rf(15),
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: rh(0.3),
  },
  emailButtonSubtitle: {
    fontSize: rf(13),
    color: COLORS.white,
    opacity: 0.9,
  },
  responseNote: {
    fontSize: rf(12),
    color: COLORS.gray,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: rf(18),
  },

  // Final note
  finalNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '10',
    padding: rw(4),
    borderRadius: rw(3),
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginBottom: rh(2),
    gap: rw(3),
  },
  finalNoteText: {
    fontSize: rf(13),
    color: COLORS.dark,
    flex: 1,
    lineHeight: rf(20),
  },

  // Update
  updateSection: {
    alignItems: 'center',
    paddingVertical: rh(1.5),
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    marginBottom: rh(1),
  },
  updateText: {
    fontSize: rf(12),
    color: COLORS.grayLight,
    fontStyle: 'italic',
  },

  // iOS spacer
  navigationBarSpacer: {
    height: 34,
    backgroundColor: COLORS.white,
  },
});

export default PrivacyPolicyScreen;
