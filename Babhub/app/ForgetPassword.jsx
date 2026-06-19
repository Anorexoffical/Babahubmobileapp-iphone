// app/ForgetPassword.jsx
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  Animated,
  Linking,
  Modal,
  StatusBar,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import http from '../src/api/http';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// Date picker removed: DOB no longer required for password recovery
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');

// Enhanced responsive sizing functions for all devices
const responsiveWidth = (percentage) => {
  const baseWidth = 375; // iPhone 6/7/8 as base
  const scale = width / baseWidth;
  return (percentage / 100) * baseWidth * Math.min(scale, 1.8);
};

const responsiveHeight = (percentage) => {
  const baseHeight = 667; // iPhone 6/7/8 as base
  const scale = height / baseHeight;
  return (percentage / 100) * baseHeight * Math.min(scale, 1.8);
};

const responsiveFont = (size) => {
  const scale = Math.min(width, height) / 400;
  const scaledSize = size * scale;
  
  // Set minimum and maximum font sizes for readability
  if (Platform.OS === 'android') {
    return Math.max(Math.min(scaledSize, size * 1.3), size * 0.9);
  }
  return Math.max(Math.min(scaledSize, size * 1.2), size * 0.8);
};

// Safe area calculations optimized for all Android devices including Huawei
const getSafeAreaBottom = () => {
  if (Platform.OS === 'ios') {
    return responsiveHeight(2);
  } else {
    // Enhanced for Android devices including Huawei with navigation bars
    const hasPhysicalNavigation = height / width > 1.9;
    if (hasPhysicalNavigation) {
      return responsiveHeight(3);
    } else {
      return responsiveHeight(4);
    }
  }
};

const getSafeAreaTop = () => {
  if (Platform.OS === 'ios') {
    return responsiveHeight(6);
  } else {
    const statusBarHeight = StatusBar.currentHeight || responsiveHeight(3);
    return statusBarHeight + responsiveHeight(1.5);
  }
};

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

const ForgetPassword = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState('');
  const [emailFocus, setEmailFocus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // date picker removed
  const [errors, setErrors] = useState({});

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Safe area values
  const safeAreaBottom = getSafeAreaBottom();
  const safeAreaTop = getSafeAreaTop();

  // Clear form when coming from reset password
  useEffect(() => {
    const clearFormIfNeeded = async () => {
      // Check if we're coming from a completed password reset
      if (params.passwordResetCompleted === 'true') {
        // Clear any stored session data
        await SecureStore.deleteItemAsync('reset_email');
        await SecureStore.deleteItemAsync('reset_timestamp');
        
        // Clear form fields
          setEmail('');
          setErrors({});
        setErrors({});
        
        // Remove the parameter from URL
        router.setParams({ passwordResetCompleted: undefined });
      }
    };

    clearFormIfNeeded();
  }, [params.passwordResetCompleted]);

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Date picker removed: DOB is no longer used

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "Please enter your email";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }
    
    // Only email required for recovery

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRecoverPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const { data } = await http.post(
        "/users/forgot-password",
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      if (data && data.success) {
        // ✅ Store both email AND timestamp for ResetPassword
        await SecureStore.setItemAsync('reset_email', email);
        await SecureStore.setItemAsync('reset_timestamp', Date.now().toString());
        // Clear any previous errors
        setErrors({});
        // Show success modal instead of alert
        setShowSuccessModal(true);
      } else {
        let errorMessage = "We couldn't verify your account details.";
        if (data?.message?.toLowerCase().includes('email')) {
          errorMessage = "📧 This email address isn't registered with BabaHub.\n\nPlease check if you entered the correct email address or create a new account.";
        } else if (data?.message?.toLowerCase().includes('not found') || data?.message?.toLowerCase().includes('no account')) {
          errorMessage = "🔍 We couldn't find an account with this email.\n\nPlease check if you entered the correct email address or create a new account.";
        } else if (data?.message?.toLowerCase().includes('invalid')) {
          errorMessage = "❌ The information you provided doesn't match our records.\n\nPlease double-check your email address.";
        } else {
          errorMessage = data?.message || "We're having trouble verifying your account. Please check your details and try again.";
        }
        setErrorMessage(errorMessage);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Recovery error:', error);
      let connectionErrorMessage = "📡 Connection Issue\n\nWe're having trouble connecting to our servers. Please check your internet connection and try again.";
      if (error.message && error.message.includes('Network request failed')) {
        connectionErrorMessage = "📡 Connection Issue\n\nWe're having trouble connecting to our servers. Please check your internet connection and try again.";
      } else {
        connectionErrorMessage = "⚠️ Something went wrong\n\nPlease try again in a moment. If the problem continues, contact our support team.";
      }
      setErrorMessage(connectionErrorMessage);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
    // Navigate to ResetPassword
    router.push('/ResetPassword');
  };

  const handleErrorClose = () => {
    setShowErrorModal(false);
  };

  const handleBackToLogin = () => {
    // Show confirmation before going back
    Alert.alert(
      "Go Back to Login?",
      "Are you sure you want to go back to login? Any entered information will be lost.",
      [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => {}
        },
        { 
          text: "Yes, Go Back", 
          style: "destructive",
          onPress: () => {
            // Clear any stored credentials when going back to login
            SecureStore.deleteItemAsync('reset_email');
            SecureStore.deleteItemAsync('reset_timestamp');
            // Use back function to navigate back
            router.back();
          }
        }
      ]
    );
  };

  const contactSupport = () => {
    const whatsappNumber = '+27845000000'; // Your WhatsApp number
    
    // Create the message based on whether email is provided or not
    let message = "Hello BabaHub Support,\n\n";
    
    if (email) {
      message += `I'm having trouble logging in and need help with password recovery.\n\n`;
      message += `📧 My email: ${email}\n`;
      message += `🔐 Issue: I forgot my password and can't access my account.\n\n`;
      message += `Please help me recover my account access.`;
    } else {
      message += `I'm having trouble with my BabaHub account.\n\n`;
      message += `🔐 Issue: I forgot both my email and password, and I can't access my account.\n\n`;
      message += `I need assistance recovering my account. Could you please help me?`;
    }
    
    message += `\n\nThank you!`;
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `whatsapp://send?phone=${whatsappNumber}&text=${encodedMessage}`;
    
    // Try to open WhatsApp
    Linking.openURL(whatsappUrl).catch(() => {
      // If WhatsApp is not installed, open in browser
      const webUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      Linking.openURL(webUrl);
    });
  };

  return (
    <View style={styles.fullContainer}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={COLORS.white}
        translucent={false}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : responsiveHeight(2)}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Header Section */}
            <View style={[styles.headerSection, { marginTop: safeAreaTop }]}>
              <View style={styles.headerIcon}>
                <MaterialIcons name="lock-reset" size={responsiveFont(32)} color={COLORS.primary} />
              </View>
              <Text style={styles.header}>Reset Password</Text>
              <Text style={styles.subHeader}>
                Enter your details to verify your account
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Email Address
                  <Text style={styles.required}> *</Text>
                </Text>
                <View style={[
                  styles.inputWrapper,
                  emailFocus && styles.inputWrapperFocused,
                  errors.email && styles.inputWrapperError,
                  isLoading && styles.inputDisabled
                ]}>
                  <MaterialIcons 
                    name="email" 
                    size={responsiveFont(20)} 
                    color={emailFocus ? COLORS.primary : (errors.email ? COLORS.error : COLORS.grayLight)} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor={COLORS.grayLight}
                    style={styles.input}
                    keyboardType="email-address"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email && text.trim()) {
                        setErrors((prev) => ({ ...prev, email: "" }));
                      }
                    }}
                    onFocus={() => setEmailFocus(true)}
                    onBlur={() => setEmailFocus(false)}
                    underlineColorAndroid="transparent"
                    selectionColor={COLORS.primary}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
                {errors.email ? (
                  <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={responsiveFont(16)} color={COLORS.error} />
                    <Text style={styles.errorText}>{errors.email}</Text>
                  </View>
                ) : null}
              </View>

              {/* DOB removed: recovery is email-only */}

              {/* Verify Button */}
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  isLoading && styles.verifyButtonDisabled
                ]}
                onPress={handleRecoverPassword}
                activeOpacity={0.9}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <MaterialIcons name="loop" size={responsiveFont(20)} color={COLORS.white} />
                    <Text style={styles.verifyButtonText}>Verifying...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.verifyButtonText}>Continue</Text>
                    <MaterialIcons name="arrow-forward" size={responsiveFont(20)} color={COLORS.white} />
                  </>
                )}
              </TouchableOpacity>

              {/* Back to Login */}
              <TouchableOpacity 
                onPress={handleBackToLogin}
                style={styles.backToLoginContainer}
                disabled={isLoading}
              >
                <MaterialIcons name="arrow-back" size={responsiveFont(16)} color={COLORS.primary} />
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </TouchableOpacity>
            </View>

            {/* Support Section */}
            <View style={styles.supportSection}>
              <Text style={styles.supportText}>Need help? Contact our support team</Text>
              <TouchableOpacity style={styles.whatsappButton} onPress={contactSupport}>
                <MaterialIcons name="chat" size={responsiveFont(18)} color={COLORS.white} />
                <Text style={styles.whatsappText}>Contact BabaHub Support</Text>
              </TouchableOpacity>
              <Text style={styles.supportNote}>
                {email 
                  ? `We'll include your email (${email}) in the message to help you faster`
                  : "Tell us about your issue and we'll help you recover your account"
                }
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* White Navigation Bar Spacer for iOS */}
        {Platform.OS === 'ios' && <View style={[styles.navigationBarSpacer, { height: safeAreaBottom }]} />}
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={handleSuccessContinue}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
              <MaterialIcons name="verified-user" size={responsiveFont(60)} color={COLORS.success} />
            </View>
            
            <Text style={styles.successTitle}>✅ Identity Verified!</Text>
            
            <Text style={styles.successMessage}>
              Great! Your account details have been verified successfully. You can now create a new password for your account.
            </Text>

            <TouchableOpacity
              style={styles.successButton}
              onPress={handleSuccessContinue}
              activeOpacity={0.9}
            >
              <Text style={styles.successButtonText}>Create New Password</Text>
              <MaterialIcons name="arrow-forward" size={responsiveFont(20)} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={handleErrorClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorModal}>
            <View style={styles.errorIconContainer}>
              <MaterialIcons name="warning" size={responsiveFont(60)} color={COLORS.warning} />
            </View>
            
            <Text style={styles.errorTitle}>Verification Failed</Text>
            
            <Text style={styles.errorMessage}>
              {errorMessage}
            </Text>

            {/* Single Try Again Button */}
            <TouchableOpacity
              style={styles.tryAgainButton}
              onPress={handleErrorClose}
              activeOpacity={0.9}
            >
              <Text style={styles.tryAgainButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardAvoid: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: responsiveWidth(6),
    paddingVertical: responsiveHeight(2),
    minHeight: height,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: responsiveHeight(4),
  },
  headerIcon: {
    width: responsiveWidth(16),
    height: responsiveWidth(16),
    borderRadius: responsiveWidth(8),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveHeight(2),
  },
  header: {
    fontSize: responsiveFont(28),
    fontWeight: '800',
    marginBottom: responsiveHeight(1),
    color: COLORS.dark,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subHeader: {
    fontSize: responsiveFont(16),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: responsiveHeight(2.2),
    paddingHorizontal: responsiveWidth(5),
  },
  formSection: {
    marginBottom: responsiveHeight(3),
  },
  inputContainer: {
    marginBottom: responsiveHeight(2.4),
  },
  label: {
    fontWeight: '600',
    marginBottom: responsiveHeight(0.8),
    fontSize: responsiveFont(14),
    color: COLORS.dark,
    letterSpacing: 0.3,
  },
  required: {
    color: COLORS.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.8,
    borderColor: COLORS.primaryLight,
    borderRadius: responsiveWidth(35),
    paddingHorizontal: responsiveWidth(4),
    backgroundColor: COLORS.white,
    height: responsiveHeight(7),
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: responsiveHeight(0.2)
    },
    shadowOpacity: 0.08,
    shadowRadius: responsiveWidth(3),
    elevation: 4,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    borderWidth: 1.2,
    shadowColor: COLORS.primary,
    shadowOffset: { 
      width: 0, 
      height: responsiveHeight(0.4)
    },
    shadowOpacity: 0.15,
    shadowRadius: responsiveWidth(4),
    elevation: 8,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
    borderWidth: 1.2,
    shadowColor: COLORS.error,
    shadowOffset: { 
      width: 0, 
      height: responsiveHeight(0.4)
    },
    shadowOpacity: 0.12,
    shadowRadius: responsiveWidth(3.5),
    elevation: 6,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  inputIcon: {
    marginRight: responsiveWidth(3),
  },
  input: {
    flex: 1,
    fontSize: responsiveFont(16),
    color: COLORS.dark,
    paddingVertical: 0,
    height: '100%',
  },
  // dob styles removed
  placeholderText: {
    fontSize: responsiveFont(16),
    color: COLORS.grayLight,
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: responsiveHeight(0.8),
  },
  errorText: {
    color: COLORS.error,
    fontSize: responsiveFont(13),
    marginLeft: responsiveWidth(1.5),
    fontWeight: '500',
    flex: 1,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: responsiveWidth(35),
    height: responsiveHeight(7),
    paddingHorizontal: responsiveWidth(6),
    shadowColor: COLORS.primary,
    shadowOffset: { 
      width: 0, 
      height: responsiveHeight(0.8)
    },
    shadowOpacity: 0.25,
    shadowRadius: responsiveWidth(5),
    elevation: 12,
    gap: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(2),
    borderWidth: 0.8,
    borderColor: COLORS.primaryDark,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(2),
  },
  verifyButtonText: {
    fontSize: responsiveFont(18),
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  backToLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: responsiveWidth(1.5),
    marginBottom: responsiveHeight(2),
    padding: responsiveHeight(1.2),
    borderRadius: responsiveWidth(3),
  },
  backToLoginText: {
    color: COLORS.primary,
    fontSize: responsiveFont(15),
    fontWeight: '600',
  },
  supportSection: {
    alignItems: 'center',
    marginTop: responsiveHeight(2),
    padding: responsiveHeight(1.6),
    backgroundColor: COLORS.white + '80',
    borderRadius: responsiveWidth(4),
  },
  supportText: {
    fontSize: responsiveFont(14),
    color: COLORS.gray,
    marginBottom: responsiveHeight(1.2),
    textAlign: 'center',
    fontWeight: '500',
  },
  supportNote: {
    fontSize: responsiveFont(12),
    color: COLORS.grayLight,
    textAlign: 'center',
    marginTop: responsiveHeight(0.8),
    fontStyle: 'italic',
    lineHeight: responsiveHeight(1.6),
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1.2),
    borderRadius: responsiveWidth(6.25),
    gap: responsiveWidth(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: responsiveHeight(0.2) },
    shadowOpacity: 0.1,
    shadowRadius: responsiveWidth(1),
    elevation: 3,
  },
  whatsappText: {
    color: COLORS.white,
    fontSize: responsiveFont(14),
    fontWeight: '600',
  },
  // Navigation Bar Spacer for iOS
  navigationBarSpacer: {
    backgroundColor: COLORS.white,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveWidth(5),
  },
  // Success Modal
  successModal: {
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(6),
    padding: responsiveWidth(8),
    alignItems: 'center',
    width: '100%',
    maxWidth: responsiveWidth(90),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: responsiveHeight(1),
    },
    shadowOpacity: 0.25,
    shadowRadius: responsiveWidth(5),
    elevation: 20,
  },
  successIconContainer: {
    marginBottom: responsiveHeight(2),
  },
  successTitle: {
    fontSize: responsiveFont(24),
    fontWeight: '800',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: responsiveHeight(1.6),
    letterSpacing: 0.5,
  },
  successMessage: {
    fontSize: responsiveFont(16),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: responsiveHeight(2.2),
    marginBottom: responsiveHeight(3.2),
  },
  successButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: responsiveWidth(35),
    height: responsiveHeight(7),
    paddingHorizontal: responsiveWidth(8),
    gap: responsiveWidth(2),
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: responsiveHeight(0.8),
    },
    shadowOpacity: 0.3,
    shadowRadius: responsiveWidth(4),
    elevation: 8,
  },
  successButtonText: {
    fontSize: responsiveFont(18),
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  // Error Modal
  errorModal: {
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(6),
    padding: responsiveWidth(8),
    alignItems: 'center',
    width: '100%',
    maxWidth: responsiveWidth(90),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: responsiveHeight(1),
    },
    shadowOpacity: 0.25,
    shadowRadius: responsiveWidth(5),
    elevation: 20,
  },
  errorIconContainer: {
    marginBottom: responsiveHeight(2),
  },
  errorTitle: {
    fontSize: responsiveFont(24),
    fontWeight: '800',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: responsiveHeight(1.6),
    letterSpacing: 0.5,
  },
  errorMessage: {
    fontSize: responsiveFont(16),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: responsiveHeight(2.2),
    marginBottom: responsiveHeight(3.2),
  },
  // Single Try Again Button
  tryAgainButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: responsiveWidth(3),
    height: responsiveHeight(6.25),
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: responsiveHeight(0.4),
    },
    shadowOpacity: 0.3,
    shadowRadius: responsiveWidth(2),
    elevation: 6,
  },
  tryAgainButtonText: {
    fontSize: responsiveFont(16),
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ForgetPassword;