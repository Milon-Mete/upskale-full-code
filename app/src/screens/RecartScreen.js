import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Alert, ActivityIndicator, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RecartScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);

  let subtotal = items.reduce((s, i) => s + (i.price || 0), 0);
  const discount = couponApplied?.discount || 0;
  const finalTotal = Math.max(0, subtotal - discount);

  const handlePayment = () => {
    if (items.length === 0) return;
    Alert.alert('Checkout', `Pay ₹${finalTotal.toLocaleString()}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Pay', onPress: () => setLoading(true) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout ({items.length} items)</Text>
        <View style={{ width: 24 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={80} color="#4b5563" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add courses to get started</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.emptyBtnText}>Explore Courses</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {items.map((item, i) => (
            <View key={i} style={styles.cartItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemPrice}>₹{item.price?.toLocaleString()}</Text>
                <TouchableOpacity style={styles.removeBtn}>
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Coupon */}
          <View style={styles.couponSection}>
            <Text style={styles.sectionLabel}>Have a Coupon?</Text>
            <View style={styles.couponRow}>
              <TextInput style={styles.couponInput} placeholder="Enter code" placeholderTextColor="#6b7280" value={couponCode} onChangeText={setCouponCode} />
              <TouchableOpacity style={styles.applyBtn} onPress={() => setCouponApplied({ code: couponCode, discount: 100 })}>
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{subtotal.toLocaleString()}</Text>
            </View>
            {couponApplied && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#10b981' }]}>Discount</Text>
                <Text style={[styles.summaryValue, { color: '#10b981' }]}>-₹{discount}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>₹{finalTotal.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.payBtn} onPress={handlePayment} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.payBtnText}>Secure Checkout</Text>}
            </TouchableOpacity>
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
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 8 },
  emptyTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  emptySub: { color: '#6b7280', fontSize: 14 },
  emptyBtn: { backgroundColor: '#10b981', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 30, marginTop: 16 },
  emptyBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
  cartItem: { flexDirection: 'row', margin: 16, marginBottom: 8, backgroundColor: '#121212', borderRadius: 16, padding: 12, gap: 12 },
  itemImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#1a1a1a' },
  itemInfo: { flex: 1 },
  itemTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  itemPrice: { color: '#10b981', fontSize: 16, fontWeight: '900', marginTop: 4 },
  removeBtn: { position: 'absolute', top: 0, right: 0 },
  couponSection: { margin: 16, marginTop: 0, backgroundColor: '#121212', borderRadius: 16, padding: 16 },
  sectionLabel: { color: '#9ca3af', fontSize: 11, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  couponRow: { flexDirection: 'row', gap: 8 },
  couponInput: { flex: 1, backgroundColor: '#0a0a0a', borderRadius: 10, padding: 12, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  applyBtn: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 20, justifyContent: 'center' },
  applyBtnText: { color: '#000', fontWeight: '800', fontSize: 13 },
  summaryCard: { margin: 16, marginTop: 0, backgroundColor: '#121212', borderRadius: 16, padding: 20, marginBottom: 40 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { color: '#9ca3af', fontSize: 14 },
  summaryValue: { color: '#d1d5db', fontSize: 14, fontWeight: '700' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
  totalAmount: { color: '#fff', fontSize: 28, fontWeight: '900' },
  payBtn: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center' },
  payBtnText: { color: '#000', fontWeight: '900', fontSize: 15 },
});
