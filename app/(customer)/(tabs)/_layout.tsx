import { Tabs } from 'expo-router';
import React from 'react';
import { Circle, Line, Path, Rect, Svg } from 'react-native-svg';
import { useTheme } from '../../../contexts/ThemeContext';

function CalendarIcon({ color, filled }: { color: string; filled: boolean }) {
  const fg = filled ? 'white' : color;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3} y={4} width={18} height={18} rx={2}
        stroke={color} strokeWidth={filled ? 0 : 1.8}
        fill={filled ? color : 'none'}
      />
      <Line x1={16} y1={2} x2={16} y2={6} stroke={fg} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={8} y1={2} x2={8} y2={6} stroke={fg} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={3} y1={10} x2={21} y2={10} stroke={fg} strokeWidth={1.8} />
      <Circle cx={8} cy={14} r={1} fill={fg} />
      <Circle cx={12} cy={14} r={1} fill={fg} />
      <Circle cx={16} cy={14} r={1} fill={fg} />
    </Svg>
  );
}

function PersonIcon({ color, filled }: { color: string; filled: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle
        cx={12} cy={7} r={4}
        stroke={color} strokeWidth={filled ? 0 : 1.8}
        fill={filled ? color : 'none'}
      />
      <Path
        d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"
        stroke={color} strokeWidth={filled ? 0 : 1.8}
        fill={filled ? color : 'none'}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function CustomerTabLayout() {
  const { tokens } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tokens.tabActive,
        tabBarInactiveTintColor: tokens.tabInactive,
        tabBarStyle: {
          backgroundColor: tokens.tabBg,
          borderTopColor: tokens.tabBorder,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="my-bookings"
        options={{
          title: 'My Bookings',
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, focused }) => (
            <CalendarIcon color={color} filled={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <PersonIcon color={color} filled={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
