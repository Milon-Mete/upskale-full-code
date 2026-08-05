import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import PremiumScreen from '../screens/PremiumScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BiteSizeCourseScreen from '../screens/BiteSizeCourseScreen';
import CertificateScreen from '../screens/CertificateScreen';
import LibraryScreen from '../screens/LibraryScreen';
import CartScreen from '../screens/CartScreen';
import MasterclassCartScreen from '../screens/MasterclassCartScreen';
import RecartScreen from '../screens/RecartScreen';
import DynamicCourseScreen from '../screens/DynamicCourseScreen';
import RecordedLandingScreen from '../screens/RecordedLandingScreen';
import PlanSelectionScreen from '../screens/PlanSelectionScreen';
import BiteSizeCheckoutScreen from '../screens/BiteSizeCheckoutScreen';
import MasterclassLandingScreen from '../screens/MasterclassLandingScreen';
import StudentCertificateViewScreen from '../screens/StudentCertificateViewScreen';
import ExcelPlaylistScreen from '../screens/ExcelPlaylistScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ControlCenterScreen from '../screens/ControlCenterScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d0d0d',
          borderTopColor: 'rgba(255,255,255,0.04)',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '700',
          letterSpacing: 0.5,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Library') iconName = 'bookmark';
          else if (route.name === 'Premium') iconName = 'crown';
          else if (route.name === 'Account') iconName = 'person-circle';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Premium" component={PremiumScreen} />
      <Tab.Screen name="Account" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={HomeTabs} />
      <Stack.Screen name="BiteSizeCourse" component={BiteSizeCourseScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Certificate" component={CertificateScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="MasterclassCart" component={MasterclassCartScreen} />
      <Stack.Screen name="Recart" component={RecartScreen} />
      <Stack.Screen name="DynamicCourse" component={DynamicCourseScreen} />
      <Stack.Screen name="RecordedLanding" component={RecordedLandingScreen} />
      <Stack.Screen name="PlanSelection" component={PlanSelectionScreen} />
      <Stack.Screen name="BiteSizeCheckout" component={BiteSizeCheckoutScreen} />
      <Stack.Screen name="MasterclassLanding" component={MasterclassLandingScreen} />
      <Stack.Screen name="CertificateView" component={StudentCertificateViewScreen} />
      <Stack.Screen name="ExcelPlaylist" component={ExcelPlaylistScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="ControlCenter" component={ControlCenterScreen} />
    </Stack.Navigator>
  );
}
