import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '../config';

export default function BiteSizeCheckoutScreen({ route, navigation }) {
  const { slug, plan } = route.params || {};
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const plans = {
    trial: { price: 1, duration: '3 Days', label: 'Trial Access' },
    monthly: { price: 99, duration: '1 Month', label: 'Monthly Pass' },
    yearly: { price: 599, duration: '1 Year', label: 'Yearly Access' },
  };
  const pricing = plans[plan] || plans.monthly;

  useEffect(() => {
    if (slug) {
      fetch(`${BASE_URL}/bitesize-courses/${slug}`)
        .then(res => res.json())
        .then(setCourse)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [slug]);

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          {course && (
            <View style={styles.courseInfo}>
              <Image source={{ uri: course.image }} style={styles.courseImage} />
              <View>
                <Text style={styles.badge}>Subscription Plan</Text>
                <Text style={styles.courseTitle}>Unlocks {course.title}</Text>
                <Text style={styles.planLabel}>{pricing.label}</Text>
              </View>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>₹{pricing.price}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Duration</Text>
            <Text style={styles.priceValue}>{pricing.duration}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Due</Text>
            <Text style={styles.totalAmount}>₹{pricing.price}</Text>
          </View>

          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => {
              setProcessing(true);
              Alert.alert('Payment', `Pay ₹${pricing.price}?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Pay', onPress: () => {
                  setProcessing(false);
                  navigation.navigate('BiteSizeCourse', { slug });
                }},
              ]);
            }}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.payBtnText}>Pay ₹{pricing.price} Now</Text>
            )}
          </TouchableOpacity>

          <View style={styles.secureRow}>
            <Ionicons name="shield-checkmark" size={14} color="#6b7280" />
            <Text style={styles.secureText}>Secure Encrypted</Text>
            <Ionicons name="card" size={14} color="#6b7280" />
            <Text style={styles.secureText}>One-time payment</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  content: { padding: 16, flex: 1 },
  card: { backgroundColor: '#121212', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  courseInfo: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  courseImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#1a1a1a' },
  badge: { color: '#eab308', fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  courseTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  planLabel: { color: '#9ca3af', fontSize: 12, marginTop: 4 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 16 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { color: '#9ca3af', fontSize: 14 },
  priceValue: { color: '#d1d5db', fontSize: 14, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  totalLabel: { color: '#fff', fontSize: 18, fontWeight: '800' },
  totalAmount: { color: '#fff', fontSize: 28, fontWeight: '900' },
  payBtn: { backgroundColor: '#059669', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  payBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  secureRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  secureText: { color: '#6b7280', fontSize: 11 },
});
