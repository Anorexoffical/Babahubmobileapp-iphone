import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Linking,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Responsive sizing — consistent with login/profile/PrivacyPolicy
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

const FAQ_DATA = [
  {
    id: '1',
    question: 'Do you save cart data?',
    answer: 'No, we do not save your cart data permanently. Your cart items are temporarily stored during your current session but will be cleared when you close the app.',
  },
  {
    id: '2',
    question: 'How many days does it take to receive my order?',
    answer: 'Most orders are delivered within 3-4 business days. Delivery times may vary depending on your location and product availability.',
  },
  {
    id: '3',
    question: 'Where can I check my order status?',
    answer: 'You can check your order status in the "Profile" section under "My Orders". You will receive real-time updates about your order delivery status.',
  },
  {
    id: '4',
    question: 'What payment methods do you accept?',
    answer: 'We accept various payment methods including credit/debit cards, mobile money, and cash on delivery. All payments are securely processed.',
  },
  {
    id: '5',
    question: 'Can I cancel my order after placing it?',
    answer: 'Yes, you can cancel your order within 1 hour of placing it. After that, the order enters processing and cannot be cancelled.',
  },
  {
    id: '6',
    question: 'Do you offer refunds for returned items?',
    answer: 'Yes, we offer full refunds for returned items within 7 days of delivery, provided the items are in original condition with tags attached.',
  },
];

const CustomerSupportScreen = () => {
  const navigation = useNavigation();
  const [faqModalVisible, setFaqModalVisible] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('ProfileScreen');
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:babahubsa@gmail.com?subject=Customer Support Request&body=Hello BabaHub Team,');
  };

  const toggleQuestion = (id) => {
    setExpandedQuestion(expandedQuestion === id ? null : id);
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
              <Text style={styles.headerTitle}>Customer Support</Text>
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
              <Ionicons name="headset" size={rf(36)} color={COLORS.primary} />
            </View>
            <Text style={styles.heroTitle}>We're Here to Help! 👋</Text>
            <Text style={styles.heroSubtitle}>
              Your satisfaction is our priority. Get instant support for any questions or concerns.
            </Text>
          </View>

          {/* Quick Contact */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <Ionicons name="flash" size={rf(20)} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>Quick Contact</Text>
            </View>

            <TouchableOpacity style={styles.contactCard} onPress={handleEmailPress} activeOpacity={0.85}>
              <View style={styles.contactIconCircle}>
                <Ionicons name="mail" size={rf(22)} color={COLORS.white} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactMethod}>Email Support</Text>
                <Text style={styles.contactDetail}>babahubsa@gmail.com</Text>
                <Text style={styles.responseTime}>Response time: Within 2 hours</Text>
              </View>
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Recommended</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Services Grid */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <Ionicons name="build" size={rf(20)} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>How We Can Help You</Text>
            </View>

            <View style={styles.gridRow}>
              <ServiceCard icon="cart" color={COLORS.primary} title="Order Issues" desc="Tracking, returns, refunds" />
              <ServiceCard icon="card" color={COLORS.accent} title="Payment Help" desc="Billing & payment issues" />
            </View>
            <View style={styles.gridRow}>
              <ServiceCard icon="person" color={COLORS.secondary} title="Account Help" desc="Login & profile issues" />
              <ServiceCard icon="cube" color={COLORS.warning} title="Product Info" desc="Details & recommendations" />
            </View>
          </View>

          {/* FAQ */}
          <TouchableOpacity style={styles.card} onPress={() => setFaqModalVisible(true)} activeOpacity={0.85}>
            <View style={styles.faqRow}>
              <View style={styles.faqIconWrap}>
                <Ionicons name="help-circle" size={rf(30)} color={COLORS.primary} />
              </View>
              <View style={styles.faqTextWrap}>
                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                <Text style={styles.faqSubtitle}>Quick answers to common questions</Text>
              </View>
              <Ionicons name="chevron-forward" size={rf(22)} color={COLORS.primary} />
            </View>
          </TouchableOpacity>

          {/* Support Hours */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <Ionicons name="time" size={rf(20)} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>Support Hours</Text>
            </View>

            <View style={styles.hoursContainer}>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursDay}>Monday – Saturday</Text>
                <View style={styles.hoursTimeBadge}>
                  <Text style={styles.hoursTime}>8:00 AM – 6:00 PM</Text>
                </View>
              </View>
              <View style={[styles.hoursRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.hoursDay}>Sunday & Holidays</Text>
                <View style={[styles.hoursTimeBadge, styles.emergencyBadge]}>
                  <Text style={styles.emergencyText}>Email Only</Text>
                </View>
              </View>
            </View>
          </View>

          {/* CTA */}
          <View style={styles.card}>
            <Text style={styles.ctaTitle}>Need Immediate Help?</Text>
            <Text style={styles.ctaText}>
              Don't hesitate to reach out. Our team is ready to assist you during support hours.
            </Text>
            <TouchableOpacity style={styles.emailButton} onPress={handleEmailPress} activeOpacity={0.85}>
              <View style={styles.emailButtonInner}>
                <View style={styles.emailIconWrap}>
                  <Ionicons name="mail" size={rf(22)} color={COLORS.white} />
                </View>
                <View style={styles.emailButtonText}>
                  <Text style={styles.emailButtonTitle}>Contact Through Email</Text>
                  <Text style={styles.emailButtonSubtitle}>babahubsa@gmail.com</Text>
                </View>
                <Ionicons name="chevron-forward" size={rf(20)} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer note */}
          <View style={styles.updateSection}>
            <Text style={styles.updateText}>BabaHub – Your trusted shopping companion</Text>
          </View>
        </ScrollView>
      </View>

      {/* FAQ Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={faqModalVisible}
        onRequestClose={() => setFaqModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setFaqModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Frequently Asked Questions</Text>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setFaqModalVisible(false)}>
                    <Ionicons name="close" size={rf(22)} color={COLORS.dark} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.faqList} showsVerticalScrollIndicator={false}>
                  {FAQ_DATA.map((item) => (
                    <View key={item.id} style={styles.faqItem}>
                      <TouchableOpacity style={styles.faqQuestion} onPress={() => toggleQuestion(item.id)}>
                        <Text style={styles.faqQuestionText}>{item.question}</Text>
                        <Ionicons
                          name={expandedQuestion === item.id ? 'chevron-up' : 'chevron-down'}
                          size={rf(20)}
                          color={COLORS.primary}
                        />
                      </TouchableOpacity>
                      {expandedQuestion === item.id && (
                        <View style={styles.faqAnswer}>
                          <Text style={styles.faqAnswerText}>{item.answer}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity style={styles.closeModalButton} onPress={() => setFaqModalVisible(false)}>
                    <Text style={styles.closeModalButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {Platform.OS === 'ios' && <View style={styles.navigationBarSpacer} />}
    </View>
  );
};

/* ── Reusable sub-component ── */
const ServiceCard = ({ icon, color, title, desc }) => (
  <View style={styles.serviceCard}>
    <View style={[styles.serviceIconWrap, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={rf(24)} color={color} />
    </View>
    <Text style={styles.serviceTitle}>{title}</Text>
    <Text style={styles.serviceDesc}>{desc}</Text>
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

  // Scroll
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

  // Card
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: rw(4),
    marginTop: rh(2),
    borderRadius: rw(4),
    padding: rw(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.light,
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

  // Contact card
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '08',
    padding: rw(4),
    borderRadius: rw(3),
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  contactIconCircle: {
    width: rw(12),
    height: rw(12),
    borderRadius: rw(6),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: rw(3),
  },
  contactInfo: { flex: 1 },
  contactMethod: {
    fontSize: rf(15),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: rh(0.3),
  },
  contactDetail: {
    fontSize: rf(13),
    color: COLORS.darkLight,
    marginBottom: rh(0.3),
  },
  responseTime: {
    fontSize: rf(12),
    color: COLORS.gray,
    fontWeight: '500',
  },
  recommendedBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: rw(2.5),
    paddingVertical: rh(0.5),
    borderRadius: rw(2),
    marginLeft: rw(2),
  },
  recommendedText: {
    fontSize: rf(11),
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Services grid
  gridRow: {
    flexDirection: 'row',
    gap: rw(3),
    marginBottom: rw(3),
  },
  serviceCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: rw(3),
    padding: rw(3.5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  serviceIconWrap: {
    width: rw(12),
    height: rw(12),
    borderRadius: rw(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: rh(0.8),
  },
  serviceTitle: {
    fontSize: rf(13),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: rh(0.4),
    textAlign: 'center',
  },
  serviceDesc: {
    fontSize: rf(12),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: rf(17),
  },

  // FAQ row
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(3),
  },
  faqIconWrap: {
    width: rw(14),
    height: rw(14),
    borderRadius: rw(7),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqTextWrap: { flex: 1 },
  faqSubtitle: {
    fontSize: rf(13),
    color: COLORS.gray,
    marginTop: rh(0.3),
    fontWeight: '500',
  },

  // Support hours
  hoursContainer: {
    backgroundColor: COLORS.background,
    borderRadius: rw(3),
    paddingHorizontal: rw(4),
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: rh(1.5),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  hoursDay: {
    fontSize: rf(14),
    fontWeight: '600',
    color: COLORS.dark,
    flex: 1,
  },
  hoursTimeBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: rw(3),
    paddingVertical: rh(0.6),
    borderRadius: rw(2),
  },
  hoursTime: {
    fontSize: rf(13),
    fontWeight: '600',
    color: COLORS.primary,
  },
  emergencyBadge: { backgroundColor: COLORS.warning + '15' },
  emergencyText: {
    fontSize: rf(13),
    fontWeight: '600',
    color: COLORS.warning,
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
    marginBottom: rh(2),
    lineHeight: rf(22),
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
    paddingVertical: rh(2),
    paddingHorizontal: rw(4),
    marginTop: rh(1),
  },
  updateText: {
    fontSize: rf(12),
    color: COLORS.grayLight,
    fontStyle: 'italic',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: rw(5),
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: rw(5),
    width: '100%',
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: rw(4),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
    backgroundColor: COLORS.background,
  },
  modalTitle: {
    fontSize: rf(16),
    fontWeight: '800',
    color: COLORS.dark,
    flex: 1,
  },
  closeButton: {
    padding: rw(1),
    borderRadius: rw(2),
  },
  faqList: {
    maxHeight: height * 0.5,
    padding: rw(4),
  },
  faqItem: {
    marginBottom: rh(1),
    borderRadius: rw(3),
    backgroundColor: COLORS.background,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: rw(4),
  },
  faqQuestionText: {
    fontSize: rf(14),
    fontWeight: '600',
    color: COLORS.dark,
    flex: 1,
    marginRight: rw(3),
    lineHeight: rf(20),
  },
  faqAnswer: {
    padding: rw(4),
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
  },
  faqAnswerText: {
    fontSize: rf(13),
    color: COLORS.gray,
    lineHeight: rf(20),
  },
  modalFooter: {
    padding: rw(4),
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    alignItems: 'center',
  },
  closeModalButton: {
    backgroundColor: COLORS.primary,
    borderRadius: rw(35),
    paddingVertical: rh(1.8),
    paddingHorizontal: rw(10),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  closeModalButtonText: {
    fontSize: rf(15),
    fontWeight: '700',
    color: COLORS.white,
  },

  // iOS spacer
  navigationBarSpacer: { height: 34, backgroundColor: COLORS.white },
});

export default CustomerSupportScreen;
