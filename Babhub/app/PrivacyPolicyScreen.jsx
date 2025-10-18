import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar,
  SafeAreaView,
  Linking 
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
    Linking.openURL('mailto:babahubsa@gmail.com');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:0845000000');
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {/* Premium Header - Same as CustomerSupportScreen */}
      <View style={styles.header}>
        <View style={styles.headerBackground}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
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
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.heroTitle}>Privacy Policy</Text>
          <Text style={styles.heroSubtitle}>Your Privacy Matters to Us</Text>
          <Text style={styles.lastUpdated}>Last Updated: December 2024</Text>
        </View>

        <View style={styles.content}>
          {/* Introduction */}
          <View style={styles.introSection}>
            <Text style={styles.introText}>
              At <Text style={styles.brandText}>BabaHub</Text>, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our e-commerce application.
            </Text>
          </View>

          {/* Section 1 - Information Collection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="person-circle" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            </View>
            
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Personal Information for Account Creation:</Text>
              <View style={styles.bulletItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.bulletText}>
                  <Text style={styles.highlight}>Full Name</Text> - For order processing and personalization
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.bulletText}>
                  <Text style={styles.highlight}>Email Address</Text> - For account verification and communication
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.bulletText}>
                  <Text style={styles.highlight}>Date of Birth</Text> - For age verification and personalized offers
                </Text>
              </View>
            </View>

            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Checkout Information:</Text>
              <View style={styles.bulletItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.bulletText}>
                  <Text style={styles.highlight}>Shipping Address</Text> - For product delivery
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.bulletText}>
                  <Text style={styles.highlight}>Phone Number</Text> - For delivery coordination and updates
                </Text>
              </View>
            </View>

            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Payment Information:</Text>
              <View style={styles.bulletItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.bulletText}>
                  <Text style={styles.highlight}>Card Details</Text> - Processed securely through PayFast, <Text style={styles.emphasis}>NOT stored</Text> on our servers
                </Text>
              </View>
            </View>
          </View>

          {/* Section 2 - Data Security */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="lock-closed" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>2. Data Security & Encryption</Text>
            </View>
            
            <Text style={styles.sectionText}>
              We implement industry-standard security measures to protect your data:
            </Text>
            
            <View style={styles.securityGrid}>
              <View style={styles.securityItem}>
                <Ionicons name="shield-checkmark" size={24} color={COLORS.success} />
                <Text style={styles.securityTitle}>End-to-End Encryption</Text>
                <Text style={styles.securityText}>All personal data encrypted using AES-256</Text>
              </View>
              <View style={styles.securityItem}>
                <Ionicons name="server" size={24} color={COLORS.primary} />
                <Text style={styles.securityTitle}>Secure Storage</Text>
                <Text style={styles.securityText}>Data stored in secure, access-controlled databases</Text>
              </View>
              <View style={styles.securityItem}>
                <Ionicons name="card" size={24} color={COLORS.warning} />
                <Text style={styles.securityTitle}>Payment Security</Text>
                <Text style={styles.securityText}>Card details processed externally via PayFast</Text>
              </View>
              <View style={styles.securityItem}>
                <Ionicons name="eye-off" size={24} color={COLORS.error} />
                <Text style={styles.securityTitle}>No Third-Party Sharing</Text>
                <Text style={styles.securityText}>We do not sell or share your personal data</Text>
              </View>
            </View>
          </View>

          {/* Section 3 - Data Usage */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="business" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
            </View>
            
            <View style={styles.usageList}>
              <View style={styles.usageItem}>
                <Ionicons name="cart" size={18} color={COLORS.primary} />
                <Text style={styles.usageText}>Order processing and fulfillment</Text>
              </View>
              <View style={styles.usageItem}>
                <Ionicons name="navigate" size={18} color={COLORS.primary} />
                <Text style={styles.usageText}>Order tracking and delivery updates</Text>
              </View>
              <View style={styles.usageItem}>
                <Ionicons name="chatbubble" size={18} color={COLORS.primary} />
                <Text style={styles.usageText}>Customer support and communication</Text>
              </View>
              <View style={styles.usageItem}>
                <Ionicons name="notifications" size={18} color={COLORS.primary} />
                <Text style={styles.usageText}>Order status notifications</Text>
              </View>
              <View style={styles.usageItem}>
                <Ionicons name="trending-up" size={18} color={COLORS.primary} />
                <Text style={styles.usageText}>Service improvement and analytics</Text>
              </View>
            </View>
          </View>

          {/* Section 4 - Third-Party Services */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="git-network" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>4. Third-Party Services</Text>
            </View>
            
            <Text style={styles.sectionText}>
              We work with trusted partners to provide our services:
            </Text>
            
            <View style={styles.thirdPartyCard}>
              <View style={styles.partnerItem}>
                <Ionicons name="card" size={20} color={COLORS.success} />
                <View style={styles.partnerInfo}>
                  <Text style={styles.partnerName}>PayFast Payment Gateway</Text>
                  <Text style={styles.partnerDesc}>Secure payment processing - card details never stored with us</Text>
                </View>
              </View>
              <View style={styles.partnerItem}>
                <Ionicons name="cube" size={20} color={COLORS.warning} />
                <View style={styles.partnerInfo}>
                  <Text style={styles.partnerName}>Shipping Partners</Text>
                  <Text style={styles.partnerDesc}>Delivery services receive only necessary delivery information</Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.importantNote}>
              <Ionicons name="warning" size={16} color={COLORS.warning} />
              <Text style={styles.noteText}> We do NOT share your personal data with advertisers or marketing companies</Text>
            </Text>
          </View>

          {/* Section 5 - User Rights */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="people" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>5. Your Rights & Control</Text>
            </View>
            
            <View style={styles.rightsGrid}>
              <View style={styles.rightItem}>
                <Ionicons name="eye" size={20} color={COLORS.primary} />
                <Text style={styles.rightTitle}>Right to Access</Text>
                <Text style={styles.rightText}>View your personal data</Text>
              </View>
              <View style={styles.rightItem}>
                <Ionicons name="create" size={20} color={COLORS.primary} />
                <Text style={styles.rightTitle}>Right to Update</Text>
                <Text style={styles.rightText}>Modify your information</Text>
              </View>
              <View style={styles.rightItem}>
                <Ionicons name="trash" size={20} color={COLORS.primary} />
                <Text style={styles.rightTitle}>Right to Delete</Text>
                <Text style={styles.rightText}>Request account deletion</Text>
              </View>
              <View style={styles.rightItem}>
                <Ionicons name="download" size={20} color={COLORS.primary} />
                <Text style={styles.rightTitle}>Data Portability</Text>
                <Text style={styles.rightText}>Export your data</Text>
              </View>
            </View>
          </View>


          {/* Contact Section */}
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Contact Us</Text>
            <Text style={styles.contactText}>
              For privacy-related questions or to exercise your rights:
            </Text>
            
            <View style={styles.contactMethods}>
              <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
                <Ionicons name="mail" size={20} color={COLORS.primary} />
                <Text style={styles.contactDetail}>babahubsa@gmail.com</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
                <Ionicons name="call" size={20} color={COLORS.primary} />
                <Text style={styles.contactDetail}>084 500 0000</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactItem}>
                <Ionicons name="help-circle" size={20} color={COLORS.primary} />
                <Text style={styles.contactDetail}>In-app Support Center</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Final Note */}
          <View style={styles.finalNote}>
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
            <Text style={styles.finalNoteText}>
              By using BabaHub, you acknowledge that you have read and understood this Privacy Policy. We are committed to continuously improving our privacy practices.
            </Text>
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
  // Updated Header Styles to match CustomerSupportScreen
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
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: height * 0.05,
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
    fontSize: width * 0.07,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 5,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: width * 0.04,
    color: COLORS.gray,
    marginBottom: 8,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: width * 0.032,
    color: COLORS.grayLight,
    fontStyle: 'italic',
  },
  content: {
    padding: width * 0.05,
  },
  introSection: {
    marginBottom: height * 0.03,
    padding: width * 0.04,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  introText: {
    fontSize: width * 0.038,
    color: COLORS.dark,
    lineHeight: 24,
    textAlign: 'center',
  },
  brandText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  section: {
    marginBottom: height * 0.03,
    padding: width * 0.04,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: width * 0.04,
    fontWeight: '700',
    color: COLORS.dark,
    flex: 1,
  },
  sectionText: {
    fontSize: width * 0.036,
    color: COLORS.darkLight,
    lineHeight: 22,
    marginBottom: 15,
  },
  subsection: {
    marginBottom: 15,
  },
  subsectionTitle: {
    fontSize: width * 0.038,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 12,
    marginTop: 8,
  },
  bulletText: {
    fontSize: width * 0.035,
    color: COLORS.darkLight,
    flex: 1,
    lineHeight: 20,
  },
  highlight: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  emphasis: {
    fontWeight: '700',
    color: COLORS.error,
  },
  securityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  securityItem: {
    width: '48%',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  securityTitle: {
    fontSize: width * 0.032,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 8,
    textAlign: 'center',
  },
  securityText: {
    fontSize: width * 0.03,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  usageList: {
    gap: 10,
  },
  usageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  usageText: {
    fontSize: width * 0.035,
    color: COLORS.darkLight,
    marginLeft: 12,
    flex: 1,
  },
  thirdPartyCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
  },
  partnerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  partnerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  partnerName: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  partnerDesc: {
    fontSize: width * 0.033,
    color: COLORS.gray,
    lineHeight: 18,
  },
  importantNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  noteText: {
    fontSize: width * 0.035,
    color: COLORS.dark,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  rightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rightItem: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 12,
  },
  rightTitle: {
    fontSize: width * 0.032,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 8,
    textAlign: 'center',
  },
  rightText: {
    fontSize: width * 0.03,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 4,
  },
  complianceSection: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: width * 0.04,
    marginBottom: height * 0.03,
  },
  complianceTitle: {
    fontSize: width * 0.04,
    fontWeight: '700',
    color: COLORS.white,
    flex: 1,
  },
  complianceList: {
    gap: 12,
    marginTop: 10,
  },
  complianceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  complianceText: {
    fontSize: width * 0.035,
    color: COLORS.white,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: width * 0.04,
    marginBottom: height * 0.03,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  contactTitle: {
    fontSize: width * 0.04,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 10,
  },
  contactText: {
    fontSize: width * 0.036,
    color: COLORS.darkLight,
    marginBottom: 15,
    lineHeight: 22,
  },
  contactMethods: {
    gap: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  contactDetail: {
    fontSize: width * 0.035,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 12,
  },
  finalNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '10',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  finalNoteText: {
    fontSize: width * 0.035,
    color: COLORS.dark,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

export default PrivacyPolicyScreen;