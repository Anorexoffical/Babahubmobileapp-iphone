// app/_layout.js
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
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

  useEffect(() => {
    if (isLoading) return;

    // Hide splash once auth check is done
    SplashScreen.hideAsync();

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
      'PaymentScreen' // ADDED PaymentScreen to protected routes
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

    // 🔒 Redirect to login if accessing protected route without auth
    if (isProtectedRoute && !userToken) {
      router.replace('/login');
    }

    // ✅ Redirect authenticated user away from login/signup
    if (userToken && (currentRoute === 'login' || currentRoute === 'CreateAccount')) {
      router.replace('/(tabs)/HomeScreen');
    }

    // ❌ Handle unknown routes → go to 404
    if (!isProtectedRoute && !isPublicRoute && currentRoute !== '404') {
      router.replace('/404');
    }
  }, [userToken, segments, isLoading]);

  // Loader while auth is being checked
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
          <Stack.Screen name="OrderSuccessScreen" />
          <Stack.Screen name="PaymentScreen" options={{ gestureEnabled: false }} />

          {/* 404 page - must be last */}
          <Stack.Screen name="404" />
          <Stack.Screen name="[...missing]" />
        </Stack>
      </RouteProtection>
    </AuthProvider>
  );
}