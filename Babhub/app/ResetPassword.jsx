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
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Mybutton from '../components/Mybutton';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');

// Security constants
const RESET_TOKEN_KEY = 'reset_token';
const RESET_EMAIL_KEY = 'reset_email';
const RESET_TIMESTAMP_KEY = 'reset_timestamp';
const TOKEN_EXPIRY_TIME = 15 * 60 * 1000;

const ResetPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordFocus, setNewPasswordFocus] = useState(false);
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const validateResetSession = async () => {
      try {
        const resetToken = await SecureStore.getItemAsync(RESET_TOKEN_KEY);
        const storedEmail = await SecureStore.getItemAsync(RESET_EMAIL_KEY);
        const tokenTimestamp = await SecureStore.getItemAsync(RESET_TIMESTAMP_KEY);

        if (!resetToken || !storedEmail || !tokenTimestamp) {
          Alert.alert('Session Expired', 'Please start the password recovery process again.');
          router.replace('/ForgetPassword');
          return;
        }

        const currentTime = Date.now();
        const tokenTime = parseInt(tokenTimestamp);
        
        if (currentTime - tokenTime > TOKEN_EXPIRY_TIME) {
          await SecureStore.deleteItemAsync(RESET_TOKEN_KEY);
          await SecureStore.deleteItemAsync(RESET_EMAIL_KEY);
          await SecureStore.deleteItemAsync(RESET_TIMESTAMP_KEY);
          
          Alert.alert('Session Expired', 'Your reset session has expired. Please start over.');
          router.replace('/ForgetPassword');
          return;
        }

        setEmail(storedEmail);
        setIsSessionValid(true);
        
        const atIndex = storedEmail.indexOf('@');
        const username = atIndex > 0 ? storedEmail.substring(0, atIndex) : 'User';
        const displayName = username.length > 2 ? 
          username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1) : 
          '*'.repeat(username.length);
        setUserName(displayName);

      } catch (error) {
        console.error('Session validation error:', error);
        Alert.alert('Error', 'Session validation failed. Please try again.');
        router.replace('/ForgetPassword');
      }
    };

    validateResetSession();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    if (!isSessionValid) {
      Alert.alert('Session Expired', 'Please start the password recovery process again.');
      router.replace('/ForgetPassword');
      return;
    }

    setIsLoading(true);

    try {
      const resetToken = await SecureStore.getItemAsync(RESET_TOKEN_KEY);
      if (!resetToken) {
        Alert.alert('Session Expired', 'Please start the password recovery process again.');
        router.replace('/ForgetPassword');
        return;
      }

      console.log('Sending reset request for email:', email);
      
      // Remove the Authorization header since your backend doesn't expect it
      const response = await fetch("https://account.babahub.co/api/users/reset-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // Remove this line: "Authorization": `Bearer ${resetToken}`
        },
        body: JSON.stringify({ 
          email: email,
          newPassword: newPassword 
        }),
      });

      console.log('Response status:', response.status);

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        await SecureStore.deleteItemAsync(RESET_TOKEN_KEY);
        await SecureStore.deleteItemAsync(RESET_EMAIL_KEY);
        await SecureStore.deleteItemAsync(RESET_TIMESTAMP_KEY);

        Alert.alert(
          "Success", 
          "Your password has been reset successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace('/login');
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error('Full error details:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
        Alert.alert(
          'Connection Error', 
          'Cannot connect to the server. Please:\n\n• Check your internet connection\n• Verify the server is running\n• Try again in a few moments'
        );
      } else if (error.message.includes('HTTP error')) {
        Alert.alert('Server Error', `Server returned an error: ${error.message}`);
      } else {
        Alert.alert('Error', `An unexpected error occurred: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRecovery = () => {
    router.replace('/ForgetPassword');
  };

  const maskEmail = (email) => {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return '*'.repeat(localPart.length) + '@' + domain;
    }
    return localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1) + '@' + domain;
  };

  if (!isSessionValid) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Validating session security...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Reset Password</Text>
      <Text style={styles.subHeader}>
        Create a new password for your account
      </Text>

      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfoText}>Account: {userName}</Text>
        <Text style={styles.emailText}>{maskEmail(email)}</Text>
        <Text style={styles.securityNote}>Secure session • Expires in 15 minutes</Text>
      </View>

      <Text style={styles.label}>New Password *</Text>
      <View
        style={[
          styles.passwordInputContainer,
          newPasswordFocus && styles.inputActive,
          errors.newPassword && styles.inputError,
        ]}
      >
        <TextInput
          placeholder="Enter new password (min. 6 characters)"
          style={styles.passwordInput}
          secureTextEntry={!newPasswordVisible}
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            if (errors.newPassword && text) {
              setErrors((prev) => ({ ...prev, newPassword: "" }));
            }
            if (errors.confirmPassword && text === confirmPassword) {
              setErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }
          }}
          onFocus={() => setNewPasswordFocus(true)}
          onBlur={() => setNewPasswordFocus(false)}
          underlineColorAndroid="transparent"
          selectionColor="#3366FF"
          editable={!isLoading}
        />
        <TouchableOpacity onPress={() => setNewPasswordVisible(!newPasswordVisible)}>
          <MaterialIcons
            name={newPasswordVisible ? "visibility" : "visibility-off"}
            size={22}
            color="#888"
          />
        </TouchableOpacity>
      </View>
      {errors.newPassword ? (
        <Text style={styles.errorText}>{errors.newPassword}</Text>
      ) : null}

      <Text style={styles.label}>Confirm New Password *</Text>
      <View
        style={[
          styles.passwordInputContainer,
          confirmPasswordFocus && styles.inputActive,
          errors.confirmPassword && styles.inputError,
        ]}
      >
        <TextInput
          placeholder="Confirm new password"
          style={styles.passwordInput}
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
          selectionColor="#3366FF"
          editable={!isLoading}
        />
        <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
          <MaterialIcons
            name={confirmPasswordVisible ? "visibility" : "visibility-off"}
            size={22}
            color="#888"
          />
        </TouchableOpacity>
      </View>
      {errors.confirmPassword ? (
        <Text style={styles.errorText}>{errors.confirmPassword}</Text>
      ) : null}

      <Mybutton 
        btntitle={isLoading ? "Resetting..." : "Reset Password"} 
        onPress={handleResetPassword}
        disabled={isLoading || !isSessionValid}
      />

      <TouchableOpacity onPress={handleBackToRecovery} disabled={isLoading}>
        <Text style={[styles.backButton, isLoading && styles.disabledText]}>
          Back to Recovery
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  userInfoContainer: {
    backgroundColor: '#F0F5FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#3366FF',
  },
  userInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3366FF',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  securityNote: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: width > 400 ? 16 : 14,
    color: '#333',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    marginBottom: 10,
    height: height < 700 ? 45 : 50,
  },
  passwordInput: {
    flex: 1,
    fontSize: width > 400 ? 16 : 15,
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
    color: '#000',
  },
  inputActive: {
    borderColor: '#3366FF',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 15,
    marginTop: -5,
  },
  backButton: {
    color: '#3366FF',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
    fontSize: width > 400 ? 16 : 14,
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default ResetPassword;