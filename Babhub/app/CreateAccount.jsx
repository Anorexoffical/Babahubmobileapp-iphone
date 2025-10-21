// app/CreateAccount.jsx
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
  Modal,
  StatusBar,
  Linking,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

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

const CreateAccount = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameFocus, setNameFocus] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [dobFocus, setDobFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [errors, setErrors] = useState({});

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
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

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

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

  const clearForm = () => {
    setName("");
    setEmail("");
    setDob("");
    setPassword("");
    setConfirmPassword("");
    setSelectedDate(new Date());
    setNameFocus(false);
    setEmailFocus(false);
    setDobFocus(false);
    setPasswordFocus(false);
    setConfirmPasswordFocus(false);
    setAcceptedTerms(false);
    setErrors({});
  };

  const openPrivacyPolicy = () => {
    Linking.openURL("https://babahub.co/index.php/privacy-policy/").catch((err) =>
      Alert.alert("Error", "Unable to open privacy policy")
    );
  };

  const openTermsOfService = () => {
    Linking.openURL("https://babahub.co/index.php/terms-of-service/").catch((err) =>
      Alert.alert("Error", "Unable to open terms of service")
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }
    if (!dob) newErrors.dob = "Date of birth is required";
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!acceptedTerms) {
      newErrors.terms = "Please accept the Terms and Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://account.babahub.co/api/users/register",
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ 
            name: name.trim(),
            email: email.toLowerCase().trim(), 
            dob, 
            password,
            role: "customer"
          }),
        }
      );

      const data = await response.json();
      console.log("Registration response:", data);

      if (response.ok) {
        // Show success modal with confetti instead of alert
        setShowSuccessModal(true);
      } else {
        // Enhanced error messages for existing users
        let errorMessage = data.message || "Something went wrong";
        
        if (errorMessage.toLowerCase().includes("email") || errorMessage.toLowerCase().includes("already")) {
          errorMessage = `An account with email ${email} already exists. Please try signing in or use a different email address.`;
        } else if (errorMessage.toLowerCase().includes("user") || errorMessage.toLowerCase().includes("exists")) {
          errorMessage = "This user already exists. Please try signing in or use different credentials.";
        } else if (data.errors) {
          // Handle validation errors from server
          const serverErrors = Object.values(data.errors).join(', ');
          errorMessage = serverErrors || "Please check your information and try again.";
        }
        
        Alert.alert(
          "Registration Failed",
          errorMessage,
          [{ text: "OK" }]
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      Alert.alert(
        "Connection Error",
        "Unable to connect to server. Please check your internet connection and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
    clearForm();
    router.back();
  };

  const handleBackToLogin = () => {
    router.back();
  };

  const scrollViewRef = React.useRef();

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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : responsiveHeight(2)}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.container}
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
                <MaterialIcons name="person-add" size={responsiveFont(32)} color={COLORS.primary} />
              </View>
              <Text style={styles.header}>Join BabaHub</Text>
              <Text style={styles.subHeader}>
                Create your account and start your shopping journey
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Full Name
                  <Text style={styles.required}> *</Text>
                </Text>
                <View style={[
                  styles.inputWrapper,
                  nameFocus && styles.inputWrapperFocused,
                  errors.name && styles.inputWrapperError,
                  isLoading && styles.inputDisabled
                ]}>
                  <MaterialIcons 
                    name="person" 
                    size={responsiveFont(20)} 
                    color={nameFocus ? COLORS.primary : (errors.name ? COLORS.error : COLORS.grayLight)} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="John Doe"
                    placeholderTextColor={COLORS.grayLight}
                    style={styles.input}
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (errors.name && text.trim()) {
                        setErrors((prev) => ({ ...prev, name: "" }));
                      }
                    }}
                    onFocus={() => setNameFocus(true)}
                    onBlur={() => setNameFocus(false)}
                    underlineColorAndroid="transparent"
                    selectionColor={COLORS.primary}
                    editable={!isLoading}
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete="name"
                    textContentType="name"
                  />
                </View>
                {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
              </View>

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
                    editable={!isLoading}
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                  />
                </View>
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
              </View>

              {/* DOB Input */}
              <View style={styles.inputContainer}>
                <View style={styles.dobHeader}>
                  <Text style={styles.label}>
                    Date of Birth
                    <Text style={styles.required}> *</Text>
                  </Text>
                  <View style={styles.dobHelper}>
                    <MaterialIcons name="info" size={responsiveFont(14)} color={COLORS.primary} />
                    <Text style={styles.dobHelperText}>For account recovery</Text>
                  </View>
                </View>
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
                      size={responsiveFont(20)} 
                      color={dobFocus ? COLORS.primary : (errors.dob ? COLORS.error : COLORS.grayLight)} 
                      style={styles.inputIcon}
                    />
                    <Text style={[dob ? styles.dobText : styles.placeholderText]}>
                      {dob || "DD/MM/YYYY"}
                    </Text>
                    <MaterialIcons 
                      name="arrow-drop-down" 
                      size={responsiveFont(24)} 
                      color={COLORS.gray} 
                    />
                  </View>
                </TouchableOpacity>
                {errors.dob ? (
                  <Text style={styles.errorText}>{errors.dob}</Text>
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
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.grayLight}
                    style={styles.input}
                    secureTextEntry={!passwordVisible}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password && text) {
                        setErrors((prev) => ({ ...prev, password: "" }));
                      }
                      if (errors.confirmPassword && text === confirmPassword) {
                        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                      }
                    }}
                    onFocus={() => setPasswordFocus(true)}
                    onBlur={() => setPasswordFocus(false)}
                    underlineColorAndroid="transparent"
                    selectionColor={COLORS.primary}
                    editable={!isLoading}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    keyboardType="default"
                    textContentType="newPassword"
                    importantForAutofill="yes"
                  />
                  <TouchableOpacity 
                    onPress={() => setPasswordVisible(!passwordVisible)}
                    style={styles.visibilityButton}
                    disabled={isLoading}
                  >
                    <MaterialIcons
                      name={passwordVisible ? "visibility" : "visibility-off"}
                      size={responsiveFont(22)}
                      color={COLORS.gray}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : (
                  <Text style={styles.helperText}>Must be at least 6 characters</Text>
                )}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Confirm Password
                  <Text style={styles.required}> *</Text>
                </Text>
                <View style={[
                  styles.inputWrapper,
                  confirmPasswordFocus && styles.inputWrapperFocused,
                  errors.confirmPassword && styles.inputWrapperError,
                  isLoading && styles.inputDisabled
                ]}>
                  <MaterialIcons 
                    name="lock-outline" 
                    size={responsiveFont(20)} 
                    color={confirmPasswordFocus ? COLORS.primary : (errors.confirmPassword ? COLORS.error : COLORS.grayLight)} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.grayLight}
                    style={styles.input}
                    secureTextEntry={!confirmPasswordVisible}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword && text) {
                        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                      }
                    }}
                    onFocus={() => setConfirmPasswordFocus(true)}
                    onBlur={() => setConfirmPasswordFocus(false)}
                    underlineColorAndroid="transparent"
                    selectionColor={COLORS.primary}
                    editable={!isLoading}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    keyboardType="default"
                    textContentType="newPassword"
                    importantForAutofill="yes"
                  />
                  <TouchableOpacity
                    onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    style={styles.visibilityButton}
                    disabled={isLoading}
                  >
                    <MaterialIcons
                      name={confirmPasswordVisible ? "visibility" : "visibility-off"}
                      size={responsiveFont(22)}
                      color={COLORS.gray}
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword ? (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                ) : null}
              </View>

              {/* Single Terms and Privacy Checkbox */}
              <View style={styles.checkboxContainer}>
                <View style={styles.checkboxRow}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      acceptedTerms && styles.checkboxChecked,
                      errors.terms && styles.checkboxError
                    ]}
                    onPress={() => {
                      setAcceptedTerms(!acceptedTerms);
                      if (errors.terms) {
                        setErrors((prev) => ({ ...prev, terms: "" }));
                      }
                    }}
                    disabled={isLoading}
                  >
                    {acceptedTerms && (
                      <MaterialIcons name="check" size={responsiveFont(16)} color={COLORS.white} />
                    )}
                  </TouchableOpacity>
                  <View style={styles.checkboxTextContainer}>
                    <Text style={styles.checkboxLabel}>
                      I agree to the{" "}
                      <Text style={styles.checkboxLink} onPress={openTermsOfService}>
                        Terms of Service
                      </Text>{" "}
                      and{" "}
                      <Text style={styles.checkboxLink} onPress={openPrivacyPolicy}>
                        Privacy Policy
                      </Text>
                    </Text>
                  </View>
                </View>
                {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}
              </View>

              {/* Create Account Button */}
              <TouchableOpacity
                style={[
                  styles.createAccountButton,
                  isLoading && styles.createAccountButtonDisabled
                ]}
                onPress={handleCreateAccount}
                activeOpacity={0.9}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <MaterialIcons name="loop" size={responsiveFont(20)} color={COLORS.white} />
                    <Text style={styles.createAccountButtonText}>Creating Account...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.createAccountButtonText}>Create Account</Text>
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
            
            <Text style={styles.successTitle}>🎉 Welcome to BabaHub!</Text>
            
            <Text style={styles.successMessage}>
              Your account has been created successfully!{"\n\n"}
              <Text style={styles.securityReminder}>
                💡 Remember: Your date of birth will be used to verify your identity 
                if you ever need to reset your password.
              </Text>
            </Text>

            <TouchableOpacity
              style={styles.successButton}
              onPress={handleSuccessContinue}
              activeOpacity={0.9}
            >
              <Text style={styles.successButtonText}>Back to Login</Text>
              <MaterialIcons name="arrow-back" size={responsiveFont(20)} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* White Navigation Bar Spacer for iOS in Modal */}
          {Platform.OS === 'ios' && <View style={[styles.modalNavigationBarSpacer, { height: safeAreaBottom }]} />}
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
  container: {
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
    fontSize: responsiveFont(32),
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
    marginBottom: responsiveHeight(2),
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
  // DOB Specific Styles
  dobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveHeight(0.8),
  },
  dobHelper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(0.4),
    borderRadius: responsiveWidth(2),
    gap: responsiveWidth(1),
  },
  dobHelperText: {
    fontSize: responsiveFont(11),
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Input Styles
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
  dobInput: {
    justifyContent: 'space-between',
  },
  dobText: {
    fontSize: responsiveFont(16),
    color: COLORS.dark,
    flex: 1,
  },
  placeholderText: {
    fontSize: responsiveFont(16),
    color: COLORS.grayLight,
    flex: 1,
  },
  visibilityButton: {
    padding: responsiveWidth(1),
    marginLeft: responsiveWidth(2),
  },
  errorText: {
    color: COLORS.error,
    fontSize: responsiveFont(12),
    marginTop: responsiveHeight(0.6),
    fontWeight: '500',
  },
  helperText: {
    color: COLORS.gray,
    fontSize: responsiveFont(12),
    marginTop: responsiveHeight(0.6),
    fontWeight: '500',
  },
  // Checkbox Styles
  checkboxContainer: {
    marginBottom: responsiveHeight(2),
    marginTop: responsiveHeight(1),
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: responsiveHeight(1.2),
  },
  checkbox: {
    width: responsiveWidth(5),
    height: responsiveWidth(5),
    borderRadius: responsiveWidth(1.5),
    borderWidth: 2,
    borderColor: COLORS.grayLight,
    marginRight: responsiveWidth(3),
    marginTop: responsiveHeight(0.2),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxError: {
    borderColor: COLORS.error,
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: responsiveFont(14),
    color: COLORS.dark,
    lineHeight: responsiveHeight(2),
  },
  checkboxLink: {
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Button Styles
  createAccountButton: {
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
  createAccountButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(2),
  },
  createAccountButtonText: {
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
  },
  securityReminder: {
    fontSize: responsiveFont(14),
    color: COLORS.darkLight,
    fontWeight: '500',
    fontStyle: 'italic',
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
});

export default CreateAccount;