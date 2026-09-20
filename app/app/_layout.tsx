// app/_layout.tsx
import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StripeProvider } from '@stripe/stripe-react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useColorScheme } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/services/firebase';
import { getUserProfile } from '../src/services/authService';
import { setupNotificationListeners } from '../src/services/notificationService';
import { setUserProperties } from '../src/services/analyticsService';
import { useAuthStore } from '../src/store';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 2, staleTime: 300_000 } } });

export default function RootLayout() {
  const { setUser, setProfile, setLoading } = useAuthStore();
  const colorScheme = useColorScheme();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setProfile(profile);
        await setUserProperties(firebaseUser.uid, profile?.subscription || 'free');
        const onboarded = await AsyncStorage.getItem('onboarding_done');
        if (!onboarded) router.replace('/onboarding');
      } else {
        setProfile(null);
      }
      setLoading(false);
      await SplashScreen.hideAsync();
    });

    const unsubNotif = setupNotificationListeners(
      () => {},
      (response) => {
        const data = response.notification.request.content.data as any;
        if (data?.screen === 'finder') router.push('/(tabs)/finder');
        else if (data?.screen === 'favorites') router.push('/(tabs)/favorites');
        else if (data?.screen === 'referral') router.push('/referral');
      }
    );
    return () => { unsubAuth(); unsubNotif(); };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!} merchantIdentifier="merchant.com.scentia.app" urlScheme="scentia">
              <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
                <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="fragrance/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="checkout" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="results" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="privacy" options={{ presentation: 'modal' }} />
                <Stack.Screen name="referral" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              </Stack>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <Toast />
            </StripeProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
