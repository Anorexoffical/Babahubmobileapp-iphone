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

      // Define protected routes
      const protectedRoutes = [
        '(tabs)', 
        'CartScreen', 
        'Checkout', 
        'CustomerSupport', 
        'MyOrder', 
        'PrivacyPolicyScreen', 
        'ProductDetailPage', 
        'ProfileDetailsScreen',
        'OrderSuccessScreen',
        'PaymentScreen',
        'PaymentCancelledScreen',
        'ReturnPolicyScreen'
      ];

      // Define public routes
      const publicRoutes = [
        'index', 
        'login', 
        'ForgetPassword', 
        'CreateAccount', 
        'ResetPassword',
        '404'
      ];

      const currentRoute = segments[0] || 'index';
      const isProtectedRoute = protectedRoutes.includes(currentRoute);
      const isPublicRoute = publicRoutes.includes(currentRoute);

      // 🔒 Allow payment callbacks even without auth
      const isPaymentCallback = segments.some(segment => 
        segment.includes('payment') || 
        segment.includes('success') || 
        segment.includes('cancel')
      );

      // Allow payment callbacks to proceed without redirection
      if (isPaymentCallback) {
        return;
      }

      // 🔒 Redirect to login if accessing protected route without auth
      if (isProtectedRoute && !userToken) {
        router.replace('/login');
        return;
      }

      // ✅ Allow free navigation between all auth pages without redirection
      const isAuthPage = ['login', 'CreateAccount', 'ForgetPassword', 'ResetPassword'].includes(currentRoute);
      
      if (isAuthPage) {
        // Always allow navigation between auth pages
        return;
      }

      // ✅ Redirect authenticated user away from auth pages only if they land directly on them
      if (userToken && isAuthPage && segments.length === 1) {
        router.replace('/(tabs)/HomeScreen');
        return;
      }

      // ❌ Handle unknown routes → go to 404
      if (!isProtectedRoute && !isPublicRoute && currentRoute !== '404') {
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