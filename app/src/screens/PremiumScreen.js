import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Dimensions, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '../config';

const { width } = Dimensions.get('window');

const ICON_MAP = {
  FileSpreadsheet: 'grid',
  Presentation: 'easel',
  Bot: 'chatbubble-ellipses',
  BarChart3: 'bar-chart',
  MessageSquare: 'chatbubbles',
};

export default function PremiumScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    fetchCourses();
    checkSubscription();
  }, []);

  const checkSubscription = () => {
    // In production, check AsyncStorage for user data with subscription info
    setTimeout(() => setLoading(false), 500);
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${BASE_URL}/bitesize-courses`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCoursesLoading(false);
    }
  };

  const hasAccess = activePlan && daysRemaining > 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#eab308" size="large" style={{ flex: 1, justifyContent: 'center' }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          {hasAccess ? (
            <View style={styles.activeHeader}>
              <View style={styles.proBadge}>
                <Ionicons name="crown" size={20} color="#eab308" />
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
              <Text style={styles.headerTitle}>Your subscription is active</Text>
              {daysRemaining <= 5 && (
                <View style={styles.expiryWarning}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text style={styles.expiryText}>Expires in {daysRemaining} days</Text>
                </View>
              )}
              <View style={styles.planDetails}>
                <Text style={styles.planDetailTitle}>Plan Details</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>{activePlan?.planType || 'Monthly'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Active</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Days Remaining</Text>
                  <Text style={styles.detailValue}>{daysRemaining}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.inactiveHeader}>
              <View style={styles.crownIcon}>
                <Ionicons name="crown" size={36} color="#eab308" />
              </View>
              <Text style={styles.inactiveTitle}>
                Upgrade to <Text style={styles.proText}>PRO</Text>
              </Text>
              <Text style={styles.inactiveSub}>
                Unlock unrestricted access to bite-sized premium learning.
              </Text>

              {/* Pricing Cards */}
              <View style={styles.pricingRow}>
                {[
                  { key: 'trial', price: '₹1', duration: '3 days', label: 'Trial', badge: null },
                  { key: 'monthly', price: '₹99', duration: '/month', label: 'Monthly', badge: 'Popular' },
                  { key: 'yearly', price: '₹599', duration: '/year', label: 'Yearly', badge: 'Best Value' },
                ].map((plan, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.planCard}
                    onPress={() => navigation.navigate('PlanSelection')}
                  >
                    {plan.badge && (
                      <View style={styles.planBadge}>
                        <Text style={styles.planBadgeText}>{plan.badge}</Text>
                      </View>
                    )}
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planDuration}>{plan.duration}</Text>
                    <Text style={styles.planLabel}>{plan.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.featureList}>
                {['Unrestricted Access', 'Official Certification', 'Accelerated Learning'].map((f, i) => (
                  <View key={i} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Courses Section */}
        <View style={styles.coursesSection}>
          <View style={styles.coursesHeader}>
            <Ionicons name="sparkles" size={16} color="#eab308" />
            <Text style={styles.coursesTitle}>Premium Vault</Text>
          </View>
          <Text style={styles.coursesSub}>Available Bite-Sized Courses</Text>

          {coursesLoading ? (
            <ActivityIndicator color="#eab308" style={{ marginTop: 20 }} />
          ) : courses.length === 0 ? (
            <View style={styles.emptyCourses}>
              <Text style={styles.emptyCoursesText}>No courses available</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courseScroll}>
              {courses.map((course) => {
                const iconName = ICON_MAP[course.iconName] || 'chatbubbles';
                return (
                  <TouchableOpacity
                    key={course._id}
                    style={styles.courseCard}
                    onPress={() => {
                      if (course.isLocked) {
                        Alert.alert('Coming Soon', 'This course is coming soon!');
                      } else {
                        navigation.navigate('BiteSizeCourse', { slug: course.slug });
                      }
                    }}
                  >
                    <Image source={{ uri: course.image }} style={styles.courseBg} />
                    <View style={styles.courseOverlay}>
                      <View style={styles.courseTop}>
                        <View style={styles.courseIconBox}>
                          <Ionicons name={iconName} size={18} color={course.highlightColor || '#10b981'} />
                        </View>
                        {course.isLocked ? (
                          <View style={styles.lockedBadge}>
                            <Ionicons name="lock-closed" size={10} color="#9ca3af" />
                            <Text style={styles.lockedText}>Locked</Text>
                          </View>
                        ) : (
                          <View style={styles.availableBadge}>
                            <Text style={styles.availableText}>Available</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.courseBottom}>
                        <View style={styles.courseTagRow}>
                          <Text style={styles.courseTag}>{course.tag || 'Course'}</Text>
                        </View>
                        <Text style={styles.courseTitle} numberOfLines={1}>{course.title}</Text>
                        <Text style={[styles.courseHighlight, { color: course.highlightColor || '#10b981' }]} numberOfLines={1}>
                          {course.highlight}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {!hasAccess && (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => navigation.navigate('PlanSelection')}
          >
            <Text style={styles.startBtnText}>Start with ₹1 Trial</Text>
            <Ionicons name="arrow-forward" size={18} color="#000" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { padding: 16, paddingTop: 24 },
  activeHeader: { gap: 16 },
  proBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(234,179,8,0.1)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(234,179,8,0.2)',
  },
  proBadgeText: { color: '#eab308', fontSize: 14, fontWeight: '900' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  expiryWarning: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(239,68,68,0.1)', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  expiryText: { color: '#ef4444', fontSize: 12, fontWeight: '700' },
  planDetails: { backgroundColor: '#121212', borderRadius: 16, padding: 16, marginTop: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  planDetailTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  detailLabel: { color: '#6b7280', fontSize: 13 },
  detailValue: { color: '#d1d5db', fontSize: 13, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  statusText: { color: '#10b981', fontSize: 11, fontWeight: '700' },
  inactiveHeader: { gap: 16, alignItems: 'center', paddingTop: 20 },
  crownIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: 'rgba(234,179,8,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(234,179,8,0.2)' },
  inactiveTitle: { color: '#fff', fontSize: 32, fontWeight: '900', textAlign: 'center' },
  proText: { color: '#eab308' },
  inactiveSub: { color: '#6b7280', fontSize: 13, textAlign: 'center', marginBottom: 8 },
  pricingRow: { flexDirection: 'row', gap: 8, width: '100%' },
  planCard: { flex: 1, backgroundColor: '#121212', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', position: 'relative' },
  planBadge: { position: 'absolute', top: -6, backgroundColor: '#eab308', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  planBadgeText: { color: '#000', fontSize: 7, fontWeight: '900' },
  planPrice: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 8 },
  planDuration: { color: '#6b7280', fontSize: 10, marginTop: 2 },
  planLabel: { color: '#9ca3af', fontSize: 10, marginTop: 4, fontWeight: '600' },
  featureList: { width: '100%', gap: 12, marginTop: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { color: '#d1d5db', fontSize: 13 },
  coursesSection: { padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 24 },
  coursesHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  coursesTitle: { color: '#eab308', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  coursesSub: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 16 },
  emptyCourses: { padding: 40, alignItems: 'center' },
  emptyCoursesText: { color: '#6b7280', fontSize: 14 },
  courseScroll: { paddingRight: 16, gap: 12 },
  courseCard: { width: width * 0.72, height: 240, borderRadius: 20, overflow: 'hidden', backgroundColor: '#121212' },
  courseBg: { width: '100%', height: '100%', position: 'absolute' },
  courseOverlay: { flex: 1, justifyContent: 'space-between', padding: 14, backgroundColor: 'rgba(0,0,0,0.6)' },
  courseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  courseIconBox: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 12 },
  lockedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  lockedText: { color: '#9ca3af', fontSize: 9, fontWeight: '700' },
  availableBadge: { backgroundColor: '#10b981', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  availableText: { color: '#fff', fontSize: 8, fontWeight: '700' },
  courseBottom: { gap: 4 },
  courseTagRow: {},
  courseTag: { color: '#d1d5db', fontSize: 9, fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  courseTitle: { color: '#d1d5db', fontSize: 12, fontWeight: '600' },
  courseHighlight: { fontSize: 16, fontWeight: '900', textTransform: 'uppercase' },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#eab308', marginHorizontal: 16, marginTop: 8, marginBottom: 40,
    padding: 16, borderRadius: 12,
  },
  startBtnText: { color: '#000', fontWeight: '900', fontSize: 15 },
});
