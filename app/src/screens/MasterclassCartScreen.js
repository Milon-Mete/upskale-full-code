import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Alert, ActivityIndicator, TextInput, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MasterclassCartScreen({ route, navigation }) {
  const [item, setItem] = useState(route.params?.item || null);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginStep, setLoginStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const basePrice = item?.price || 0;
  const discount = couponApplied?.baseDiscount || 0;
  const finalTotal = Math.max(0, basePrice - discount);

  const handlePayment = () => {
    if (!item) return;
    Alert.alert(
      'Complete Registration',
      `Pay ₹${finalTotal.toLocaleString()} for ${item.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pay Securely', onPress: () => setLoading(true) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      {!item ? (
        <View style={styles.emptyState}>
          <Ionicons name="ticket-outline" size={64} color="#4b5563" />
          <Text style={styles.emptyTitle}>No Masterclass Selected</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.emptyBtnText}>Browse Events</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={styles.itemCard}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <View style={styles.itemBadge}>
                <Ionicons name="flash" size={10} color="#ef4444" />
                <Text style={styles.itemBadgeText}>LIVE MASTERCLASS</Text>
              </View>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemPrice}>₹{basePrice.toLocaleString()}</Text>
            </View>
          </View>

          {/* Coupon */}
          <View style={styles.couponSection}>
            <Text style={styles.sectionLabel}>Have a Coupon?</Text>
            <View style={styles.couponRow}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter code"
                placeholderTextColor="#6b7280"
                value={couponCode}
                onChangeText={setCouponCode}
              />
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => {
                  setCouponApplied(couponCode ? { code: couponCode, baseDiscount: 100 } : null);
                }}
              >
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
            {couponApplied && (
              <View style={styles.couponApplied}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.couponAppliedText}>{couponApplied.code} applied!</Text>
              </View>
            )}
          </View>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Payment Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ticket Price</Text>
              <Text style={styles.summaryValue}>₹{basePrice.toLocaleString()}</Text>
            </View>
            {couponApplied && (
              <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.summaryLabel, { color: '#10b981' }]}>Discount</Text>
                <Text style={[styles.summaryValue, { color: '#10b981' }]}>-₹{discount}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalAmount}>₹{finalTotal.toLocaleString()}</Text>
            </View>
            <TouchableOpacity
              style={styles.payBtn}
              onPress={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.payBtnText}>Complete Registration</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.secureNote}>
              <Ionicons name="lock-closed" size={12} color="#6b7280" /> Secure Payment via Razorpay
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  emptyBtn: { backgroundColor: '#ef4444', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '800' },
  itemCard: {
    flexDirection: 'row', margin: 16, backgroundColor: '#121212', borderRadius: 16,
    padding: 16, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  itemImage: { width: 100, height: 80, borderRadius: 12, backgroundColor: '#1a1a1a' },
  itemInfo: { flex: 1, justifyContent: 'center' },
  itemBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 4, alignSelf: 'flex-start', marginBottom: 6,
  },
  itemBadgeText: { color: '#ef4444', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  itemTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  itemPrice: { color: '#ef4444', fontSize: 20, fontWeight: '900', marginTop: 4 },
  couponSection: {
    margin: 16, marginTop: 0, backgroundColor: '#121212', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionLabel: { color: '#9ca3af', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' },
  couponRow: { flexDirection: 'row', gap: 8 },
  couponInput: {
    flex: 1, backgroundColor: '#0a0a0a', borderRadius: 10, padding: 12,
    color: '#fff', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  applyBtn: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 20, justifyContent: 'center' },
  applyBtnText: { color: '#000', fontWeight: '800', fontSize: 13 },
  couponApplied: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  couponAppliedText: { color: '#10b981', fontSize: 12, fontWeight: '600' },
  summaryCard: {
    margin: 16, marginTop: 0, backgroundColor: '#121212', borderRadius: 16,
    padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  summaryTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  summaryLabel: { color: '#9ca3af', fontSize: 14 },
  summaryValue: { color: '#d1d5db', fontSize: 14, fontWeight: '700' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
  totalAmount: { color: '#fff', fontSize: 28, fontWeight: '900' },
  payBtn: { backgroundColor: '#ef4444', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  payBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  secureNote: { color: '#6b7280', fontSize: 11, textAlign: 'center' },
});
