import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Alert, ActivityIndicator, Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '../config';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // In production, fetch from API
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on UPSKALE and start learning! 🚀 https://upskale.com`,
      });
    } catch (err) {}
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => {
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      }},
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#10b981" size="large" style={{ flex: 1, justifyContent: 'center' }} />
      </SafeAreaView>
    );
  }

  const enrolledCount = enrollments.length;
  const certCount = certificates.length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Student'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role || 'Student'} Account</Text>
          </View>
        </View>

        {!user ? (
          <View style={styles.loginPrompt}>
            <Ionicons name="person-circle-outline" size={64} color="#4b5563" />
            <Text style={styles.loginPromptText}>Login to see your profile</Text>
            <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginBtnText}>Login Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Ionicons name="book" size={16} color="#9ca3af" />
                </View>
                <Text style={styles.statNumber}>{enrolledCount}</Text>
                <Text style={styles.statLabel}>Enrolled</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Ionicons name="flame" size={16} color={streak > 0 ? '#f97316' : '#9ca3af'} />
                </View>
                <Text style={[styles.statNumber, streak > 0 && { color: '#f97316' }]}>{streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Ionicons name="ribbon" size={16} color="#9ca3af" />
                </View>
                <Text style={styles.statNumber}>{certCount}</Text>
                <Text style={styles.statLabel}>Certificates</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                <Ionicons name="share-social" size={18} color="#60a5fa" />
                <Text style={styles.actionText}>Share Referral</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="settings" size={18} color="#9ca3af" />
                <Text style={styles.actionText}>Settings</Text>
              </TouchableOpacity>
            </View>

            {/* My Learning Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="flash" size={18} color="#10b981" />
                <Text style={styles.sectionTitle}>My Learning</Text>
              </View>
              {enrollments.length === 0 ? (
                <View style={styles.emptySection}>
                  <Ionicons name="book-outline" size={40} color="#4b5563" />
                  <Text style={styles.emptyText}>No active courses</Text>
                  <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.browseBtnText}>Browse Courses</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                enrollments.map((enc, i) => (
                  <View key={i} style={styles.enrollmentCard}>
                    <View style={styles.enrollmentHeader}>
                      <Text style={styles.enrollmentTitle}>{enc.title || 'Course'}</Text>
                      <Text style={styles.enrollmentBadge}>{enc.planType || 'Standard'}</Text>
                    </View>
                    <View style={styles.progressRow}>
                      <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${enc.progress || 0}%` }]} />
                      </View>
                      <Text style={styles.progressText}>{enc.progress || 0}%</Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Certificates Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="ribbon" size={18} color="#eab308" />
                <Text style={styles.sectionTitle}>My Certificates</Text>
                <Text style={styles.sectionCount}>{certCount}</Text>
              </View>
              {certificates.length === 0 ? (
                <View style={styles.emptySection}>
                  <Text style={styles.emptyText}>Complete courses to earn certificates</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {certificates.map((cert, i) => (
                    <TouchableOpacity key={i} style={styles.certCard}>
                      <Ionicons name="ribbon" size={24} color="#eab308" />
                      <Text style={styles.certTitle} numberOfLines={2}>{cert.courseName}</Text>
                      <Text style={styles.certDate}>{cert.issuedDate}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Badges */}
            {badges.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="trophy" size={18} color="#10b981" />
                  <Text style={styles.sectionTitle}>Badges</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {badges.map((badge, i) => (
                    <View key={i} style={styles.badgeCard}>
                      <Ionicons name="award" size={32} color="#10b981" />
                      <Text style={styles.badgeTitle}>{badge.courseId?.title || 'Completed'}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Referral Network */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="people" size={18} color="#60a5fa" />
                <Text style={styles.sectionTitle}>Referral Network</Text>
              </View>
              <View style={styles.referralCard}>
                <TouchableOpacity style={styles.whatsappBtn} onPress={handleShare}>
                  <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                  <Text style={styles.whatsappBtnText}>Share to WhatsApp</Text>
                </TouchableOpacity>
                <View style={styles.referralStats}>
                  <View style={styles.refStat}>
                    <Text style={styles.refNumber}>0</Text>
                    <Text style={styles.refLabel}>Referrals</Text>
                  </View>
                  <View style={styles.refStat}>
                    <Text style={[styles.refNumber, { color: '#10b981' }]}>0</Text>
                    <Text style={styles.refLabel}>Purchased</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out" size={18} color="#ef4444" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  profileHeader: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  name: { color: '#fff', fontSize: 22, fontWeight: '900' },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  roleText: { color: '#9ca3af', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  loginPrompt: { alignItems: 'center', paddingVertical: 60, gap: 16 },
  loginPromptText: { color: '#6b7280', fontSize: 16 },
  loginBtn: { backgroundColor: '#10b981', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 30 },
  loginBtnText: { color: '#000', fontWeight: '900', fontSize: 14 },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#121212', borderRadius: 16, padding: 16, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statIcon: { marginBottom: 4 },
  statNumber: { color: '#fff', fontSize: 28, fontWeight: '900' },
  statLabel: { color: '#6b7280', fontSize: 11, fontWeight: '600' },
  quickActions: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 24 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#121212', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  actionText: { color: '#d1d5db', fontSize: 13, fontWeight: '600' },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '900', flex: 1 },
  sectionCount: { color: '#10b981', fontSize: 14, fontWeight: '700' },
  emptySection: { backgroundColor: '#121212', borderRadius: 16, padding: 24, alignItems: 'center', gap: 12 },
  emptyText: { color: '#6b7280', fontSize: 13 },
  browseBtn: { backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20 },
  browseBtnText: { color: '#000', fontWeight: '800', fontSize: 12 },
  enrollmentCard: { backgroundColor: '#121212', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  enrollmentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  enrollmentTitle: { color: '#fff', fontSize: 14, fontWeight: '700', flex: 1 },
  enrollmentBadge: { color: '#10b981', fontSize: 9, fontWeight: '700', backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, letterSpacing: 1 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBg: { flex: 1, height: 6, backgroundColor: '#1f2937', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10b981' },
  progressText: { color: '#6b7280', fontSize: 11, fontWeight: '700' },
  certCard: { width: 140, backgroundColor: '#121212', borderRadius: 16, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(234,179,8,0.1)' },
  certTitle: { color: '#fff', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  certDate: { color: '#6b7280', fontSize: 9 },
  badgeCard: { alignItems: 'center', backgroundColor: '#121212', borderRadius: 12, padding: 16, minWidth: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  badgeTitle: { color: '#d1d5db', fontSize: 10, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  referralCard: { backgroundColor: '#121212', borderRadius: 16, padding: 16, gap: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  whatsappBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#25D366', padding: 12, borderRadius: 12 },
  whatsappBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  referralStats: { flexDirection: 'row', gap: 8 },
  refStat: { flex: 1, backgroundColor: '#0a0a0a', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  refNumber: { color: '#fff', fontSize: 20, fontWeight: '900' },
  refLabel: { color: '#6b7280', fontSize: 10, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, marginBottom: 40 },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '700' },
});
