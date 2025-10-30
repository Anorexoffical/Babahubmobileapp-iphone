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
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

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

const FAQ_DATA = [
  {
    id: '1',
    question: 'Do you save cart data?',
    answer: 'No, we do not save your cart data permanently. Your cart items are temporarily stored during your current session but will be cleared when you close the app.'
  },
  {
    id: '2',
    question: 'How many days does it take to receive my order?',
    answer: 'Most orders are delivered within 3-4 business days. Delivery times may vary depending on your location and product availability.'
  },
  {
    id: '3',
    question: 'Where can I check my order status?',
    answer: 'You can check your order status in the "Profile" section under "My Orders". You will receive real-time updates about your order delivery status.'
  },
  {
    id: '4',
    question: 'What payment methods do you accept?',
    answer: 'We accept various payment methods including credit/debit cards, mobile money, and cash on delivery. All payments are securely processed.'
  },
  {
    id: '5',
    question: 'Can I cancel my order after placing it?',
    answer: 'Yes, you can cancel your order within 1 hour of placing it. After that, the order enters processing and cannot be cancelled.'
  },
  {
    id: '6',
    question: 'Do you offer refunds for returned items?',
    answer: 'Yes, we offer full refunds for returned items within 7 days of delivery, provided the items are in original condition with tags attached.'
  }
];

const CustomerSupportScreen = () => {
  const navigation = useNavigation();
  const [faqModalVisible, setFaqModalVisible] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('ProfileScreen');
    }
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:babahubsa@gmail.com?subject=Customer Support Request&body=Hello BabaHub Team,');
  };

  const handleCallPress = () => {
    Linking.openURL('tel:0845000000');
  };

  const toggleQuestion = (id) => {
    setExpandedQuestion(expandedQuestion === id ? null : id);
  };

  const renderFAQModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={faqModalVisible}
      onRequestClose={() => setFaqModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setFaqModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Frequently Asked Questions</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setFaqModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={COLORS.dark} />
                </TouchableOpacity>
              </View>

              {/* FAQ List */}
              <ScrollView 
                style={styles.faqList}
                showsVerticalScrollIndicator={false}
              >
                {FAQ_DATA.map((item) => (
                  <View key={item.id} style={styles.faqItem}>
                    <TouchableOpacity 
                      style={styles.faqQuestion}
                      onPress={() => toggleQuestion(item.id)}
                    >
                      <Text style={styles.faqQuestionText}>{item.question}</Text>
                      <Ionicons 
                        name={expandedQuestion === item.id ? "chevron-up" : "chevron-down"} 
                        size={20} 
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

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setFaqModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

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
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="headset" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.heroTitle}>We're Here to Help! 👋</Text>
            <Text style={styles.heroSubtitle}>
              Your satisfaction is our priority. Get instant support for any questions or concerns.
            </Text>
          </View>

          {/* Quick Contact Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flash" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Quick Contact</Text>
            </View>
            
            {/* Email Support */}
            <TouchableOpacity style={[styles.contactCard, styles.emailCard]} onPress={handleEmailPress}>
              <View style={[styles.contactIconContainer, styles.emailIcon]}>
                <Ionicons name="mail" size={24} color={COLORS.white} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactMethod}>Email Support</Text>
                <Text style={styles.contactDetail}>babahubsa@gmail.com</Text>
                <Text style={styles.responseTime}>Response time: Within 2 hours</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Recommended</Text>
              </View>
            </TouchableOpacity>

            {/* Phone Support */}
           
          </View>

          {/* Support Services */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="build" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>How We Can Help You</Text>
            </View>
            
            <View style={styles.servicesGrid}>
              <View style={styles.serviceCard}>
                <View style={[styles.serviceIcon, { backgroundColor: COLORS.primary + '15' }]}>
                  <Ionicons name="cart" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.serviceTitle}>Order Issues</Text>
                <Text style={styles.serviceDesc}>Tracking, returns, refunds</Text>
              </View>
              
              <View style={styles.serviceCard}>
                <View style={[styles.serviceIcon, { backgroundColor: COLORS.accent + '15' }]}>
                  <Ionicons name="card" size={24} color={COLORS.accent} />
                </View>
                <Text style={styles.serviceTitle}>Payment Help</Text>
                <Text style={styles.serviceDesc}>Billing & payment issues</Text>
              </View>
              
              <View style={styles.serviceCard}>
                <View style={[styles.serviceIcon, { backgroundColor: COLORS.secondary + '15' }]}>
                  <Ionicons name="person" size={24} color={COLORS.secondary} />
                </View>
                <Text style={styles.serviceTitle}>Account Help</Text>
                <Text style={styles.serviceDesc}>Login & profile issues</Text>
              </View>
              
              <View style={styles.serviceCard}>
                <View style={[styles.serviceIcon, { backgroundColor: COLORS.warning + '15' }]}>
                  <Ionicons name="cube" size={24} color={COLORS.warning} />
                </View>
                <Text style={styles.serviceTitle}>Product Info</Text>
                <Text style={styles.serviceDesc}>Details & recommendations</Text>
              </View>
            </View>
          </View>

          {/* FAQ Section */}
          <TouchableOpacity style={styles.faqSection} onPress={() => setFaqModalVisible(true)}>
            <View style={styles.faqContent}>
              <View style={styles.faqIconContainer}>
                <Ionicons name="help-circle" size={32} color={COLORS.primary} />
              </View>
              <View style={styles.faqText}>
                <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
                <Text style={styles.faqSubtitle}>Quick answers to common questions</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
            </View>
          </TouchableOpacity>

          {/* Support Hours */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Support Hours</Text>
            </View>
            
            <View style={styles.hoursContainer}>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursDay}>Monday - Saturday</Text>
                <View style={styles.hoursTimeBadge}>
                  <Text style={styles.hoursTime}>8:00 AM - 6:00 PM</Text>
                </View>
              </View>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursDay}>Sunday & Holidays</Text>
                <View style={[styles.hoursTimeBadge, styles.emergencyBadge]}>
                  <Text style={styles.emergencyText}>Email Support Only</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Final CTA */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>Need Immediate Help?</Text>
            <Text style={styles.ctaText}>
              Don't hesitate to reach out. Our team is ready to assist you with any issues or questions during our support hours.
            </Text>
            <TouchableOpacity style={[styles.ctaButton, styles.emailButton]} onPress={handleEmailPress}>
              <Ionicons name="mail" size={20} color={COLORS.white} />
              <Text style={styles.ctaButtonText}>Contact Through Email</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* FAQ Modal */}
      {renderFAQModal()}

      {/* White Navigation Bar Spacer for iOS */}
      {Platform.OS === 'ios' && <View style={styles.navigationBarSpacer} />}
    </View>
  );
};

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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : height * 0.06,
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
    fontSize: width < 400 ? 18 : 20,
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
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: height * 0.04,
    paddingHorizontal: width * 0.05,
    backgroundColor: COLORS.white,
    marginHorizontal: Math.max(width * 0.03, 10),
    marginTop: height * 0.03,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: width < 400 ? 20 : 24,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: width < 400 ? 14 : 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: Math.max(width * 0.03, 10),
    marginBottom: width * 0.04,
    borderRadius: 20,
    padding: Math.max(width * 0.04, 15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: width < 400 ? 16 : 18,
    fontWeight: '700',
    color: COLORS.dark,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.light,
    minHeight: 80,
  },
  emailCard: {
    backgroundColor: COLORS.primary + '08',
    borderColor: COLORS.primary + '30',
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  emailIcon: {
    backgroundColor: COLORS.primary,
  },
  phoneIcon: {
    backgroundColor: COLORS.accent + '15',
  },
  contactInfo: {
    flex: 1,
  },
  contactMethod: {
    fontSize: width < 400 ? 14 : 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 2,
  },
  contactDetail: {
    fontSize: width < 400 ? 13 : 15,
    color: COLORS.darkLight,
    marginBottom: 4,
  },
  responseTime: {
    fontSize: width < 400 ? 12 : 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: width < 400 ? 10 : 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: width < 400 ? '48%' : '48%',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    minHeight: 120,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: width < 400 ? 13 : 15,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
    textAlign: 'center',
  },
  serviceDesc: {
    fontSize: width < 400 ? 11 : 13,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 16,
  },
  faqSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: Math.max(width * 0.03, 10),
    marginBottom: width * 0.04,
    borderRadius: 20,
    padding: Math.max(width * 0.04, 15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  faqContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  faqText: {
    flex: 1,
  },
  faqTitle: {
    fontSize: width < 400 ? 16 : 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  faqSubtitle: {
    fontSize: width < 400 ? 13 : 15,
    color: COLORS.gray,
  },
  hoursContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
  },
  hoursRow: {
    flexDirection: width < 400 ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: width < 400 ? 'flex-start' : 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
    gap: width < 400 ? 8 : 0,
  },
  hoursDay: {
    fontSize: width < 400 ? 14 : 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  hoursTimeBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  hoursTime: {
    fontSize: width < 400 ? 13 : 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emergencyBadge: {
    backgroundColor: COLORS.warning + '15',
  },
  emergencyText: {
    fontSize: width < 400 ? 13 : 15,
    fontWeight: '600',
    color: COLORS.warning,
  },
  ctaSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: Math.max(width * 0.03, 10),
    borderRadius: 20,
    padding: Math.max(width * 0.04, 15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  ctaTitle: {
    fontSize: width < 400 ? 18 : 20,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: width < 400 ? 14 : 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    gap: 8,
    minHeight: 56,
  },
  emailButton: {
    backgroundColor: COLORS.primary,
  },
  ctaButtonText: {
    fontSize: width < 400 ? 16 : 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 25,
    width: '100%',
    maxWidth: 500,
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
    backgroundColor: COLORS.background,
  },
  modalTitle: {
    fontSize: width < 400 ? 18 : 20,
    fontWeight: '800',
    color: COLORS.dark,
    flex: 1,
  },
  closeButton: {
    padding: 4,
    borderRadius: 12,
  },
  faqList: {
    maxHeight: height * 0.5,
    padding: 16,
  },
  faqItem: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: width < 400 ? 14 : 16,
    fontWeight: '600',
    color: COLORS.dark,
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
  },
  faqAnswerText: {
    fontSize: width < 400 ? 13 : 15,
    color: COLORS.gray,
    lineHeight: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 16,
    minWidth: 120,
  },
  cancelButtonText: {
    fontSize: width < 400 ? 14 : 16,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  // White Navigation Bar Spacer for iOS
  navigationBarSpacer: {
    height: Platform.OS === 'ios' ? 34 : 0,
    backgroundColor: COLORS.white,
  },
});

export default CustomerSupportScreen;