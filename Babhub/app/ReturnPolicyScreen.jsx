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
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Brand Color Palette
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
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('ProfileScreen');
    }
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:babahubsa@gmail.com?subject=Return Policy Inquiry&body=Hello BabaHub Support,');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:0845000000');
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
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="refresh-circle" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.heroTitle}>Return & Refund Policy 🔄</Text>
            <Text style={styles.heroSubtitle}>
              Understanding our policies for returns, refunds, and exchanges
            </Text>
          </View>

          {/* Data Protection Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>How We Store & Protect Your Data</Text>
            </View>
            
            <View style={styles.policyCard}>
              <View style={styles.policyPoint}>
                <View style={styles.pointIcon}>
                  <Ionicons name="lock-closed" size={16} color={COLORS.primary} />
                </View>
                <View style={styles.pointContent}>
                  <Text style={styles.pointTitle}>Secure Data Storage</Text>
                  <Text style={styles.pointDescription}>
                    All your personal and payment information is encrypted and stored securely using industry-standard security protocols.
                  </Text>
                </View>
              </View>

              <View style={styles.policyPoint}>
                <View style={styles.pointIcon}>
                  <Ionicons name="card" size={16} color={COLORS.primary} />
                </View>
                <View style={styles.pointContent}>
                  <Text style={styles.pointTitle}>Payment Protection</Text>
                  <Text style={styles.pointDescription}>
                    We use secure payment gateways that comply with PCI DSS standards. Your payment details are never stored on our servers.
                  </Text>
                </View>
              </View>

              <View style={styles.policyPoint}>
                <View style={styles.pointIcon}>
                  <Ionicons name="eye-off" size={16} color={COLORS.primary} />
                </View>
                <View style={styles.pointContent}>
                  <Text style={styles.pointTitle}>Privacy First</Text>
                  <Text style={styles.pointDescription}>
                    We never share your personal information with third parties without your consent, except as required by law.
                  </Text>
                </View>
              </View>

              <View style={styles.policyPoint}>
                <View style={styles.pointIcon}>
                  <Ionicons name="server" size={16} color={COLORS.primary} />
                </View>
                <View style={styles.pointContent}>
                  <Text style={styles.pointTitle}>Regular Security Audits</Text>
                  <Text style={styles.pointDescription}>
                    Our systems undergo regular security audits and updates to ensure your data remains protected against emerging threats.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Return & Refund Policy Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="return-down-back" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Return & Refund Policy</Text>
            </View>
            
            <View style={styles.policyCard}>
              <View style={styles.warningBanner}>
                <Ionicons name="information-circle" size={20} color={COLORS.warning} />
                <Text style={styles.warningText}>
                  We currently do not accept returns once the order is confirmed and delivered.
                </Text>
              </View>

              <View style={styles.exceptionSection}>
                <Text style={styles.exceptionTitle}>Exceptions for Damaged or Incorrect Items</Text>
                
                <View style={styles.exceptionPoint}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.exceptionText}>
                    If the product is damaged or incorrect upon delivery
                  </Text>
                </View>
                
                <View style={styles.exceptionPoint}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.exceptionText}>
                    Please contact our customer support within 3 days of receiving your order
                  </Text>
                </View>
                
                <View style={styles.exceptionPoint}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.exceptionText}>
                    Provide clear photos of the damaged/incorrect item
                  </Text>
                </View>
                
                <View style={styles.exceptionPoint}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.exceptionText}>
                    Include your order number and delivery details
                  </Text>
                </View>
              </View>

              <View style={styles.noteBox}>
                <Text style={styles.noteTitle}>Important Note:</Text>
                <Text style={styles.noteText}>
                  Refunds are processed within 5-7 business days after approval. The refund will be credited to your original payment method.
                </Text>
              </View>
            </View>
          </View>

          {/* Shipping & Delivery Policy Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cube" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Shipping & Delivery Policy</Text>
            </View>
            
            <View style={styles.policyCard}>
              <View style={styles.deliveryInfo}>
                <View style={styles.deliveryItem}>
                  <View style={styles.deliveryIcon}>
                    <Ionicons name="time" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.deliveryContent}>
                    <Text style={styles.deliveryTitle}>Delivery Timeframe</Text>
                    <Text style={styles.deliveryDescription}>
                      3–7 working days depending on your city and product availability
                    </Text>
                  </View>
                </View>

                <View style={styles.deliveryItem}>
                  <View style={styles.deliveryIcon}>
                    <Ionicons name="business" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.deliveryContent}>
                    <Text style={styles.deliveryTitle}>Trusted Couriers</Text>
                    <Text style={styles.deliveryDescription}>
                      We deliver products through trusted courier services to ensure safe and timely delivery
                    </Text>
                  </View>
                </View>

                <View style={styles.deliveryItem}>
                  <View style={styles.deliveryIcon}>
                    <Ionicons name="notifications" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.deliveryContent}>
                    <Text style={styles.deliveryTitle}>Order Tracking</Text>
                    <Text style={styles.deliveryDescription}>
                      Once your order is shipped, you will receive a confirmation message with tracking details
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.trackingSection}>
                <Text style={styles.trackingTitle}>Track Your Order</Text>
                <Text style={styles.trackingDescription}>
                  You can track your order in real-time through the tracking link provided in your confirmation message.
                </Text>
              </View>
            </View>
          </View>

          {/* Non-Returnable Items */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="close-circle" size={22} color={COLORS.error} />
              <Text style={styles.sectionTitle}>Non-Returnable Items</Text>
            </View>
            
            <View style={styles.policyCard}>
              <View style={styles.nonReturnableList}>
                <View style={styles.nonReturnableItem}>
                  <Ionicons name="close" size={16} color={COLORS.error} />
                  <Text style={styles.nonReturnableText}>Personalized or custom-made products</Text>
                </View>
                <View style={styles.nonReturnableItem}>
                  <Ionicons name="close" size={16} color={COLORS.error} />
                  <Text style={styles.nonReturnableText}>Perishable goods and groceries</Text>
                </View>
                <View style={styles.nonReturnableItem}>
                  <Ionicons name="close" size={16} color={COLORS.error} />
                  <Text style={styles.nonReturnableText}>Intimate hygiene products</Text>
                </View>
                <View style={styles.nonReturnableItem}>
                  <Ionicons name="close" size={16} color={COLORS.error} />
                  <Text style={styles.nonReturnableText}>Digital products and software</Text>
                </View>
                <View style={styles.nonReturnableItem}>
                  <Ionicons name="close" size={16} color={COLORS.error} />
                  <Text style={styles.nonReturnableText}>Products without original packaging</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Contact Support CTA */}
          <View style={styles.ctaSection}>
            <View style={styles.ctaIconContainer}>
              <Ionicons name="help-buoy" size={32} color={COLORS.white} />
            </View>
            <Text style={styles.ctaTitle}>Need Help With Returns?</Text>
            <Text style={styles.ctaText}>
              Our support team is here to help you with any questions about returns, refunds, or delivery issues.
            </Text>
            <View style={styles.ctaButtons}>
              <TouchableOpacity style={[styles.ctaButton, styles.emailButton]} onPress={handleContactSupport}>
                <Ionicons name="mail" size={20} color={COLORS.white} />
                <Text style={styles.ctaButtonText}>Email Support</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ctaButton, styles.callButton]} onPress={handleCallSupport}>
                <Ionicons name="call" size={20} color={COLORS.white} />
                <Text style={styles.ctaButtonText}>Call Support</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Last Updated */}
          <View style={styles.updateSection}>
            <Text style={styles.updateText}>
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </ScrollView>
      </View>

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
  policyCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
  },
  policyPoint: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  pointIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pointContent: {
    flex: 1,
  },
  pointTitle: {
    fontSize: width * 0.038,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  pointDescription: {
    fontSize: width * 0.035,
    color: COLORS.gray,
    lineHeight: 20,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    gap: 10,
  },
  warningText: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: COLORS.warning,
    flex: 1,
    lineHeight: 20,
  },
  exceptionSection: {
    padding: 16,
  },
  exceptionTitle: {
    fontSize: width * 0.038,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 12,
  },
  exceptionPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  exceptionText: {
    fontSize: width * 0.035,
    color: COLORS.gray,
    flex: 1,
    lineHeight: 20,
  },
  noteBox: {
    backgroundColor: COLORS.primary + '10',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  noteTitle: {
    fontSize: width * 0.035,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  noteText: {
    fontSize: width * 0.035,
    color: COLORS.darkLight,
    lineHeight: 20,
  },
  deliveryInfo: {
    padding: 16,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  deliveryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deliveryContent: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: width * 0.038,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  deliveryDescription: {
    fontSize: width * 0.035,
    color: COLORS.gray,
    lineHeight: 20,
  },
  trackingSection: {
    backgroundColor: COLORS.accent + '10',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
  },
  trackingTitle: {
    fontSize: width * 0.038,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: 4,
  },
  trackingDescription: {
    fontSize: width * 0.035,
    color: COLORS.darkLight,
    lineHeight: 20,
  },
  nonReturnableList: {
    padding: 16,
  },
  nonReturnableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  nonReturnableText: {
    fontSize: width * 0.035,
    color: COLORS.gray,
    flex: 1,
    lineHeight: 20,
  },
  ctaSection: {
    backgroundColor: COLORS.primary,
    marginHorizontal: width * 0.05,
    marginBottom: width * 0.04,
    borderRadius: 20,
    padding: width * 0.05,
    alignItems: 'center',
  },
  ctaIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  ctaTitle: {
    fontSize: width * 0.045,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: width * 0.038,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    opacity: 0.9,
  },
  ctaButtons: {
    flexDirection: width < 400 ? 'column' : 'row',
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
    flex: width < 400 ? 0 : 1,
    gap: 8,
    minHeight: 56,
  },
  emailButton: {
    backgroundColor: COLORS.white,
  },
  callButton: {
    backgroundColor: COLORS.accent,
  },
  ctaButtonText: {
    fontSize: width * 0.038,
    fontWeight: '700',
  },
  emailButtonText: {
    color: COLORS.primary,
  },
  callButtonText: {
    color: COLORS.white,
  },
  updateSection: {
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
  },
  updateText: {
    fontSize: width * 0.032,
    color: COLORS.grayLight,
    fontStyle: 'italic',
  },
  // White Navigation Bar Spacer for iOS
  navigationBarSpacer: {
    height: Platform.OS === 'ios' ? 34 : 0,
    backgroundColor: COLORS.white,
  },
});

export default ReturnPolicyScreen;