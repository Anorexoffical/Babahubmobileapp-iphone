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
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Mybutton from '../components/Mybutton';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from './contexts/AuthContext';

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

const Login = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const [checked, setChecked] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const handleLogin = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);

    try {
      const response = await fetch("https://account.babahub.co/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role: "customer",
        }),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (response.ok) {
        const { user } = data;
        const authToken = "mock-or-jwt"; // replace with real JWT later
        await signIn(authToken, user);
        router.replace("/(tabs)/HomeScreen");
      } else {
        let errorMessage = data.message || "Invalid credentials";
        
        if (data.message?.toLowerCase().includes('email') || data.message?.toLowerCase().includes('not found')) {
          errorMessage = "📧 This email address isn't registered with BabaHub.\n\nPlease check if you entered the correct email address or create a new account.";
        } else if (data.message?.toLowerCase().includes('password') || data.message?.toLowerCase().includes('invalid')) {
          errorMessage = "🔐 The password you entered is incorrect.\n\nPlease check your password and try again, or reset your password if you've forgotten it.";
        } else if (data.message?.toLowerCase().includes('account') || data.message?.toLowerCase().includes('suspended')) {
          errorMessage = "⚠️ Account Issue\n\nThere seems to be a problem with your account. Please contact support for assistance.";
        }
        
        Alert.alert("Login Failed", errorMessage);
      }
    } catch (err) {
      console.error("Login error:", err.message);
      let connectionErrorMessage = "📡 Connection Issue\n\nWe're having trouble connecting to our servers. Please check your internet connection and try again.";
      
      if (err.message.includes('Network request failed')) {
        connectionErrorMessage = "📡 Connection Issue\n\nWe're having trouble connecting to our servers. Please check your internet connection and try again.";
      } else {
        connectionErrorMessage = "⚠️ Something went wrong\n\nPlease try again in a moment. If the problem continues, contact our support team.";
      }
      
      Alert.alert("Connection Error", connectionErrorMessage);
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

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                  size={20} 
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
                  size={20} 
                  color={passwordFocus ? COLORS.primary : (errors.password ? COLORS.error : COLORS.grayLight)} 
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.grayLight}
                  style={styles.input}
                  secureTextEntry={!passwordVisible}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password && text.trim()) {
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }
                  }}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                  underlineColorAndroid="transparent"
                  selectionColor={COLORS.primary}
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  style={styles.visibilityButton}
                  disabled={isLoading}
                >
                  <MaterialIcons
                    name={passwordVisible ? 'visibility' : 'visibility-off'}
                    size={22}
                    color={errors.password ? COLORS.error : COLORS.gray}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <View style={styles.errorContainer}>
                  <MaterialIcons name="error-outline" size={16} color={COLORS.error} />
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
                    <MaterialIcons name="check" size={16} color={COLORS.white} />
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
                <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
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

          {/* Footer */}
          {/* <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Text>
          </View> */}
        </Animated.View>
      </ScrollView>
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
    justifyContent: 'center',
    minHeight: height - 100,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  logoImage: {
    width: 140,
    height: 140,
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
  helperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.grayLight,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberText: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '500',
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loaderContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  loginButton: {
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
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.light,
  },
  dividerText: {
    marginHorizontal: 16,
    color: COLORS.gray,
    fontSize: 14,
    fontWeight: '500',
  },
  createAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  createAccountText: {
    fontSize: 15,
    color: COLORS.gray,
  },
  createAccountLink: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.grayLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default Login;