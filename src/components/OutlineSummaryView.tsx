import React from 'react';
import { Lesson, LanguageMode, HomileticsRecord } from '../types/bsf';
import { BSF_CURRICULUM } from '../data/curriculum';
import { loadHomileticsRecord } from '../utils/storage';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Edit3,
  Calendar,
  Sparkles,
  ArrowRight,
  PieChart as PieIcon,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

interface OutlineSummaryViewProps {
  onSelectLesson: (lessonId: string) => void;
  language: LanguageMode;
  onOpenExportModalForLesson: (lesson: Lesson, record: HomileticsRecord) => void;
  currentLessonId?: string;
}

export const OutlineSummaryView: React.FC<OutlineSummaryViewProps> = ({
  onSelectLesson,
  language,
  onOpenExportModalForLesson,
  currentLessonId = '1',
}) => {
  const isZh = language === 'zh';

  // Load lessons excluding vacation break weeks
  const lessons = BSF_CURRICULUM.filter((l) => !l.isVacationBreak);
  const totalLessonsCount = lessons.length; // 30 official curriculum lessons

  // Find active lesson
  const currentLesson = lessons.find((l) => l.id === currentLessonId) || lessons[0];
  const currentLessonIndex = lessons.findIndex((l) => l.id === currentLessonId) + 1;

  // Gather completion stats across all lessons
  let completedCount = 0;
  let completedStarHomiletics = 0;
  let totalStarHomiletics = 0;

  lessons.forEach((l) => {
    const rec = loadHomileticsRecord(l.id);
    if (l.isHomileticsStar) totalStarHomiletics++;
    if (rec.isCompleted) {
      completedCount++;
      if (l.isHomileticsStar) completedStarHomiletics++;
    }
  });

  const remainingCount = totalLessonsCount - completedCount;
  const completedPercentage = Math.round((completedCount / totalLessonsCount) * 100);
  const completedRegular = completedCount - completedStarHomiletics;

  // Donut Chart Data
  const donutData = [
    {
      name: isZh ? '已完成重点讲道法 (*)' : 'Completed Focus (*)',
      value: completedStarHomiletics,
      color: '#059669', // Emerald
    },
    {
      name: isZh ? '已完成常规课次' : 'Completed Regular',
      value: completedRegular,
      color: '#2563EB', // Blue
    },
    {
      name: isZh ? '待完成课次' : 'Remaining Lessons',
      value: Math.max(0, remainingCount),
      color: '#E2E8F0', // Slate gray
    },
  ];

  // Define thematic sections of Romans to visualize progress along the letter
  const sectionsDef = [
    { name: isZh ? '罪与审判' : 'Sin & Law', ids: ['w', 'intro', '1', '2', '3', '4'] },
    { name: isZh ? '称义恩典' : 'Justification', ids: ['5', '6', '7', '8', '9'] },
    { name: isZh ? '成圣安稳' : 'Sanctification', ids: ['10', '11', '12', '13', '14', '15'] },
    { name: isZh ? '主权拣选' : 'Sovereignty', ids: ['16', '17', '18', '19', '20'] },
    { name: isZh ? '信徒生活' : 'Living & Unity', ids: ['21', '22', '23', '24', '25', '26', '27', '28'] },
    { name: isZh ? '总结感恩' : 'Summary', ids: ['29', '30'] },
  ];

  const barChartData = sectionsDef.map((sec) => {
    let secTotal = sec.ids.length;
    let secDone = 0;
    sec.ids.forEach((id) => {
      const rec = loadHomileticsRecord(id);
      if (rec.isCompleted) secDone++;
    });
    return {
      section: sec.name,
      completed: secDone,
      total: secTotal,
    };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Title Banner */}
      <div className="bg-white p-6 rounded-xl border border-stone-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif font-bold text-stone-900 text-2xl mb-1">
              {isZh ? '罗马书研经大纲汇总与进度概览' : 'Romans Homiletics Progress & Outlines'}
            </h2>
            <p className="text-xs text-stone-500 font-sans">
              {isZh
                ? '全学年 30 周课程大纲完成度统计、教义板块进度图表与当前学习进度标记。'
                : '30-week curriculum completion metrics, doctrinal module breakdown, and active study tracking.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-medium text-stone-500 bg-stone-100 px-3 py-1.5 rounded-lg font-mono">
              {isZh ? '学年总课次：' : 'Total: '}30 {isZh ? '周' : 'Weeks'}
            </span>
          </div>
        </div>
      </div>

      {/* ================= VISUAL PROGRESS DASHBOARD (RECHARTS) ================= */}
      <div className="space-y-4">
        {/* 1. Active Learning Progress Callout Strip */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-800 text-white rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs tracking-wider uppercase font-semibold text-stone-300">
                {isZh ? '当前学习进度定位' : 'Active Study Progress Marker'}
              </span>
              <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded text-amber-200">
                {isZh ? `第 ${currentLessonIndex} / 30 周` : `Week ${currentLessonIndex} of 30`}
              </span>
            </div>

            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="font-serif font-bold text-xl text-white">
                第 {currentLesson.lessonNum} 课：{isZh ? currentLesson.theme : currentLesson.themeEn}
              </h3>
              <span className="text-xs text-stone-300 font-sans">
                ({isZh ? currentLesson.scriptureRange : currentLesson.scriptureRangeEn})
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-stone-400 font-sans flex-wrap">
              <span>{isZh ? `核心教义：${currentLesson.doctrine}` : `Doctrine: ${currentLesson.doctrineEn}`}</span>
              <span>·</span>
              <span className="font-mono">{currentLesson.date}</span>
              {currentLesson.isHomileticsStar && (
                <span className="text-[11px] text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                  ★ {isZh ? '重点讲道法研经' : 'Homiletics Focus'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectLesson(currentLesson.id)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-900 bg-white hover:bg-stone-100 rounded-lg transition-colors shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isZh ? '继续研写本课大纲' : 'Continue Workbench'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
            </button>
          </div>
        </div>

        {/* 2. Charts Grid (Donut Percentage + Doctrinal Module Bars) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Chart 1: Donut Completion Percentage (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-stone-200/90 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-700" />
                <h4 className="font-serif font-bold text-stone-900 text-sm">
                  {isZh ? '讲道法大纲完成百分比' : 'Homiletics Completion %'}
                </h4>
              </div>
              <span className="text-xs font-mono text-stone-400">
                {completedCount} / {totalLessonsCount}
              </span>
            </div>

            {/* Donut with Center Percentage */}
            <div className="relative h-56 flex items-center justify-center my-1">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={88}
                    paddingAngle={3}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(val: any, name: any) => [`${val} 课`, name]}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Donut Stat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-mono font-bold text-3xl text-stone-900 tabular-nums">
                  {completedPercentage}%
                </span>
                <span className="text-[11px] text-stone-500 font-sans mt-0.5">
                  {isZh ? '全书完成度' : 'Overall Progress'}
                </span>
              </div>
            </div>

            {/* Donut Legend Strip */}
            <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs font-sans">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span>{isZh ? '重点讲道法 (*)' : 'Focus Homiletics'}</span>
                </div>
                <span className="font-mono font-semibold text-stone-800">
                  {completedStarHomiletics} / {totalStarHomiletics} 课
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span>{isZh ? '常规课次大纲' : 'Regular Lessons'}</span>
                </div>
                <span className="font-mono font-semibold text-stone-800">
                  {completedRegular} 课
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
                  <span>{isZh ? '待研读大纲' : 'Remaining'}</span>
                </div>
                <span className="font-mono text-stone-500">
                  {remainingCount} 课
                </span>
              </div>
            </div>
          </div>

          {/* Chart 2: Romans Doctrinal Sections Progress Bar Chart (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-stone-200/90 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-700" />
                <h4 className="font-serif font-bold text-stone-900 text-sm">
                  {isZh ? '罗马书各教义板块研学进度' : 'Progress by Doctrinal Section'}
                </h4>
              </div>
              <span className="text-xs text-stone-400">
                {isZh ? '6 大主题板块' : '6 Modules'}
              </span>
            </div>

            {/* Bar Chart Container */}
            <div className="h-56 mt-2">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={barChartData}
                  margin={{ top: 12, right: 12, left: -16, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="section"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    formatter={(value: any, name: any) => [
                      `${value} 课`,
                      name === 'completed' ? (isZh ? '已完成' : 'Completed') : (isZh ? '总课数' : 'Total'),
                    ]}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="total"
                    name={isZh ? '总课数' : 'Total'}
                    fill="#E2E8F0"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="completed"
                    name={isZh ? '已完成' : 'Completed'}
                    fill="#059669"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Tip */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 font-sans">
              <span>{isZh ? '绿色：已完成大纲 · 浅灰：该板块总课数' : 'Green: completed outlines · Gray: module total'}</span>
              <span>{isZh ? '点击下方卡片可快速编辑' : 'Click below to edit'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= OUTLINES LIST ================= */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-stone-900 text-lg">
            {isZh ? '全书 30 周经文大纲清单' : 'All 30-Week Scripture Outlines'}
          </h3>
          <span className="text-xs text-stone-500 font-mono">
            {completedCount} / {totalLessonsCount} {isZh ? '已完成' : 'completed'}
          </span>
        </div>

        {lessons.map((lesson) => {
          const record = loadHomileticsRecord(lesson.id);
          const subject = isZh ? record.subjectSentenceZh : record.subjectSentenceEn;
          const aim = isZh ? record.aimZh : record.aimEn;
          const hasContent = Boolean(subject || aim || record.divisions.some((d) => d.titleZh || d.titleEn));
          const isActive = lesson.id === currentLessonId;

          return (
            <div
              key={lesson.id}
              className={`p-5 rounded-xl border bg-white transition-all space-y-3 ${
                isActive
                  ? 'border-stone-900 ring-1 ring-stone-900/10 shadow-xs'
                  : record.isCompleted
                  ? 'border-emerald-200/90 shadow-2xs'
                  : 'border-stone-200/90'
              }`}
            >
              <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-stone-900 text-white'
                        : record.isCompleted
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-stone-100 text-stone-800'
                    }`}
                  >
                    {lesson.lessonNum}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-serif font-bold text-stone-900 text-base">
                        {isZh ? lesson.theme : lesson.themeEn}
                      </h4>
                      {lesson.isHomileticsStar && (
                        <span className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-medium">
                          ★ 讲道法
                        </span>
                      )}
                      {record.isCompleted && (
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          已完成
                        </span>
                      )}
                      {isActive && (
                        <span className="text-[11px] text-stone-800 bg-stone-100 px-1.5 py-0.2 rounded font-medium">
                          📍 当前定位
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 font-sans mt-0.5">
                      {isZh ? lesson.scriptureRange : lesson.scriptureRangeEn} · {isZh ? `教义：${lesson.doctrine}` : `Doctrine: ${lesson.doctrineEn}`} · {lesson.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenExportModalForLesson(lesson, record)}
                    className="px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200/80 rounded-md transition-colors"
                  >
                    {isZh ? '导出预览' : 'Preview'}
                  </button>
                  <button
                    onClick={() => onSelectLesson(lesson.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isZh ? '编辑大纲' : 'Edit'}</span>
                  </button>
                </div>
              </div>

              {/* Quick content glance */}
              {hasContent ? (
                <div className="space-y-2 text-xs font-serif pt-1">
                  {subject && (
                    <div className="text-stone-800">
                      <span className="font-sans font-bold text-stone-500 mr-1.5">
                        [命题句]
                      </span>
                      {subject}
                    </div>
                  )}
                  {aim && (
                    <div className="text-stone-700">
                      <span className="font-sans font-bold text-stone-500 mr-1.5">
                        [目的]
                      </span>
                      {aim}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1 font-sans">
                    {record.divisions.map((div, idx) => {
                      const t = isZh ? div.titleZh : div.titleEn;
                      return (
                        <span
                          key={div.id}
                          className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px]"
                        >
                          {idx + 1}. {div.rangeText}: {t || '(未命名)'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic font-serif">
                  {isZh ? '尚未编写大纲内容，点击右侧“编辑大纲”开始。' : 'No outline written yet. Click Edit to start.'}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
