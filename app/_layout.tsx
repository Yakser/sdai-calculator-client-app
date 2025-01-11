import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, createContext } from 'react'
import 'react-native-reanimated'
import { AppRegistry } from 'react-native'
import { PaperProvider, DefaultTheme } from 'react-native-paper'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

// Контекст для передачи темы
export const ThemeContext = createContext({
  isDarkTheme: false,
  toggleTheme: () => {},
})

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#5885DC',
    accent: '#BB2649',
    background: '#fff',
    surface: '#fff',
  },
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar animated={true} />
      </PaperProvider>
    </GestureHandlerRootView>
  )
}

AppRegistry.registerComponent('app name', () => RootLayout)
