import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Dimensions, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '../config';

const { width } = Dimensions.get('window');

export default function LibraryScreen({ navigation }) {
  const [savedCourses, setSavedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    try {
      // In production, check subscription status and fetch saved videos
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#10b981" size="large" style={{ flex: 1, justifyContent: 'center' }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Library</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {['All', 'Bite-Size', 'Recorded'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLocked ? (
        <View style={styles.lockedState}>
          <View style={styles.lockedIcon}>
            <Ionicons name="lock-closed" size={40} color="#eab308" />
          </View>
          <Text style={styles.lockedTitle}>Library Locked</Text>
          <Text style={styles.lockedSub}>
            Your PRO access has expired.{'\n'}Renew your plan to view saved videos.
          </Text>
          <TouchableOpacity
            style={styles.unlockBtn}
            onPress={() => navigation.navigate('PlanSelection')}
          >
            <Text style={styles.unlockBtnText}>Unlock PRO Access</Text>
            <Ionicons name="arrow-forward" size={16} color="#000" />
          </TouchableOpacity>
        </View>
      ) : savedCourses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={64} color="#4b5563" />
          <Text style={styles.emptyTitle}>My Library is empty</Text>
          <Text style={styles.emptySub}>Watch & save content to access it here anytime.</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigation.navigate('Premium')}
          >
            <Text style={styles.browseBtnText}>Browse Courses</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {savedCourses.map((group, i) => (
            <View key={i} style={styles.courseGroup}>
              <View style={styles.groupHeader}>
                <Ionicons name="videocam" size={16} color="#6b7280" />
                <Text style={styles.groupTitle}>{group.courseTitle}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
                {group.videos?.map((video, j) => (
                  <TouchableOpacity
                    key={j}
                    style={styles.videoCard}
                    onPress={() => navigation.navigate('BiteSizeCourse', { slug: group.courseSlug })}
                  >
                    <Image source={{ uri: video.thumbnail }} style={styles.videoThumb} />
                    <View style={styles.videoOverlay}>
                      <View style={styles.playIcon}>
                        <Ionicons name="play" size={14} color="#fff" />
                      </View>
                    </View>
                    <View style={styles.videoInfo}>
                      <Text style={styles.videoLabel}>Lesson {video.originalIndex + 1}</Text>
                      <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 8 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 20 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#121212' },
  tabActive: { backgroundColor: '#10b981' },
  tabText: { color: '#6b7280', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#000', fontWeight: '700' },
  lockedState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  lockedIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(234,179,8,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(234,179,8,0.2)' },
  lockedTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  lockedSub: { color: '#6b7280', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  unlockBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#eab308', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  unlockBtnText: { color: '#000', fontWeight: '900', fontSize: 14 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 8 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  emptySub: { color: '#6b7280', fontSize: 14, textAlign: 'center' },
  browseBtn: { backgroundColor: '#10b981', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 30, marginTop: 16 },
  browseBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
  courseGroup: { marginBottom: 24 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, marginBottom: 12 },
  groupTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  videoCard: { width: 144, height: 256, borderRadius: 12, overflow: 'hidden', backgroundColor: '#121212' },
  videoThumb: { width: '100%', height: '100%', position: 'absolute' },
  videoOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  playIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(16,185,129,0.8)', justifyContent: 'center', alignItems: 'center' },
  videoInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, backgroundColor: 'rgba(0,0,0,0.7)' },
  videoLabel: { color: '#10b981', fontSize: 8, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  videoTitle: { color: '#fff', fontSize: 11, fontWeight: '700', marginTop: 2 },
});
