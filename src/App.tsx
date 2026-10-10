import React, { useState, useEffect } from 'react';
import { Lesson, HomileticsRecord, LanguageMode } from './types/bsf';
import { BSF_CURRICULUM } from './data/curriculum';
import {
  getActiveUser,
  setActiveUser,
  DEFAULT_USER,
  loadHomileticsRecord,
  saveHomileticsRecord,
  getCompletedLessons,
} from './utils/storage';
import { Header } from './components/Header';
import { ScripturePanel } from './components/ScripturePanel';
import { ScriptureCondensationView } from './components/ScriptureCondensationView';
import { HomileticsCoach } from './components/HomileticsCoach';
import { CurriculumList } from './components/CurriculumList';
import { OutlineSummaryView } from './components/OutlineSummaryView';
import { BsfGuidelinesModal } from './components/BsfGuidelinesModal';
import { HomileticsExportModal } from './components/HomileticsExportModal';
import { UserSwitcherModal } from './components/UserSwitcherModal';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<LanguageMode>('zh');
  const [currentTab, setCurrentTab] = useState<'workbench' | 'curriculum' | 'summary' | 'guide'>('workbench');
  const [currentLessonId, setCurrentLessonId] = useState<string>('1');
  const [currentWorkbenchStep, setCurrentWorkbenchStep] = useState<number>(1);
  const [mobileWorkbenchView, setMobileWorkbenchView] = useState<'coach' | 'scripture' | 'split'>('coach');
  const [currentUser, setCurrentUser] = useState<string>(() => getActiveUser());
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => getCompletedLessons(getActiveUser()));

  // Current homiletics record
  const [record, setRecord] = useState<HomileticsRecord>(() => loadHomileticsRecord('1', getActiveUser()));

  // Export Modal state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportLesson, setExportLesson] = useState<Lesson>(BSF_CURRICULUM[2]); // Lesson 1
  const [exportRecord, setExportRecord] = useState<HomileticsRecord>(record);

  // Initialize and seed lesson 1 if empty
  useEffect(() => {
    const existing = loadHomileticsRecord('1', currentUser);
    if (!existing.subjectSentenceZh && !existing.subjectSentenceEn && currentUser.toLowerCase() === DEFAULT_USER.toLowerCase()) {
      existing.contentList = [
        {
          id: 'item_1',
          afterVerse: 1,
          verseRef: '1:1',
          summaryZh: '保罗自我介绍：基督耶稣的仆人，奉召为使徒，特派传神的福音。',
          summaryEn: 'Paul introduces himself: servant of Jesus Christ, called apostle, set apart for God’s gospel.',
        },
        {
          id: 'item_2',
          afterVerse: 4,
          verseRef: '1:2-1:4',
          summaryZh: '福音由先知预言，论及耶稣基督：按肉体出于大卫，因复活显明是神的儿子。',
          summaryEn: 'Gospel promised through prophets concerning Jesus: David’s seed by flesh, Son of God by resurrection.',
        },
        {
          id: 'item_3',
          afterVerse: 6,
          verseRef: '1:5-1:6',
          summaryZh: '保罗从基督领受恩惠与使徒职分，叫万国信服真道，包括罗马受召信徒。',
          summaryEn: 'Paul received grace and apostleship for obedience of faith among all nations, including Rome.',
        },
        {
          id: 'item_4',
          afterVerse: 7,
          verseRef: '1:7',
          summaryZh: '保罗向罗马蒙爱圣徒问安：愿恩惠平安从父神与主基督归与他们。',
          summaryEn: 'Paul greets saints in Rome with grace and peace from God the Father and Lord Jesus.',
        },
        {
          id: 'item_5',
          afterVerse: 8,
          verseRef: '1:8',
          summaryZh: '保罗为罗马众人感谢神，因他们的信心传遍天下。',
          summaryEn: 'Paul thanks God through Jesus for Roman believers whose faith is proclaimed worldwide.',
        },
        {
          id: 'item_6',
          afterVerse: 10,
          verseRef: '1:9-1:10',
          summaryZh: '保罗在祷告中不住记念罗马信徒，恳求照神旨意得以前往。',
          summaryEn: 'Paul constantly mentions them in prayer, seeking God’s will to visit them.',
        },
        {
          id: 'item_7',
          afterVerse: 12,
          verseRef: '1:11-1:12',
          summaryZh: '保罗切望见他们以分享属灵恩赐，使彼此同得坚固与安慰。',
          summaryEn: 'Paul longs to impart spiritual gifts for mutual encouragement by shared faith.',
        },
        {
          id: 'item_8',
          afterVerse: 13,
          verseRef: '1:13',
          summaryZh: '保罗屡次定意往罗马去要在他们中得果子，但至今仍有阻隔。',
          summaryEn: 'Paul often intended to come to reap fruit among them, but was hindered until now.',
        },
        {
          id: 'item_9',
          afterVerse: 15,
          verseRef: '1:14-1:15',
          summaryZh: '保罗深感欠了众人的福音债，情愿尽力将福音传给罗马人。',
          summaryEn: 'Paul is obligated to all and eager to preach the gospel in Rome.',
        },
        {
          id: 'item_10',
          afterVerse: 16,
          verseRef: '1:16',
          summaryZh: '保罗宣告不以福音为耻：福音本是神的大能，要救一切相信的人。',
          summaryEn: 'Paul is not ashamed of the gospel: it is the power of God for salvation to all who believe.',
        },
        {
          id: 'item_11',
          afterVerse: 17,
          verseRef: '1:17',
          summaryZh: '神的义在福音上显明出来，本于信以至于信，如记“义人必因信得生”。',
          summaryEn: 'Righteousness of God revealed from faith to faith; the righteous shall live by faith.',
        },
      ];
      existing.subjectSentenceZh = '保罗竭力传扬因信称义的福音以坚固罗马圣徒'; // 含 保罗(1字)、罗马(1字)，折算后19字
      existing.subjectSentenceEn = 'Paul preaches God’s gospel of power to save all believers.'; // 10 words, Paul (1)
      existing.aimZh = '使会众明白：福音是神拯救万人的大能，坚固信徒放胆见证基督。';
      existing.aimEn = 'Cause the audience to know that God’s gospel has saving power.';
      existing.divisions = [
        {
          id: 'div_1',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 7,
          rangeText: '1:1-7',
          titleZh: '保罗奉召作使徒特派传神的恩惠福音',
          titleEn: 'Paul called as an apostle for God’s gospel',
          principleZh: '神的呼召赋予信徒坚定的属灵使命与身份。',
          principleEn: 'God’s divine calling gives believers eternal purpose.',
          app1Zh: '我是否清楚知道自己在基督里的属灵身份？',
          app1En: 'Do I know my true calling and identity in Christ Jesus?',
          app2Zh: '我如何向身边的人见证主耶稣基督的恩典？',
          app2En: 'How can I witness to God’s grace this coming week?',
        },
        {
          id: 'div_2',
          startChapter: 1,
          startVerse: 8,
          endChapter: 1,
          endVerse: 15,
          rangeText: '1:8-15',
          titleZh: '保罗渴慕在罗马圣徒中同得信心的安慰',
          titleEn: 'Paul longs to encourage believers in Rome',
          principleZh: '真诚的属灵相交能激发彼此的信心与力量。',
          principleEn: 'Genuine fellowship strengthens mutual faith in trials.',
          app1Zh: '当面临拦阻时，我是否仍坚持为教会肢体切切祈求？',
          app1En: 'Do I persistently pray for fellow believers in weakness?',
          app2Zh: '我最近是否在团契中真诚地与人分享并同受安慰？',
          app2En: 'How can I actively encourage someone in my small group?',
        },
        {
          id: 'div_3',
          startChapter: 1,
          startVerse: 16,
          endChapter: 1,
          endVerse: 17,
          rangeText: '1:16-17',
          titleZh: '福音本是神救一切相信之人的大能',
          titleEn: 'The gospel is the power of God for salvation',
          principleZh: '唯有因信依靠神，罪人方能白白称义得生。',
          principleEn: 'Righteousness and life come solely through faith.',
          app1Zh: '在世俗的非议面前，我是否放胆不以福音为耻？',
          app1En: 'Am I unashamed of the gospel in modern culture?',
          app2Zh: '我今天面对挑战时，是依靠自身才能还是信靠神的大能？',
          app2En: 'Am I relying on my own deeds or on God’s sovereign power?',
        },
      ];
      saveHomileticsRecord(existing, currentUser);
      setRecord(existing);
    }

    setCompletedLessons(getCompletedLessons(currentUser));
  }, [currentUser]);

  // Update record when switching lessons or user
  useEffect(() => {
    const loaded = loadHomileticsRecord(currentLessonId, currentUser);
    setRecord(loaded);
  }, [currentLessonId, currentUser]);

  const currentLesson = BSF_CURRICULUM.find((l) => l.id === currentLessonId) || BSF_CURRICULUM[2];

  const handleSwitchUser = (newUserName: string) => {
    const savedName = setActiveUser(newUserName);
    setCurrentUser(savedName);
    const loaded = loadHomileticsRecord(currentLessonId, savedName);
    setRecord(loaded);
    setCompletedLessons(getCompletedLessons(savedName));
  };

  const handleUpdateRecord = (updated: HomileticsRecord) => {
    setRecord(updated);
    saveHomileticsRecord(updated, currentUser);
    setCompletedLessons(getCompletedLessons(currentUser));
  };

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'zh' ? 'en' : 'zh'));
  };

  const handleSelectLesson = (id: string) => {
    setCurrentLessonId(id);
    setCurrentTab('workbench');
  };

  const handleToggleComplete = (lessonId: string) => {
    const rec = loadHomileticsRecord(lessonId, currentUser);
    rec.isCompleted = !rec.isCompleted;
    saveHomileticsRecord(rec, currentUser);
    if (lessonId === currentLessonId) {
      setRecord(rec);
    }
    setCompletedLessons(getCompletedLessons(currentUser));
  };

  const handleOpenExportCurrent = () => {
    setExportLesson(currentLesson);
    setExportRecord(record);
    setIsExportOpen(true);
  };

  const handleOpenExportForLesson = (lesson: Lesson, r: HomileticsRecord) => {
    setExportLesson(lesson);
    setExportRecord(r);
    setIsExportOpen(true);
  };

  // Next / Previous Lesson navigation
  const currentIndex = BSF_CURRICULUM.findIndex((l) => l.id === currentLessonId);
  const handlePrevLesson = () => {
    if (currentIndex > 0) {
      setCurrentLessonId(BSF_CURRICULUM[currentIndex - 1].id);
    }
  };
  const handleNextLesson = () => {
    if (currentIndex < BSF_CURRICULUM.length - 1) {
      setCurrentLessonId(BSF_CURRICULUM[currentIndex + 1].id);
    }
  };

  const isZh = language === 'zh';

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onOpenExportModal={handleOpenExportCurrent}
        completedCount={completedLessons.size}
        totalLessons={30}
        currentUser={currentUser}
        onOpenUserSwitcher={() => setIsUserSwitcherOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-24 md:pb-8 flex flex-col">
        {/* ================= VIEW 1: WORKBENCH ================= */}
        {currentTab === 'workbench' && (
          <div className="flex-1 flex flex-col space-y-4">
            {/* Lesson Selector Bar */}
            <div className="bg-white px-3.5 sm:px-5 py-3 rounded-xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                <button
                  onClick={handlePrevLesson}
                  disabled={currentIndex <= 0}
                  className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none shrink-0"
                  title="上一课"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Dropdown selector */}
                <select
                  value={currentLessonId}
                  onChange={(e) => setCurrentLessonId(e.target.value)}
                  className="bg-stone-50 border border-stone-300 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-500 font-serif flex-1 sm:flex-initial max-w-[220px] xs:max-w-[280px] sm:max-w-md truncate"
                >
                  {BSF_CURRICULUM.map((l) => (
                    <option key={l.id} value={l.id}>
                      第 {l.lessonNum} 课 · {isZh ? l.theme : l.themeEn} ({l.date})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleNextLesson}
                  disabled={currentIndex >= BSF_CURRICULUM.length - 1}
                  className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none shrink-0"
                  title="下一课"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Lesson Metadata Pills + Learner Profile Tag */}
              <div className="flex items-center gap-2 sm:gap-3 text-xs text-stone-500 flex-wrap">
                <button
                  onClick={() => setIsUserSwitcherOpen(true)}
                  title={isZh ? '点击切换研经学员' : 'Click to switch learner'}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200/80 text-stone-800 font-serif font-semibold border border-stone-200 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{isZh ? `学员：${currentUser}` : `Learner: ${currentUser}`}</span>
                </button>
                <span className="font-serif font-medium text-stone-800">
                  {isZh ? currentLesson.scriptureRange : currentLesson.scriptureRangeEn}
                </span>
                <span>·</span>
                <span>{isZh ? `教义：${currentLesson.doctrine}` : `Doctrine: ${currentLesson.doctrineEn}`}</span>
                <span>·</span>
                <span className="font-mono text-stone-400">{currentLesson.date}</span>
                {currentLesson.isHomileticsStar && (
                  <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium border border-amber-200/50">
                    ★ 重点讲道法
                  </span>
                )}
              </div>
            </div>

            {/* 5-Step Process Tabs for Workbench (Touch-friendly & Horizontally Scrollable) */}
            <div className="bg-white p-1.5 rounded-xl border border-stone-200/90 shadow-2xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {[
                { step: 1, title: isZh ? '1. 内容列项' : '1. Content Listing', subtitle: isZh ? '经文浓缩' : 'Full Scripture' },
                { step: 2, title: isZh ? '2. 经文分段' : '2. Divisions', subtitle: isZh ? '大纲分段' : 'Headings' },
                { step: 3, title: isZh ? '3. 主题句' : '3. Subject Sentence', subtitle: isZh ? '核心主旨' : 'Subject' },
                { step: 4, title: isZh ? '4. 主旨' : '4. Aim', subtitle: isZh ? '研经目的' : 'Passage Aim' },
                { step: 5, title: isZh ? '5. 生活应用' : '5. Applications', subtitle: isZh ? '属灵原则' : 'Life Apps' },
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => setCurrentWorkbenchStep(s.step)}
                  className={`flex-1 min-w-[105px] sm:min-w-[130px] px-2.5 sm:px-3.5 py-2 rounded-lg text-left transition-all font-sans shrink-0 sm:shrink ${
                    currentWorkbenchStep === s.step
                      ? 'bg-stone-900 text-white shadow-2xs font-medium'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <div className="text-xs font-semibold truncate">{s.title}</div>
                  <div className={`text-[10px] sm:text-[11px] truncate ${currentWorkbenchStep === s.step ? 'text-stone-300' : 'text-stone-400'}`}>
                    {s.subtitle}
                  </div>
                </button>
              ))}
            </div>

            {/* Step 1: Full-Width Scripture Condensation View (No Right Panel) */}
            {currentWorkbenchStep === 1 && (
              <div className="flex-1">
                <ScriptureCondensationView
                  lesson={currentLesson}
                  record={record}
                  language={language}
                  onUpdateRecord={handleUpdateRecord}
                  onNextStep={() => setCurrentWorkbenchStep(2)}
                />
              </div>
            )}

            {/* Steps 2 - 5: Responsive Workbench (Desktop side-by-side / Mobile segmented toggle) */}
            {currentWorkbenchStep > 1 && (
              <div className="flex-1 flex flex-col space-y-3">
                {/* Mobile View Switcher (Visible only on phone/tablet < lg) */}
                <div className="flex lg:hidden bg-stone-200/70 p-1 rounded-xl items-center gap-1 font-sans">
                  <button
                    onClick={() => setMobileWorkbenchView('coach')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      mobileWorkbenchView === 'coach'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span>✍️</span>
                    <span>{isZh ? '研写工作台' : 'Workbench Form'}</span>
                  </button>
                  <button
                    onClick={() => setMobileWorkbenchView('scripture')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      mobileWorkbenchView === 'scripture'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span>📖</span>
                    <span>{isZh ? '对照经文' : 'Scripture'}</span>
                  </button>
                  <button
                    onClick={() => setMobileWorkbenchView('split')}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                      mobileWorkbenchView === 'split'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title={isZh ? '上下同时展示' : 'Show Both'}
                  >
                    <span>📑</span>
                    <span className="hidden xs:inline">{isZh ? '上下' : 'Both'}</span>
                  </button>
                </div>

                {/* Grid Container: Side-by-side on lg, Controlled visibility on mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[600px]">
                  {/* Left Column: Scripture Reading */}
                  <div
                    className={`lg:col-span-5 h-[580px] lg:h-auto ${
                      mobileWorkbenchView === 'coach' ? 'hidden lg:block' : 'block'
                    }`}
                  >
                    <ScripturePanel
                      lesson={currentLesson}
                      language={language}
                      onToggleLanguage={handleToggleLanguage}
                    />
                  </div>

                  {/* Right Column: BSF Homiletics Coach */}
                  <div
                    className={`lg:col-span-7 min-h-[580px] lg:h-auto ${
                      mobileWorkbenchView === 'scripture' ? 'hidden lg:block' : 'block'
                    }`}
                  >
                    <HomileticsCoach
                      lesson={currentLesson}
                      record={record}
                      language={language}
                      onUpdateRecord={handleUpdateRecord}
                      onOpenExportModal={handleOpenExportCurrent}
                      activeStep={currentWorkbenchStep}
                      onStepChange={setCurrentWorkbenchStep}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 2: CURRICULUM ================= */}
        {currentTab === 'curriculum' && (
          <div className="py-2">
            <CurriculumList
              currentLessonId={currentLessonId}
              onSelectLesson={handleSelectLesson}
              completedLessons={completedLessons}
              onToggleComplete={handleToggleComplete}
              language={language}
              currentUser={currentUser}
            />
          </div>
        )}

        {/* ================= VIEW 3: OUTLINES SUMMARY ================= */}
        {currentTab === 'summary' && (
          <div className="py-2">
            <OutlineSummaryView
              onSelectLesson={handleSelectLesson}
              language={language}
              onOpenExportModalForLesson={handleOpenExportForLesson}
              currentLessonId={currentLessonId}
              currentUser={currentUser}
            />
          </div>
        )}

        {/* ================= VIEW 4: BSF GUIDELINES ================= */}
        {currentTab === 'guide' && (
          <div className="py-2">
            <BsfGuidelinesModal language={language} />
          </div>
        )}
      </main>

      {/* Global Export & Print Modal */}
      <HomileticsExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        lesson={exportLesson}
        record={exportRecord}
        language={language}
        currentUser={currentUser}
      />

      {/* Learner Profile / Switcher Modal */}
      <UserSwitcherModal
        isOpen={isUserSwitcherOpen}
        onClose={() => setIsUserSwitcherOpen(false)}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        language={language}
      />
    </div>
  );
}
