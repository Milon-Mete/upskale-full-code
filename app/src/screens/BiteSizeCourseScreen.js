import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, Image,
  ActivityIndicator, FlatList, ScrollView, Alert
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '../config';

const { width, height } = Dimensions.get('window');

function ShortVideo({ video, isActive, courseTitle, courseHighlight, courseId,
  userId, onNext, onPrev, onEnded }) {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.totalLikes || 0);
  const [showAutoAdvance, setShowAutoAdvance] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const autoTimer = useRef(null);
  const countTimer = useRef(null);
  const [saved, setSaved] = useState(false);
  const [speed, setSpeed] = useState(1.0);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.playAsync();
    } else if (videoRef.current) {
      videoRef.current.pauseAsync();
    }
  }, [isActive]);

  const togglePlay = () => {
    if (paused) {
      videoRef.current?.playAsync();
    } else {
      videoRef.current?.pauseAsync();
    }
    setPaused(!paused);
  };

  const handleLike = async () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    try {
      await fetch(`${BASE_URL}/bitesize-courses/content/${courseId}/like/${video._id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
    } catch (err) {}
  };

  const handleEnd = () => {
    setProgress(1);
    if (onNext) {
      setShowAutoAdvance(true);
      setCountdown(4);
      countTimer.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 2) {
            clearInterval(countTimer.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      autoTimer.current = setTimeout(() => {
        setShowAutoAdvance(false);
        onNext();
      }, 4000);
    }
    onEnded?.();
  };

  const cancelAutoAdvance = () => {
    setShowAutoAdvance(false);
    if (autoTimer.current) clearTimeout(autoTimer.current);
    if (countTimer.current) { clearInterval(countTimer.current); countTimer.current = null; }
  };

  const rewatch = () => {
    cancelAutoAdvance();
    videoRef.current?.setPositionAsync(0);
    videoRef.current?.playAsync();
    setPaused(false);
  };

  return (
    <View style={styles.videoContainer}>
      <Video
        ref={videoRef}
        source={{ uri: video.videoUrls?.bn || video.videoUrl }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        isLooping={false}
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded) {
            setProgress(status.positionMillis / status.durationMillis);
            setPaused(!status.isPlaying);
            if (status.didJustFinish) handleEnd();
          }
        }}
      />

      {/* Dark overlay */}
      <View style={styles.videoOverlay} pointerEvents="box-none">
        {/* Course tag */}
        <View style={styles.courseTag}>
          <Ionicons name="play" size={8} color="#10b981" />
          <Text style={styles.courseTagText}>{courseTitle} {courseHighlight}</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        {/* Speed badge */}
        {speed !== 1 && (
          <View style={styles.speedBadge}>
            <Text style={styles.speedText}>{speed}x</Text>
          </View>
        )}

        {/* Auto-advance overlay */}
        {showAutoAdvance && (
          <View style={styles.autoAdvance}>
            <View style={styles.autoAdvanceInner}>
              <View style={styles.countdownCircle}>
                <Text style={styles.countdownText}>{countdown}</Text>
              </View>
              <Text style={styles.nextLabel}>Next</Text>
              <TouchableOpacity onPress={rewatch} style={styles.advBtn}>
                <Ionicons name="reload" size={12} color="#10b981" />
                <Text style={[styles.advBtnText, { color: '#10b981' }]}>Rewatch</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={cancelAutoAdvance} style={styles.advBtn}>
                <Text style={styles.advBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Bottom info */}
        <View style={styles.bottomArea}>
          <View style={styles.bottomLeft}>
            <View style={styles.logoRow}>
              <Image
                source={{ uri: 'https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412223/20250730_170449_0000_uq4d24.png' }}
                style={styles.logo}
              />
            </View>
            <Text style={styles.videoTitle}>{video.title}</Text>
          </View>

          {/* Right actions */}
          <View style={styles.rightActions}>
            <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={26}
                color={liked ? '#ef4444' : '#fff'}
              />
              <Text style={styles.actionLabel}>{likeCount > 0 ? likeCount : 'Like'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="chatbubble-outline" size={24} color="#fff" />
              <Text style={styles.actionLabel}>Comments</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Play/pause tap area */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={togglePlay}
        />
      </View>
    </View>
  );
}

// QUIZ SECTION
function QuizSection({ course, onRetake }) {
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const questions = course.quiz?.questions || [];
  const currentQ = questions[qIndex];

  const handleSelect = (opt) => {
    setAnswers({ ...answers, [String(currentQ._id)]: opt });
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/bitesize-courses/submit-quiz/${course._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      Alert.alert('Error', 'Could not grade quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <View style={styles.quizResult}>
        <Ionicons
          name={result.passed ? 'trophy' : 'shield'}
          size={80}
          color={result.passed ? '#eab308' : '#ef4444'}
        />
        <Text style={styles.resultTitle}>
          {result.passed ? 'You Passed!' : 'Almost There'}
        </Text>
        <Text style={styles.resultScore}>Score: {result.score}%</Text>
        {result.passed ? (
          <TouchableOpacity
            style={styles.certBtn}
            onPress={() => {}}
          >
            <Text style={styles.certBtnText}>View Certificate</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.retakeBtn}
            onPress={() => { setResult(null); setAnswers({}); setQIndex(0); }}
          >
            <Text style={styles.retakeBtnText}>Review & Retake</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.quizContainer}>
      <View style={styles.quizHeader}>
        <Text style={styles.quizLabel}>Final Assessment</Text>
        <Text style={styles.quizCounter}>{qIndex + 1}/{questions.length}</Text>
      </View>
      <View style={styles.quizProgressBg}>
        <View style={[styles.quizProgressFill, {
          width: `${((qIndex + 1) / questions.length) * 100}%`
        }]} />
      </View>
      <Text style={styles.questionText}>{currentQ?.questionText}</Text>
      <ScrollView style={styles.optionsList}>
        {currentQ?.options.map((opt, i) => {
          const selected = answers[String(currentQ._id)] === opt;
          return (
            <TouchableOpacity
              key={i}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => handleSelect(opt)}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {opt}
              </Text>
              {selected && <Ionicons name="checkmark-circle" size={20} color="#10b981" />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <TouchableOpacity
        style={[styles.nextBtn, !answers[String(currentQ._id)] && styles.nextBtnDisabled]}
        disabled={!answers[String(currentQ._id)] || submitting}
        onPress={() => {
          if (qIndex < questions.length - 1) setQIndex(qIndex + 1);
          else submitQuiz();
        }}
      >
        <Text style={styles.nextBtnText}>
          {submitting ? 'Submitting...' :
            qIndex === questions.length - 1 ? 'Submit & Grade' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function BiteSizeCourseScreen({ route, navigation }) {
  const { slug } = route.params;
  const [course, setCourse] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const publicRes = await fetch(`${BASE_URL}/bitesize-courses/${slug}`);
      const publicData = await publicRes.json();
      setCourse(publicData);

      const premiumRes = await fetch(`${BASE_URL}/bitesize-courses/content/${publicData._id}`, {
        credentials: 'include'
      });
      if (premiumRes.ok) {
        const premiumData = await premiumRes.json();
        setContent(premiumData.content || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#10b981" size="large" />
      </View>
    );
  }

  const goNext = () => {
    if (activeIndex < content.length - 1) {
      const next = activeIndex + 1;
      setActiveIndex(next);
      flatRef.current?.scrollToIndex({ index: next, animated: true });
    }
  };

  const goPrev = () => {
    if (activeIndex > 0) {
      const prev = activeIndex - 1;
      setActiveIndex(prev);
      flatRef.current?.scrollToIndex({ index: prev, animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>

      <FlatList
        ref={flatRef}
        data={content}
        keyExtractor={(item, i) => item._id || String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
        renderItem={({ item, index }) => (
          <ShortVideo
            video={item}
            isActive={index === activeIndex}
            courseTitle={course?.title}
            courseHighlight={course?.highlight}
            courseId={course?._id}
            userId={null}
            onNext={goNext}
            onPrev={goPrev}
            onEnded={() => {
              fetch(`${BASE_URL}/engagement/progress/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ courseId: course?._id, contentId: item._id })
              }).catch(() => {});
            }}
          />
        )}
        getItemLayout={(_, index) => ({
          length: width, offset: width * index, index
        })}
        ListFooterComponent={
          content.length > 0 ? (
            <View style={{ width, minHeight: height - 80 }}>
              <QuizSection course={course} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 100, padding: 8 },
  videoContainer: { width, height: height - 80 },
  video: { width: '100%', height: '100%' },
  videoOverlay: { ...StyleSheet.absoluteFillObject },
  courseTag: {
    position: 'absolute', top: 50, left: 60,
    backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  courseTagText: { color: '#e5e7eb', fontSize: 11, fontWeight: '700' },
  progressBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressFill: { height: '100%', backgroundColor: '#10b981' },
  speedBadge: {
    position: 'absolute', top: 50, left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8,
  },
  speedText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  autoAdvance: {
    position: 'absolute', bottom: 120, left: 0, right: 0,
    alignItems: 'center', zIndex: 30,
  },
  autoAdvanceInner: {
    backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  countdownCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(16,185,129,0.2)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  countdownText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  nextLabel: { color: '#fff', fontSize: 12, fontWeight: '500' },
  advBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  advBtnText: { color: '#9ca3af', fontSize: 11, fontWeight: '700' },
  bottomArea: {
    position: 'absolute', bottom: 24, left: 16, right: 60,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  bottomLeft: { flex: 1 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logo: { width: 100, height: 24 },
  videoTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  rightActions: { gap: 16, alignItems: 'center' },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionLabel: { color: '#fff', fontSize: 11, fontWeight: '600' },

  // Quiz styles
  quizContainer: { width, padding: 24, backgroundColor: '#050505', minHeight: height },
  quizHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  quizLabel: { color: '#10b981', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  quizCounter: { color: '#6b7280', fontSize: 12, fontWeight: '700' },
  quizProgressBg: { height: 8, backgroundColor: '#1f2937', borderRadius: 4, marginBottom: 24, overflow: 'hidden' },
  quizProgressFill: { height: '100%', backgroundColor: '#10b981' },
  questionText: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 24, lineHeight: 26 },
  optionsList: { flex: 1 },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderRadius: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#121212', marginBottom: 12,
  },
  optionSelected: { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)' },
  optionText: { color: '#9ca3af', fontSize: 14, fontWeight: '500', flex: 1 },
  optionTextSelected: { color: '#34d399' },
  nextBtn: {
    backgroundColor: '#059669', padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 16,
  },
  nextBtnDisabled: { backgroundColor: '#1a1a1a' },
  nextBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  quizResult: { width, flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050505', padding: 24 },
  resultTitle: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 16, marginBottom: 8 },
  resultScore: { color: '#34d399', fontSize: 18, fontWeight: '700', marginBottom: 24 },
  certBtn: { backgroundColor: '#059669', padding: 16, borderRadius: 12, width: '100%' },
  certBtnText: { color: '#fff', fontWeight: '900', fontSize: 15, textAlign: 'center' },
  retakeBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, width: '100%' },
  retakeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15, textAlign: 'center' },
});
