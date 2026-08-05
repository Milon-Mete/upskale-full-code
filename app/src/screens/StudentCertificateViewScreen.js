import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Share, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function StudentCertificateViewScreen({ route, navigation }) {
  const { certificateId } = route.params || {};
  const [generating, setGenerating] = useState(false);
  const certUrl = `https://upskale.com/view-certificate/${certificateId}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my verified certificate from UPSKALE! ${certUrl}`,
        title: 'UPSKALE Certificate',
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleDownload = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      Alert.alert('Download', 'Certificate downloaded successfully!');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#10b981" />
          <Text style={styles.verifiedText}>Verified Credential</Text>
        </View>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {certificateId ? (
        <WebView
          source={{ uri: certUrl }}
          style={{ flex: 1 }}
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
          <Text style={styles.emptyText}>No certificate ID provided</Text>
        </View>
      )}

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload} disabled={generating}>
          {generating ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <>
              <Ionicons name="download" size={18} color="#000" />
              <Text style={styles.downloadText}>Download Certificate</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkedinBtn}>
          <Ionicons name="logo-linkedin" size={18} color="#fff" />
          <Text style={styles.linkedinText}>Share on LinkedIn</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030303' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  verifiedText: { color: '#10b981', fontSize: 11, fontWeight: '700' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { color: '#6b7280', fontSize: 16 },
  actionBar: {
    flexDirection: 'column', padding: 16, gap: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
  },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#10b981', padding: 14, borderRadius: 12,
  },
  downloadText: { color: '#000', fontWeight: '900', fontSize: 14 },
  linkedinBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#0A66C2', padding: 14, borderRadius: 12,
  },
  linkedinText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
