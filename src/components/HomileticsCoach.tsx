import React, { useState } from 'react';
import { Lesson, HomileticsRecord, Division, LanguageMode } from '../types/bsf';
import { WordCountBadge } from './WordCountBadge';
import { getVersesForLesson } from '../data/romansScriptures';
import {
  ListOrdered,
  Layers,
  FileText,
  Target,
  Compass,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Eye,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface HomileticsCoachProps {
  lesson: Lesson;
  record: HomileticsRecord;
  language: LanguageMode;
  onUpdateRecord: (updated: HomileticsRecord) => void;
  onOpenExportModal: () => void;
  activeStep?: number;
  onStepChange?: (step: number) => void;
}

// Helper to parse chapter/verse bounds from Division
function parseDivisionBounds(
  div: Division,
  defaultChapter: number,
  fallbackStartVerse = 1,
  fallbackEndVerse = 5
) {
  if (div.startVerse && div.endVerse) {
    return {
      startChapter: div.startChapter || defaultChapter,
      startVerse: div.startVerse,
      endChapter: div.endChapter || div.startChapter || defaultChapter,
      endVerse: div.endVerse,
    };
  }

  const clean = (div.rangeText || '').replace(/^[^\d]*/, '').trim();

  // e.g. "1:1-1:5" or "9:30-10:13"
  const twoChapMatch = clean.match(/^(\d+):(\d+)\s*[-~至到]\s*(\d+):(\d+)$/);
  if (twoChapMatch) {
    return {
      startChapter: parseInt(twoChapMatch[1], 10),
      startVerse: parseInt(twoChapMatch[2], 10),
      endChapter: parseInt(twoChapMatch[3], 10),
      endVerse: parseInt(twoChapMatch[4], 10),
    };
  }

  // e.g. "1:1-5" or "1:6-15"
  const oneChapMatch = clean.match(/^(\d+):(\d+)\s*[-~至到]\s*(\d+)$/);
  if (oneChapMatch) {
    const ch = parseInt(oneChapMatch[1], 10);
    return {
      startChapter: ch,
      startVerse: parseInt(oneChapMatch[2], 10),
      endChapter: ch,
      endVerse: parseInt(oneChapMatch[3], 10),
    };
  }

  // e.g. "1-5"
  const verseOnlyMatch = clean.match(/^(\d+)\s*[-~至到]\s*(\d+)$/);
  if (verseOnlyMatch) {
    return {
      startChapter: defaultChapter,
      startVerse: parseInt(verseOnlyMatch[1], 10),
      endChapter: defaultChapter,
      endVerse: parseInt(verseOnlyMatch[2], 10),
    };
  }

  // e.g. "1:1"
  const singleMatch = clean.match(/^(\d+):(\d+)$/);
  if (singleMatch) {
    const ch = parseInt(singleMatch[1], 10);
    const v = parseInt(singleMatch[2], 10);
    return {
      startChapter: ch,
      startVerse: v,
      endChapter: ch,
      endVerse: v,
    };
  }

  return {
    startChapter: defaultChapter,
    startVerse: fallbackStartVerse,
    endChapter: defaultChapter,
    endVerse: fallbackEndVerse,
  };
}

// Helper to format concise, standard BSF range strings (e.g. 1:1-5, 1:6-15, 9:30-10:13)
function formatRangeString(
  startChapter: number,
  startVerse: number,
  endChapter: number,
  endVerse: number
): string {
  if (startChapter === endChapter) {
    if (startVerse === endVerse) {
      return `${startChapter}:${startVerse}`;
    }
    return `${startChapter}:${startVerse}-${endVerse}`;
  }
  return `${startChapter}:${startVerse}-${endChapter}:${endVerse}`;
}

export const HomileticsCoach: React.FC<HomileticsCoachProps> = ({
  lesson,
  record,
  language,
  onUpdateRecord,
  onOpenExportModal,
  activeStep = 2,
  onStepChange,
}) => {
  const isZh = language === 'zh';
  const [internalStep, setInternalStep] = useState<number>(activeStep || 2);
  const currentStep = onStepChange ? activeStep : internalStep;
  const setStep = (s: number) => {
    if (onStepChange) onStepChange(s);
    else setInternalStep(s);
  };

  const [saveToast, setSaveToast] = useState(false);
  const [showContentListDrawer, setShowContentListDrawer] = useState(false);

  // Get verses for the current lesson
  const verses = getVersesForLesson(lesson);
  const defaultChapter = lesson.chapter || (verses.length > 0 ? verses[0].chapter : 1);

  // Set of verse numbers that have condensation blocks in Step 1
  const condensedVerseNumbers = new Set<number>(
    (record.contentList || [])
      .map((item) => item.afterVerse)
      .filter((v): v is number => typeof v === 'number')
  );

  // Helper to trigger save notification
  const notifySave = (newRecord: HomileticsRecord) => {
    onUpdateRecord(newRecord);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 1200);
  };

  // ================= STEP 2: Division Management & Auto-recognition =================

  // Add Division with intelligent start recognition
  const handleAddDivision = () => {
    if (record.divisions.length >= 8) return;
    const lessonVerses = verses.length > 0 ? verses : [
      { chapter: defaultChapter, verse: 1, textZh: '', textEn: '' }
    ];

    let startChapter = defaultChapter;
    let startVerse = lessonVerses[0].verse;
    let endChapter = defaultChapter;
    let endVerse = lessonVerses[lessonVerses.length - 1].verse;

    if (record.divisions.length === 0) {
      // Adding division 1: start at beginning of lesson
      startChapter = lessonVerses[0].chapter;
      startVerse = lessonVerses[0].verse;

      // If Step 1 has a condensation block, align end with first condensation point
      const firstCond = record.contentList?.[0];
      if (firstCond?.afterVerse && firstCond.afterVerse >= startVerse) {
        endVerse = firstCond.afterVerse;
        endChapter = startChapter;
      } else {
        const candidateIdx = Math.min(4, lessonVerses.length - 1);
        endChapter = lessonVerses[candidateIdx].chapter;
        endVerse = lessonVerses[candidateIdx].verse;
      }
    } else {
      // Automatic recognition of start segment based on previous division:
      // "比如第一段是1:1-5， 第二段就应该是6开始，以此类推"
      const lastDiv = record.divisions[record.divisions.length - 1];
      const lastBounds = parseDivisionBounds(lastDiv, defaultChapter);

      const lastEndIndex = lessonVerses.findIndex(
        (v) => v.chapter === lastBounds.endChapter && v.verse === lastBounds.endVerse
      );

      if (lastEndIndex >= 0 && lastEndIndex < lessonVerses.length - 1) {
        const nextVerseObj = lessonVerses[lastEndIndex + 1];
        startChapter = nextVerseObj.chapter;
        startVerse = nextVerseObj.verse;

        // Try to find next condensation point
        const nextCond = (record.contentList || []).find(
          (c) => c.afterVerse && c.afterVerse >= startVerse
        );
        if (nextCond?.afterVerse) {
          endChapter = startChapter;
          endVerse = nextCond.afterVerse;
        } else {
          const remainingEnd = lessonVerses[lessonVerses.length - 1];
          endChapter = remainingEnd.chapter;
          endVerse = remainingEnd.verse;
        }
      } else {
        startChapter = lastBounds.endChapter;
        startVerse = lastBounds.endVerse + 1;
        endChapter = startChapter;
        endVerse = startVerse;
      }
    }

    const rangeText = formatRangeString(startChapter, startVerse, endChapter, endVerse);
    const newDiv: Division = {
      id: `div_${Date.now()}`,
      startChapter,
      startVerse,
      endChapter,
      endVerse,
      rangeText,
      titleZh: '',
      titleEn: '',
      principleZh: '',
      principleEn: '',
      app1Zh: '',
      app1En: '',
      app2Zh: '',
      app2En: '',
    };

    notifySave({
      ...record,
      divisions: [...record.divisions, newDiv],
    });
  };

  // User changes Start Verse via dropdown
  const handleSelectStartVerse = (divId: string, verseKey: string) => {
    const [chStr, vStr] = verseKey.split(':');
    const ch = parseInt(chStr, 10);
    const v = parseInt(vStr, 10);

    const divIndex = record.divisions.findIndex((d) => d.id === divId);
    if (divIndex === -1) return;

    const currentDiv = record.divisions[divIndex];
    const bounds = parseDivisionBounds(currentDiv, defaultChapter);

    let endChapter = bounds.endChapter;
    let endVerse = bounds.endVerse;

    // If new start is strictly after end, align end with start
    if (ch > endChapter || (ch === endChapter && v > endVerse)) {
      endChapter = ch;
      endVerse = v;
    }

    const rangeText = formatRangeString(ch, v, endChapter, endVerse);
    const updated = [...record.divisions];
    updated[divIndex] = {
      ...currentDiv,
      startChapter: ch,
      startVerse: v,
      endChapter,
      endVerse,
      rangeText,
    };

    notifySave({ ...record, divisions: updated });
  };

  // User changes End Verse via dropdown (with auto-recognition propagating to next division)
  const handleSelectEndVerse = (divId: string, verseKey: string) => {
    const [chStr, vStr] = verseKey.split(':');
    const newEndChapter = parseInt(chStr, 10);
    const newEndVerse = parseInt(vStr, 10);

    const divIndex = record.divisions.findIndex((d) => d.id === divId);
    if (divIndex === -1) return;

    const currentDiv = record.divisions[divIndex];
    const bounds = parseDivisionBounds(currentDiv, defaultChapter);

    const startChapter = bounds.startChapter;
    const startVerse = bounds.startVerse;
    const rangeText = formatRangeString(startChapter, startVerse, newEndChapter, newEndVerse);

    const updated = [...record.divisions];
    updated[divIndex] = {
      ...currentDiv,
      startChapter,
      startVerse,
      endChapter: newEndChapter,
      endVerse: newEndVerse,
      rangeText,
    };

    // System automatically cascades and updates the start of the next division!
    // "系统能够自动识别起始段，比如第一段是1:1-5， 第二段就应该是6开始，以此类推"
    if (divIndex + 1 < updated.length) {
      const nextDiv = updated[divIndex + 1];
      const endIndex = verses.findIndex(
        (v) => v.chapter === newEndChapter && v.verse === newEndVerse
      );

      if (endIndex >= 0 && endIndex < verses.length - 1) {
        const nextStartObj = verses[endIndex + 1];
        const nextBounds = parseDivisionBounds(nextDiv, defaultChapter);

        let nextEndChapter = nextBounds.endChapter;
        let nextEndVerse = nextBounds.endVerse;

        // If next end was before next start, push end to match or exceed
        if (
          nextEndChapter < nextStartObj.chapter ||
          (nextEndChapter === nextStartObj.chapter && nextEndVerse < nextStartObj.verse)
        ) {
          nextEndChapter = nextStartObj.chapter;
          nextEndVerse = nextStartObj.verse;
        }

        const nextRangeText = formatRangeString(
          nextStartObj.chapter,
          nextStartObj.verse,
          nextEndChapter,
          nextEndVerse
        );

        updated[divIndex + 1] = {
          ...nextDiv,
          startChapter: nextStartObj.chapter,
          startVerse: nextStartObj.verse,
          endChapter: nextEndChapter,
          endVerse: nextEndVerse,
          rangeText: nextRangeText,
        };
      }
    }

    notifySave({ ...record, divisions: updated });
  };

  const handleRemoveDivision = (id: string) => {
    notifySave({
      ...record,
      divisions: record.divisions.filter((d) => d.id !== id),
    });
  };

  const handleClearAllDivisions = () => {
    notifySave({
      ...record,
      divisions: [],
    });
  };

  const handleUpdateDivision = (id: string, updates: Partial<Division>) => {
    notifySave({
      ...record,
      divisions: record.divisions.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    });
  };

  // ================= STEP 3: Subject Sentence =================
  const handleSubjectSentenceChange = (val: string) => {
    if (isZh) {
      notifySave({ ...record, subjectSentenceZh: val });
    } else {
      notifySave({ ...record, subjectSentenceEn: val });
    }
  };

  // ================= STEP 4: Aim =================
  const handleAimChange = (val: string) => {
    if (isZh) {
      notifySave({ ...record, aimZh: val });
    } else {
      notifySave({ ...record, aimEn: val });
    }
  };

  const toggleCompleted = () => {
    notifySave({
      ...record,
      isCompleted: !record.isCompleted,
    });
  };

  const steps = [
    { num: 1, title: isZh ? '内容列项' : 'Content List', icon: ListOrdered },
    { num: 2, title: isZh ? '经文分段' : 'Divisions', icon: Layers },
    { num: 3, title: isZh ? '主题句' : 'Subject', icon: FileText },
    { num: 4, title: isZh ? '主旨' : 'Aim', icon: Target },
    { num: 5, title: isZh ? '生活应用' : 'Applications', icon: Compass },
  ];

  const currentSubjectSentence = isZh ? record.subjectSentenceZh : record.subjectSentenceEn;
  const currentAim = isZh ? record.aimZh : record.aimEn;

  return (
    <div className="bg-white rounded-xl border border-stone-200/90 shadow-2xs flex flex-col h-full overflow-hidden">
      {/* Top Stepper Bar */}
      <div className="px-5 py-3 border-b border-stone-200 bg-stone-50/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-900 text-sm">
              {isZh ? '研经工作台' : 'Workbench'}
            </span>
            <span className="text-xs text-stone-400 font-mono">
              {isZh ? `步骤 ${currentStep} / 5` : `Step ${currentStep} of 5`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {saveToast && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 font-sans animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isZh ? '已保存' : 'Saved'}
              </span>
            )}
            <button
              onClick={toggleCompleted}
              className={`text-xs px-2.5 py-1 rounded-md font-medium border flex items-center gap-1 transition-colors ${
                record.isCompleted
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-stone-600 border-stone-200 hover:text-stone-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{record.isCompleted ? (isZh ? '已完成' : 'Completed') : (isZh ? '标记完成' : 'Mark Complete')}</span>
            </button>
          </div>
        </div>

        {/* 5 Steps Tabs */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {steps.map((st) => {
            const isActive = currentStep === st.num;
            return (
              <button
                key={st.num}
                onClick={() => setStep(st.num)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-stone-100/70 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                    isActive ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {st.num}
                </div>
                <div className="min-w-0 hidden md:block">
                  <div className="text-xs font-medium truncate">{st.title}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Workspace (Steps 2 to 5 - Clean, Quiet, Unhindered) */}
      <div className="p-6 overflow-y-auto flex-1 space-y-6">
        {/* ================= STEP 2: DIVISIONS (经文分段) ================= */}
        {currentStep === 2 && (
          <div className="space-y-5">
            {/* Reference to Step 1 Content List */}
            {(record.contentList || []).length > 0 && (
              <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-stone-700 font-sans">
                    {isZh
                      ? `已浓缩 ${(record.contentList || []).length} 个经文提炼项`
                      : `${(record.contentList || []).length} content items condensed`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowContentListDrawer(!showContentListDrawer)}
                    className="text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showContentListDrawer ? (isZh ? '收起参考' : 'Hide') : (isZh ? '展开经文提炼参考' : 'View Ref')}</span>
                  </button>
                </div>

                {showContentListDrawer && (
                  <div className="space-y-1.5 pt-2 border-t border-stone-200 max-h-48 overflow-y-auto text-xs font-sans text-stone-600">
                    {(record.contentList || []).map((item, i) => (
                      <div key={item.id} className="flex items-start gap-1.5">
                        <span className="font-mono font-bold text-stone-400 shrink-0">{i + 1}.</span>
                        <span className="font-mono text-stone-700 font-semibold shrink-0">({item.verseRef})</span>
                        <span className="text-stone-800">{isZh ? item.summaryZh : item.summaryEn || item.summaryZh}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-stone-900 font-serif">
                    {isZh ? '经文分段' : 'Divisions'}
                  </h4>
                  <p className="text-xs text-stone-400 font-sans mt-0.5">
                    {isZh
                      ? '通过下拉框自主选定起始与结束经节，系统自动衔接下一段起始节'
                      : 'Select start and end verses via dropdowns. The system automatically chains the next start verse.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {record.divisions.length > 0 && (
                    <button
                      onClick={handleClearAllDivisions}
                      className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-red-600 px-2 py-1 rounded transition-colors font-sans"
                      title={isZh ? '清空分段重新划分' : 'Clear all divisions'}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{isZh ? '清空重设' : 'Reset'}</span>
                    </button>
                  )}
                  <button
                    onClick={handleAddDivision}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 px-3 py-1.5 rounded-lg transition-colors font-sans shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isZh ? '添加分段' : 'Add Division'}</span>
                  </button>
                </div>
              </div>

              {/* Empty state when user hasn't added divisions yet */}
              {record.divisions.length === 0 && (
                <div className="py-12 px-6 rounded-xl border border-dashed border-stone-300 text-center bg-stone-50/50 space-y-3">
                  <Layers className="w-8 h-8 text-stone-400 mx-auto" />
                  <div>
                    <h5 className="text-sm font-medium text-stone-800 font-serif">
                      {isZh ? '尚未添加经文分段' : 'No divisions added yet'}
                    </h5>
                    <p className="text-xs text-stone-500 font-sans mt-1">
                      {isZh
                        ? '请点击“添加分段”，通过下拉框选择起始与结束经节，自主完成分段划分。'
                        : 'Click "Add Division" to freely divide the passage using verse dropdowns.'}
                    </p>
                  </div>
                  <button
                    onClick={handleAddDivision}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isZh ? '添加第 1 分段' : 'Add Division 1'}</span>
                  </button>
                </div>
              )}

              {/* Division Cards */}
              {record.divisions.map((div, idx) => {
                const currentTitle = isZh ? div.titleZh : div.titleEn;
                const bounds = parseDivisionBounds(div, defaultChapter);

                // Start key: e.g. "1:1"
                const currentStartKey = `${bounds.startChapter}:${bounds.startVerse}`;
                // End key: e.g. "1:5"
                const currentEndKey = `${bounds.endChapter}:${bounds.endVerse}`;

                // Calculate if this start verse was automatically chained from previous division
                let isAutoChained = false;
                if (idx > 0) {
                  const prevBounds = parseDivisionBounds(record.divisions[idx - 1], defaultChapter);
                  const prevEndIdx = verses.findIndex(
                    (v) => v.chapter === prevBounds.endChapter && v.verse === prevBounds.endVerse
                  );
                  if (prevEndIdx >= 0 && prevEndIdx < verses.length - 1) {
                    const expectedNext = verses[prevEndIdx + 1];
                    if (
                      expectedNext.chapter === bounds.startChapter &&
                      expectedNext.verse === bounds.startVerse
                    ) {
                      isAutoChained = true;
                    }
                  } else if (
                    bounds.startChapter === prevBounds.endChapter &&
                    bounds.startVerse === prevBounds.endVerse + 1
                  ) {
                    isAutoChained = true;
                  }
                }

                // Verses eligible for END selection: all verses from start onwards
                const startIdxInVerses = verses.findIndex(
                  (v) => v.chapter === bounds.startChapter && v.verse === bounds.startVerse
                );
                const eligibleEndVerses = startIdxInVerses >= 0
                  ? verses.slice(startIdxInVerses)
                  : verses;

                return (
                  <div
                    key={div.id}
                    className="p-4 sm:p-5 rounded-xl border border-stone-200 bg-white space-y-3.5 shadow-2xs hover:border-stone-300 transition-colors"
                  >
                    {/* Top Row: Index + Start/End Dropdowns + Delete */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-100">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Division Number */}
                        <span className="w-6 h-6 rounded-md bg-stone-900 text-white text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        {/* Starting Verse Dropdown */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-stone-500 font-sans">
                            {isZh ? '起始：' : 'From:'}
                          </span>
                          <select
                            value={currentStartKey}
                            onChange={(e) => handleSelectStartVerse(div.id, e.target.value)}
                            className="text-xs font-mono font-semibold text-stone-800 bg-stone-50 border border-stone-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-stone-500"
                          >
                            {verses.map((v) => (
                              <option key={`start-${v.chapter}:${v.verse}`} value={`${v.chapter}:${v.verse}`}>
                                {v.chapter}:{v.verse} {condensedVerseNumbers.has(v.verse) ? '★' : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Arrow separator */}
                        <span className="text-stone-400 font-serif text-xs">至</span>

                        {/* Ending Verse Dropdown */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-stone-500 font-sans">
                            {isZh ? '结束：' : 'To:'}
                          </span>
                          <select
                            value={currentEndKey}
                            onChange={(e) => handleSelectEndVerse(div.id, e.target.value)}
                            className="text-xs font-mono font-semibold text-stone-800 bg-stone-50 border border-stone-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-stone-500"
                          >
                            {eligibleEndVerses.map((v) => (
                              <option key={`end-${v.chapter}:${v.verse}`} value={`${v.chapter}:${v.verse}`}>
                                {v.chapter}:{v.verse} {condensedVerseNumbers.has(v.verse) ? (isZh ? '★ (浓缩节)' : '★ (Condensed)') : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Auto-chained indicator */}
                        {isAutoChained && (
                          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                            {isZh ? '自动衔接' : 'Auto-chained'}
                          </span>
                        )}

                        {/* Formatted Range badge */}
                        <span className="text-xs font-mono font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                          {div.rangeText || formatRangeString(bounds.startChapter, bounds.startVerse, bounds.endChapter, bounds.endVerse)}
                        </span>
                      </div>

                      {/* Delete division button */}
                      <button
                        onClick={() => handleRemoveDivision(div.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded transition-colors self-end sm:self-auto"
                        title={isZh ? '删除此分段' : 'Delete division'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Division Title Input */}
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={currentTitle}
                        onChange={(e) =>
                          handleUpdateDivision(
                            div.id,
                            isZh ? { titleZh: e.target.value } : { titleEn: e.target.value }
                          )
                        }
                        placeholder={
                          isZh
                            ? `分段 ${idx + 1} 标题（20字以内，人名地名算1字）...`
                            : `Division ${idx + 1} heading (under 10 words)...`
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-stone-500 font-sans"
                      />
                    </div>

                    {/* Word Count Badge */}
                    <WordCountBadge text={currentTitle} language={language} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 3: SUBJECT SENTENCE (主题句) ================= */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-stone-900 font-serif">
                {isZh ? '主题句 (Subject Sentence)' : 'Subject Sentence'}
              </label>
              <WordCountBadge text={currentSubjectSentence} language={language} />
            </div>

            <textarea
              rows={5}
              value={currentSubjectSentence}
              onChange={(e) => handleSubjectSentenceChange(e.target.value)}
              placeholder={isZh ? '在此输入整篇经文的主题句...' : 'Enter the subject sentence here...'}
              className="w-full p-4 text-base rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-500 font-serif leading-relaxed"
            />
          </div>
        )}

        {/* ================= STEP 4: AIM (主旨) ================= */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-stone-900 font-serif">
                {isZh ? '主旨 / 目的 (Aim)' : 'Aim'}
              </label>
            </div>

            <textarea
              rows={5}
              value={currentAim}
              onChange={(e) => handleAimChange(e.target.value)}
              placeholder={isZh ? '在此输入经文主旨与核心目的...' : 'Enter the aim here...'}
              className="w-full p-4 text-base rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-500 font-serif leading-relaxed"
            />
          </div>
        )}

        {/* ================= STEP 5: APPLICATIONS (生活应用) ================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-stone-900 font-serif">
              {isZh ? '属灵原则与生活应用' : 'Principles & Applications'}
            </h4>

            {record.divisions.length === 0 ? (
              <div className="py-12 text-center text-stone-400 font-sans text-xs">
                {isZh ? '尚无经文分段，请返回第 2 步添加分段。' : 'No divisions yet. Please go back to Step 2.'}
              </div>
            ) : (
              record.divisions.map((div, idx) => {
                const title = isZh ? div.titleZh || `分段 ${idx + 1}` : div.titleEn || `Division ${idx + 1}`;
                const principle = isZh ? div.principleZh : div.principleEn;
                const app1 = isZh ? div.app1Zh : div.app1En;
                const app2 = isZh ? div.app2Zh : div.app2En;

                return (
                  <div
                    key={div.id}
                    className="p-5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-4"
                  >
                    <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                      <span className="w-6 h-6 rounded bg-stone-900 text-white text-xs font-mono font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-semibold text-stone-900 font-serif">
                        {div.rangeText}：{title}
                      </span>
                    </div>

                    {/* Principle */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700 font-sans">
                        {isZh ? `属灵原则 (Principle ${idx + 1})` : `Principle ${idx + 1}`}
                      </label>
                      <input
                        type="text"
                        value={principle}
                        onChange={(e) =>
                          handleUpdateDivision(
                            div.id,
                            isZh ? { principleZh: e.target.value } : { principleEn: e.target.value }
                          )
                        }
                        placeholder={isZh ? '输入属灵原则...' : 'Enter principle...'}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-stone-500 font-serif"
                      />
                    </div>

                    {/* Applications */}
                    <div className="space-y-2 pt-1 font-sans">
                      <label className="text-xs font-semibold text-stone-700">
                        {isZh ? '生活应用问题' : 'Application Questions'}
                      </label>

                      <div className="flex items-start gap-2">
                        <span className="text-xs text-stone-400 font-mono mt-2">1.</span>
                        <input
                          type="text"
                          value={app1}
                          onChange={(e) =>
                            handleUpdateDivision(
                              div.id,
                              isZh ? { app1Zh: e.target.value } : { app1En: e.target.value }
                            )
                          }
                          placeholder={isZh ? '生活应用问题 1...' : 'Application Question 1...'}
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-stone-500"
                        />
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-xs text-stone-400 font-mono mt-2">2.</span>
                        <input
                          type="text"
                          value={app2}
                          onChange={(e) =>
                            handleUpdateDivision(
                              div.id,
                              isZh ? { app2Zh: e.target.value } : { app2En: e.target.value }
                            )
                          }
                          placeholder={isZh ? '生活应用问题 2...' : 'Application Question 2...'}
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-stone-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Navigation Bottom Bar */}
      <div className="px-5 py-3.5 bg-stone-50/90 border-t border-stone-200 flex items-center justify-between font-sans">
        <button
          onClick={() => setStep(currentStep - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>{isZh ? '上一步' : 'Previous'}</span>
        </button>

        <div className="flex items-center gap-2">
          {currentStep < 5 ? (
            <button
              onClick={() => setStep(currentStep + 1)}
              className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors shadow-2xs"
            >
              <span>{isZh ? '下一步' : 'Next Step'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isZh ? '查看大纲并导出' : 'View Outline'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
