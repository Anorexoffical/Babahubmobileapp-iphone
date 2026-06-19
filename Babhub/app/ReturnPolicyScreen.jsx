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

// Responsive sizing — consistent with login/profile/PrivacyPolicy/CustomerSupport
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

const ReturnPolicyScreen = () => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('ProfileScreen');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:babahubsa@gmail.com?subject=Return Policy Inquiry&body=Hello BabaHub Support,');
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
              <Text style={styles.headerTitle}>Return Policy</Text>
              <View style={styles.placeholder} />
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero */}
          <View style={styles.heroSection}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="refresh-circle" size={rf(36)} color={COLORS.primary} />
            </View>
            <Text style={styles.heroTitle}>Return & Refund Policy 🔄</Text>
            <Text style={styles.heroSubtitle}>
              Understanding our policies for returns, refunds, and exchanges
            </Text>
          </View>

          <View style={styles.content}>

            {/* Thank You */}
            <View style={styles.card}>
              <Text style={styles.introText}>
                We're committed to ensuring your complete satisfaction with every purchase.
                Please review our return and refund policy below.
              </Text>
            </View>

            {/* Returns Eligibility */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconWrap}>
                  <Ionicons name="checkmark-circle" size={rf(20)} color={COLORS.primary} />
                </View>
                <Text style={styles.sectionTitle}>Returns Eligibility</Text>
              </View>

              <View style={styles.highlightBox}>
                <Text style={styles.eligibilityPeriod}>
                  Returns accepted within <Text style={styles.highlight}>7 days</Text> of delivery
                </Text>
              </View>

              <Text style={styles.subsectionTitle}>Conditions that must be met:</Text>
              <CheckItem icon="checkmark" color={COLORS.success} text="Item is unused, unworn, and in its original packaging" />
              <CheckItem icon="checkmark" color={COLORS.success} text="All tags, labels, and accessories are intact" />
              <CheckItem icon="checkmark" color={COLORS.success} text="Proof of purchase (order ID or invoice) is provided" />

              <View style={styles.nonReturnableBox}>
                <Text style={styles.nonReturnableTitle}>Non-returnable Items:</Text>
                <CheckItem icon="close" color={COLORS.error} text="Perishable goods (e.g., food, beverages)" />
                <CheckItem icon="close" color={COLORS.error} text="Personal care items (e.g., cosmetics, hygiene products)" />
                <CheckItem icon="close" color={COLORS.error} text="Sale or clearance items" />
                <CheckItem icon="close" color={COLORS.error} text="Digital or downloadable products" />
              </View>
            </View>

            {/* Return Process */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconWrap}>
                  <Ionicons name="arrow-redo" size={rf(20)} color={COLORS.primary} />
                </View>
                <Text style={styles.sectionTitle}>Return Process</Text>
              </View>

              <StepItem number="1" title="Contact Us by Email" desc={<>Email us at <Text style={styles.bold}>babahubsa@gmail.com</Text> to initiate a return request.</>} />
              <StepItem number="2" title="Provide Order Details" desc={<>Include your <Text style={styles.bold}>Order ID</Text> and the <Text style={styles.bold}>reason for the return</Text> in your email so our team can review your request.</>} />
              <StepItem number="3" title="Review Process" desc={<>Our team will review your request within <Text style={styles.bold}>24 hours</Text>.</>} />
              <StepItem number="4" title="Pickup Arrangement" desc="Once approved, pickup or drop-off will be arranged based on your location." last />
            </View>

            {/* Refunds */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconWrap}>
                  <Ionicons name="card" size={rf(20)} color={COLORS.primary} />
                </View>
                <Text style={styles.sectionTitle}>Refunds</Text>
              </View>

              <View style={styles.refundTimelineBox}>
                <Ionicons name="time" size={rf(20)} color={COLORS.primary} />
                <Text style={styles.refundTimelineText}>
                  Refunds processed within <Text style={styles.highlight}>5–7 business days</Text> after approval
                </Text>
              </View>

              <View style={styles.refundDetails}>
                <RefundPoint text="Refunds will be made to your original payment method (card, bank, or wallet)" />
                <RefundPoint text="Shipping and service charges are non-refundable unless the item was damaged or incorrect" />
              </View>
            </View>

            {/* Damaged Items */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconWrap, { backgroundColor: COLORS.warning + '15' }]}>
                  <Ionicons name="warning" size={rf(20)} color={COLORS.warning} />
                </View>
                <Text style={styles.sectionTitle}>Damaged or Incorrect Items</Text>
              </View>

              <View style={styles.warningBanner}>
                <Ionicons name="information-circle" size={rf(20)} color={COLORS.warning} />
                <Text style={styles.warningText}>
                  Contact us within <Text style={styles.bold}>48 hours</Text> of delivery for damaged, defective, or wrong items
                </Text>
              </View>

              <Text style={[styles.subsectionTitle, { marginTop: rh(1.5) }]}>Required Information:</Text>
              <View style={styles.requirementRow}>
                <View style={styles.requirementIconWrap}>
                  <Ionicons name="camera" size={rf(16)} color={COLORS.primary} />
                </View>
                <Text style={styles.requirementText}>Clear photos of the damaged/incorrect item</Text>
              </View>
              <View style={styles.requirementRow}>
                <View style={styles.requirementIconWrap}>
                  <Ionicons name="document" size={rf(16)} color={COLORS.primary} />
                </View>
                <Text style={styles.requirementText}>Your order ID and delivery details</Text>
              </View>

              <View style={styles.resolutionBox}>
                <Text style={styles.resolutionTitle}>Resolution:</Text>
                <Text style={styles.resolutionText}>
                  We'll arrange a replacement or full refund at no extra cost
                </Text>
              </View>
            </View>

            {/* Exchange Policy */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconWrap}>
                  <Ionicons name="swap-horizontal" size={rf(20)} color={COLORS.primary} />
                </View>
                <Text style={styles.sectionTitle}>Exchange Policy</Text>
              </View>

              <View style={styles.exchangeNotice}>
                <Ionicons name="information-circle" size={rf(20)} color={COLORS.primary} />
                <Text style={styles.exchangeNoticeText}>
                  We currently do not support direct exchanges
                </Text>
              </View>
              <Text style={styles.bodyText}>
                You may return your item and place a new order for the desired product.
              </Text>
            </View>

            {/* CTA */}
            <View style={styles.card}>
              <Text style={styles.ctaTitle}>Need Help With Returns?</Text>
              <Text style={styles.ctaText}>
                Our support team is here to help you with any questions about returns, refunds, or delivery issues.
              </Text>
              <TouchableOpacity style={styles.emailButton} onPress={handleContactSupport} activeOpacity={0.85}>
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
            </View>

            {/* Update + Footer */}
            <View style={styles.updateSection}>
              <Text style={styles.updateText}>Last updated: October 21, 2025</Text>
            </View>
            <View style={styles.footer}>
              <Text style={styles.footerText}>BabaHub – Your trusted shopping partner</Text>
            </View>

          </View>
        </ScrollView>
      </View>

      {Platform.OS === 'ios' && <View style={styles.navigationBarSpacer} />}
    </View>
  );
};

/* ── Reusable sub-components ── */

const CheckItem = ({ icon, color, text }) => (
  <View style={styles.checkRow}>
    <Ionicons name={icon} size={rf(16)} color={color} />
    <Text style={styles.checkText}>{text}</Text>
  </View>
);

const StepItem = ({ number, title, desc, last }) => (
  <View style={[styles.stepRow, last && { marginBottom: 0 }]}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDesc}>{desc}</Text>
    </View>
  </View>
);

const RefundPoint = ({ text }) => (
  <View style={styles.refundPointRow}>
    <Ionicons name="arrow-forward" size={rf(16)} color={COLORS.primary} />
    <Text style={styles.refundPointText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: COLORS.white },
  container: { flex: 1, backgroundColor: COLORS.background },

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
  placeholder: { width: rw(10) },

  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: rh(4) },

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
    marginBottom: rh(0.8),
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: rf(14),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: rf(22),
    fontWeight: '500',
  },

  content: {
    paddingHorizontal: rw(4),
    paddingTop: rh(2),
  },

  // Card
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
    marginTop: rh(1),
  },

  // Highlight box
  highlightBox: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: rw(3),
    padding: rw(4),
    marginBottom: rh(1.5),
    alignItems: 'center',
  },
  eligibilityPeriod: {
    fontSize: rf(15),
    fontWeight: '700',
    color: COLORS.dark,
    textAlign: 'center',
  },
  highlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  subsectionTitle: {
    fontSize: rf(13),
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: rh(0.8),
  },

  // Check rows
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: rw(2.5),
    marginBottom: rh(0.8),
  },
  checkText: {
    fontSize: rf(13),
    color: COLORS.darkLight,
    flex: 1,
    lineHeight: rf(20),
  },

  // Non-returnable
  nonReturnableBox: {
    backgroundColor: COLORS.light,
    borderRadius: rw(3),
    padding: rw(4),
    marginTop: rh(1.5),
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  nonReturnableTitle: {
    fontSize: rf(13),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: rh(0.8),
  },

  // Steps
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: rw(3),
    marginBottom: rh(2),
  },
  stepNumber: {
    width: rw(8),
    height: rw(8),
    borderRadius: rw(4),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: rf(14),
    fontWeight: '700',
    color: COLORS.white,
  },
  stepContent: { flex: 1 },
  stepTitle: {
    fontSize: rf(15),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: rh(0.4),
  },
  stepDesc: {
    fontSize: rf(13),
    color: COLORS.gray,
    lineHeight: rf(20),
  },
  bold: { fontWeight: '700' },

  // Refund
  refundTimelineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    borderRadius: rw(3),
    padding: rw(4),
    gap: rw(3),
    marginBottom: rh(1.5),
  },
  refundTimelineText: {
    fontSize: rf(14),
    fontWeight: '600',
    color: COLORS.dark,
    flex: 1,
    lineHeight: rf(22),
  },
  refundDetails: { gap: rh(1) },
  refundPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: rw(2.5),
  },
  refundPointText: {
    fontSize: rf(13),
    color: COLORS.darkLight,
    flex: 1,
    lineHeight: rf(20),
  },

  // Warning
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.warning + '15',
    padding: rw(4),
    borderRadius: rw(3),
    gap: rw(3),
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
    marginBottom: rh(0.5),
  },
  warningText: {
    fontSize: rf(13),
    fontWeight: '600',
    color: COLORS.warning,
    flex: 1,
    lineHeight: rf(20),
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(2.5),
    marginBottom: rh(1),
  },
  requirementIconWrap: {
    width: rw(7),
    height: rw(7),
    borderRadius: rw(2),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requirementText: {
    fontSize: rf(13),
    color: COLORS.darkLight,
    flex: 1,
    lineHeight: rf(20),
  },
  resolutionBox: {
    backgroundColor: COLORS.success + '10',
    padding: rw(4),
    borderRadius: rw(3),
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
    marginTop: rh(1.5),
  },
  resolutionTitle: {
    fontSize: rf(13),
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: rh(0.4),
  },
  resolutionText: {
    fontSize: rf(13),
    color: COLORS.darkLight,
    lineHeight: rf(20),
  },

  // Exchange
  exchangeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: rw(4),
    borderRadius: rw(3),
    gap: rw(3),
    marginBottom: rh(0.5),
  },
  exchangeNoticeText: {
    fontSize: rf(14),
    fontWeight: '700',
    color: COLORS.primary,
    flex: 1,
  },

  // CTA
  ctaTitle: {
    fontSize: rf(18),
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: rh(0.8),
    textAlign: 'center',
  },
  ctaText: {
    fontSize: rf(14),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: rf(22),
    marginBottom: rh(2),
  },

  // Email button — pill-shaped, matches app standard
  emailButton: {
    backgroundColor: COLORS.primary,
    borderRadius: rw(35),
    paddingVertical: rh(1.8),
    paddingHorizontal: rw(4),
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
  emailButtonText: { flex: 1 },
  emailButtonTitle: {
    fontSize: rf(15),
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: rh(0.2),
  },
  emailButtonSubtitle: {
    fontSize: rf(12),
    color: COLORS.white,
    opacity: 0.9,
  },

  // Footer
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
  footer: {
    alignItems: 'center',
    paddingBottom: rh(1),
  },
  footerText: {
    fontSize: rf(12),
    color: COLORS.grayLight,
    fontStyle: 'italic',
  },

  // iOS spacer
  navigationBarSpacer: { height: 34, backgroundColor: COLORS.white },
});

export default ReturnPolicyScreen;
