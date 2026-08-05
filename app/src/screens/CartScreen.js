import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Alert, ActivityIndicator, TextInput, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '../config';

export default function CartScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [syncedCart, setSyncedCart] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [itemPrefs, setItemPrefs] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [appliedPromotions, setAppliedPromotions] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [loginStep, setLoginStep] = useState(1);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    setIsRefreshing(false);
  }, []);

  // Calculate totals
  let subtotal = 0;
  syncedCart.forEach(item => {
    const pref = itemPrefs[item.id] || { activeTab: 'recorded', paymentMethod: 'full' };
    subtotal += item.price || 0;
  });

  const discountAmount = appliedCoupon ? appliedCoupon.baseDiscount : 0;
  const promoDiscountAmount = appliedPromotions.reduce((s, p) => s + p.discountValue, 0);
  const finalTotal = Math.max(0, subtotal - discountAmount - promoDiscountAmount);

  const handleCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setTimeout(() => {
      setAppliedCoupon({ code: 'SAVE50', baseDiscount: 50 });
      setCouponMsg({ type: 'success', text: 'Coupon applied! Saved ₹50' });
      setCouponLoading(false);
    }, 1000);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setAppliedPromotions([]);
    setCouponCode('');
    setCouponMsg({ type: '', text: '' });
  };

  const handlePayment = () => {
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    if (syncedCart.length === 0) return;
    setPaymentLoading(true);
    Alert.alert('Payment', `Pay ₹${finalTotal.toLocaleString()}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Pay Securely', onPress: () => {
        setTimeout(() => {
          setPaymentLoading(false);
          Alert.alert('Success', 'Payment successful! Welcome aboard.');
        }, 2000);
      }},
    ]);
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="cart" size={40} color="#4b5563" />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Looks like you haven't added any courses yet.</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.browseBtnText}>Explore Courses</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout ({syncedCart.length} items)</Text>
        <TouchableOpacity onPress={() => setItems([])}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {syncedCart.map((item, i) => (
          <View key={i} style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                <TouchableOpacity onPress={() => {
                  const newCart = syncedCart.filter((_, idx) => idx !== i);
                  setSyncedCart(newCart);
                }}>
                  <Ionicons name="close-circle" size={18} color="#4b5563" />
                </TouchableOpacity>
              </View>
              <View style={styles.itemBadgeRow}>
                <View style={styles.itemBadge}>
                  <Text style={styles.itemBadgeText}>{item.itemModel || 'Course'}</Text>
                </View>
              </View>
              <Text style={styles.itemPrice}>₹{item.price?.toLocaleString() || '0'}</Text>
            </View>
          </View>
        ))}

        {/* Coupon */}
        <View style={styles.couponSection}>
          <Text style={styles.couponLabel}>Have a Coupon?</Text>
          {appliedCoupon ? (
            <View style={styles.couponApplied}>
              <View>
                <Text style={styles.couponCode}>{appliedCoupon.code}</Text>
                <Text style={styles.couponSuccess}>Applied Successfully</Text>
              </View>
              <TouchableOpacity onPress={removeCoupon}>
                <Ionicons name="close" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponRow}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter code here"
                placeholderTextColor="#4b5563"
                value={couponCode}
                onChangeText={(text) => setCouponCode(text.toUpperCase())}
              />
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleCoupon}
                disabled={couponLoading || !couponCode.trim()}
              >
                {couponLoading ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.applyBtnText}>Apply</Text>}
              </TouchableOpacity>
            </View>
          )}
          {couponMsg.text && (
            <Text style={[styles.couponMsg, couponMsg.type === 'error' ? { color: '#ef4444' } : { color: '#10b981' }]}>
              {couponMsg.text}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Summary */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items ({syncedCart.length})</Text>
          <Text style={styles.summaryValue}>₹{subtotal.toLocaleString()}</Text>
        </View>
        {appliedCoupon && (
          <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.summaryLabel, { color: '#10b981' }]}>Coupon</Text>
            <Text style={[styles.summaryValue, { color: '#10b981' }]}>-₹{discountAmount}</Text>
          </View>
        )}
        {appliedPromotions.map((promo, i) => (
          <View key={i} style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.summaryLabel, { color: '#eab308' }]}>{promo.message || 'Extra Discount'}</Text>
            <Text style={[styles.summaryValue, { color: '#eab308' }]}>-₹{promo.discountValue}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total to pay</Text>
          <Text style={styles.totalAmount}>₹{finalTotal.toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.payBtn} onPress={handlePayment} disabled={paymentLoading}>
          {paymentLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.payBtnText}>Secure Checkout</Text>
              <Ionicons name="arrow-forward" size={18} color="#000" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.secureNote}>
          <Ionicons name="shield-checkmark" size={12} color="#6b7280" /> Secure 256-bit SSL encryption
        </Text>
      </View>

      {/* Auth Modal */}
      <Modal visible={showLoginModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Ionicons name="lock-closed" size={20} color="#fff" />
              </View>
              <TouchableOpacity onPress={() => setShowLoginModal(false)}>
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>Unlock Your Access</Text>
            <Text style={styles.modalSub}>Sign in to proceed with secure checkout.</Text>

            {loginStep === 1 ? (
              <View style={styles.modalInput}>
                <Ionicons name="phone-portrait" size={18} color="#6b7280" style={{ marginRight: 10 }} />
                <TextInput
                  style={{ flex: 1, color: '#fff', fontSize: 14 }}
                  placeholder="Phone Number"
                  placeholderTextColor="#4b5563"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            ) : (
              <View style={styles.modalInput}>
                <Ionicons name="lock-closed" size={18} color="#6b7280" style={{ marginRight: 10 }} />
                <TextInput
                  style={{ flex: 1, color: '#fff', fontSize: 14, textAlign: 'center', letterSpacing: 4 }}
                  placeholder="Enter OTP"
                  placeholderTextColor="#4b5563"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />
              </View>
            )}

            {authError ? <Text style={{ color: '#ef4444', fontSize: 12, textAlign: 'center' }}>{authError}</Text> : null}

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                if (loginStep === 1) { setLoginStep(2); }
                else { setShowLoginModal(false); setIsLoggedIn(true); }
              }}
            >
              <Text style={styles.modalBtnText}>Continue Securely</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  emptySub: { color: '#6b7280', fontSize: 14, textAlign: 'center' },
  browseBtn: { backgroundColor: '#10b981', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 30, marginTop: 16 },
  browseBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
  cartItem: { flexDirection: 'row', margin: 16, marginBottom: 8, backgroundColor: '#0a0a0a', borderRadius: 16, padding: 12, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  itemImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#1a1a1a' },
  itemInfo: { flex: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemTitle: { color: '#fff', fontSize: 14, fontWeight: '700', flex: 1 },
  itemBadgeRow: { flexDirection: 'row', gap: 6, marginVertical: 6 },
  itemBadge: { backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
  itemBadgeText: { color: '#34d399', fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  itemPrice: { color: '#fff', fontSize: 18, fontWeight: '900' },
  couponSection: { margin: 16, marginTop: 0, backgroundColor: '#0a0a0a', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  couponLabel: { color: '#9ca3af', fontSize: 11, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  couponRow: { flexDirection: 'row', gap: 8 },
  couponInput: { flex: 1, backgroundColor: '#050505', borderRadius: 10, padding: 12, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  applyBtn: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 20, justifyContent: 'center' },
  applyBtnText: { color: '#000', fontWeight: '800', fontSize: 13 },
  couponApplied: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.1)', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
  couponCode: { color: '#10b981', fontSize: 14, fontWeight: '900' },
  couponSuccess: { color: '#34d399', fontSize: 11, marginTop: 2 },
  couponMsg: { fontSize: 12, marginTop: 8, fontWeight: '600' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', backgroundColor: '#0a0a0a' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  summaryLabel: { color: '#9ca3af', fontSize: 13 },
  summaryValue: { color: '#d1d5db', fontSize: 13, fontWeight: '700' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  totalLabel: { color: '#fff', fontSize: 14, fontWeight: '700' },
  totalAmount: { color: '#fff', fontSize: 28, fontWeight: '900' },
  payBtn: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 8 },
  payBtnText: { color: '#000', fontWeight: '900', fontSize: 15 },
  secureNote: { color: '#6b7280', fontSize: 10, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#0a0a0a', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 4 },
  modalSub: { color: '#6b7280', fontSize: 12, marginBottom: 20 },
  modalInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#050505', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, marginBottom: 12 },
  modalBtn: { backgroundColor: '#10b981', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  modalBtnText: { color: '#000', fontWeight: '900', fontSize: 14 },
});
