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

const ResetPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedEmail = await SecureStore.getItemAsync('reset_email');
        const storedUserName = await SecureStore.getItemAsync('reset_username');
        
        if (!storedEmail) {
          Alert.alert('Session Expired', 'Please start the password recovery process again.');
          router.replace('/ForgetPassword');
          return;
        }
        
        setEmail(storedEmail);
        setUserName(storedUserName || 'User'); // Fallback to 'User' if name not available
      } catch (error) {
        console.error('Session check error:', error);
        router.replace('/ForgetPassword');
      }
    };

    checkSession();
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

    setIsLoading(true);

    try {
      console.log('Attempting password reset for:', email);
      
      const response = await fetch("https://account.babahub.co/api/users/reset-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: email,
          newPassword: newPassword 
        }),
      });

      console.log('Response status:', response.status);

      // First get the response text
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid server response format');
      }

      if (response.ok && data.success) {
        // Clear session data
        await SecureStore.deleteItemAsync('reset_email');
        await SecureStore.deleteItemAsync('reset_username');
        await SecureStore.deleteItemAsync('reset_token');
        await SecureStore.deleteItemAsync('reset_timestamp');
        
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
        Alert.alert("Error", data.message || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.message.includes('Network request failed')) {
        Alert.alert(
          'Connection Error', 
          'Cannot connect to the server. Please check your internet connection and try again.'
        );
      } else {
        Alert.alert('Error', error.message || 'An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRecovery = () => {
    router.replace('/ForgetPassword');
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Reset Password</Text>
      <Text style={styles.subHeader}>
        Create a new password for your account
      </Text>

      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfoText}>Resetting password for:</Text>
        <Text style={styles.nameText}>{userName}</Text>
        <Text style={styles.emailHint}>({email})</Text>
      </View>

      <Text style={styles.label}>New Password *</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[
            styles.input,
            errors.newPassword && styles.inputError,
            styles.passwordInput,
          ]}
          placeholder="Enter new password (min. 6 characters)"
          secureTextEntry={!showNewPassword}
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            if (errors.newPassword) setErrors({...errors, newPassword: ''});
          }}
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={toggleNewPasswordVisibility}
          disabled={isLoading}
        >
          <MaterialIcons 
            name={showNewPassword ? "visibility" : "visibility-off"} 
            size={24} 
            color="#666" 
          />
        </TouchableOpacity>
      </View>
      {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}

      <Text style={styles.label}>Confirm New Password *</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[
            styles.input,
            errors.confirmPassword && styles.inputError,
            styles.passwordInput,
          ]}
          placeholder="Confirm new password"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
          }}
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={toggleConfirmPasswordVisibility}
          disabled={isLoading}
        >
          <MaterialIcons 
            name={showConfirmPassword ? "visibility" : "visibility-off"} 
            size={24} 
            color="#666" 
          />
        </TouchableOpacity>
      </View>
      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

      <Mybutton 
        btntitle={isLoading ? "Resetting..." : "Reset Password"} 
        onPress={handleResetPassword}
        disabled={isLoading}
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
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: '#fff',
    minHeight: height,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
    color: '#222',
    textAlign: 'center',
    marginTop: 20,
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  userInfoContainer: {
    backgroundColor: '#F0F5FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: 'center',
  },
  userInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3366FF',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '700',
    marginBottom: 2,
  },
  emailHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  passwordInput: {
    paddingRight: 50, // Make space for the eye icon
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 13,
    zIndex: 1,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 15,
  },
  backButton: {
    color: '#3366FF',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
    fontSize: 16,
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default ResetPassword;