import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Alert, ActivityIndicator, Dimensions, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '../config';

const { width } = Dimensions.get('window');

const testimonials = [
  { name: 'Aarav Sharma', initial: 'A', rating: 5, text: 'This platform is such a gem. I upgraded to their pro plan and absolutely love using it.' },
  { name: 'Priya Verma', initial: 'P', rating: 4, text: 'App bohat acha hai aur cost ke hisab se pro features kafi affordable hai.' },
  { name: 'Aarav Sharma', initial: 'A', rating: 5, text: 'Great for self-study. If you want to study without getting distracted then you should buy their pro mode.' },
];

const features = [
  { name: 'Unlimited Module Access', free: true, pro: true },
  { name: 'Community Access', free: true, pro: true },
  { name: 'Premium Certifications', free: false, pro: true },
  { name: 'Downloadable Resources', free: false, pro: true },
];

const faqs = [
  { q: 'How does the PRO plan help me get hired?', a: 'PRO gives you direct access to our hiring partners, resume reviews, and mock interviews.' },
  { q: 'In which languages is the platform available?', a: 'Our platform currently supports English, Hindi, and Bengali.' },
];

export default function PlanSelectionScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [processing, setProcessing] = useState(false);
  const plans = {
    yearly: { price: 599, duration: '/year', label: 'Full Access', badge: 'Best Value' },
    monthly: { price: 99, duration: '/month', label: 'Monthly Pass', badge: 'Most Popular' },
    trial: { price: 1, duration: '/3 days', label: 'Trial Access', badge: null },
  };

  const isActive = currentUser?.biteSizeSubscription?.status === 'active';

  const handlePayment = () => {
    setProcessing(true);
    Alert.alert('Payment', `Pay ₹${plans[selectedPlan].price} for ${selectedPlan} plan?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Pay Now', onPress: () => {
        setTimeout(() => {
          setProcessing(false);
          Alert.alert('Success', 'Payment successful! Welcome to PRO.');
        }, 2000);
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Video Header */}
        <View style={styles.videoSection}>
          <View style={styles.videoPlaceholder}>
            <View style={styles.fallbackVideo}>
              <Ionicons name="play-circle" size={50} color="rgba(255,255,255,0.3)" />
              <Text style={styles.videoFallbackText}>UPSKALE PRO Preview</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.videoBackBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Logo & Title */}
          <View style={styles.logoSection}>
            <Image
              source={{ uri: 'https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412223/20250730_170449_0000_uq4d24.png' }}
              style={styles.logo}
            />
            <Text style={styles.mainTitle}>Unlock 10x career growth now</Text>
          </View>

          {/* Testimonials */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testimonialScroll}>
            {testimonials.map((t, i) => (
              <View key={i} style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <View style={styles.testimonialAvatar}>
                    <Text style={styles.testimonialInitial}>{t.initial}</Text>
                  </View>
                  <Text style={styles.testimonialName}>{t.name}</Text>
                </View>
                <View style={styles.stars}>
                  {[...Array(t.rating)].map((_, j) => (
                    <Ionicons key={j} name="star" size={12} color="#eab308" />
                  ))}
                </View>
                <Text style={styles.testimonialText}>{t.text}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Comparison Table */}
          <View style={styles.comparison}>
            <Text style={styles.sectionTitle}>Unlock deeper learning</Text>
            <View style={styles.comparisonTable}>
              <View style={styles.comparisonHeader}>
                <Text style={styles.comparisonHeaderText}>What you get</Text>
                <Text style={styles.comparisonHeaderText}>Free</Text>
                <Text style={[styles.comparisonHeaderText, { color: '#eab308' }]}>Pro</Text>
              </View>
              {features.map((feat, i) => (
                <View key={i} style={styles.comparisonRow}>
                  <Text style={styles.comparisonFeature}>{feat.name}</Text>
                  <Ionicons name={feat.free ? 'checkmark' : 'lock-closed'} size={16} color={feat.free ? '#eab308' : '#4b5563'} />
                  <Ionicons name={feat.pro ? 'checkmark' : 'lock-closed'} size={16} color={feat.pro ? '#eab308' : '#4b5563'} />
                </View>
              ))}
            </View>
          </View>

          {/* FAQs */}
          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>FAQs</Text>
            {faqs.map((faq, i) => (
              <View key={i} style={styles.faqCard}>
                <TouchableOpacity style={styles.faqHeader} onPress={() => setOpenFaq(openFaq === i ? null : i)}>
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  <Ionicons name={openFaq === i ? 'chevron-up' : 'chevron-down'} size={16} color="#6b7280" />
                </TouchableOpacity>
                {openFaq === i && <Text style={styles.faqAnswer}>{faq.a}</Text>}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Pricing */}
      <View style={styles.bottomBar}>
        {isActive ? (
          <View style={styles.activePlanRow}>
            <View style={styles.activeBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#10b981" />
              <Text style={styles.activeText}>PRO Plan Active</Text>
            </View>
            <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.goBackText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.planScroll}>
              {Object.entries(plans).map(([key, plan]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.planCard, selectedPlan === key && styles.planCardActive]}
                  onPress={() => setSelectedPlan(key)}
                >
                  {plan.badge && (
                    <View style={styles.planBadge}>
                      <Text style={styles.planBadgeText}>{plan.badge}</Text>
                    </View>
                  )}
                  <Text style={styles.planLabel}>{plan.label}</Text>
                  <Text style={[styles.planPrice, selectedPlan === key && { color: '#fff' }]}>₹{plan.price}</Text>
                  <Text style={styles.planDuration}>{plan.duration}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={handlePayment}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.continueBtnText}>Continue to Payment</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  videoSection: { height: 220, backgroundColor: '#000', position: 'relative' },
  videoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fallbackVideo: { alignItems: 'center', gap: 12 },
  videoFallbackText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600' },
  videoBackBtn: { position: 'absolute', top: 10, left: 16, backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 20 },
  mainContent: { padding: 16, paddingTop: 24 },
  logoSection: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 140, height: 40, marginBottom: 12 },
  mainTitle: { color: '#fff', fontSize: 26, fontWeight: '900', textAlign: 'center', lineHeight: 32 },
  testimonialScroll: { marginBottom: 24, marginLeft: -16, paddingLeft: 16 },
  testimonialCard: {
    backgroundColor: '#121212', borderRadius: 16, padding: 16, marginRight: 12,
    minWidth: 280, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  testimonialHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  testimonialAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  testimonialInitial: { color: '#d1d5db', fontSize: 12, fontWeight: '700' },
  testimonialName: { color: '#d1d5db', fontSize: 13, fontWeight: '600' },
  stars: { flexDirection: 'row', gap: 2, marginBottom: 8 },
  testimonialText: { color: '#9ca3af', fontSize: 12, lineHeight: 17 },
  comparison: { marginBottom: 24 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 16 },
  comparisonTable: { backgroundColor: '#121212', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  comparisonHeader: { flexDirection: 'row', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', gap: 8 },
  comparisonHeaderText: { flex: 1, color: '#6b7280', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' },
  comparisonRow: { flexDirection: 'row', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)', gap: 8, alignItems: 'center' },
  comparisonFeature: { flex: 1, color: '#d1d5db', fontSize: 13 },
  faqSection: { marginBottom: 240 },
  faqCard: { backgroundColor: '#121212', borderRadius: 12, marginBottom: 8, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  faqQuestion: { color: '#d1d5db', fontSize: 13, fontWeight: '600', flex: 1 },
  faqAnswer: { color: '#6b7280', fontSize: 12, paddingHorizontal: 16, paddingBottom: 16, lineHeight: 17 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#121212', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    padding: 16, paddingBottom: 24,
  },
  activePlanRow: { alignItems: 'center', gap: 12 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  activeText: { color: '#10b981', fontSize: 14, fontWeight: '700' },
  goBackBtn: { backgroundColor: '#059669', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  goBackText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  planScroll: { marginBottom: 12, marginLeft: -16, paddingLeft: 16 },
  planCard: {
    backgroundColor: '#0a0a0a', borderRadius: 12, padding: 14, marginRight: 8,
    minWidth: 120, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center',
  },
  planCardActive: { borderColor: '#eab308', backgroundColor: 'rgba(234,179,8,0.05)' },
  planBadge: { position: 'absolute', top: -6, backgroundColor: '#eab308', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  planBadgeText: { color: '#000', fontSize: 7, fontWeight: '900' },
  planLabel: { color: '#9ca3af', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  planPrice: { color: '#fff', fontSize: 22, fontWeight: '900' },
  planDuration: { color: '#6b7280', fontSize: 10, marginTop: 2 },
  continueBtn: { backgroundColor: '#fff', padding: 14, borderRadius: 12, alignItems: 'center' },
  continueBtnText: { color: '#000', fontWeight: '900', fontSize: 14 },
});
