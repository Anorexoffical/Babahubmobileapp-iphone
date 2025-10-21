// app/ResetPassword.jsx
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  BackHandler,
  Modal,
  StatusBar,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
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

const RESET_TOKEN_EXPIRY_TIME = 1 * 60 * 1000; // 1 minute (reduced from 2 minutes)

const ResetPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute in seconds (reduced from 120)
  const [sessionValid, setSessionValid] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showBackConfirmModal, setShowBackConfirmModal] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const confettiRef = useRef(null);

  // Safe area values
  const safeAreaBottom = getSafeAreaBottom();
  const safeAreaTop = getSafeAreaTop();

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

  useEffect(() => {
    if (showSuccessModal && confettiRef.current) {
      confettiRef.current.play();
    }
  }, [showSuccessModal]);

  // Handle Android back button - ONLY block after reset is completed
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (resetCompleted) {
        // Prevent going back only AFTER reset is completed
        handleGoToLogin();
        return true; // Prevent default back behavior
      }
      
      // Show custom modal for back to recovery
      setShowBackConfirmModal(true);
      return true; // Prevent default back behavior
    });

    return () => backHandler.remove();
  }, [resetCompleted]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedEmail = await SecureStore.getItemAsync('reset_email');
        const storedTimestamp = await SecureStore.getItemAsync('reset_timestamp');
        
        // Check if session data exists
        if (!storedEmail) {
          Alert.alert(
            "Session Required", 
            "Please start the password recovery process first",
            [{ text: "Start Recovery", onPress: () => router.push('/ForgetPassword') }]
          );
          return;
        }

        const currentTime = Date.now();
        const sessionTime = parseInt(storedTimestamp);
        const timeElapsed = currentTime - sessionTime;
        const timeRemaining = RESET_TOKEN_EXPIRY_TIME - timeElapsed;
        
        if (timeRemaining <= 0) {
          // Session expired
          await clearSessionData();
          Alert.alert(
            "Session Expired", 
            "Please start the recovery process again",
            [{ text: "Start Over", onPress: () => router.push('/ForgetPassword') }]
          );
          return;
        }
        
        // Session is valid
        setEmail(storedEmail);
        setSessionValid(true);
        setTimeLeft(Math.floor(timeRemaining / 1000));
        
      } catch (error) {
        console.error('Session check error:', error);
        Alert.alert(
          "Session Error", 
          "Please start the recovery process again",
          [{ text: "Try Again", onPress: () => router.push('/ForgetPassword') }]
        );
      }
    };

    checkSession();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!sessionValid || timeLeft <= 0 || resetCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSessionExpiry();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionValid, timeLeft, resetCompleted]);

  const clearSessionData = async () => {
    try {
      await SecureStore.deleteItemAsync('reset_email');
      await SecureStore.deleteItemAsync('reset_timestamp');
    } catch (error) {
      console.error('Error clearing session data:', error);
    }
  };

  const handleSessionExpiry = async () => {
    await clearSessionData();
    Alert.alert(
      "Time's Up", 
      "Please start the recovery process again",
      [{ text: "Start Over", onPress: () => router.push('/ForgetPassword') }]
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = "Please enter a new password";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoToLogin = async () => {
    // Clear all session data and input fields
    await clearSessionData();
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    
    // Navigate to login using replace to prevent going back
    // Also pass a parameter to indicate reset completion
    router.replace({
      pathname: '/login',
      params: { passwordResetCompleted: 'true' }
    });
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    // Double-check session validity
    if (!sessionValid || timeLeft <= 0) {
      Alert.alert(
        "Session Expired", 
        "Please start the recovery process again",
        [{ text: "Start Over", onPress: () => router.push('/ForgetPassword') }]
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://account.babahub.co/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Invalid server response');
      }

      if (response.ok && data.success) {
        // Mark reset as completed to prevent going back
        setResetCompleted(true);
        
        // Show success modal instead of alert
        setShowSuccessModal(true);
        
      } else {
        let errorMessage = "We couldn't reset your password";
        
        if (data.message?.toLowerCase().includes('weak')) {
          errorMessage = "Please choose a stronger password";
        } else if (data.message?.toLowerCase().includes('same')) {
          errorMessage = "Please choose a different password";
        } else {
          errorMessage = data.message || errorMessage;
        }
        
        Alert.alert("Reset Failed", errorMessage);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.message.includes('Network request failed')) {
        Alert.alert("Connection Lost", "Please check your internet connection");
      } else {
        Alert.alert("Error", "Please try again");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRecovery = () => {
    setShowBackConfirmModal(false);
    router.back();
  };

  const handleCancelBack = () => {
    setShowBackConfirmModal(false);
  };

  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
    handleGoToLogin();
  };

  // If reset is completed, show a different UI that forces forward navigation
  if (resetCompleted && !showSuccessModal) {
    return (
      <View style={styles.fullContainer}>
        {/* White Status Bar */}
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor={COLORS.white}
          translucent={false}
        />
        <View style={styles.successContainer}>
          <View style={styles.successContent}>
            <View style={styles.successIcon}>
              <MaterialIcons name="check-circle" size={responsiveFont(80)} color={COLORS.success} />
            </View>
            <Text style={styles.successTitle}>Password Reset Successfully!</Text>
            <Text style={styles.successMessage}>
              Your password has been updated. You can now sign in with your new password.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={handleGoToLogin}
              activeOpacity={0.9}
            >
              <Text style={styles.successButtonText}>Go to Login</Text>
              <MaterialIcons name="arrow-forward" size={responsiveFont(20)} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
        {/* White Navigation Bar Spacer for iOS */}
        {Platform.OS === 'ios' && <View style={[styles.navigationBarSpacer, { height: safeAreaBottom }]} />}
      </View>
    );
  }

  if (!sessionValid) {
    return (
      <View style={styles.fullContainer}>
        {/* White Status Bar */}
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor={COLORS.white}
          translucent={false}
        />
        <View style={styles.loadingContainer}>
          <MaterialIcons name="hourglass-empty" size={responsiveFont(48)} color={COLORS.primary} />
          <Text style={styles.loadingText}>Validating session...</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.push('/ForgetPassword')}
          >
            <Text style={styles.retryButtonText}>Start Recovery Again</Text>
          </TouchableOpacity>
        </View>
        {/* White Navigation Bar Spacer for iOS */}
        {Platform.OS === 'ios' && <View style={[styles.navigationBarSpacer, { height: safeAreaBottom }]} />}
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      {/* White Status Bar */}
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
                <MaterialIcons name="lock-open" size={responsiveFont(32)} color={COLORS.primary} />
              </View>
              <Text style={styles.header}>New Password</Text>
              <Text style={styles.subHeader}>
                Create your new password
              </Text>
            </View>

            {/* Timer Section */}
            <View style={[
              styles.timerContainer,
              timeLeft <= 15 && styles.timerContainerWarning
            ]}>
              <View style={styles.timerCircle}>
                <Text style={[
                  styles.timerText,
                  timeLeft <= 15 && styles.timerTextWarning
                ]}>
                  {formatTime(timeLeft)}
                </Text>
              </View>
              <Text style={styles.timerLabel}>
                {timeLeft <= 15 ? "Time running out" : "Time remaining"}
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* New Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  New Password
                  <Text style={styles.required}> *</Text>
                </Text>
                <View style={[
                  styles.inputWrapper,
                  errors.newPassword && styles.inputWrapperError,
                  (isLoading || timeLeft <= 0) && styles.inputDisabled
                ]}>
                  <MaterialIcons 
                    name="lock" 
                    size={responsiveFont(20)} 
                    color={errors.newPassword ? COLORS.error : COLORS.grayLight} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Enter new password"
                    placeholderTextColor={COLORS.grayLight}
                    style={styles.input}
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (errors.newPassword) setErrors({...errors, newPassword: ''});
                    }}
                    editable={!isLoading && timeLeft > 0}
                    selectionColor={COLORS.primary}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    keyboardType="default"
                    textContentType="newPassword"
                    importantForAutofill="yes"
                  />
                  <TouchableOpacity 
                    style={styles.visibilityButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    disabled={isLoading || timeLeft <= 0}
                  >
                    <MaterialIcons
                      name={showNewPassword ? "visibility" : "visibility-off"}
                      size={responsiveFont(22)}
                      color={(isLoading || timeLeft <= 0) ? COLORS.grayLight : COLORS.gray}
                    />
                  </TouchableOpacity>
                </View>
                {errors.newPassword ? (
                  <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={responsiveFont(16)} color={COLORS.error} />
                    <Text style={styles.errorText}>{errors.newPassword}</Text>
                  </View>
                ) : null}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Confirm Password
                  <Text style={styles.required}> *</Text>
                </Text>
                <View style={[
                  styles.inputWrapper,
                  errors.confirmPassword && styles.inputWrapperError,
                  (isLoading || timeLeft <= 0) && styles.inputDisabled
                ]}>
                  <MaterialIcons 
                    name="lock-outline" 
                    size={responsiveFont(20)} 
                    color={errors.confirmPassword ? COLORS.error : COLORS.grayLight} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Confirm new password"
                    placeholderTextColor={COLORS.grayLight}
                    style={styles.input}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
                    }}
                    editable={!isLoading && timeLeft > 0}
                    selectionColor={COLORS.primary}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    keyboardType="default"
                    textContentType="newPassword"
                    importantForAutofill="yes"
                  />
                  <TouchableOpacity 
                    style={styles.visibilityButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading || timeLeft <= 0}
                  >
                    <MaterialIcons
                      name={showConfirmPassword ? "visibility" : "visibility-off"}
                      size={responsiveFont(22)}
                      color={(isLoading || timeLeft <= 0) ? COLORS.grayLight : COLORS.gray}
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword ? (
                  <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={responsiveFont(16)} color={COLORS.error} />
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  </View>
                ) : null}
              </View>

              {/* Reset Button */}
              <TouchableOpacity
                style={[
                  styles.resetButton,
                  (isLoading || timeLeft <= 0) && styles.resetButtonDisabled
                ]}
                onPress={handleResetPassword}
                activeOpacity={0.9}
                disabled={isLoading || timeLeft <= 0}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <MaterialIcons name="loop" size={responsiveFont(20)} color={COLORS.white} />
                    <Text style={styles.resetButtonText}>Updating...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.resetButtonText}>
                      {timeLeft <= 0 ? "Session Expired" : "Reset Password"}
                    </Text>
                    <MaterialIcons name="check-circle" size={responsiveFont(20)} color={COLORS.white} />
                  </>
                )}
              </TouchableOpacity>

              {/* Back Link - Only show if reset is not completed */}
              {!resetCompleted && (
                <TouchableOpacity 
                  onPress={() => setShowBackConfirmModal(true)} 
                  style={styles.backButtonContainer}
                  disabled={isLoading}
                >
                  <MaterialIcons name="arrow-back" size={responsiveFont(16)} color={COLORS.primary} />
                  <Text style={styles.backButtonText}>Back to Recovery</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </ScrollView>

        {/* White Navigation Bar Spacer for iOS */}
        {Platform.OS === 'ios' && <View style={[styles.navigationBarSpacer, { height: safeAreaBottom }]} />}
      </KeyboardAvoidingView>

      {/* Success Modal with Confetti */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={handleSuccessContinue}
      >
        <View style={styles.modalOverlay}>
          {/* White Status Bar for Modal */}
          <StatusBar 
            barStyle="light-content" 
            backgroundColor="transparent"
            translucent={true}
          />
          
          {/* Confetti Background */}
          <LottieView
            ref={confettiRef}
            source={require('../assets/animations/Confetti.json')}
            autoPlay={false}
            loop={false}
            style={styles.confetti}
            resizeMode="cover"
          />
          
          {/* Success Content */}
          <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
              <MaterialIcons name="check-circle" size={responsiveFont(80)} color={COLORS.success} />
            </View>
            
            <Text style={styles.successTitle}>🎉 Password Reset Successful!</Text>
            
            <Text style={styles.successMessage}>
              Your password has been updated successfully. You can now sign in with your new password.
            </Text>

            <TouchableOpacity
              style={styles.successButton}
              onPress={handleSuccessContinue}
              activeOpacity={0.9}
            >
              <Text style={styles.successButtonText}>Continue to Login</Text>
              <MaterialIcons name="arrow-forward" size={responsiveFont(20)} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* White Navigation Bar Spacer for iOS in Modal */}
          {Platform.OS === 'ios' && <View style={[styles.modalNavigationBarSpacer, { height: safeAreaBottom }]} />}
        </View>
      </Modal>

      {/* Custom Back Confirmation Modal */}
      <Modal
        visible={showBackConfirmModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={handleCancelBack}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.customModal}>
            <View style={styles.modalIconContainer}>
              <MaterialIcons name="help-outline" size={responsiveFont(60)} color={COLORS.warning} />
            </View>
            
            <Text style={styles.modalTitle}>Go Back to Recovery?</Text>
            
            <Text style={styles.modalMessage}>
              Are you sure you want to go back to recovery? Any entered password information will be lost.
            </Text>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCancelBack}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleBackToRecovery}
                activeOpacity={0.9}
              >
                <Text style={styles.modalConfirmButtonText}>Yes, Go Back</Text>
              </TouchableOpacity>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: responsiveWidth(6),
  },
  loadingText: {
    fontSize: responsiveFont(16),
    color: COLORS.gray,
    marginTop: responsiveHeight(1.6),
    marginBottom: responsiveHeight(2),
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1.2),
    borderRadius: responsiveWidth(6.25),
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: responsiveFont(16),
    fontWeight: '600',
  },
  // Success Screen Styles
  successContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(6),
  },
  successContent: {
    alignItems: 'center',
    width: '100%',
  },
  successIcon: {
    marginBottom: responsiveHeight(2.4),
  },
  successTitle: {
    fontSize: responsiveFont(28),
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
    paddingHorizontal: responsiveWidth(5),
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
    maxWidth: responsiveWidth(75),
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
  // Navigation Bar Spacer for iOS
  navigationBarSpacer: {
    backgroundColor: COLORS.white,
  },
  modalNavigationBarSpacer: {
    backgroundColor: 'transparent',
  },
  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveWidth(5),
  },
  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
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
    zIndex: 2,
  },
  successIconContainer: {
    marginBottom: responsiveHeight(2),
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: responsiveHeight(3),
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
  timerContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(4),
    padding: responsiveHeight(2),
    marginBottom: responsiveHeight(2.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: responsiveHeight(0.4) },
    shadowOpacity: 0.1,
    shadowRadius: responsiveWidth(3),
    elevation: 8,
  },
  timerContainerWarning: {
    backgroundColor: '#FFF5F5',
  },
  timerCircle: {
    width: responsiveWidth(17.5),
    height: responsiveWidth(17.5),
    borderRadius: responsiveWidth(8.75),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveHeight(1),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: responsiveHeight(0.4) },
    shadowOpacity: 0.3,
    shadowRadius: responsiveWidth(2),
    elevation: 6,
  },
  timerText: {
    fontSize: responsiveFont(18),
    fontWeight: 'bold',
    color: COLORS.white,
  },
  timerTextWarning: {
    color: COLORS.white,
  },
  timerLabel: {
    fontSize: responsiveFont(14),
    color: COLORS.gray,
    textAlign: 'center',
    fontWeight: '500',
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
  visibilityButton: {
    padding: responsiveWidth(1),
    marginLeft: responsiveWidth(2),
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
  resetButton: {
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
  resetButtonDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.grayLight,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(2),
  },
  resetButtonText: {
    fontSize: responsiveFont(18),
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: responsiveWidth(1.5),
    marginBottom: responsiveHeight(2),
    padding: responsiveHeight(1.2),
    borderRadius: responsiveWidth(3),
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: responsiveFont(15),
    fontWeight: '600',
  },
  // Custom Modal Styles
  customModal: {
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
  modalIconContainer: {
    marginBottom: responsiveHeight(2),
  },
  modalTitle: {
    fontSize: responsiveFont(24),
    fontWeight: '800',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: responsiveHeight(1.6),
    letterSpacing: 0.5,
  },
  modalMessage: {
    fontSize: responsiveFont(16),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: responsiveHeight(2.2),
    marginBottom: responsiveHeight(3.2),
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: responsiveWidth(3),
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.light,
    borderRadius: responsiveWidth(3),
    height: responsiveHeight(6.25),
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  modalCancelButtonText: {
    fontSize: responsiveFont(16),
    fontWeight: '600',
    color: COLORS.dark,
  },
  modalConfirmButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: responsiveWidth(3),
    height: responsiveHeight(6.25),
  },
  modalConfirmButtonText: {
    fontSize: responsiveFont(16),
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ResetPassword;