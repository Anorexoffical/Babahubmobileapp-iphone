// app/ForgetPassword.jsx (updated with secure session management)
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
} from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import Mybutton from '../components/Mybutton';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');

// Security constants
const RESET_TOKEN_KEY = 'reset_token';
const RESET_EMAIL_KEY = 'reset_email';
const RESET_TIMESTAMP_KEY = 'reset_timestamp';
const TOKEN_EXPIRY_TIME = 15 * 60 * 1000; // 15 minutes

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

  // Generate secure random token
  const generateSecureToken = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const handleRecoverPassword = async () => {
    // Validation
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }
    
    if (!dob) newErrors.dob = "Date of birth is required";

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Verify credentials with backend
      const response = await fetch("https://account.babahub.co/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, dob }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Generate secure token and store session data
        const resetToken = generateSecureToken();
        
        // Store all session data securely
        await SecureStore.setItemAsync(RESET_TOKEN_KEY, resetToken);
        await SecureStore.setItemAsync(RESET_EMAIL_KEY, email);
        await SecureStore.setItemAsync(RESET_TIMESTAMP_KEY, Date.now().toString());
        
        // Clear any previous errors
        setErrors({});
        
        // Navigate to reset password page WITHOUT parameters
        router.push('/ResetPassword');
      } else {
        // Show specific error message from backend
        Alert.alert("Error", data.message || "Failed to verify credentials");
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.header}>Recover Password</Text>
      <Text style={styles.subHeader}>
        Enter your email and date of birth to recover your password
      </Text>

      <Text style={styles.label}>Email *</Text>
      <TextInput
        placeholder="hello@example.com"
        style={[
          styles.input, 
          emailFocus && styles.inputActive,
          errors.email && styles.inputError
        ]}
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
        selectionColor="#3366FF"
        autoCapitalize="none"
        editable={!isLoading}
      />
      {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

      <Text style={styles.label}>Date of Birth *</Text>
      <TouchableOpacity onPress={showDatepicker} disabled={isLoading}>
        <View
          style={[
            styles.input,
            dobFocus && styles.inputActive,
            errors.dob && styles.inputError,
            styles.dobInput,
            isLoading && styles.disabledInput
          ]}
        >
          <Text style={[dob ? styles.dobText : styles.placeholderText]}>
            {dob || "DD/MM/YYYY"}
          </Text>
          <MaterialIcons name="calendar-today" size={20} color="#888" />
        </View>
      </TouchableOpacity>
      {errors.dob ? <Text style={styles.errorText}>{errors.dob}</Text> : null}

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        maximumDate={new Date()}
        date={selectedDate}
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisibility(false)}
      />

      <Mybutton 
        btntitle={isLoading ? "Verifying..." : "Recover Password"} 
        onPress={handleRecoverPassword}
        disabled={isLoading}
      />

      <TouchableOpacity onPress={handleBackToLogin} disabled={isLoading}>
        <Text style={[styles.backToLogin, isLoading && styles.disabledText]}>
          Back to Login
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: width > 500 ? width * 0.15 : 24,
    paddingVertical: height < 700 ? 20 : 40,
    backgroundColor: '#fff',
    minHeight: height,
  },
  header: {
    fontSize: width > 400 ? 32 : 28,
    fontWeight: '700',
    marginBottom: 10,
    color: '#222',
    textAlign: 'center',
    marginTop: height * 0.02,
  },
  subHeader: {
    fontSize: width > 400 ? 18 : 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: width * 0.05,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: width > 400 ? 16 : 14,
    color: '#333',
  },
  input: {
    height: height < 700 ? 45 : 50,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 18,
    marginBottom: 10,
    backgroundColor: '#fff',
    fontSize: width > 400 ? 16 : 15,
    justifyContent: 'center',
  },
  inputActive: {
    borderColor: '#3366FF',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  disabledInput: {
    opacity: 0.5,
  },
  dobInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dobText: {
    fontSize: width > 400 ? 16 : 15,
    color: '#000',
  },
  placeholderText: {
    fontSize: width > 400 ? 16 : 15,
    color: '#888',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 15,
    marginTop: -5,
  },
  backToLogin: {
    color: '#3366FF',
    textAlign: 'center',
    marginTop: 30,
    fontWeight: '600',
    fontSize: width > 400 ? 16 : 14,
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default ForgetPassword;