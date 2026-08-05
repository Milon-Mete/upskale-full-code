import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Dimensions, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '../config';

const { width } = Dimensions.get('window');

const COHORT_COURSES = [
  { title: 'Data Analyst Fellowship', desc: 'Master Python, SQL, Power BI & get placed', price: '₹2,499', slug: 'data-analyst-fellowship-1771873408075', color: '#6c38ff' },
  { title: 'MS Excel with Generative AI', desc: 'Excel mastery with ChatGPT integration', price: '₹1,999', slug: 'ms-excel-with-generative-ai-1771873408075', color: '#10b981' },
  { title: 'Power BI Data Visualization', desc: 'From raw data to expert storytelling', price: '₹2,499', slug: 'power-bi-data-visualization', color: '#f59e0b' },
  { title: 'Generative AI Toolset Mastery', desc: 'Master ChatGPT, Midjourney, Claude & more', price: '₹2,499', slug: 'generative-ai-toolset-mastery', color: '#a855f7' },
];

const FAQ_DATA = [
  { q: 'How do the courses work?', a: 'Our courses are a mix of recorded videos, live sessions, and hands-on projects. You learn at your own pace with mentor support.' },
  { q: 'Will I get a certificate?', a: 'Yes! Upon completing any course, you receive a verifiable certificate with a unique QR code.' },
  { q: 'Can I switch plans?', a: 'Absolutely! You can upgrade or downgrade your plan anytime. Contact support for assistance.' },
];

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [bitesizeCourses, setBitesizeCourses] = useState([]);
  const [showSplash, setShowSplash] = useState(true);
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const sweepAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef(null);

  useEffect(() => {
    // Splash loading animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(breatheAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();

    setTimeout(() => setShowSplash(false), 2500);

    fetchCourses();
    fetchBitesizeCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${BASE_URL}/cohorts`);
      const data = await res.json();
      const all = data.data || data.cohorts || data;
      if (Array.isArray(all)) setCourses(all);
      else setCourses(COHORT_COURSES);
    } catch (err) {
      setCourses(COHORT_COURSES);
    } finally {
      setLoading(false);
    }
  };

  const fetchBitesizeCourses = async () => {
    try {
      const res = await fetch(`${BASE_URL}/bitesize-courses`);
      if (res.ok) {
        const data = await res.json();
        setBitesizeCourses(data || []);
      }
    } catch (err) {}
  };

  if (showSplash) {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <Animated.Image
          source={{ uri: 'https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412223/20250730_170449_0000_uq4d24.png' }}
          style={[styles.splashLogo, { transform: [{ scale: breatheAnim }] }]}
          resizeMode="contain"
        />
        <Text style={styles.splashText}>UPSKALE</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom Navbar */}
      <View style={styles.navbar}>
        <Image
          source={{ uri: 'https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412223/20250730_170449_0000_uq4d24.png' }}
          style={styles.navLogo}
          resizeMode="contain"
        />
        <View style={styles.navRight}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginBtn}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Learn Skills.{'\n'}
            <Text style={styles.heroHighlight}>Get Certified.</Text>{'\n'}
            Build Career.
          </Text>
          <Text style={styles.heroSub}>
            Bite-sized lessons in Bengali, Hindi & English
          </Text>
          <TouchableOpacity style={styles.heroBtn} onPress={() => {
            scrollRef.current?.scrollTo({ y: 500, animated: true });
          }}>
            <Text style={styles.heroBtnText}>Discover Courses</Text>
            <Ionicons name="arrow-forward" size={18} color="#000" />
          </TouchableOpacity>

          {/* Stats */}
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>15K+</Text>
              <Text style={styles.heroStatLabel}>Students</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>10+</Text>
              <Text style={styles.heroStatLabel}>Courses</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>3</Text>
              <Text style={styles.heroStatLabel}>Languages</Text>
            </View>
          </View>
        </View>

        {/* Cohort Courses Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>3 Month Live Training</Text>
            <Text style={styles.sectionSub}>Industry relevant courses by experts</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {(courses.length > 0 ? courses : COHORT_COURSES).map((course, i) => (
              <TouchableOpacity
                key={course._id || i}
                style={[styles.cohortCard, { borderTopColor: course.color || '#10b981' }]}
                onPress={() => navigation.navigate('DynamicCourse', { slug: course.slug })}
              >
                <View style={styles.cohortHeader}>
                  <View style={[styles.cohortIcon, { backgroundColor: (course.color || '#10b981') + '20' }]}>
                    <Ionicons name="school" size={20} color={course.color || '#10b981'} />
                  </View>
                  <Text style={styles.cohortPrice}>{course.price || '₹2,499'}</Text>
                </View>
                <Text style={styles.cohortTitle} numberOfLines={2}>{course.title}</Text>
                <Text style={styles.cohortDesc} numberOfLines={2}>{course.desc || course.description}</Text>
                <View style={styles.cohortFooter}>
                  <Text style={[styles.cohortTag, { color: course.color || '#10b981' }]}>Live Cohort</Text>
                  <Ionicons name="arrow-forward" size={14} color={course.color || '#10b981'} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* BiteSized Section (Sarkari-style) */}
        <View style={[styles.section, { backgroundColor: '#080808', paddingVertical: 32 }]}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="flash" size={18} color="#10b981" />
              <Text style={styles.sectionTitle}>Bite-Sized Quick Learning</Text>
            </View>
            <Text style={styles.sectionSub}>60-second lessons in Bengali, Hindi, English</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {bitesizeCourses.map((course) => (
              <TouchableOpacity
                key={course._id}
                style={styles.biteCard}
                onPress={() => navigation.navigate('BiteSizeCourse', { slug: course.slug })}
              >
                <Image source={{ uri: course.image }} style={styles.biteImage} />
                <View style={styles.biteOverlay}>
                  <Text style={styles.biteTag}>{course.tag || 'Quick Learn'}</Text>
                  <Text style={styles.biteTitle} numberOfLines={1}>{course.highlight || course.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Masterclass Highlight */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="videocam" size={18} color="#ef4444" />
              <Text style={styles.sectionTitle}>Live Masterclasses</Text>
            </View>
          </View>
          <View style={styles.masterclassCard}>
            <View style={styles.masterclassBadge}>
              <Text style={styles.masterclassBadgeText}>Upcoming</Text>
            </View>
            <Text style={styles.masterclassTitle}>Industry Expert Sessions</Text>
            <Text style={styles.masterclassDesc}>Join live sessions with top industry professionals. Limited seats available.</Text>
            <TouchableOpacity style={styles.masterclassBtn}>
              <Text style={styles.masterclassBtnText}>View Schedule</Text>
              <Ionicons name="arrow-forward" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Premium Gallery */}
        <View style={[styles.section, { backgroundColor: '#080808', paddingVertical: 32 }]}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="crown" size={18} color="#eab308" />
              <Text style={styles.sectionTitle}>Premium Pro Access</Text>
            </View>
            <Text style={styles.sectionSub}>Unlock unlimited learning with PRO</Text>
          </View>
          <View style={styles.galleryRow}>
            {[
              { icon: 'unlock', label: 'Unlimited Courses', color: '#10b981' },
              { icon: 'ribbon', label: 'Certification', color: '#eab308' },
              { icon: 'chatbubbles', label: 'Multi-Language', color: '#60a5fa' },
              { icon: 'flash', label: 'Ad-Free', color: '#a855f7' },
            ].map((item, i) => (
              <View key={i} style={styles.galleryItem}>
                <Ionicons name={item.icon} size={24} color={item.color} />
                <Text style={styles.galleryLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.proBtn} onPress={() => navigation.navigate('PlanSelection')}>
            <Text style={styles.proBtnText}>Go PRO - ₹99/mo</Text>
          </TouchableOpacity>
        </View>

        {/* Student Brands / Hiring Partners */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Students work at</Text>
          <View style={styles.brandsRow}>
            {['Accenture', 'Amazon', 'Infosys', 'Wipro', 'TCS', 'Deloitte'].map((brand, i) => (
              <View key={i} style={styles.brandItem}>
                <Text style={styles.brandText}>{brand}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Testimonials */}
        <View style={[styles.section, { backgroundColor: '#080808', paddingVertical: 32 }]}>
          <Text style={styles.sectionTitle}>What Students Say</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {[
              { name: 'Puja Das', role: 'Data Analyst @ Infosys', text: 'The dashboard tracking kept me motivated. Bite-sized lessons made it easy to learn daily.' },
              { name: 'Amit Patel', role: 'DevOps @ Wipro', text: 'Real projects and GitHub reviews made it feel like a real job, not just a course.' },
              { name: 'Sneha Roy', role: 'Designer @ Accenture', text: 'I built my entire portfolio here. The design critiques were brutally honest and helpful.' },
            ].map((t, i) => (
              <View key={i} style={styles.testimonialCard}>
                <View style={styles.testimonialStars}>
                  {[...Array(5)].map((_, j) => <Ionicons key={j} name="star" size={12} color="#10b981" />)}
                </View>
                <Text style={styles.testimonialText}>"{t.text}"</Text>
                <View style={styles.testimonialAuthor}>
                  <View style={styles.testimonialAvatar} />
                  <View>
                    <Text style={styles.testimonialName}>{t.name}</Text>
                    <Text style={styles.testimonialRole}>{t.role}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Final CTA */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaGradient}>
            <Text style={styles.ctaTitle}>Start Your Journey Today</Text>
            <Text style={styles.ctaSub}>Join 15,000+ learners and transform your career</Text>
            <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation.navigate('Premium')}>
              <Text style={styles.ctaBtnText}>Get Started Free</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAQs</Text>
          {FAQ_DATA.map((faq, i) => (
            <View key={i} style={styles.faqCard}>
              <Text style={styles.faqQuestion}>{faq.q}</Text>
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Image
            source={{ uri: 'https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412223/20250730_170449_0000_uq4d24.png' }}
            style={styles.footerLogo}
          />
          <Text style={styles.footerText}>© 2026 UPSKALE. All rights reserved.</Text>
          <Text style={styles.footerSub}>Learn skills. Get certified. Build career.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  splashContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  splashLogo: { width: 180, height: 60 },
  splashText: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 16 },
  navbar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  navLogo: { width: 120, height: 36 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loginBtn: { backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  hero: { padding: 24, paddingTop: 40, backgroundColor: '#fff' },
  heroTitle: { fontSize: 36, fontWeight: '900', color: '#111', lineHeight: 42, marginBottom: 12 },
  heroHighlight: { color: '#10b981' },
  heroSub: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
    backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30,
  },
  heroBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
  heroStats: { flexDirection: 'row', gap: 24, marginTop: 24 },
  heroStat: { alignItems: 'center' },
  heroStatNumber: { fontSize: 24, fontWeight: '900', color: '#111' },
  heroStatLabel: { fontSize: 11, color: '#6b7280', fontWeight: '600' },
  section: { paddingVertical: 24, backgroundColor: '#fff' },
  sectionHeader: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#111' },
  sectionSub: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  cohortCard: {
    width: width * 0.72, backgroundColor: '#f9fafb', borderRadius: 20, padding: 16,
    borderTopWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  cohortHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cohortIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cohortPrice: { fontSize: 20, fontWeight: '900', color: '#111' },
  cohortTitle: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 6 },
  cohortDesc: { fontSize: 12, color: '#6b7280', lineHeight: 16, marginBottom: 12 },
  cohortFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cohortTag: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  biteCard: { width: width * 0.6, height: 180, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1a1a1a' },
  biteImage: { width: '100%', height: '100%', position: 'absolute' },
  biteOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, backgroundColor: 'rgba(0,0,0,0.6)' },
  biteTag: { color: '#10b981', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  biteTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  masterclassCard: {
    marginHorizontal: 20, backgroundColor: '#fef2f2', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#fecaca',
  },
  masterclassBadge: { backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 12 },
  masterclassBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  masterclassTitle: { fontSize: 18, fontWeight: '900', color: '#111', marginBottom: 6 },
  masterclassDesc: { fontSize: 13, color: '#6b7280', lineHeight: 18, marginBottom: 16 },
  masterclassBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  masterclassBtnText: { color: '#ef4444', fontSize: 13, fontWeight: '800' },
  galleryRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  galleryItem: { width: (width - 64) / 2, backgroundColor: '#f3f4f6', borderRadius: 12, padding: 16, alignItems: 'center', gap: 8 },
  galleryLabel: { color: '#111', fontSize: 12, fontWeight: '700' },
  proBtn: { backgroundColor: '#eab308', marginHorizontal: 20, padding: 14, borderRadius: 12, alignItems: 'center' },
  proBtnText: { color: '#000', fontWeight: '900', fontSize: 14 },
  brandsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 8 },
  brandItem: { backgroundColor: '#f3f4f6', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  brandText: { color: '#6b7280', fontSize: 12, fontWeight: '600' },
  testimonialCard: {
    backgroundColor: '#f9fafb', borderRadius: 16, padding: 16,
    minWidth: width * 0.72, marginRight: 12,
  },
  testimonialStars: { flexDirection: 'row', gap: 2, marginBottom: 8 },
  testimonialText: { color: '#4b5563', fontSize: 12, lineHeight: 17, fontStyle: 'italic', marginBottom: 12 },
  testimonialAuthor: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  testimonialAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#10b981' },
  testimonialName: { color: '#111', fontSize: 12, fontWeight: '700' },
  testimonialRole: { color: '#6b7280', fontSize: 10 },
  ctaSection: { padding: 20 },
  ctaGradient: {
    backgroundColor: '#10b981', borderRadius: 20, padding: 32, alignItems: 'center',
    shadowColor: '#10b981', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  ctaTitle: { color: '#fff', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  ctaSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#000', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30 },
  ctaBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  faqCard: { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  faqQuestion: { color: '#111', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  faqAnswer: { color: '#6b7280', fontSize: 12, lineHeight: 17 },
  footer: { padding: 24, alignItems: 'center', gap: 8, backgroundColor: '#f9fafb' },
  footerLogo: { width: 100, height: 28, opacity: 0.6 },
  footerText: { color: '#9ca3af', fontSize: 11 },
  footerSub: { color: '#d1d5db', fontSize: 10 },
});
