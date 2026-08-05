import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const tabs = [
  { id: 'cohort', label: 'Cohort', icon: 'layers', color: '#10b981' },
  { id: 'masterclass', label: 'Master', icon: 'star', color: '#a855f7' },
  { id: 'bitesize', label: 'Bite-Sized', icon: 'play-circle', color: '#34d399' },
  { id: 'coupon', label: 'Coupon', icon: 'pricetag', color: '#eab308' },
  { id: 'users', label: 'Users', icon: 'people', color: '#60a5fa' },
  { id: 'certificate', label: 'Certify', icon: 'ribbon', color: '#ec4899' },
];

export default function DashboardScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('cohort');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check admin access would use AsyncStorage in production
    setIsAuthorized(true);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#10b981" size="large" style={{ flex: 1, justifyContent: 'center' }} />
      </SafeAreaView>
    );
  }

  if (!isAuthorized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Ionicons name="shield-alert" size={48} color="#ef4444" />
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 12 }}>Access Denied</Text>
          <Text style={{ color: '#6b7280', marginTop: 8, textAlign: 'center' }}>You do not have admin permissions.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-alert" size={12} color="#ef4444" />
            <Text style={styles.adminBadgeText}>Admin Panel</Text>
          </View>
          <Text style={styles.headerTitle}>{tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}</Text>
          <Text style={styles.headerSub}>Manage your digital assets & students</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Tabs Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && { backgroundColor: tab.color + '20', borderColor: tab.color + '40' }]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons name={tab.icon} size={16} color={activeTab === tab.id ? tab.color : '#6b7280'} />
            <Text style={[styles.tabText, activeTab === tab.id && { color: tab.color }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'cohort' && (
          <View style={styles.placeholderCard}>
            <Ionicons name="layers" size={48} color="#10b981" />
            <Text style={styles.placeholderTitle}>Cohort Manager</Text>
            <Text style={styles.placeholderText}>Manage cohort courses, pricing, and syllabus.</Text>
            {['Data Science Fellowship', 'Power BI Mastery', 'Excel with AI'].map((course, i) => (
              <View key={i} style={styles.courseRow}>
                <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                <Text style={styles.courseRowText}>{course}</Text>
              </View>
            ))}
          </View>
        )}
        {activeTab === 'bitesize' && (
          <View style={styles.placeholderCard}>
            <Ionicons name="play-circle" size={48} color="#34d399" />
            <Text style={styles.placeholderTitle}>Bite-Sized Manager</Text>
            <Text style={styles.placeholderText}>Manage short-form video courses and quizzes.</Text>
          </View>
        )}
        {activeTab === 'coupon' && (
          <View style={styles.placeholderCard}>
            <Ionicons name="pricetag" size={48} color="#eab308" />
            <Text style={styles.placeholderTitle}>Coupon Manager</Text>
            <Text style={styles.placeholderText}>Create and manage discount coupons.</Text>
          </View>
        )}
        {activeTab === 'users' && (
          <View style={styles.placeholderCard}>
            <Ionicons name="people" size={48} color="#60a5fa" />
            <Text style={styles.placeholderTitle}>User Dashboard</Text>
            <Text style={styles.placeholderText}>View and manage all registered users.</Text>
          </View>
        )}
        {activeTab === 'certificate' && (
          <View style={styles.placeholderCard}>
            <Ionicons name="ribbon" size={48} color="#ec4899" />
            <Text style={styles.placeholderTitle}>Certificate Manager</Text>
            <Text style={styles.placeholderText}>Generate and manage certificates for students.</Text>
          </View>
        )}
        {activeTab === 'masterclass' && (
          <View style={styles.placeholderCard}>
            <Ionicons name="star" size={48} color="#a855f7" />
            <Text style={styles.placeholderTitle}>Masterclass Manager</Text>
            <Text style={styles.placeholderText}>Schedule and manage live masterclasses.</Text>
          </View>
        )}
      </ScrollView>

      {/* Mobile Bottom Nav */}
      <View style={styles.bottomNav}>
        {tabs.slice(0, 5).map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.bottomTab}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={activeTab === tab.id ? tab.color : '#4b5563'}
            />
            <Text style={[styles.bottomTabText, activeTab === tab.id && { color: tab.color }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: 16, paddingTop: 8,
  },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  adminBadgeText: { color: '#ef4444', fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900', textTransform: 'capitalize' },
  headerSub: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  tabBar: { paddingHorizontal: 16, marginBottom: 16, maxHeight: 50 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#121212', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
  },
  tabText: { color: '#6b7280', fontSize: 12, fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  placeholderCard: {
    backgroundColor: '#121212', borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center', gap: 12,
  },
  placeholderTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  placeholderText: { color: '#6b7280', fontSize: 13, textAlign: 'center', lineHeight: 18 },
  courseRow: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'stretch', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  courseRowText: { color: '#d1d5db', fontSize: 13 },
  bottomNav: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#0a0a0a', paddingVertical: 6,
  },
  bottomTab: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4 },
  bottomTabText: { color: '#4b5563', fontSize: 8, fontWeight: '700' },
});
