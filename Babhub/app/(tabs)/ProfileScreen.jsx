import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();

  // Generate monogram from user's name
  const getMonogram = () => {
    if (user?.name) {
      const names = user.name.split(' ');
      if (names.length === 1) return names[0].charAt(0).toUpperCase();
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return "WM"; // Default monogram
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileInfo}
          onPress={() => navigation.navigate('ProfileDetailsScreen')}
        >
          <View style={styles.avatarContainer}>
            <Text style={styles.monogram}>{getMonogram()}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || "Guest"}</Text>
            <Text style={styles.userEmail}>{user?.email || "Not logged in"}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>

        <MenuItem
          icon="cart-outline"
          title="My Cart"
          subtitle="Add, remove products and move to checkout"
          onPress={() => navigation.navigate('CartScreen')}
        />

        <MenuItem
          icon="reorder-three-outline"
          title="My Orders"
          subtitle="In-progress and Completed Orders"
          onPress={() => navigation.navigate('MyOrder')}
        />

        <MenuItem
          icon="headset-outline"
          title="Customer Support"
          subtitle="Contact our support team"
          onPress={() => navigation.navigate('CustomerSupport')}
        />

        <MenuItem
          icon="shield-checkmark-outline"
          title="Privacy Policy"
          subtitle="How we handle your information"
          onPress={() => navigation.navigate('PrivacyPolicyScreen')}
        />
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await signOut(); 
          navigation.replace("login");
        }}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const MenuItem = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={24} color="#000" />
    </View>
    <View style={styles.menuText}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#000" />
  </TouchableOpacity>
);

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#000',
    padding: width * 0.06,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: height * 0.05,
    paddingBottom: height * 0.04,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  profileInfo: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  avatarContainer: {
    height: width * 0.18,
    width: width * 0.18,
    borderRadius: width * 0.09,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  monogram: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#000',
  },
  userDetails: { 
    marginLeft: width * 0.04 
  },
  userName: { 
    color: '#fff', 
    fontSize: width * 0.05, 
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: { 
    color: '#ddd', 
    fontSize: width * 0.035,
  },
  section: { 
    padding: width * 0.05,
    marginTop: height * 0.02,
  },
  sectionTitle: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    marginBottom: height * 0.03,
    color: '#000',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.03,
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.03,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
  },
  iconContainer: {
    backgroundColor: '#fff',
    padding: width * 0.025,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  menuText: {
    flex: 1,
    marginLeft: width * 0.04,
  },
  menuTitle: { 
    fontSize: width * 0.04, 
    fontWeight: '600', 
    color: '#000',
    marginBottom: 2,
  },
  menuSubtitle: { 
    fontSize: width * 0.032, 
    color: '#666',
  },
  logoutButton: {
    marginHorizontal: width * 0.05,
    borderWidth: 2,
    borderColor: '#000',
    paddingVertical: height * 0.02,
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: height * 0.05,
    marginTop: height * 0.01,
    backgroundColor: '#000',
  },
  logoutText: { 
    fontSize: width * 0.04, 
    fontWeight: 'bold', 
    color: '#fff',
  },
});