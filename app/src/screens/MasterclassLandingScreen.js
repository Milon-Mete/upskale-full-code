import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function MasterclassLandingScreen({ route, navigation }) {
  const { slug } = route.params || {};
  const [activeTab, setActiveTab] = useState('details');

  const masterclass = {
    title: 'Live Masterclass',
    description: 'Join our exclusive live masterclass with industry experts.',
    price: 499,
    date: 'Saturday, 15 May 2026',
    time: '5:00 PM - 7:00 PM IST',
    instructor: 'Debkanta Chakraborty',
    topics: ['AI & Automation', 'Practical Projects', 'Career Guidance', 'Live Q&A'],
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Masterclass</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2340&auto=format&fit=crop' }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.badge}>LIVE EVENT</Text>
            <Text style={styles.title}>{masterclass.title}</Text>
            <View style={styles.dateRow}>
              <Ionicons name="calendar" size={14} color="#ef4444" />
              <Text style={styles.dateText}>{masterclass.date}</Text>
            </View>
            <View style={styles.dateRow}>
              <Ionicons name="time" size={14} color="#ef4444" />
              <Text style={styles.dateText}>{masterclass.time}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {['Details', 'Topics', 'Instructor'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          <Text style={styles.description}>{masterclass.description}</Text>
          <Text style={styles.instructor}>By {masterclass.instructor}</Text>

          {activeTab === 'Topics' && (
            <View style={styles.topicsList}>
              {masterclass.topics.map((topic, i) => (
                <View key={i} style={styles.topicItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#ef4444" />
                  <Text style={styles.topicText}>{topic}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceAmount}>₹{masterclass.price}</Text>
          <Text style={styles.priceLabel}>Limited Seats</Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('MasterclassCart', { item: masterclass })}
        >
          <Text style={styles.bookBtnText}>Register Now</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  hero: { height: 280, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, backgroundColor: 'rgba(0,0,0,0.7)', gap: 8,
  },
  badge: {
    color: '#ef4444', fontSize: 10, fontWeight: '900', letterSpacing: 2,
    backgroundColor: 'rgba(239,68,68,0.2)', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 4, alignSelf: 'flex-start',
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '900' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { color: '#d1d5db', fontSize: 13 },
  tabRow: { flexDirection: 'row', padding: 16, gap: 8 },
  tab: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#121212' },
  tabActive: { backgroundColor: '#ef4444' },
  tabText: { color: '#6b7280', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  content: { padding: 20, gap: 16 },
  description: { color: '#d1d5db', fontSize: 15, lineHeight: 22 },
  instructor: { color: '#ef4444', fontSize: 14, fontWeight: '700' },
  topicsList: { gap: 12, marginTop: 12 },
  topicItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topicText: { color: '#d1d5db', fontSize: 14 },
  bottomBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: '#121212', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
  },
  priceAmount: { color: '#fff', fontSize: 24, fontWeight: '900' },
  priceLabel: { color: '#9ca3af', fontSize: 11 },
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#ef4444', paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 12,
  },
  bookBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
});
