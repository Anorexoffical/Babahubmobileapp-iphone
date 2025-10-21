import { Tabs, useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { View, ActivityIndicator, BackHandler } from 'react-native';

export default function TabLayout() {
  const { userToken, isLoading } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isLoading && !userToken) {
      router.replace('/login');
    }
  }, [userToken, isLoading]);

  // Handle back button in tab navigator
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Get current route name
      const currentRoute = navigation.getState()?.routes[navigation.getState().index]?.name;
      
      // If we're on HomeScreen, minimize the app
      if (currentRoute === 'HomeScreen') {
        BackHandler.exitApp();
        return true;
      }
      
      // For other tabs, let the default back behavior work
      return false;
    });

    return () => backHandler.remove();
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3366FF" />
      </View>
    );
  }

  if (!userToken) {
    return null;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: '#000000',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = '';

          if (route.name === 'HomeScreen') {
            iconName = 'home-outline';
          } else if (route.name === 'StoreScreen') {
            iconName = 'bag-outline';
          } else if (route.name === 'WishlistScreen') {
            iconName = 'heart-outline';
          } else if (route.name === 'ProfileScreen') {
            iconName = 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="HomeScreen" options={{ title: 'Home' }} />
      <Tabs.Screen name="StoreScreen" options={{ title: 'Store' }} />
      <Tabs.Screen name="WishlistScreen" options={{ title: 'Wishlist' }} />
      <Tabs.Screen name="ProfileScreen" options={{ title: 'Profile' }} />
    </Tabs>
  );
}