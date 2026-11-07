import React, { useState, useEffect } from 'react';
import { BookOpen, Star, TrendingUp, Layers, Zap, BarChart3, FileSpreadsheet, Bot, Presentation, MessageSquare, BadgeIndianRupee } from 'lucide-react';
import { BASE_URL } from '../config';
import { realSwipes } from '../swipes';
import { NetflixRail, RailCard, RailSkeleton } from './NetflixRail';

const IconMap = {
  FileSpreadsheet, Presentation, Bot, BarChart3, MessageSquare,
};

const readUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); }
  catch { return null; }
};

/* ---------------- Live Cohorts rail (GET /cohorts) ---------------- */
export const CohortRail = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/cohorts`);
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to fetch cohorts', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="py-6"><RailSkeleton /></div>;
  if (courses.length === 0) return null;

  return (
    <NetflixRail id="cohorts" eyebrow="Learn live with mentors" title="Live Cohorts" icon={Zap}>
      {courses.map((c) => {
        const price = c.pricing?.live?.discount || c.pricing?.recorded?.discount || 0;
        const original = c.pricing?.live?.original || c.pricing?.recorded?.original || 0;
        const ribbon = (c.tags && c.tags[0]) ? String(c.tags[0]).toUpperCase() : 'COHORT';
        return (
          <RailCard
            key={c._id}
            to={`/course/${c.slug}`}
            image={c.thumbnail}
            ribbon={ribbon}
            kicker="3-Month Training"
            bigTitle={c.title}
            badge="Live Cohort"
            metaLeft={{ icon: BadgeIndianRupee, text: price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'Free' }}
            metaRight={original > price ? { text: `₹${original.toLocaleString('en-IN')}`, strike: true } : null}
          />
        );
      })}
    </NetflixRail>
  );
};

/* ---------------- Trending rail (GET /bitesize-courses, rank numbers) ---------------- */
export const TrendingRail = ({ footer = null }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const user = readUser();
    const sub = user?.biteSizeSubscription;
    setHasAccess(Boolean(
      (sub?.status === 'active' && sub?.expiresAt && new Date(sub.expiresAt) > new Date()) ||
      user?.role === 'admin'
    ));
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/bitesize-courses`);
        setCourses(realSwipes(await res.json()));
      } catch (e) {
        console.error('Failed to fetch bitesize courses', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="py-6"><RailSkeleton /></div>;
  if (courses.length === 0) return null;

  return (
    <>
    <NetflixRail id="trending" eyebrow="Short, sharp, certificate-ready" title="Trending" titleGold icon={TrendingUp}>
      {courses.toReversed().map((course, i) => {
        const FallbackIcon = IconMap[course.iconName] || Layers;
        const chapters = course.chapters || [];
        const lessonCount = chapters.reduce((n, ch) => n + (ch.modules ? ch.modules.length : 0), 0);
        const rating = Number(course.averageRating) || 0;

        const targetUrl = course.isLocked ? '#' : (hasAccess ? `/bitesize/${course.slug}` : '/pro');
        const navState = (!course.isLocked && !hasAccess) ? { returnTo: `/bitesize/${course.slug}` } : null;

        return (
          <RailCard
            key={course._id}
            to={targetUrl}
            state={navState}
            onClick={(e) => course.isLocked && e.preventDefault()}
            image={course.image}
            fallbackIcon={FallbackIcon}
            ribbon={course.tag ? String(course.tag).toUpperCase() : 'SWIPES'}
            kicker={course.title}
            bigTitle={course.highlight || course.title}
            badge={course.isLocked ? 'Coming Soon' : 'Certificate Course'}
            rank={i + 1}
            metaLeft={{ icon: BookOpen, text: lessonCount > 0 ? `${lessonCount} lessons` : `${chapters.length} chapters` }}
            metaRight={rating > 0 ? { icon: Star, text: `${rating}/5` } : null}
          />
        );
      })}
    </NetflixRail>
    {footer}
    </>
  );
};
