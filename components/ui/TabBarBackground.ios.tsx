import React, { useContext } from 'react';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from '@/app/_layout';

export default function BlurTabBarBackground() {
  const { isDarkTheme } = useContext(ThemeContext);
  let tabHeight = 0;

  try {
    tabHeight = useBottomTabBarHeight();
  } catch (error) {
    console.warn('Warning: Bottom tab navigator context is not available.', error);
    tabHeight = 49;
  }
  const { bottom } = useSafeAreaInsets();

  return (
      <BlurView
          tint={isDarkTheme ? 'dark' : 'light'}
          intensity={100}
          style={[styles.blurView, { height: tabHeight + bottom }]}
      />
  );
}

export function useBottomTabOverflow() {
  const tabHeight = useBottomTabBarHeight();
  const { bottom } = useSafeAreaInsets();
  return tabHeight - bottom;
}

const styles = StyleSheet.create({
  blurView: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    zIndex: -1,
  },
});