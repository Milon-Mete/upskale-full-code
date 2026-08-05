import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../config';

export default function ContinueWatching({ navigation }) {
  const [course, setCourse] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContinueWatching();
  }, []);

  const fetchContinueWatching = async () => {
    try {
      const res = await fetch(`${BASE_URL}/engagement/progress/recent/continue`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success && data.courses?.length > 0) {
        setCourse(data.courses[0]);
      }
    } catch (err) {
      console.error('Failed to fetch continue watching', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !course || dismissed) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('BiteSizeCourse', { slug: course.courseSlug })}
        activeOpacity={0.9}
      >
        {/* Close button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => setDismissed(true)}
        >
          <Ionicons name="close" size={10} color="#fff" />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <Image
            source={{ uri: course.courseImage }}
            style={styles.thumbnail}
          />
          <View style={styles.info}>
            <View style={styles.labelRow}>
              <Ionicons name="time" size={10} color="#10b981" />
              <Text style={styles.label}>Continue</Text>
            </View>
            <Text style={styles.title} numberOfLines={1}>{course.courseTitle}</Text>
            <Text style={styles.count}>
              {course.completedVideos}/{course.totalVideos} videos
            </Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${course.progressPercent || 0}%` }]} />
            </View>
          </View>
          <Ionicons name="arrow-forward" size={16} color="#9ca3af" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 150,
  },
  card: {
    backgroundColor: 'rgba(18,18,18,0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
  },
  info: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  label: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  count: {
    color: '#6b7280',
    fontSize: 9,
    marginTop: 2,
  },
  progressBg: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
});
