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
import { responsiveFont, responsiveWidth, responsiveHeight } from '../src/utils/responsive';

const { width, height } = Dimensions.get('window');
const rf = responsiveFont;
const rw = responsiveWidth;
const rh = responsiveHeight;

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

          {/* Thank You Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Thank You for Shopping with BabaHub</Text>
            </View>
            <View style={styles.policyCard}>
              <Text style={styles.welcomeText}>
                We're committed to ensuring your complete satisfaction with every purchase. Please review our return and refund policy below.
              </Text>
            </View>
          </View>

          {/* Returns Eligibility Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Returns Eligibility</Text>
            </View>
            
            <View style={styles.policyCard}>
              <View style={styles.eligibilityInfo}>
                <Text style={styles.eligibilityPeriod}>
                  We accept returns within <Text style={styles.highlight}>7 days</Text> of delivery
                </Text>
                <Text style={styles.eligibilitySubtitle}>
                  The following conditions must be met:
                </Text>
                
                <View style={styles.conditionList}>
                  <View style={styles.conditionItem}>
                    <Ionicons name="checkmark" size={16} color={COLORS.success} />
                    <Text style={styles.conditionText}>
                      Item is unused, unworn, and in its original packaging
                    </Text>
                  </View>
                  <View style={styles.conditionItem}>
                    <Ionicons name="checkmark" size={16} color={COLORS.success} />
                    <Text style={styles.conditionText}>
                      All tags, labels, and accessories are intact
                    </Text>
                  </View>
                  <View style={styles.conditionItem}>
                    <Ionicons name="checkmark" size={16} color={COLORS.success} />
                    <Text style={styles.conditionText}>
                      Proof of purchase (order ID or invoice) is provided
                    </Text>
                  </View>
                </View>
              </View>

              {/* Non-returnable Items */}
              <View style={styles.nonReturnableSection}>
                <Text style={styles.nonReturnableTitle}>Non-returnable Items:</Text>
                <View style={styles.nonReturnableList}>
                  <View style={styles.nonReturnableItem}>
                    <Ionicons name="close" size={16} color={COLORS.error} />
                    <Text style={styles.nonReturnableText}>Perishable goods (e.g., food, beverages)</Text>
                  </View>
                  <View style={styles.nonReturnableItem}>
                    <Ionicons name="close" size={16} color={COLORS.error} />
                    <Text style={styles.nonReturnableText}>Personal care items (e.g., cosmetics, hygiene products)</Text>
                  </View>
                  <View style={styles.nonReturnableItem}>
                    <Ionicons name="close" size={16} color={COLORS.error} />
                    <Text style={styles.nonReturnableText}>Sale or clearance items</Text>
                  </View>
                  <View style={styles.nonReturnableItem}>
                    <Ionicons name="close" size={16} color={COLORS.error} />
                    <Text style={styles.nonReturnableText}>Digital or downloadable products</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Return Process Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="arrow-redo" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Return Process</Text>
            </View>
            
            <View style={styles.policyCard}>
              <View style={styles.processSteps}>
                <View style={styles.processStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Go to My Orders</Text>
                    <Text style={styles.stepDescription}>
                      Navigate to <Text style={styles.bold}>My Orders</Text> → <Text style={styles.bold}>Request Return</Text> in the Baba Hub app
                    </Text>
                  </View>
                </View>

                <View style={styles.processStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Select Item & Reason</Text>
                    <Text style={styles.stepDescription}>
                      Choose the item and provide the reason for return
                    </Text>
                  </View>
                </View>

                <View style={styles.processStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Review Process</Text>
                    <Text style={styles.stepDescription}>
                      Our team will review your request within <Text style={styles.bold}>48 hours</Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.processStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Pickup Arrangement</Text>
                    <Text style={styles.stepDescription}>
                      Once approved, pickup or drop-off will be arranged based on your location
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Refunds Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Refunds</Text>
            </View>
            
            <View style={styles.policyCard}>
              <View style={styles.refundInfo}>
                <View style={styles.refundTimeline}>
                  <Ionicons name="time" size={20} color={COLORS.primary} />
                  <Text style={styles.refundTimelineText}>
                    Refunds processed within <Text style={styles.highlight}>5–7 business days</Text> after approval
                  </Text>
                </View>

                <View style={styles.refundDetails}>
                  <View style={styles.refundPoint}>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                    <Text style={styles.refundPointText}>
                      Refunds will be made to your original payment method (card, bank, or wallet)
                    </Text>
                  </View>
                  <View style={styles.refundPoint}>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                    <Text style={styles.refundPointText}>
                      Shipping and service charges are non-refundable unless the item was damaged or incorrect
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Damaged or Incorrect Items Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="warning" size={22} color={COLORS.warning} />
              <Text style={styles.sectionTitle}>Damaged or Incorrect Items</Text>
            </View>
            
            <View style={styles.policyCard}>
              <View style={styles.warningBanner}>
                <Ionicons name="information-circle" size={20} color={COLORS.warning} />
                <Text style={styles.warningText}>
                  Contact us within 48 hours of delivery for damaged, defective, or wrong items
                </Text>
              </View>

              <View style={styles.damagedItemsInfo}>
                <Text style={styles.damagedItemsTitle}>Required Information:</Text>
                
                <View style={styles.requirementList}>
                  <View style={styles.requirementItem}>
                    <View style={styles.requirementIcon}>
                      <Ionicons name="camera" size={16} color={COLORS.primary} />
                    </View>
                    <Text style={styles.requirementText}>
                      Clear photos of the damaged/incorrect item
                    </Text>
                  </View>
                  
                  <View style={styles.requirementItem}>
                    <View style={styles.requirementIcon}>
                      <Ionicons name="document" size={16} color={COLORS.primary} />
                    </View>
                    <Text style={styles.requirementText}>
                      Your order ID and delivery details
                    </Text>
                  </View>
                </View>

                <View style={styles.resolutionBox}>
                  <Text style={styles.resolutionTitle}>Resolution:</Text>
                  <Text style={styles.resolutionText}>
                    We'll arrange a replacement or full refund at no extra cost
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Exchange Policy Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="swap-horizontal" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Exchange Policy</Text>
            </View>
            
            <View style={styles.policyCard}>
              <View style={styles.exchangeInfo}>
                <View style={styles.exchangeNotice}>
                  <Ionicons name="information-circle" size={24} color={COLORS.primary} />
                  <Text style={styles.exchangeNoticeText}>
                    We currently do not support direct exchanges
                  </Text>
                </View>
                <Text style={styles.exchangeAlternative}>
                  You may return your item and place a new order for the desired product
                </Text>
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
            <TouchableOpacity style={styles.ctaButton} onPress={handleContactSupport}>
              <Ionicons name="mail" size={20} color={COLORS.primary} />
              <Text style={styles.ctaButtonText}>Email Support</Text>
            </TouchableOpacity>
          </View>

          {/* Last Updated - Moved to End */}
          <View style={styles.updateSection}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.grayLight} />
            <Text style={styles.updateText}>
              Last updated: October 21, 2025
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Baba Hub - Your trusted shopping partner
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
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: width * 0.05,
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
    fontSize: width < 400 ? 16 : 18,
    fontWeight: '700',
    color: COLORS.dark,
  },
  policyCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
  },
  welcomeText: {
    fontSize: width < 400 ? 14 : 16,
    color: COLORS.darkLight,
    lineHeight: 22,
    padding: 16,
    textAlign: 'center',
  },
  eligibilityInfo: {
    padding: 16,
  },
  eligibilityPeriod: {
    fontSize: width < 400 ? 16 : 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  eligibilitySubtitle: {
    fontSize: width < 400 ? 14 : 16,
    color: COLORS.gray,
    marginBottom: 16,
    textAlign: 'center',
  },
  conditionList: {
    gap: 12,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  conditionText: {
    fontSize: width < 400 ? 14 : 16,
    color: COLORS.darkLight,
    flex: 1,
    lineHeight: 20,
  },
  nonReturnableSection: {
    backgroundColor: COLORS.light,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight + '30',
  },
  nonReturnableTitle: {
    fontSize: width < 400 ? 14 : 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 12,
  },
  nonReturnableList: {
    gap: 10,
  },
  nonReturnableItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  nonReturnableText: {
    fontSize: width < 400 ? 13 : 15,
    color: COLORS.gray,
    flex: 1,
    lineHeight: 20,
  },
  processSteps: {
    padding: 16,
    gap: 20,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: width < 400 ? 14 : 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: width < 400 ? 14 : 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: width < 400 ? 13 : 15,
    color: COLORS.gray,
    lineHeight: 20,
  },
  refundInfo: {
    padding: 16,
  },
  refundTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  refundTimelineText: {
    fontSize: width < 400 ? 14 : 16,
    fontWeight: '600',
    color: COLORS.dark,
    textAlign: 'center',
    flex: 1,
  },
  refundDetails: {
    gap: 12,
  },
  refundPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  refundPointText: {
    fontSize: width < 400 ? 14 : 16,
    color: COLORS.darkLight,
    flex: 1,
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
    fontSize: width < 400 ? 14 : 16,
    fontWeight: '600',
    color: COLORS.warning,
    flex: 1,
    lineHeight: 20,
  },
  damagedItemsInfo: {
    padding: 16,
  },
  damagedItemsTitle: {
    fontSize: width < 400 ? 14 : 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 12,
  },
  requirementList: {
    gap: 12,
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requirementIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requirementText: {
    fontSize: width < 400 ? 14 : 16,
    color: COLORS.darkLight,
    flex: 1,
    lineHeight: 20,
  },
  resolutionBox: {
    backgroundColor: COLORS.success + '10',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  resolutionTitle: {
    fontSize: width < 400 ? 14 : 16,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: 4,
  },
  resolutionText: {
    fontSize: width < 400 ? 14 : 16,
    color: COLORS.darkLight,
    lineHeight: 20,
  },
  exchangeInfo: {
    padding: 16,
    alignItems: 'center',
  },
  exchangeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 10,
  },
  exchangeNoticeText: {
    fontSize: width < 400 ? 14 : 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  exchangeAlternative: {
    fontSize: width < 400 ? 14 : 16,
    color: COLORS.darkLight,
    textAlign: 'center',
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
    fontSize: width < 400 ? 18 : 20,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: width < 400 ? 14 : 16,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    opacity: 0.9,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    minWidth: '80%',
    gap: 8,
  },
  ctaButtonText: {
    fontSize: width < 400 ? 16 : 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  updateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: width * 0.05,
    marginBottom: width * 0.04,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  updateText: {
    fontSize: width < 400 ? 12 : 14,
    color: COLORS.grayLight,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    marginTop: 10,
  },
  footerText: {
    fontSize: width < 400 ? 12 : 14,
    color: COLORS.grayLight,
    fontStyle: 'italic',
  },
  highlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  bold: {
    fontWeight: '700',
  },
  // White Navigation Bar Spacer for iOS
  navigationBarSpacer: {
    height: Platform.OS === 'ios' ? 34 : 0,
    backgroundColor: COLORS.white,
  },
});

export default ReturnPolicyScreen;