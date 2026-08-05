import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '../config';

export default function LoginScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1=phone, 2=otp, 3=profile
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    name: '',
    email: '',
    age: '',
    gender: 'Male',
  });

  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startResendTimer = () => {
    setResendTimer(120);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSendOtp = async () => {
    const phone = formData.phone.replace(/[^0-9]/g, '');
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: phone.startsWith('+') ? phone : `+91${phone}` }),
      });
      if (res.ok) {
        setStep(2);
        startResendTimer();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (formData.otp.length < 4) {
      setError('Please enter the OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const phone = formData.phone.replace(/[^0-9]/g, '');
      const res = await fetch(`${BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phone: phone.startsWith('+') ? phone : `+91${phone}`,
          otp: formData.otp,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.isNewUser) {
          setStep(3);
        } else {
          Alert.alert('Welcome', 'Logged in successfully!');
          navigation.goBack();
        }
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const phone = formData.phone.replace(/[^0-9]/g, '');
      const res = await fetch(`${BASE_URL}/complete-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          phone: phone.startsWith('+') ? phone : `+91${phone}`,
        }),
      });
      if (res.ok) {
        Alert.alert('Success', 'Profile created! Welcome to UPSKALE.');
        navigation.goBack();
      } else {
        const data = await res.json();
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (step === 1) handleSendOtp();
    else if (step === 2) handleVerifyOtp();
    else handleRegister();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            if (step > 1) { setStep(step - 1); setError(''); }
            else navigation.goBack();
          }}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: 'https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412223/20250730_170449_0000_uq4d24.png' }}
            style={{ width: 100, height: 28 }}
          />
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={12} color="#10b981" />
            <Text style={styles.badgeText}>Upskale Access</Text>
          </View>

          <Text style={styles.title}>
            {step === 1 ? 'Welcome' : step === 2 ? 'Verify OTP' : 'Complete Profile'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? 'Enter your phone number to continue.'
              : step === 2
              ? `6-digit code sent to ${formData.phone}`
              : 'Just a few more details to get started!'}
          </Text>

          {step === 1 && (
            <View style={styles.inputGroup}>
              <View style={styles.inputRow}>
                <Ionicons name="phone-portrait" size={18} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#6b7280"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text.replace(/[^0-9]/g, '') })}
                />
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.inputGroup}>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed" size={18} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="000000"
                  placeholderTextColor="#6b7280"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={formData.otp}
                  onChangeText={(text) => setFormData({ ...formData, otp: text.replace(/[^0-9]/g, '') })}
                />
              </View>
              <View style={styles.resendRow}>
                <Text style={styles.validText}>Valid for 5 minutes</Text>
                {resendTimer > 0 ? (
                  <Text style={styles.timerText}>Resend in {formatTime(resendTimer)}</Text>
                ) : (
                  <TouchableOpacity onPress={handleSendOtp}>
                    <Text style={styles.resendBtn}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.inputGroup}>
              <View style={styles.inputRow}>
                <Ionicons name="person" size={18} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#6b7280"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>
              <View style={styles.inputRow}>
                <Ionicons name="mail" size={18} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#6b7280"
                  keyboardType="email-address"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                />
              </View>
              <View style={styles.row}>
                <View style={[styles.inputRow, { flex: 1 }]}>
                  <Ionicons name="calendar" size={18} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Age"
                    placeholderTextColor="#6b7280"
                    keyboardType="number-pad"
                    maxLength={2}
                    value={formData.age}
                    onChangeText={(text) => setFormData({ ...formData, age: text })}
                  />
                </View>
                <View style={[styles.inputRow, { flex: 1 }]}>
                  <Ionicons name="people" size={18} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Gender"
                    placeholderTextColor="#6b7280"
                    value={formData.gender}
                    onChangeText={(text) => setFormData({ ...formData, gender: text })}
                  />
                </View>
              </View>
            </View>
          )}

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={14} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.submitBtnText}>
                {step === 1 ? 'Send OTP' : step === 2 ? 'Verify & Continue' : 'Finish Registration'}
              </Text>
            )}
          </TouchableOpacity>

          {step > 1 && (
            <TouchableOpacity style={styles.backLink} onPress={() => { setStep(step - 1); setError(''); }}>
              <Ionicons name="chevron-back" size={14} color="#6b7280" />
              <Text style={styles.backLinkText}>Go Back</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  content: { padding: 24, alignItems: 'center', paddingTop: 40 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 16,
  },
  badgeText: { color: '#10b981', fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  subtitle: { color: '#6b7280', fontSize: 13, marginBottom: 32, textAlign: 'center' },
  inputGroup: { width: '100%', gap: 12, marginBottom: 16 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0a0a0a',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12,
    paddingHorizontal: 14, height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 15, height: '100%' },
  otpInput: { textAlign: 'center', fontSize: 20, letterSpacing: 6, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12 },
  resendRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  validText: { color: '#6b7280', fontSize: 11 },
  timerText: { color: '#6b7280', fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  resendBtn: { color: '#10b981', fontSize: 11, fontWeight: '700' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(239,68,68,0.1)',
    padding: 10, borderRadius: 8, width: '100%', marginBottom: 12,
  },
  errorText: { color: '#ef4444', fontSize: 12 },
  submitBtn: {
    backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center',
    width: '100%', marginBottom: 16,
  },
  submitBtnText: { color: '#000', fontWeight: '900', fontSize: 15 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backLinkText: { color: '#6b7280', fontSize: 12 },
});
