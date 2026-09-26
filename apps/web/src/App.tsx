import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router';
import { BottomNav } from './components/BottomNav';
import { UpdatePrompt } from './components/UpdatePrompt';
import { useApp } from './lib/store';
import { Home } from './screens/Home';
import { Onboarding } from './screens/Onboarding';

const Learn = lazy(() => import('./screens/Learn'));
const LessonPlayer = lazy(() => import('./screens/LessonPlayer'));
const Practice = lazy(() => import('./screens/Practice'));
const Review = lazy(() => import('./screens/Review'));
const Pronunciation = lazy(() => import('./screens/Pronunciation'));
const SoundCoach = lazy(() => import('./screens/SoundCoach'));
const Listening = lazy(() => import('./screens/Listening'));
const ListeningPlayer = lazy(() => import('./screens/ListeningPlayer'));
const Drill = lazy(() => import('./screens/Drill'));
const SpeakLikeDutch = lazy(() => import('./screens/SpeakLikeDutch'));
const Talk = lazy(() => import('./screens/Talk'));
const Chat = lazy(() => import('./screens/Chat'));
const Culture = lazy(() => import('./screens/Culture'));
const CultureArticle = lazy(() => import('./screens/CultureArticle'));
const Progress = lazy(() => import('./screens/Progress'));
const PatternDetail = lazy(() => import('./screens/PatternDetail'));
const Profile = lazy(() => import('./screens/Profile'));
const Account = lazy(() => import('./screens/Account'));

/** Focused, full-screen flows hide the bottom bar (lesson player, chat, drills). */
const FULL_SCREEN = [/^\/learn\/.+/, /^\/talk\/.+/, /^\/practice\/review/, /^\/practice\/drill\//, /^\/onboarding/];

function Shell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const full = FULL_SCREEN.some((r) => r.test(pathname));
  return (
    <div className="app">
      <a className="sr-only" href="#main">
        Skip to content
      </a>
      <main id="main" className={`main${full ? ' full' : ''}`}>
        <Suspense
          fallback={
            <p className="muted" aria-busy="true">
              Laden…
            </p>
          }
        >
          {children}
        </Suspense>
      </main>
      {!full && <BottomNav />}
      <UpdatePrompt />
    </div>
  );
}

function AppRoutes() {
  const { profile } = useApp();
  if (!profile.onboarded) {
    return (
      <Routes>
        <Route path="/account" element={<Account />} />
        <Route path="*" element={<Onboarding />} />
      </Routes>
    );
  }
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/learn" element={<Learn />} />
      <Route path="/learn/:lessonId" element={<LessonPlayer />} />
      <Route path="/practice" element={<Practice />} />
      <Route path="/practice/review" element={<Review />} />
      <Route path="/practice/pronunciation" element={<Pronunciation />} />
      <Route path="/practice/pronunciation/:soundId" element={<SoundCoach />} />
      <Route path="/practice/listening" element={<Listening />} />
      <Route path="/practice/listening/:itemId" element={<ListeningPlayer />} />
      <Route path="/practice/drill/:patternId" element={<Drill />} />
      <Route path="/practice/natural" element={<SpeakLikeDutch />} />
      <Route path="/talk" element={<Talk />} />
      <Route path="/talk/:mode/:refId?" element={<Chat />} />
      <Route path="/culture" element={<Culture />} />
      <Route path="/culture/:articleId" element={<CultureArticle />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/progress/diary/:patternId" element={<PatternDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/account" element={<Account />} />
      <Route path="/onboarding" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Shell>
        <AppRoutes />
      </Shell>
    </BrowserRouter>
  );
}
