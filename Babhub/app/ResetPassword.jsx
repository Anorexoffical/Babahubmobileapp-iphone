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
import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Mybutton from '../components/Mybutton';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const ResetPassword = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordFocus, setNewPasswordFocus] = useState(false);
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
      const response = await fetch("https://account.babahub.co/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email,
          newPassword: newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          "Success", 
          "Your password has been reset successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace('/Login');
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", data.message || "Failed to reset password");
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRecovery = () => {
    router.back();
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.header}>Reset Password</Text>
      <Text style={styles.subHeader}>
        Create a new password for your account
      </Text>

      <Text style={styles.emailText}>Resetting password for: {email}</Text>

      <Text style={styles.label}>New Password *</Text>
      <View
        style={[
          styles.passwordInputContainer,
          newPasswordFocus && styles.inputActive,
          errors.newPassword && styles.inputError,
        ]}
      >
        <TextInput
          placeholder="Enter new password"
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
  emailText: {
    fontSize: 14,
    color: '#3366FF',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
    backgroundColor: '#F0F5FF',
    padding: 12,
    borderRadius: 8,
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