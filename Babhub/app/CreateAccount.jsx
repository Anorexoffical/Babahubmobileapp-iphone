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
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

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

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [errors, setErrors] = useState({});

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
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
    setErrors({});
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
          headers: { "Content-Type": "application/json" },
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
        }
        
        Alert.alert(
          "Registration Failed",
          errorMessage,
          [{ text: "OK" }]
        );
      }
    } catch (err) {
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
    // Use router.back() to go back to previous screen (login) instead of pushing new page
    router.back();
  };

  const handleBackToLogin = () => {
    // Use router.back() to go back to previous screen instead of pushing new page
    router.back();
  };

  const scrollViewRef = React.useRef();

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
          <View style={styles.headerSection}>
            <View style={styles.headerIcon}>
              <MaterialIcons name="person-add" size={32} color={COLORS.primary} />
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
                  size={20} 
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
                  <MaterialIcons name="info" size={14} color={COLORS.primary} />
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
                    size={20} 
                    color={dobFocus ? COLORS.primary : (errors.dob ? COLORS.error : COLORS.grayLight)} 
                    style={styles.inputIcon}
                  />
                  <Text style={[dob ? styles.dobText : styles.placeholderText]}>
                    {dob || "DD/MM/YYYY"}
                  </Text>
                  <MaterialIcons 
                    name="arrow-drop-down" 
                    size={24} 
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
                />
                <TouchableOpacity 
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  style={styles.visibilityButton}
                  disabled={isLoading}
                >
                  <MaterialIcons
                    name={passwordVisible ? "visibility" : "visibility-off"}
                    size={22}
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
                  size={20} 
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
                />
                <TouchableOpacity
                  onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  style={styles.visibilityButton}
                  disabled={isLoading}
                >
                  <MaterialIcons
                    name={confirmPasswordVisible ? "visibility" : "visibility-off"}
                    size={22}
                    color={COLORS.gray}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
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
                  <MaterialIcons name="loop" size={20} color={COLORS.white} />
                  <Text style={styles.createAccountButtonText}>Creating Account...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.createAccountButtonText}>Create Account</Text>
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

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By creating an account, you agree to our{" "}
              <Text style={styles.footerLink}>Terms of Service</Text> and{" "}
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Success Modal with Confetti */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={handleSuccessContinue}
      >
        <View style={styles.modalOverlay}>
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
              <MaterialIcons name="arrow-back" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
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
    fontSize: 32,
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
    marginBottom: 20,
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
  // DOB Specific Styles
  dobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dobHelper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  dobHelperText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Input Styles
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
  visibilityButton: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  helperText: {
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  createAccountButton: {
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
  createAccountButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createAccountButtonText: {
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
  footer: {
    alignItems: 'center',
    paddingTop: 10,
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
  },
  securityReminder: {
    fontSize: 14,
    color: COLORS.darkLight,
    fontWeight: '500',
    fontStyle: 'italic',
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
});

export default CreateAccount;