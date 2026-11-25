import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Montserrat_800ExtraBold } from '@expo-google-fonts/montserrat/800ExtraBold';
import { useFonts } from 'expo-font';
import { router, Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/lib/auth';
import { supabaseConfigured } from '@/lib/supabase';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Montserrat_800ExtraBold,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// Screens reachable while signed out. The welcome screen (index) has no segment.
const PUBLIC_SCREENS = new Set<string | undefined>([undefined, 'connexion', 'verification']);

/** Replaces the whole history, so the back gesture can't return to a screen that no longer applies. */
function resetTo(path: '/' | '/profil' | '/voyages') {
  if (router.canDismiss()) router.dismissAll();
  router.replace(path);
}

function RootNavigator() {
  const { loading, session, profile } = useAuth();
  const segments = useSegments();
  const current = segments[0] as string | undefined;

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  // Sends each person to the right place for their state:
  // signed out → welcome, no first name yet → profile, otherwise → their trips.
  // Until Supabase is configured, the demo leaves every screen open.
  useEffect(() => {
    if (loading || !supabaseConfigured) return;

    const onPublic = PUBLIC_SCREENS.has(current);

    if (!session) {
      if (!onPublic) resetTo('/');
    } else if (!profile) {
      if (current !== 'profil') resetTo('/profil');
    } else if (onPublic || current === 'profil') {
      resetTo('/voyages');
    }
  }, [loading, session, profile, current]);

  if (loading) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.white } }} />;
}
