import { Tabs, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { BackHandler, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const tabFontSize = Math.max(Math.round((width / 375) * 11), 10);

export default function TabLayout() {
  const navigation = useNavigation();

  // Handle back button in tab navigator
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      const currentRoute = navigation.getState()?.routes[navigation.getState().index]?.name;
      if (currentRoute === 'HomeScreen') {
        BackHandler.exitApp();
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [navigation]);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: '#000000',
        tabBarLabelStyle: {
          fontSize: tabFontSize,
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