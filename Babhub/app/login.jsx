// app/login.jsx
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Mybutton from '../components/Mybutton';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from './contexts/AuthContext';
import http from '../src/api/http';

const { width, height } = Dimensions.get('window');

// Responsive sizing functions
const responsiveWidth = (percentage) => (width * percentage) / 100;
const responsiveHeight = (percentage) => (height * percentage) / 100;
const responsiveFont = (size) => (width * size) / 400;
const moderateScale = (size, factor = 0.5) => size + (responsiveWidth(size) - size) * factor;

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

const Login = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { signIn } = useAuth();
  const [checked, setChecked] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const modalScaleAnim = useRef(new Animated.Value(0)).current;

  // Refs for inputs
  const passwordInputRef = useRef(null);

  // Clear form when coming from password reset
  useEffect(() => {
    if (params.passwordResetCompleted === 'true') {
      // Clear form fields when coming from successful password reset
      setEmail('');
      setPassword('');
      setErrors({});
      
      // Remove the parameter from URL
      router.setParams({ passwordResetCompleted: undefined });
      
      // Show success message
      setTimeout(() => {
        Alert.alert(
          "Password Reset Successful", 
          "Your password has been updated successfully. You can now sign in with your new password.",
          [{ text: "OK" }]
        );
      }, 500);
    }
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

  // Show error modal
  const showErrorPopup = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
    Animated.spring(modalScaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  // Hide error modal
  const hideErrorPopup = () => {
    Animated.timing(modalScaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowErrorModal(false);
      setErrorMessage('');
    });
  };

  // Enhanced validation function with error state
  const validateInputs = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "Please enter your email";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }
    
    if (!password) {
      newErrors.password = "Please enter your password";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleLogin = async () => {
  //   if (!validateInputs()) return;

  //   setIsLoading(true);

  //   try {
  //     const response = await fetch("https://account.babahub.co/api/users/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         email,
  //         password,
  //         role: "customer",
  //       }),
  //     });

  //     const data = await response.json();
  //     console.log("Login response:", data);

  //     if (response.ok) {
  //       const { user } = data;
  //       const authToken = "mock-or-jwt"; // replace with real JWT later
  //       await signIn(authToken, user);
  //       router.replace("/(tabs)/HomeScreen");
  //     } else {
  //       let errorMessage = data.message || "Invalid credentials";
        
  //       if (data.message?.toLowerCase().includes('email') || data.message?.toLowerCase().includes('not found')) {
  //         errorMessage = "This email address isn't registered with BabaHub. Please check your email or create a new account.";
  //       } else if (data.message?.toLowerCase().includes('password') || data.message?.toLowerCase().includes('invalid')) {
  //         errorMessage = "The password you entered is incorrect. Please check your password and try again.";
  //       } else if (data.message?.toLowerCase().includes('account') || data.message?.toLowerCase().includes('suspended')) {
  //         errorMessage = "There seems to be a problem with your account. Please contact support for assistance.";
  //       }
        
  //       showErrorPopup(errorMessage);
  //     }
  //   } catch (err) {
  //     console.error("Login error:", err.message);
  //     let connectionErrorMessage = "We're having trouble connecting to our servers. Please check your internet connection and try again.";
      
  //     if (err.message.includes('Network request failed')) {
  //       connectionErrorMessage = "We're having trouble connecting to our servers. Please check your internet connection and try again.";
  //     } else {
  //       connectionErrorMessage = "Something went wrong. Please try again in a moment.";
  //     }
      
  //     showErrorPopup(connectionErrorMessage);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleLogin = async () => {
  if (!validateInputs()) return;

  setIsLoading(true);

  try {
    const response = await http.post('/users/login', {
      email,
      password,
      role: 'customer',
    });

    // Axios puts response data in response.data
    const data = response.data;
    console.log('Login response:', data);

    const { user, token } = data;

    // Use real token if backend sends it
    const authToken = token || 'mock-or-jwt';

    await signIn(authToken, user);
    router.replace('/(tabs)/HomeScreen');

  } catch (error) {
    console.error('Login error:', error);

    let errorMessage =
      "Something went wrong. Please try again in a moment.";

    // Axios error with server response
    if (error.response && error.response.data) {
      const serverMessage = error.response.data.message || '';

      if (
        serverMessage.toLowerCase().includes('email') ||
        serverMessage.toLowerCase().includes('not found')
      ) {
        errorMessage =
          "This email address isn't registered with BabaHub. Please check your email or create a new account.";
      } else if (
        serverMessage.toLowerCase().includes('password') ||
        serverMessage.toLowerCase().includes('invalid')
      ) {
        errorMessage =
          "The password you entered is incorrect. Please check your password and try again.";
      } else if (
        serverMessage.toLowerCase().includes('account') ||
        serverMessage.toLowerCase().includes('suspended')
      ) {
        errorMessage =
          "There seems to be a problem with your account. Please contact support for assistance.";
      } else {
        errorMessage = serverMessage;
      }
    }
    // Network / timeout error
    else if (error.message === 'Network Error') {
      errorMessage =
        "We're having trouble connecting to our servers. Please check your internet connection and try again.";
    }

    showErrorPopup(errorMessage);
  } finally {
    setIsLoading(false);
  }
};


  const handleCreateAccount = () => {
    router.push('/CreateAccount'); 
  };
  
  const forgetpassword = () => {
    router.push('/ForgetPassword'); 
  };

  // Handle password input change - ensure no auto-capitalization
  const handlePasswordChange = (text) => {
    // Force lowercase for password input to prevent auto-capitalization issues
    const lowerCaseText = text.toLowerCase();
    setPassword(lowerCaseText);
    if (errors.password && text.trim()) {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/images/babahubbgless.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.header}>Welcome Back</Text>
            <Text style={styles.subHeader}>
              Sign in to continue your shopping journey
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
                  placeholder="hello@example.com"
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
                  autoCorrect={false}
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

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Password
                <Text style={styles.required}> *</Text>
              </Text>
              <View style={[
                styles.inputWrapper,
                passwordFocus && styles.inputWrapperFocused,
                errors.password && styles.inputWrapperError,
                isLoading && styles.inputDisabled
              ]}>
                <MaterialIcons 
                  name="lock" 
                  size={responsiveFont(20)} 
                  color={passwordFocus ? COLORS.primary : (errors.password ? COLORS.error : COLORS.grayLight)} 
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={passwordInputRef}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.grayLight}
                  style={styles.input}
                  secureTextEntry={!passwordVisible}
                  value={password}
                  onChangeText={handlePasswordChange}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                  underlineColorAndroid="transparent"
                  selectionColor={COLORS.primary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  keyboardType="default"
                  textContentType="password"
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  style={styles.visibilityButton}
                  disabled={isLoading}
                >
                  <MaterialIcons
                    name={passwordVisible ? 'visibility' : 'visibility-off'}
                    size={responsiveFont(22)}
                    color={errors.password ? COLORS.error : COLORS.gray}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <View style={styles.errorContainer}>
                  <MaterialIcons name="error-outline" size={responsiveFont(16)} color={COLORS.error} />
                  <Text style={styles.errorText}>{errors.password}</Text>
                </View>
              ) : null}
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.helperContainer}>
              <TouchableOpacity
                style={styles.rememberContainer}
                onPress={() => setChecked(!checked)}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <View style={[
                  styles.checkbox,
                  checked && styles.checkboxChecked
                ]}>
                  {checked && (
                    <MaterialIcons name="check" size={responsiveFont(16)} color={COLORS.white} />
                  )}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={forgetpassword} 
                disabled={isLoading}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            {isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Signing you in...</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled
                ]}
                onPress={handleLogin}
                activeOpacity={0.9}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>Sign In</Text>
                <MaterialIcons name="arrow-forward" size={responsiveFont(20)} color={COLORS.white} />
              </TouchableOpacity>
            )}

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Create Account */}
            <View style={styles.createAccountContainer}>
              <Text style={styles.createAccountText}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity 
                onPress={handleCreateAccount} 
                disabled={isLoading}
              >
                <Text style={styles.createAccountLink}>Create one</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Simple Small Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={hideErrorPopup}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={hideErrorPopup}
          >
            <Animated.View 
              style={[
                styles.modalContainer,
                {
                  transform: [{ scale: modalScaleAnim }]
                }
              ]}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <MaterialIcons 
                  name="error-outline" 
                  size={responsiveFont(24)} 
                  color={COLORS.error} 
                />
                <Text style={styles.modalTitle}>Login Failed</Text>
              </View>

              {/* Modal Body */}
              <View style={styles.modalBody}>
                <Text style={styles.modalMessage}>
                  {errorMessage}
                </Text>
              </View>

              {/* Modal Actions - Only Cancel Button */}
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={hideErrorPopup}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

// ... (styles remain exactly the same as your original)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: height,
    paddingVertical: responsiveHeight(2),
  },
  content: {
    paddingHorizontal: responsiveWidth(6),
    paddingVertical: responsiveHeight(2),
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: responsiveHeight(5),
  },
  logoContainer: {
    marginBottom: responsiveHeight(2.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: responsiveHeight(1) },
    shadowOpacity: 0.1,
    shadowRadius: responsiveWidth(4),
    elevation: 8,
  },
  logoImage: {
    width: responsiveWidth(35),
    height: responsiveWidth(35),
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
    lineHeight: responsiveHeight(2.8),
    paddingHorizontal: responsiveWidth(5),
  },
  formSection: {
    marginBottom: responsiveHeight(3.5),
  },
  inputContainer: {
    marginBottom: responsiveHeight(3),
  },
  label: {
    fontWeight: '600',
    marginBottom: responsiveHeight(1),
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
      height: responsiveHeight(0.25) 
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
      height: responsiveHeight(0.5) 
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
      height: responsiveHeight(0.5) 
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
    includeFontPadding: false,
  },
  visibilityButton: {
    padding: responsiveWidth(1),
    marginLeft: responsiveWidth(2),
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: responsiveHeight(1),
  },
  errorText: {
    color: COLORS.error,
    fontSize: responsiveFont(13),
    marginLeft: responsiveWidth(1.5),
    fontWeight: '500',
    flex: 1,
  },
  helperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveHeight(3),
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: responsiveWidth(5),
    height: responsiveWidth(5),
    borderWidth: 2,
    borderColor: COLORS.grayLight,
    borderRadius: responsiveWidth(1.5),
    marginRight: responsiveWidth(2),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberText: {
    fontSize: responsiveFont(14),
    color: COLORS.dark,
    fontWeight: '500',
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: responsiveFont(14),
    fontWeight: '600',
  },
  loaderContainer: {
    alignItems: 'center',
    paddingVertical: responsiveHeight(2),
  },
  loadingText: {
    marginTop: responsiveHeight(1.5),
    fontSize: responsiveFont(14),
    color: COLORS.gray,
    fontWeight: '500',
  },
  loginButton: {
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
      height: responsiveHeight(1) 
    },
    shadowOpacity: 0.25,
    shadowRadius: responsiveWidth(5),
    elevation: 12,
    gap: responsiveWidth(2),
    marginTop: responsiveHeight(1.2),
    marginBottom: responsiveHeight(2.5),
    borderWidth: 0.8,
    borderColor: COLORS.primaryDark,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: responsiveFont(18),
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: responsiveHeight(3),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.light,
  },
  dividerText: {
    marginHorizontal: responsiveWidth(4),
    color: COLORS.gray,
    fontSize: responsiveFont(14),
    fontWeight: '500',
  },
  createAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveHeight(2.5),
  },
  createAccountText: {
    fontSize: responsiveFont(15),
    color: COLORS.gray,
  },
  createAccountLink: {
    fontSize: responsiveFont(15),
    color: COLORS.primary,
    fontWeight: '700',
  },
  // Simple Small Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(10),
  },
  modalOverlayTouchable: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    maxWidth: responsiveWidth(75),
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(4),
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: responsiveHeight(0.5) },
        shadowOpacity: 0.2,
        shadowRadius: responsiveWidth(3),
      },
      android: {
        elevation: 6,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveHeight(2.5),
    paddingHorizontal: responsiveWidth(5),
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
    gap: responsiveWidth(3),
  },
  modalTitle: {
    fontSize: responsiveFont(18),
    fontWeight: '700',
    color: COLORS.dark,
    textAlign: 'center',
    includeFontPadding: false,
  },
  modalBody: {
    paddingVertical: responsiveHeight(2.5),
    paddingHorizontal: responsiveWidth(5),
  },
  modalMessage: {
    fontSize: responsiveFont(14),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: responsiveHeight(2.2),
    includeFontPadding: false,
  },
  modalActions: {
    padding: responsiveWidth(4),
    backgroundColor: COLORS.background,
  },
  modalButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.5),
    borderRadius: responsiveWidth(3),
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: responsiveFont(15),
    fontWeight: '600',
    includeFontPadding: false,
  },
});

export default Login;