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

const RESET_TOKEN_EXPIRY_TIME = 2 * 60 * 1000; // 2 minutes

const ResetPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [sessionValid, setSessionValid] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const confettiRef = useRef(null);

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
      
      // Show confirmation for back to recovery
      handleBackToRecovery();
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
          await SecureStore.deleteItemAsync('reset_email');
          await SecureStore.deleteItemAsync('reset_timestamp');
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

  const handleSessionExpiry = async () => {
    await SecureStore.deleteItemAsync('reset_email');
    await SecureStore.deleteItemAsync('reset_timestamp');
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

  const handleGoToLogin = () => {
    // Clear all session data
    SecureStore.deleteItemAsync('reset_email');
    SecureStore.deleteItemAsync('reset_timestamp');
    // Navigate to login using replace to prevent going back
    router.replace('/login');
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
    if (resetCompleted) {
      // If reset is completed, redirect to login
      handleGoToLogin();
    } else {
      // Show confirmation before going back
      Alert.alert(
        "Go Back to Recovery?",
        "Are you sure you want to go back to recovery? Any entered password information will be lost.",
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
              // Use back function to navigate back to ForgetPassword
              router.back();
            }
          }
        ]
      );
    }
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
              <MaterialIcons name="check-circle" size={80} color={COLORS.success} />
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
              <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
        {/* White Navigation Bar Spacer for iOS */}
        {Platform.OS === 'ios' && <View style={styles.navigationBarSpacer} />}
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
          <MaterialIcons name="hourglass-empty" size={48} color={COLORS.primary} />
          <Text style={styles.loadingText}>Validating session...</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.push('/ForgetPassword')}
          >
            <Text style={styles.retryButtonText}>Start Recovery Again</Text>
          </TouchableOpacity>
        </View>
        {/* White Navigation Bar Spacer for iOS */}
        {Platform.OS === 'ios' && <View style={styles.navigationBarSpacer} />}
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
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            <View style={styles.headerSection}>
              <View style={styles.headerIcon}>
                <MaterialIcons name="lock-open" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.header}>New Password</Text>
              <Text style={styles.subHeader}>
                Create your new password
              </Text>
            </View>

            {/* Timer Section */}
            <View style={[
              styles.timerContainer,
              timeLeft <= 30 && styles.timerContainerWarning
            ]}>
              <View style={styles.timerCircle}>
                <Text style={[
                  styles.timerText,
                  timeLeft <= 30 && styles.timerTextWarning
                ]}>
                  {formatTime(timeLeft)}
                </Text>
              </View>
              <Text style={styles.timerLabel}>
                {timeLeft <= 30 ? "Time running out" : "Time remaining"}
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
                    size={20} 
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
                    // Props to prevent auto-capitalization and ensure lowercase start
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
                      size={22}
                      color={(isLoading || timeLeft <= 0) ? COLORS.grayLight : COLORS.gray}
                    />
                  </TouchableOpacity>
                </View>
                {errors.newPassword ? (
                  <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={16} color={COLORS.error} />
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
                    size={20} 
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
                    // Props to prevent auto-capitalization and ensure lowercase start
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
                      size={22}
                      color={(isLoading || timeLeft <= 0) ? COLORS.grayLight : COLORS.gray}
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword ? (
                  <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={16} color={COLORS.error} />
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
                    <MaterialIcons name="loop" size={20} color={COLORS.white} />
                    <Text style={styles.resetButtonText}>Updating...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.resetButtonText}>
                      {timeLeft <= 0 ? "Session Expired" : "Reset Password"}
                    </Text>
                    <MaterialIcons name="check-circle" size={20} color={COLORS.white} />
                  </>
                )}
              </TouchableOpacity>

              {/* Back Link - Only show if reset is not completed */}
              {!resetCompleted && (
                <TouchableOpacity 
                  onPress={handleBackToRecovery} 
                  style={styles.backButtonContainer}
                  disabled={isLoading}
                >
                  <MaterialIcons name="arrow-back" size={16} color={COLORS.primary} />
                  <Text style={styles.backButtonText}>Back to Recovery</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </ScrollView>

        {/* White Navigation Bar Spacer for iOS */}
        {Platform.OS === 'ios' && <View style={styles.navigationBarSpacer} />}
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
              <MaterialIcons name="check-circle" size={80} color={COLORS.success} />
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
              <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* White Navigation Bar Spacer for iOS in Modal */}
          {Platform.OS === 'ios' && <View style={styles.modalNavigationBarSpacer} />}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Success Screen Styles
  successContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successContent: {
    alignItems: 'center',
    width: '100%',
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
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
    paddingHorizontal: 20,
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
    maxWidth: 300,
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
  // Navigation Bar Spacer for iOS
  navigationBarSpacer: {
    height: Platform.OS === 'ios' ? 34 : 0, // Height of iOS home indicator
    backgroundColor: COLORS.white,
  },
  modalNavigationBarSpacer: {
    height: Platform.OS === 'ios' ? 34 : 0, // Height of iOS home indicator
    backgroundColor: 'transparent',
  },
  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    zIndex: 2,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
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
  timerContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  timerContainerWarning: {
    backgroundColor: '#FFF5F5',
  },
  timerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  timerTextWarning: {
    color: COLORS.white,
  },
  timerLabel: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    fontWeight: '500',
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
  visibilityButton: {
    padding: 4,
    marginLeft: 8,
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
  resetButton: {
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
  resetButtonDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.grayLight,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ResetPassword;