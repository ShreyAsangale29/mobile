import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

LogBox.ignoreLogs([
  'THREE.WARNING',
  'THREE.Clock',
  'THREE.Timer',
  'Multiple instances of Three.js',
  '[expo-av]',
  'setLayoutAnimationEnabledExperimental',
]);

const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : args.join(' ');
  if (
    msg.includes('THREE.WARNING') ||
    msg.includes('Multiple instances of Three.js') ||
    msg.includes('[expo-av]') ||
    msg.includes('setLayoutAnimationEnabledExperimental')
  ) {
    return;
  }
  originalWarn(...args);
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="goal-selection" />
        <Stack.Screen name="activity-selection" />
        <Stack.Screen name="exercise-selection" />
        <Stack.Screen name="CameraCheckScreen" />
        <Stack.Screen name="camera" />
        <Stack.Screen name="ai-coach" />
        <Stack.Screen name="achievement" />
        <Stack.Screen name="Achievementscreen" />
        <Stack.Screen name="journey" />
        <Stack.Screen name="YogaSelectionScreen" />
        <Stack.Screen name="ProgressDashboardScreen" />
        <Stack.Screen name="session-summary" />
        <Stack.Screen name="reward-center" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}