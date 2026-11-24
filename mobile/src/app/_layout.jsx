import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../config/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor={COLORS.background} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="cadastro" />
      </Stack>
    </>
  );
}