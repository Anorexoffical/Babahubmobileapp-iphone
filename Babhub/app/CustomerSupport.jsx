import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar, 
  Linking,
  SafeAreaView 
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

const CustomerSupportScreen = () => {
  const navigation = useNavigation();

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

  const handleWhatsAppPress = () => {
    const message = "Hello BabaHub Support, I need assistance with:";
    const url = `https://wa.me/27845000000?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      alert('WhatsApp is not installed on your device');
    });
  };

  const handleFAQPress = () => {
    navigation.navigate('FAQScreen');
  };

  const handlePrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
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
          
          {/* WhatsApp Support */}
          <TouchableOpacity style={[styles.contactCard, styles.whatsappCard]} onPress={handleWhatsAppPress}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="logo-whatsapp" size={28} color={COLORS.white} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactMethod}>WhatsApp Support</Text>
              <Text style={styles.contactDetail}>Instant messaging support</Text>
              <Text style={styles.responseTime}>• Quick response • 24/7 available</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Fastest</Text>
            </View>
          </TouchableOpacity>

          {/* Email Support */}
          <TouchableOpacity style={styles.contactCard} onPress={handleEmailPress}>
            <View style={[styles.contactIconContainer, styles.emailIcon]}>
              <Ionicons name="mail" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactMethod}>Email Support</Text>
              <Text style={styles.contactDetail}>babahubsa@gmail.com</Text>
              <Text style={styles.responseTime}>Response time: Within 2 hours</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>

          {/* Phone Support */}
          <TouchableOpacity style={styles.contactCard} onPress={handleCallPress}>
            <View style={[styles.contactIconContainer, styles.phoneIcon]}>
              <Ionicons name="call" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactMethod}>Phone Support</Text>
              <Text style={styles.contactDetail}>084 500 0000</Text>
              <Text style={styles.responseTime}>Mon-Fri: 8AM-6PM • Sat: 9AM-2PM</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>
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
        <TouchableOpacity style={styles.faqSection} onPress={handleFAQPress}>
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
              <Text style={styles.hoursDay}>Monday - Friday</Text>
              <View style={styles.hoursTimeBadge}>
                <Text style={styles.hoursTime}>8:00 AM - 6:00 PM</Text>
              </View>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Saturday</Text>
              <View style={styles.hoursTimeBadge}>
                <Text style={styles.hoursTime}>9:00 AM - 2:00 PM</Text>
              </View>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Sunday & Holidays</Text>
              <View style={[styles.hoursTimeBadge, styles.emergencyBadge]}>
                <Text style={styles.emergencyText}>Emergency Support</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Privacy & Security */}
        <View style={styles.securitySection}>
          <View style={styles.securityHeader}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.white} />
            <Text style={styles.securityTitle}>Your Privacy & Security</Text>
          </View>
          <Text style={styles.securityText}>
            We protect your personal information and ensure secure communication. 
            All your data is encrypted and never shared with third parties.
          </Text>
          <TouchableOpacity style={styles.privacyButton} onPress={handlePrivacyPolicy}>
            <Text style={styles.privacyButtonText}>View Privacy Policy</Text>
            <Ionicons name="lock-closed" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Final CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Need Immediate Help?</Text>
          <Text style={styles.ctaText}>
            Don't hesitate to reach out. Our team is ready to assist you with any issues or questions.
          </Text>
          <View style={styles.ctaButtons}>
            <TouchableOpacity style={[styles.ctaButton, styles.whatsappButton]} onPress={handleWhatsAppPress}>
              <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} />
              <Text style={styles.ctaButtonText}>Chat on WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ctaButton, styles.callButton]} onPress={handleCallPress}>
              <Ionicons name="call" size={20} color={COLORS.white} />
              <Text style={styles.ctaButtonText}>Call Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: height * 0.04,
    paddingHorizontal: width * 0.05,
    backgroundColor: COLORS.white,
    marginHorizontal: width * 0.05,
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
    fontSize: width * 0.06,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: width * 0.038,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: width * 0.05,
    marginBottom: width * 0.04,
    borderRadius: 20,
    padding: width * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: width * 0.04,
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
  },
  whatsappCard: {
    backgroundColor: '#25D366',
    borderColor: '#25D366',
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
    backgroundColor: COLORS.primary + '15',
  },
  phoneIcon: {
    backgroundColor: COLORS.accent + '15',
  },
  contactInfo: {
    flex: 1,
  },
  contactMethod: {
    fontSize: width * 0.038,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 2,
  },
  contactDetail: {
    fontSize: width * 0.035,
    color: COLORS.darkLight,
    marginBottom: 4,
  },
  responseTime: {
    fontSize: width * 0.032,
    color: COLORS.gray,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: width * 0.03,
    fontWeight: '700',
    color: '#25D366',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
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
    fontSize: width * 0.035,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
    textAlign: 'center',
  },
  serviceDesc: {
    fontSize: width * 0.032,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 16,
  },
  faqSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: width * 0.05,
    marginBottom: width * 0.04,
    borderRadius: 20,
    padding: width * 0.05,
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
    fontSize: width * 0.04,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  faqSubtitle: {
    fontSize: width * 0.035,
    color: COLORS.gray,
  },
  hoursContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  hoursDay: {
    fontSize: width * 0.035,
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
    fontSize: width * 0.035,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emergencyBadge: {
    backgroundColor: COLORS.warning + '15',
  },
  emergencyText: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: COLORS.warning,
  },
  securitySection: {
    backgroundColor: COLORS.primary,
    marginHorizontal: width * 0.05,
    marginBottom: width * 0.04,
    borderRadius: 20,
    padding: width * 0.05,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  securityTitle: {
    fontSize: width * 0.04,
    fontWeight: '700',
    color: COLORS.white,
  },
  securityText: {
    fontSize: width * 0.035,
    color: COLORS.white,
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: 15,
  },
  privacyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 8,
  },
  privacyButtonText: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: COLORS.primary,
  },
  ctaSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: width * 0.05,
    borderRadius: 20,
    padding: width * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: width * 0.045,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: width * 0.038,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    flex: 1,
    gap: 8,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  callButton: {
    backgroundColor: COLORS.primary,
  },
  ctaButtonText: {
    fontSize: width * 0.038,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default CustomerSupportScreen;