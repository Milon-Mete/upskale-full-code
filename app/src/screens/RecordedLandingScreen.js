import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '../config';

const { width } = Dimensions.get('window');

export default function RecordedLandingScreen({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${BASE_URL}/cohorts`);
      const data = await res.json();
      const all = data.data || data.cohorts || data;
      if (Array.isArray(all)) setCourses(all.filter(c => c.pricing?.recorded));
      else setCourses([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Image source={{ uri: 'https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412223/20250730_170449_0000_uq4d24.png' }} style={styles.logo} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerBadge}>Self-Paced Masterclasses</Text>
          <Text style={styles.headerTitle}>
            Master new skills<Text style={styles.highlight}> at your own pace.</Text>
          </Text>
          <Text style={styles.headerSub}>Get lifetime access to premium recorded modules and certification.</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#eab308" style={{ marginTop: 40 }} />
        ) : courses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recorded courses available.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {courses.map((course) => (
              <TouchableOpacity
                key={course._id}
                style={styles.courseCard}
                onPress={() => navigation.navigate('Recart')}
              >
                <Image source={{ uri: course.thumbnail }} style={styles.courseImage} />
                <View style={styles.courseBody}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <View style={styles.features}>
                    <View style={styles.featureRow}>
                      <Ionicons name="videocam" size={14} color="#10b981" />
                      <Text style={styles.featureText}>Full HD Curriculum</Text>
                    </View>
                    <View style={styles.featureRow}>
                      <Ionicons name="time" size={14} color="#10b981" />
                      <Text style={styles.featureText}>Lifetime Access</Text>
                    </View>
                    <View style={styles.featureRow}>
                      <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                      <Text style={styles.featureText}>Verifiable Certificate</Text>
                    </View>
                  </View>
                  <View style={styles.priceRow}>
                    <View>
                      <Text style={styles.priceLabel}>One-time payment</Text>
                      <Text style={styles.priceAmount}>₹{course.pricing?.recorded?.discount || '499'}</Text>
                    </View>
                    <TouchableOpacity style={styles.addBtn}>
                      <Text style={styles.addBtnText}>Add to Cart</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  logo: { width: 100, height: 24 },
  header: { padding: 20, gap: 12, marginBottom: 16 },
  headerBadge: {
    color: '#eab308', fontSize: 11, fontWeight: '700', letterSpacing: 1,
    backgroundColor: 'rgba(234,179,8,0.1)', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 4, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(234,179,8,0.2)',
  },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '900', lineHeight: 32 },
  highlight: { color: '#eab308' },
  headerSub: { color: '#9ca3af', fontSize: 14, lineHeight: 20 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#6b7280', fontSize: 14 },
  grid: { padding: 16, gap: 16, paddingBottom: 40 },
  courseCard: { backgroundColor: '#121212', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  courseImage: { width: '100%', height: 180 },
  courseBody: { padding: 16 },
  courseTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 12 },
  features: { gap: 8, marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { color: '#9ca3af', fontSize: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceLabel: { color: '#6b7280', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  priceAmount: { color: '#fff', fontSize: 24, fontWeight: '900' },
  addBtn: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  addBtnText: { color: '#000', fontWeight: '900', fontSize: 12 },
});
