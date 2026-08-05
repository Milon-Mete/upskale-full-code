import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ControlCenterScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [planType, setPlanType] = useState('monthly');
  const [daysToAdd, setDaysToAdd] = useState('30');

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setTargetUser({
        name: 'Demo Student',
        phone: searchQuery,
        email: 'demo@student.com',
        role: 'student',
        coursesCount: 3,
        totalRevenue: 2499,
      });
      setLoading(false);
    }, 1000);
  };

  const handleImpersonate = () => {
    Alert.alert(
      'Impersonate Student',
      `Take over ${targetUser?.name}'s account? You will lose admin access until you log out.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Proceed', style: 'destructive', onPress: () => {
          Alert.alert('Impersonation', 'Logged in as student. Redirecting...');
        }},
      ]
    );
  };

  const handleForceSubscription = (action) => {
    Alert.alert(
      action === 'activate' ? 'Activate Subscription' : 'Terminate Access',
      action === 'activate'
        ? `Grant ${daysToAdd}-day ${planType} plan for ${targetUser?.name}?`
        : `Terminate access for ${targetUser?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', style: action === 'terminate' ? 'destructive' : 'default', onPress: () => {
          Alert.alert('Success', `${action === 'activate' ? 'Subscription activated' : 'Access terminated'}!`);
        }},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="shield-alert" size={24} color="#ef4444" />
          <Text style={styles.headerTitle}>God Mode Controls</Text>
        </View>
        <Text style={styles.headerSub}>Absolute system override. Use with extreme caution.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={18} color="#fff" />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color="#6b7280" style={{ position: 'absolute', left: 12, zIndex: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Enter Student Phone Number..."
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.searchBtnText}>Locate</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {targetUser && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* User Info */}
          <View style={styles.userCard}>
            <View style={styles.userHeader}>
              <Text style={styles.userTitle}>Target Acquired</Text>
              <Text style={styles.userRole}>{targetUser.role}</Text>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{targetUser.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{targetUser.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Spent:</Text>
                <Text style={[styles.infoValue, { color: '#10b981' }]}>₹{targetUser.totalRevenue}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Courses:</Text>
                <Text style={styles.infoValue}>{targetUser.coursesCount}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.impersonateBtn} onPress={handleImpersonate}>
              <Ionicons name="key" size={16} color="#fff" />
              <Text style={styles.impersonateText}>Login As Student</Text>
            </TouchableOpacity>
          </View>

          {/* Subscription Controls */}
          <View style={styles.subscriptionCard}>
            <Text style={styles.subTitle}>Subscription Engine</Text>

            <Text style={styles.inputLabel}>Plan Type</Text>
            <View style={styles.planRow}>
              {['trial', 'monthly', 'yearly'].map((plan) => (
                <TouchableOpacity
                  key={plan}
                  style={[styles.planOption, planType === plan && styles.planOptionActive]}
                  onPress={() => setPlanType(plan)}
                >
                  <Text style={[styles.planOptionText, planType === plan && styles.planOptionTextActive]}>
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Days to Grant</Text>
            <TextInput
              style={styles.input}
              value={daysToAdd}
              onChangeText={setDaysToAdd}
              keyboardType="number-pad"
            />

            <TouchableOpacity style={styles.activateBtn} onPress={() => handleForceSubscription('activate')}>
              <Ionicons name="power" size={16} color="#10b981" />
              <Text style={styles.activateText}>Force Activate / Extend</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.terminateBtn} onPress={() => handleForceSubscription('terminate')}>
              <Ionicons name="log-out" size={16} color="#ef4444" />
              <Text style={styles.terminateText}>Terminate Access</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  header: { padding: 16, backgroundColor: '#1f2937', borderBottomWidth: 1, borderBottomColor: '#374151' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  headerSub: { color: '#9ca3af', fontSize: 12 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  backBtnText: { color: '#fff', fontSize: 13 },
  searchSection: { padding: 16 },
  searchRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  searchInput: {
    flex: 1, backgroundColor: '#1f2937', borderRadius: 8, padding: 12, paddingLeft: 40,
    color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#374151',
  },
  searchBtn: { backgroundColor: '#059669', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  searchBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  content: { flex: 1, padding: 16 },
  userCard: {
    backgroundColor: '#1f2937', borderRadius: 12, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#374151',
  },
  userHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  userTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  userRole: { color: '#60a5fa', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', backgroundColor: 'rgba(96,165,250,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  userInfo: { gap: 8, marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#374151' },
  infoLabel: { color: '#6b7280', fontSize: 13 },
  infoValue: { color: '#d1d5db', fontSize: 13, fontWeight: '600' },
  impersonateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#374151', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#4b5563',
  },
  impersonateText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  subscriptionCard: {
    backgroundColor: '#1f2937', borderRadius: 12, padding: 16, marginBottom: 40,
    borderWidth: 1, borderColor: '#374151', gap: 12,
  },
  subTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  inputLabel: { color: '#6b7280', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  planRow: { flexDirection: 'row', gap: 8 },
  planOption: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#111827', alignItems: 'center', borderWidth: 1, borderColor: '#374151' },
  planOptionActive: { borderColor: '#059669', backgroundColor: 'rgba(5,150,105,0.1)' },
  planOptionText: { color: '#6b7280', fontSize: 12, fontWeight: '600' },
  planOptionTextActive: { color: '#10b981' },
  input: { backgroundColor: '#111827', borderRadius: 8, padding: 12, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#374151' },
  activateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(5,150,105,0.2)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#059669',
  },
  activateText: { color: '#10b981', fontWeight: '800', fontSize: 13 },
  terminateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ef4444',
  },
  terminateText: { color: '#ef4444', fontWeight: '800', fontSize: 13 },
});
