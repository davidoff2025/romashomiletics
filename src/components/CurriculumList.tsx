import React, { useState } from 'react';
import { Lesson, LanguageMode } from '../types/bsf';
import { BSF_CURRICULUM, BSF_CONTACTS } from '../data/curriculum';
import {
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  Bookmark,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface CurriculumListProps {
  currentLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  completedLessons: Set<string>;
  onToggleComplete: (lessonId: string) => void;
  language: LanguageMode;
  currentUser?: string;
}

export const CurriculumList: React.FC<CurriculumListProps> = ({
  currentLessonId,
  onSelectLesson,
  completedLessons,
  onToggleComplete,
  language,
  currentUser,
}) => {
  const isZh = language === 'zh';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'homiletics' | 'completed'>('all');

  const filtered = BSF_CURRICULUM.filter((item) => {
    // Search match
    const q = searchTerm.toLowerCase();
    const matchSearch =
      item.theme.toLowerCase().includes(q) ||
      item.themeEn.toLowerCase().includes(q) ||
      item.doctrine.toLowerCase().includes(q) ||
      item.scriptureRange.toLowerCase().includes(q) ||
      item.lessonNum.toLowerCase().includes(q);

    if (!matchSearch) return false;

    if (filterType === 'homiletics') return item.isHomileticsStar;
    if (filterType === 'completed') return completedLessons.has(item.id);
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header bar with filters */}
      <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-stone-900 text-xl">
              {isZh ? '2026-2027 中文BSF 罗马书教学历 (DOLM #7461)' : '2026-2027 BSF Romans Curriculum'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {isZh ? '主题：从罪孽到恩典 · 涵盖 30 周进度与同工分享日' : 'Theme: From Sin to Grace · 30 Weeks Schedule'}
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-2.5 text-xs font-sans flex-wrap">
            {currentUser && (
              <div className="px-3 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-stone-800 font-serif font-semibold">
                {isZh ? `研经学员：${currentUser}` : `Learner: ${currentUser}`}
              </div>
            )}
            <div className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 font-medium">
              {isZh ? '完成进度：' : 'Progress: '}
              <span className="font-bold font-mono text-stone-900">
                {completedLessons.size} / 30
              </span>
            </div>
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isZh ? '搜索课次、主题、教义或经文...' : 'Search lessons, doctrines, verses...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterType === 'all'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {isZh ? '全部周次 (30)' : 'All (30)'}
            </button>
            <button
              onClick={() => setFilterType('homiletics')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                filterType === 'homiletics'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>{isZh ? '重点讲道法 (*)' : 'Homiletics Focus (*)'}</span>
            </button>
            <button
              onClick={() => setFilterType('completed')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterType === 'completed'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {isZh ? '已完成' : 'Completed'}
            </button>
          </div>
        </div>
      </div>

      {/* Curriculum Items List */}
      <div className="space-y-2.5">
        {filtered.map((item) => {
          const isSelected = item.id === currentLessonId;
          const isDone = completedLessons.has(item.id);

          if (item.isVacationBreak) {
            return (
              <div
                key={item.id}
                className="py-3 px-5 rounded-xl border border-stone-200/60 bg-stone-100/70 text-stone-500 flex items-center justify-between text-xs font-sans"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-700 font-mono font-semibold text-[11px]">
                    休假
                  </span>
                  <span className="font-medium text-stone-700">{item.theme}</span>
                  <span>·</span>
                  <span>{item.date}</span>
                </div>
                <span className="text-[11px] text-stone-400">{item.specialNote}</span>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 group ${
                isSelected
                  ? 'border-stone-900 bg-white ring-1 ring-stone-900/10 shadow-xs'
                  : 'border-stone-200/90 bg-white hover:border-stone-300'
              }`}
            >
              {/* Left Column: Number & Dates */}
              <div
                onClick={() => onSelectLesson(item.id)}
                className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-mono font-bold shrink-0 text-sm ${
                    isSelected
                      ? 'bg-stone-900 text-white'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-stone-100 text-stone-800'
                  }`}
                >
                  <span className="text-xs leading-none">{item.lessonNum}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif font-semibold text-stone-900 text-base truncate">
                      {isZh ? item.theme : item.themeEn}
                    </h3>
                    {item.isHomileticsStar && (
                      <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded font-medium">
                        ★ 讲道法
                      </span>
                    )}
                    {item.fellowship && (
                      <span className="text-[11px] text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded">
                        {item.fellowship}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-1 flex-wrap">
                    <span className="font-medium text-stone-700">
                      {isZh ? item.scriptureRange : item.scriptureRangeEn}
                    </span>
                    <span>·</span>
                    <span>
                      {isZh ? `教义：${item.doctrine}` : `Doctrine: ${item.doctrineEn}`}
                    </span>
                    <span>·</span>
                    <span className="font-mono text-stone-400">{item.date}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Complete Checkbox & Navigate */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleComplete(item.id)}
                  title={isDone ? '取消标记' : '标记为已完成'}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isDone
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'border-stone-200 text-stone-300 hover:text-stone-500 hover:border-stone-300'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onSelectLesson(item.id)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                  title="进入本课研经"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leadership Contacts Footer Strip */}
      <div className="bg-stone-50 p-5 rounded-xl border border-stone-200/80 text-xs text-stone-600 space-y-2">
        <div className="font-semibold text-stone-800 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-stone-500" />
          <span>{isZh ? '同工团队联系方式（2026-2027 中文BSF DOLM #7461）：' : 'BSF Leadership Team Contacts:'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-mono">
          {BSF_CONTACTS.map((c) => (
            <div key={c.name} className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-stone-200/60">
              <span className="font-semibold text-stone-800">{c.role}</span>
              <span className="text-stone-700">{c.name}</span>
              <span className="text-stone-500 text-[11px]">{c.phone}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
