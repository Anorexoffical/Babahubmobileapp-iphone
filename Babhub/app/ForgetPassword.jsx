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
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');

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
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [emailFocus, setEmailFocus] = useState(false);
  const [dobFocus, setDobFocus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Date picker states
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [errors, setErrors] = useState({});

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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

  // Format date function
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Date picker functions
  const showDatepicker = () => {
    setDatePickerVisibility(true);
    setDobFocus(true);
  };

  const handleConfirmDate = (date) => {
    setSelectedDate(date);
    setDob(formatDate(date));
    setDatePickerVisibility(false);
    if (errors.dob) {
      setErrors((prev) => ({ ...prev, dob: "" }));
    }
  };

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
    
    if (!dob) {
      newErrors.dob = "Please select your date of birth";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRecoverPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("https://account.babahub.co/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, dob }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // ✅ Store both email AND timestamp for ResetPassword
        await SecureStore.setItemAsync('reset_email', email);
        await SecureStore.setItemAsync('reset_timestamp', Date.now().toString());
        
        // Clear any previous errors
        setErrors({});
        
        // Show success modal instead of alert
        setShowSuccessModal(true);
        
      } else {
        let errorMessage = "We couldn't verify your account details.";
        
        if (data.message?.toLowerCase().includes('email')) {
          errorMessage = "📧 This email address isn't registered with BabaHub.\n\nPlease check if you entered the correct email address or create a new account.";
        } else if (data.message?.toLowerCase().includes('date') || data.message?.toLowerCase().includes('dob')) {
          errorMessage = "📅 The date of birth doesn't match our records.\n\nPlease check your birth date and try again. Make sure you're using the same date you used when creating your account.";
        } else if (data.message?.toLowerCase().includes('not found') || data.message?.toLowerCase().includes('no account')) {
          errorMessage = "🔍 We couldn't find an account with these details.\n\nPlease check your email and date of birth, or create a new account if you don't have one.";
        } else if (data.message?.toLowerCase().includes('invalid')) {
          errorMessage = "❌ The information you provided doesn't match our records.\n\nPlease double-check your email address and date of birth.";
        } else {
          errorMessage = data.message || "We're having trouble verifying your account. Please check your details and try again.";
        }
        
        setErrorMessage(errorMessage);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Recovery error:', error);
      
      let connectionErrorMessage = "📡 Connection Issue\n\nWe're having trouble connecting to our servers. Please check your internet connection and try again.";
      
      if (error.message.includes('Network request failed')) {
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
    // Clear any stored credentials when going back to login
    SecureStore.deleteItemAsync('reset_email');
    SecureStore.deleteItemAsync('reset_timestamp');
    router.push('/login');
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
          <View style={styles.headerSection}>
            <View style={styles.headerIcon}>
              <MaterialIcons name="lock-reset" size={32} color={COLORS.primary} />
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
                  size={20} 
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
                  <MaterialIcons name="error-outline" size={16} color={COLORS.error} />
                  <Text style={styles.errorText}>{errors.email}</Text>
                </View>
              ) : null}
            </View>

            {/* DOB Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Date of Birth
                <Text style={styles.required}> *</Text>
              </Text>
              <TouchableOpacity 
                onPress={showDatepicker}
                disabled={isLoading}
              >
                <View style={[
                  styles.inputWrapper,
                  dobFocus && styles.inputWrapperFocused,
                  errors.dob && styles.inputWrapperError,
                  isLoading && styles.inputDisabled,
                  styles.dobInput,
                ]}>
                  <MaterialIcons 
                    name="calendar-today" 
                    size={20} 
                    color={dobFocus ? COLORS.primary : (errors.dob ? COLORS.error : COLORS.grayLight)} 
                    style={styles.inputIcon}
                  />
                  <Text style={[dob ? styles.dobText : styles.placeholderText]}>
                    {dob || "Select your date of birth"}
                  </Text>
                  <MaterialIcons 
                    name="arrow-drop-down" 
                    size={24} 
                    color={COLORS.gray} 
                  />
                </View>
              </TouchableOpacity>
              {errors.dob ? (
                <View style={styles.errorContainer}>
                  <MaterialIcons name="error-outline" size={16} color={COLORS.error} />
                  <Text style={styles.errorText}>{errors.dob}</Text>
                </View>
              ) : null}
            </View>

            {/* Date Picker Modal */}
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              maximumDate={new Date()}
              date={selectedDate}
              onConfirm={handleConfirmDate}
              onCancel={() => setDatePickerVisibility(false)}
              buttonTextColorIOS={COLORS.primary}
              accentColor={COLORS.primary}
            />

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
                  <MaterialIcons name="loop" size={20} color={COLORS.white} />
                  <Text style={styles.verifyButtonText}>Verifying...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.verifyButtonText}>Continue</Text>
                  <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity 
              onPress={handleBackToLogin}
              style={styles.backToLoginContainer}
              disabled={isLoading}
            >
              <MaterialIcons name="arrow-back" size={16} color={COLORS.primary} />
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>

          {/* Support Section */}
          <View style={styles.supportSection}>
            <Text style={styles.supportText}>Need help? Contact our support team</Text>
            <TouchableOpacity style={styles.whatsappButton} onPress={contactSupport}>
              <MaterialIcons name="chat" size={18} color={COLORS.white} />
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
              <MaterialIcons name="verified-user" size={60} color={COLORS.success} />
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
              <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
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
              <MaterialIcons name="warning" size={60} color={COLORS.warning} />
            </View>
            
            <Text style={styles.errorTitle}>Verification Failed</Text>
            
            <Text style={styles.errorMessage}>
              {errorMessage}
            </Text>

            <View style={styles.errorButtonContainer}>
              <TouchableOpacity
                style={styles.errorSecondaryButton}
                onPress={handleErrorClose}
                activeOpacity={0.8}
              >
                <Text style={styles.errorSecondaryButtonText}>Try Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.errorPrimaryButton}
                onPress={contactSupport}
                activeOpacity={0.9}
              >
                <MaterialIcons name="chat" size={18} color={COLORS.white} />
                <Text style={styles.errorPrimaryButtonText}>Get Help</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    minHeight: height,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: height * 0.02,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    color: COLORS.dark,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subHeader: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: width * 0.05,
  },
  formSection: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
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
    borderRadius: 140,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 2 
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    borderWidth: 1.2,
    shadowColor: COLORS.primary,
    shadowOffset: { 
      width: 0, 
      height: 4 
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
    borderWidth: 1.2,
    shadowColor: COLORS.error,
    shadowOffset: { 
      width: 0, 
      height: 4 
    },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.dark,
    paddingVertical: 0,
  },
  dobInput: {
    justifyContent: 'space-between',
  },
  dobText: {
    fontSize: 16,
    color: COLORS.dark,
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.grayLight,
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
    flex: 1,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 140,
    height: 56,
    paddingHorizontal: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { 
      width: 0, 
      height: 8 
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 0.8,
    borderColor: COLORS.primaryDark,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  backToLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
  },
  backToLoginText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  supportSection: {
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.white + '80',
    borderRadius: 16,
  },
  supportText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  supportNote: {
    fontSize: 12,
    color: COLORS.grayLight,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  whatsappText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Success Modal
  successModal: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  successMessage: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  successButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 140,
    height: 56,
    paddingHorizontal: 32,
    gap: 8,
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  // Error Modal
  errorModal: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  errorIconContainer: {
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  errorButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  errorSecondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.light,
    borderRadius: 12,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  errorSecondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  errorPrimaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    gap: 8,
  },
  errorPrimaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ForgetPassword;