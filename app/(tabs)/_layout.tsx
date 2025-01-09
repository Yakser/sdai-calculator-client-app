import { Tabs } from 'expo-router';
import React, { useContext } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemeContext } from '../_layout';

export default function TabLayout() {
    const { isDarkTheme } = useContext(ThemeContext);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarStyle: Platform.select({
                    ios: {
                        position: 'absolute',
                        borderTopWidth: 0,
                    },
                    default: {
                        position: 'relative',
                        borderTopWidth: 0,
                    },
                }),
                tabBarActiveTintColor: isDarkTheme ? '#ffffff' : '#000000',
                tabBarInactiveTintColor: isDarkTheme ? '#999999' : '#666666',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Главная',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'История',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.dots.scatter" color={color} />,
                }}
            />
        </Tabs>
    );
}