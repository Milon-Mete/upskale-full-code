import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Dimensions, Animated, FlatList, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '../config';

const { width } = Dimensions.get('window');

export default function DynamicCourseScreen({ route, navigation }) {
  const { slug } = route.params;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [accessLevel, setAccessLevel] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchCourse();
    checkUser();
  }, []);

  const checkUser = () => {
    // Would use AsyncStorage in real app
  };

  const fetchCourse = async () => {
    try {
      const res = await fetch(`${BASE_URL}/cohorts/${slug}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const fetched = data.CohortData || data.courseData || data;
        setCourse(fetched);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (planType) => {
    if (!course) return;
    Alert.alert('Add to Cart', `Add ${planType === 'live' ? 'Live' : 'Recorded'} plan to cart?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Add', onPress: () => navigation.navigate('Cart') },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loaderRing} />
        <Text style={styles.loadingText}>Loading Course...</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Course not found</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isPowerBi = course.title?.toLowerCase().includes('power bi');
  const isExcel = course.title?.toLowerCase().includes('excel');
  const themeColor = isExcel ? '#10b981' : isPowerBi ? '#f59e0b' : '#6c38ff';
  const themeBgColor = isExcel ? '#064e3b' : isPowerBi ? '#451a03' : '#1e103c';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeBgColor }]}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        {/* Custom Nav */}
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: 'https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412223/20250730_170449_0000_uq4d24.png' }}
            style={styles.navLogo}
          />
          {user ? (
            <TouchableOpacity onPress={() => navigation.navigate('Account')}>
              <Text style={styles.navBtn}>Dashboard</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.navBtn}>Log In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroBadge}>{course.category || 'Premium Course'}</Text>
          <Text style={styles.heroTitle}>{course.title}</Text>
          <Text style={styles.heroDesc}>{course.description}</Text>

          {/* Info Bar */}
          <View style={styles.infoBar}>
            {['Hybrid', 'Projects', 'Mentorship', 'Placement'].map((item, i) => (
              <View key={i} style={styles.infoItem}>
                <Text style={styles.infoValue}>{item}</Text>
                <Text style={styles.infoLabel}>
                  {i === 0 ? 'Live & Recorded' : i === 1 ? 'Hands-on' : i === 2 ? '1:1 Expert' : 'Lifetime'}
                </Text>
              </View>
            ))}
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={[styles.heroBtn, { backgroundColor: themeColor }]}
            onPress={() => handlePurchase('live')}
          >
            <Text style={styles.heroBtnText}>Enroll Now - ₹{course.pricing?.live?.discount || '2,499'}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: themeColor }]}>88%</Text>
            <Text style={styles.statLabel}>Salary Hike</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: themeColor }]}>1000+</Text>
            <Text style={styles.statLabel}>Hiring Partners</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: themeColor }]}>1:1</Text>
            <Text style={styles.statLabel}>Mentorship</Text>
          </View>
        </View>

        {/* What You Learn */}
        {course.whatulearn?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What You'll Master</Text>
            <FlatList
              horizontal
              data={course.whatulearn}
              keyExtractor={(_, i) => String(i)}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.learnCard}>
                  {item.imageurl ? (
                    <Image source={{ uri: item.imageurl }} style={styles.learnImage} />
                  ) : (
                    <View style={styles.learnImagePlaceholder} />
                  )}
                  <View style={styles.learnContent}>
                    <Text style={styles.learnText}>{item.text}</Text>
                    <Text style={styles.learnDesc}>{item.desc}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        )}

        {/* Syllabus */}
        {course.course?.length > 0 && (
          <View style={[styles.section, { backgroundColor: '#080808' }]}>
            <Text style={styles.sectionTitle}>Course Syllabus</Text>
            {course.course.map((mod, i) => (
              <TouchableOpacity
                key={i}
                style={styles.syllabusCard}
                onPress={() => setActiveModule(activeModule === i ? null : i)}
              >
                <View style={styles.syllabusHeader}>
                  <Text style={styles.syllabusWeek}>Module {i + 1}</Text>
                  <Text style={styles.syllabusTitle}>{mod.Title}</Text>
                  <Ionicons name={activeModule === i ? 'chevron-up' : 'chevron-down'} size={16} color="#6b7280" />
                </View>
                {activeModule === i && (
                  <View style={styles.syllabusTopics}>
                    {mod.topic?.map((topic, j) => (
                      <Text key={j} style={styles.topicItem}>• {topic.replace(/"/g, '')}</Text>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Pricing */}
        <View style={[styles.section, { backgroundColor: themeBgColor, paddingBottom: 40 }]}>
          <Text style={styles.sectionTitle}>Unlock Premium Access</Text>
          <View style={styles.pricingCard}>
            <View style={styles.featureList}>
              {['HD Video & Lifetime Access', 'Live Weekend Classes', 'Placement Support', 'Resume Review', 'Verifiable Certificate'].map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
            <View style={styles.priceArea}>
              <Text style={styles.priceAmount}>₹{course.pricing?.live?.discount || '2,499'}</Text>
              {course.pricing?.live?.original > 0 && (
                <Text style={styles.priceOriginal}>₹{course.pricing.live.original}</Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.buyBtn, { backgroundColor: themeColor }]}
              onPress={() => handlePurchase('live')}
            >
              <Text style={styles.buyBtnText}>Enroll Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center', gap: 16 },
  loaderRing: { width: 40, height: 40, borderWidth: 2, borderRadius: 20, borderColor: '#10b981', borderTopColor: 'transparent' },
  loadingText: { color: '#6b7280', fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  errorText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: '700' },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  navLogo: { width: 100, height: 28 },
  navBtn: { color: '#fff', fontSize: 13, fontWeight: '600' },
  hero: { padding: 20, gap: 16 },
  heroBadge: {
    color: '#d1d5db', fontSize: 11, fontWeight: '700', letterSpacing: 1,
    backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 4, alignSelf: 'flex-start',
  },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '900', lineHeight: 32 },
  heroDesc: { color: '#9ca3af', fontSize: 14, lineHeight: 20 },
  infoBar: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12,
    padding: 12, gap: 8,
  },
  infoItem: { flex: 1, alignItems: 'center' },
  infoValue: { color: '#fff', fontSize: 12, fontWeight: '700' },
  infoLabel: { color: '#9ca3af', fontSize: 8, marginTop: 2 },
  heroBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  heroBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  statsRow: { flexDirection: 'row', padding: 20, gap: 8 },
  statCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  statNumber: { fontSize: 28, fontWeight: '900' },
  statLabel: { color: '#9ca3af', fontSize: 10, fontWeight: '700', marginTop: 4 },
  section: { padding: 20, paddingTop: 32 },
  sectionTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 20 },
  learnCard: {
    width: width * 0.75, height: 200, borderRadius: 16, overflow: 'hidden',
    marginRight: 12, backgroundColor: '#121212',
  },
  learnImage: { width: '100%', height: 120 },
  learnImagePlaceholder: { width: '100%', height: 120, backgroundColor: '#1a1a1a' },
  learnContent: { padding: 12 },
  learnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  learnDesc: { color: '#9ca3af', fontSize: 11, marginTop: 4 },
  syllabusCard: {
    backgroundColor: '#121212', borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden',
  },
  syllabusHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 8,
  },
  syllabusWeek: {
    color: '#6b7280', fontSize: 10, fontWeight: '700', letterSpacing: 1,
    backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  syllabusTitle: { color: '#fff', fontSize: 14, fontWeight: '700', flex: 1 },
  syllabusTopics: { paddingHorizontal: 16, paddingBottom: 12, gap: 4 },
  topicItem: { color: '#9ca3af', fontSize: 12, paddingLeft: 8 },
  pricingCard: {
    backgroundColor: '#121212', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  featureList: { gap: 12, marginBottom: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { color: '#d1d5db', fontSize: 13 },
  priceArea: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 16 },
  priceAmount: { color: '#fff', fontSize: 32, fontWeight: '900' },
  priceOriginal: { color: '#6b7280', fontSize: 16, textDecorationLine: 'line-through' },
  buyBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  buyBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
