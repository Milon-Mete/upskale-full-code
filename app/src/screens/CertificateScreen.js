import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CertificateScreen({ route, navigation }) {
  const { certificateUrl, title } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title || 'Certificate'}</Text>
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {certificateUrl ? (
        <WebView
          source={{ uri: certificateUrl }}
          style={styles.webview}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#10b981" />
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="ribbon-outline" size={80} color="#6b7280" />
          <Text style={styles.emptyText}>No certificate available</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  shareBtn: { padding: 4 },
  webview: { flex: 1 },
  loadingOverlay: { position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { color: '#6b7280', fontSize: 16 },
});
