import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Dimensions, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { BASE_URL } from '../config';

const { width, height } = Dimensions.get('window');

const DUMMY_QUIZ = [
  { question: "What is MS Excel?", options: ["Word processor", "Spreadsheet software", "Browser", "Game"], answer: 1 },
  { question: "What is the default file extension of Excel?", options: [".docx", ".xlsx", ".pptx", ".txt"], answer: 1 },
  { question: "A cell in Excel is formed by:", options: ["Row only", "Row and column intersection", "Column only", "Sheet only"], answer: 1 },
  { question: "Which key is used to select all data?", options: ["Ctrl + C", "Ctrl + A", "Ctrl + V", "Ctrl + X"], answer: 1 },
  { question: "What is a workbook?", options: ["Single cell", "Collection of worksheets", "Chart only", "Formula"], answer: 1 },
  { question: "Which symbol is used to start a formula?", options: ["#", "=", "@", "&"], answer: 1 },
  { question: "What is a row in Excel?", options: ["Vertical line", "Horizontal line", "Box", "Table"], answer: 1 },
  { question: "What is a column in Excel?", options: ["Horizontal line", "Vertical line", "Row", "Cell"], answer: 1 },
  { question: "Which shortcut is used to copy?", options: ["Ctrl + V", "Ctrl + C", "Ctrl + X", "Ctrl + Z"], answer: 1 },
  { question: "Which option is used to paste?", options: ["Ctrl + C", "Ctrl + V", "Ctrl + X", "Ctrl + A"], answer: 1 },
];

export default function ExcelPlaylistScreen({ route, navigation }) {
  const { cohortId } = route.params;
  const [courseContent, setCourseContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModule, setActiveModule] = useState(0);
  const [activeLesson, setActiveLesson] = useState({ moduleIndex: 0, lessonIndex: 0 });
  const [moduleExpanded, setModuleExpanded] = useState(null);

  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState(Array(10).fill(null));
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const getEmbedUrl = (videoId) => {
    if (!videoId) return '';
    if (videoId.includes('youtube.com/watch?v=')) {
      const id = videoId.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
    }
    if (videoId.startsWith('http')) return videoId;
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  };

  useEffect(() => {
    if (!cohortId) { setError('No Course ID'); setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/cohorts/content/${cohortId}`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error(res.status === 401 || res.status === 403 ? 'Content Locked' : 'Server Error');
        const data = await res.json();
        if (data?.content?.length > 0) setCourseContent(data.content);
        else setError('No content available');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [cohortId]);

  // Quiz handlers
  const openQuiz = () => {
    setIsQuizOpen(true);
    setShowResult(false);
    setShowCertificate(false);
    setQuizStep(0);
    setUserAnswers(Array(10).fill(null));
  };

  const handleAnswer = (optIdx) => {
    const newAnswers = [...userAnswers];
    newAnswers[quizStep] = optIdx;
    setUserAnswers(newAnswers);
  };

  const submitQuiz = () => {
    let finalScore = 0;
    userAnswers.forEach((ans, idx) => {
      if (ans === DUMMY_QUIZ[idx].answer) finalScore += 10;
    });
    setScore(finalScore);
    setShowResult(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#10b981" size="large" style={{ flex: 1, justifyContent: 'center' }} />
      </SafeAreaView>
    );
  }

  if (error || courseContent.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 }}>
          <Ionicons name="lock-closed" size={48} color="#ef4444" />
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' }}>{error || 'No content found'}</Text>
          <TouchableOpacity style={{ backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 }} onPress={() => navigation.goBack()}>
            <Text style={{ color: '#000', fontWeight: '800' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentVideo = courseContent[activeLesson.moduleIndex]?.lessons[activeLesson.lessonIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Course Player</Text>
          <Text style={styles.headerSub}>Upskale Learning</Text>
        </View>
        <TouchableOpacity onPress={openQuiz} style={styles.quizBtn}>
          <Ionicons name="help-circle" size={18} color="#eab308" />
          <Text style={styles.quizBtnText}>Quiz</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {/* Video Player */}
        <View style={styles.videoContainer}>
          {currentVideo?.videoId ? (
            <WebView
              source={{ html: `<iframe width="100%" height="100%" src="${getEmbedUrl(currentVideo.videoId)}" frameborder="0" allowfullscreen></iframe>` }}
              style={{ flex: 1, backgroundColor: '#000' }}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="lock-closed" size={32} color="#6b7280" />
              <Text style={{ color: '#6b7280', marginTop: 8 }}>No video available</Text>
            </View>
          )}
        </View>

        {/* Lesson Title */}
        <View style={styles.lessonInfo}>
          <Text style={styles.lessonTitle}>{currentVideo?.title || 'Lesson'}</Text>
          <Text style={styles.lessonMeta}>
            Chapter {activeLesson.moduleIndex + 1} • Lesson {activeLesson.lessonIndex + 1}
          </Text>
        </View>

        {/* Course Content Sidebar (simplified) */}
        <ScrollView style={styles.sidebar}>
          {courseContent.map((module, mIdx) => (
            <View key={mIdx} style={styles.moduleCard}>
              <TouchableOpacity
                style={styles.moduleHeader}
                onPress={() => setModuleExpanded(moduleExpanded === mIdx ? null : mIdx)}
              >
                <View>
                  <Text style={styles.moduleLabel}>Module {mIdx + 1}</Text>
                  <Text style={styles.moduleTitle}>{module.chapterTitle}</Text>
                </View>
                <Ionicons
                  name={moduleExpanded === mIdx ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#6b7280"
                />
              </TouchableOpacity>
              {moduleExpanded === mIdx && module.lessons?.map((lesson, lIdx) => {
                const isActive = activeLesson.moduleIndex === mIdx && activeLesson.lessonIndex === lIdx;
                return (
                  <TouchableOpacity
                    key={lIdx}
                    style={[styles.lessonItem, isActive && styles.lessonItemActive]}
                    onPress={() => setActiveLesson({ moduleIndex: mIdx, lessonIndex: lIdx })}
                  >
                    <Ionicons
                      name={isActive ? 'play-circle' : 'ellipse-outline'}
                      size={16}
                      color={isActive ? '#10b981' : '#6b7280'}
                    />
                    <Text style={[styles.lessonItemText, isActive && { color: '#10b981' }]}>{lesson.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Quiz Modal */}
      {isQuizOpen && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Certification Quiz</Text>
              <TouchableOpacity onPress={() => setIsQuizOpen(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {showCertificate ? (
              <View style={styles.certificateView}>
                <Ionicons name="trophy" size={60} color="#eab308" />
                <Text style={styles.certTitle}>Certificate of Completion</Text>
                <Text style={styles.certSub}>Course Completed Successfully</Text>
                <TouchableOpacity style={styles.certDownloadBtn}>
                  <Ionicons name="download" size={18} color="#000" />
                  <Text style={styles.certDownloadText}>Download Certificate</Text>
                </TouchableOpacity>
              </View>
            ) : showResult ? (
              <View style={styles.resultView}>
                <Ionicons
                  name={score >= 70 ? 'trophy' : 'shield'}
                  size={60}
                  color={score >= 70 ? '#eab308' : '#ef4444'}
                />
                <Text style={styles.resultTitle}>{score >= 70 ? 'You Passed!' : 'Keep Learning'}</Text>
                <Text style={[styles.resultScore, { color: score >= 70 ? '#10b981' : '#ef4444' }]}>Score: {score}%</Text>
                {score >= 70 ? (
                  <TouchableOpacity style={styles.viewCertBtn} onPress={() => setShowCertificate(true)}>
                    <Text style={styles.viewCertText}>View Certificate</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.retakeBtn}
                    onPress={() => { setQuizStep(0); setUserAnswers(Array(10).fill(null)); setShowResult(false); }}
                  >
                    <Text style={styles.retakeText}>Retake Quiz</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.quizBody}>
                {quizStep < 10 ? (
                  <>
                    <View style={styles.quizProgressRow}>
                      <Text style={styles.quizQuestionNum}>Question {quizStep + 1} of 10</Text>
                      <View style={styles.quizProgressBg}>
                        <View style={[styles.quizProgressFill, { width: `${((quizStep + 1) / 10) * 100}%` }]} />
                      </View>
                    </View>
                    <Text style={styles.questionText}>{DUMMY_QUIZ[quizStep].question}</Text>
                    <ScrollView style={styles.optionsContainer}>
                      {DUMMY_QUIZ[quizStep].options.map((opt, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={[styles.option, userAnswers[quizStep] === idx && styles.optionSelected]}
                          onPress={() => handleAnswer(idx)}
                        >
                          <Text style={[styles.optionText, userAnswers[quizStep] === idx && styles.optionTextSelected]}>
                            {['A', 'B', 'C', 'D'][idx]}. {opt}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <TouchableOpacity
                      style={[styles.nextBtn, userAnswers[quizStep] === null && styles.nextBtnDisabled]}
                      disabled={userAnswers[quizStep] === null}
                      onPress={() => {
                        if (quizStep < 9) setQuizStep(quizStep + 1);
                        else submitQuiz();
                      }}
                    >
                      <Text style={styles.nextBtnText}>
                        {quizStep === 9 ? 'Submit Final Answers' : 'Next Question'}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : null}
              </View>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#0a0a0a',
  },
  headerTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  headerSub: { color: '#10b981', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  quizBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(234,179,8,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  quizBtnText: { color: '#eab308', fontSize: 11, fontWeight: '700' },
  mainContent: { flex: 1 },
  videoContainer: { height: 240, backgroundColor: '#000' },
  lessonInfo: { padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  lessonTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  lessonMeta: { color: '#6b7280', fontSize: 11, marginTop: 4 },
  sidebar: { flex: 1, padding: 8 },
  moduleCard: { backgroundColor: '#121212', borderRadius: 12, marginBottom: 8, overflow: 'hidden' },
  moduleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  moduleLabel: { color: '#6b7280', fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  moduleTitle: { color: '#d1d5db', fontSize: 13, fontWeight: '600', marginTop: 2 },
  lessonItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 16 },
  lessonItemActive: { backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 8 },
  lessonItemText: { color: '#9ca3af', fontSize: 12 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 16, zIndex: 200 },
  modalContent: { backgroundColor: '#121212', borderRadius: 20, maxHeight: '90%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  quizBody: { padding: 20 },
  quizProgressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  quizQuestionNum: { color: '#eab308', fontSize: 12, fontWeight: '700' },
  quizProgressBg: { height: 6, flex: 1, backgroundColor: '#1f2937', borderRadius: 3, marginLeft: 12, overflow: 'hidden' },
  quizProgressFill: { height: '100%', backgroundColor: '#eab308' },
  questionText: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 20, lineHeight: 24 },
  optionsContainer: { maxHeight: 300, marginBottom: 20 },
  option: { padding: 14, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 8, backgroundColor: '#0a0a0a' },
  optionSelected: { borderColor: '#eab308', backgroundColor: 'rgba(234,179,8,0.1)' },
  optionText: { color: '#9ca3af', fontSize: 14 },
  optionTextSelected: { color: '#fff' },
  nextBtn: { backgroundColor: '#eab308', padding: 14, borderRadius: 12, alignItems: 'center' },
  nextBtnDisabled: { backgroundColor: '#1a1a1a' },
  nextBtnText: { color: '#000', fontWeight: '900', fontSize: 14 },
  resultView: { padding: 32, alignItems: 'center', gap: 12 },
  resultTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  resultScore: { fontSize: 18, fontWeight: '700' },
  viewCertBtn: { backgroundColor: '#10b981', padding: 14, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 16 },
  viewCertText: { color: '#000', fontWeight: '900', fontSize: 14 },
  retakeBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 14, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 16 },
  retakeText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  certificateView: { padding: 32, alignItems: 'center', gap: 12 },
  certTitle: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  certSub: { color: '#10b981', fontSize: 14, textAlign: 'center' },
  certDownloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#10b981', padding: 14, borderRadius: 12, marginTop: 16 },
  certDownloadText: { color: '#000', fontWeight: '900', fontSize: 14 },
});
