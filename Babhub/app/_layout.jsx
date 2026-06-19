
import { Stack, useRouter, useSegments, useNavigation } from 'expo-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useEffect, useRef } from 'react';
import { View, ActivityIndicator, BackHandler } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Keep splash visible until manually hidden
SplashScreen.preventAutoHideAsync();

// ----------------------
// Route Protection
// ----------------------
function RouteProtection({ children }) {
  const { userToken, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigation = useNavigation();
  const splashHidden = useRef(false);

  useEffect(() => {
    const handleNavigation = async () => {
      if (isLoading) return;

      // Hide splash screen only once
      if (!splashHidden.current) {
        try {
          await SplashScreen.hideAsync();
          splashHidden.current = true;
        } catch (error) {
          console.log('Splash screen hide error:', error);
        }
      }

      // Routes that still require login (hard-protected, no login wall fallback)
      const hardProtectedRoutes = [
        'Checkout',
        'CustomerSupport',
        'MyOrder',
        'ProfileDetailsScreen',
        'OrderSuccessScreen',
        'PaymentScreen',
        'PaymentCancelledScreen',
      ];

      // Public routes (always accessible)
      const publicRoutes = [
        'index',
        'login',
        'ForgetPassword',
        'CreateAccount',
        'ResetPassword',
        '404',
        // Tabs are now public — login wall is handled inside each tab action
        '(tabs)',
        'PrivacyPolicyScreen',
        'ReturnPolicyScreen',
        'ProductDetailPage',
        // CartScreen accessible to all — checkout button is gated inside
        'CartScreen',
      ];

      const currentRoute = segments[0] || 'index';
      const isHardProtected = hardProtectedRoutes.includes(currentRoute);
      const isPublicRoute = publicRoutes.includes(currentRoute);

      // Allow payment callbacks without auth
      const isPaymentCallback = segments.some(segment =>
        segment.includes('payment') ||
        segment.includes('success') ||
        segment.includes('cancel')
      );
      if (isPaymentCallback) return;

      // Redirect to login if accessing hard-protected route without auth
      if (isHardProtected && !userToken) {
        router.replace('/login');
        return;
      }

      const isAuthPage = ['login', 'CreateAccount', 'ForgetPassword', 'ResetPassword'].includes(currentRoute);

      // Redirect authenticated users away from auth pages
      if (userToken && isAuthPage) {
        router.replace('/(tabs)/HomeScreen');
        return;
      }

      // Handle unknown routes → 404
      if (!isHardProtected && !isPublicRoute && currentRoute !== '404') {
        router.replace('/404');
        return;
      }
    };

    handleNavigation();
  }, [userToken, segments, isLoading]);

  // Enhanced back button handling for HomeScreen
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      const currentRoute = segments[0] || 'index';
      const tabRoute = segments[1] || '';
      
      // If user is on HomeScreen in tabs, exit app
      if (currentRoute === '(tabs)' && tabRoute === 'HomeScreen') {
        BackHandler.exitApp();
        return true;
      }
      
      // Allow normal back navigation for other cases
      return false;
    });

    return () => backHandler.remove();
  }, [segments]);

  // Show loading indicator while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#3366FF" />
      </View>
    );
  }

  return children;
}

// ----------------------
// Root Layout
// ----------------------
export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteProtection>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Public routes */}
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="ForgetPassword" />
          <Stack.Screen name="CreateAccount" />
          <Stack.Screen name="ResetPassword" /> 

          {/* Protected routes */}
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="CartScreen" />
          <Stack.Screen name="Checkout" />
          <Stack.Screen name="CustomerSupport" />
          <Stack.Screen name="MyOrder" />
          <Stack.Screen name="PrivacyPolicyScreen" />
          <Stack.Screen name="ProductDetailPage" />
          <Stack.Screen name="ProfileDetailsScreen" />
          <Stack.Screen name="ReturnPolicyScreen" />
          <Stack.Screen name="OrderSuccessScreen" options={{ 
            gestureEnabled: false, // Disable swipe back on iOS
            animation: 'fade' // Use fade animation for cleaner transition
          }} />
          <Stack.Screen name="PaymentCancelledScreen" options={{ 
            gestureEnabled: false, // Disable swipe back on iOS
            animation: 'fade', // Use fade animation for cleaner transition
            headerLeft: () => null, // Remove back button
          }} />
          <Stack.Screen name="PaymentScreen" options={{ gestureEnabled: false }} />

          {/* 404 page - must be last */}
          <Stack.Screen name="404" />
          <Stack.Screen name="[...missing]" />
        </Stack>
      </RouteProtection>
    </AuthProvider>
  );
}
