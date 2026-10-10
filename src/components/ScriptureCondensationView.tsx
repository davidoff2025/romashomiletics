import React, { useState } from 'react';
import { Lesson, ScriptureVerse, HomileticsRecord, ContentListItem, LanguageMode } from '../types/bsf';
import { getVersesForLesson } from '../data/romansScriptures';
import {
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Eye,
  CheckCircle2,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface ScriptureCondensationViewProps {
  lesson: Lesson;
  record: HomileticsRecord;
  language: LanguageMode;
  onUpdateRecord: (updated: HomileticsRecord) => void;
  onNextStep: () => void;
}

export const ScriptureCondensationView: React.FC<ScriptureCondensationViewProps> = ({
  lesson,
  record,
  language,
  onUpdateRecord,
  onNextStep,
}) => {
  const isZh = language === 'zh';
  const verses = getVersesForLesson(lesson);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [showBilingual, setShowBilingual] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Trigger auto-save
  const notifySave = (newRecord: HomileticsRecord) => {
    onUpdateRecord(newRecord);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 1200);
  };

  const fontSizeClass = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
  }[fontSize];

  // Helper: Find item by afterVerse
  const getItemAfterVerse = (verseNum: number): ContentListItem | undefined => {
    return (record.contentList || []).find((item) => item.afterVerse === verseNum);
  };

  // Helper: Compute verse range automatically from previous item's afterVerse to current verse
  const computeRangeForVerse = (currentVerseNum: number): string => {
    if (verses.length === 0) return '';
    const chapter = verses[0].chapter;

    // Find all existing items that appear BEFORE currentVerseNum
    const prevItems = (record.contentList || [])
      .filter((item) => item.afterVerse !== undefined && item.afterVerse < currentVerseNum)
      .sort((a, b) => (a.afterVerse || 0) - (b.afterVerse || 0));

    const firstVerseNum = verses[0].verse;
    const startVerseNum = prevItems.length > 0
      ? (prevItems[prevItems.length - 1].afterVerse || 0) + 1
      : firstVerseNum;

    if (startVerseNum === currentVerseNum) {
      return `${chapter}:${startVerseNum}`;
    }
    return `${chapter}:${startVerseNum}-${chapter}:${currentVerseNum}`;
  };

  // Insert or toggle a condensation block after verse
  const handleAddBlockAfterVerse = (verseNum: number) => {
    const existing = getItemAfterVerse(verseNum);
    if (existing) return;

    const autoRange = computeRangeForVerse(verseNum);
    const newItem: ContentListItem = {
      id: `item_${Date.now()}_${verseNum}`,
      afterVerse: verseNum,
      verseRef: autoRange,
      summaryZh: '',
      summaryEn: '',
    };

    const updatedList = [...(record.contentList || []), newItem].sort(
      (a, b) => (a.afterVerse || 0) - (b.afterVerse || 0)
    );

    notifySave({
      ...record,
      contentList: updatedList,
    });
  };

  // Update text of a block
  const handleUpdateBlock = (id: string, updates: Partial<ContentListItem>) => {
    notifySave({
      ...record,
      contentList: (record.contentList || []).map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  // Remove a block
  const handleRemoveBlock = (id: string) => {
    notifySave({
      ...record,
      contentList: (record.contentList || []).filter((item) => item.id !== id),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Utility Bar */}
      <div className="bg-white px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-900 text-base sm:text-lg">
              {isZh ? lesson.scriptureRange : lesson.scriptureRangeEn}
            </span>
            <span className="text-xs text-stone-500 font-sans">
              · {isZh ? lesson.theme : lesson.themeEn}
            </span>
          </div>
          <p className="text-xs text-stone-400 font-sans mt-0.5">
            {isZh
              ? '通读整段经文并在所需节次后点击“+”插入浓缩文本框，记录经文提炼'
              : 'Read the full passage and click "+" after any verse to insert a condensation box.'}
          </p>
        </div>

        {/* Font size & bilingual controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {saveToast && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 font-sans mr-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isZh ? '已自动暂存' : 'Saved'}
            </span>
          )}

          <button
            onClick={() => setShowBilingual(!showBilingual)}
            className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors flex items-center gap-1 ${
              showBilingual
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-600 border-stone-200 hover:text-stone-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isZh ? '双语对照' : 'Bilingual'}</span>
          </button>

          <div className="flex items-center border border-stone-200 rounded-md bg-white p-0.5">
            <button
              onClick={() => setFontSize(fontSize === 'lg' ? 'base' : 'sm')}
              className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-800"
              title="缩小字体"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-stone-400">
              {fontSize === 'sm' ? '小' : fontSize === 'base' ? '中' : '大'}
            </span>
            <button
              onClick={() => setFontSize(fontSize === 'sm' ? 'base' : 'lg')}
              className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-800"
              title="放大字体"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Full Scripture Reading Flow with In-line Condensation Boxes */}
      <div className="bg-white rounded-xl border border-stone-200/90 shadow-2xs p-4 sm:p-8 space-y-4">
        {verses.length === 0 ? (
          <div className="py-16 text-center text-stone-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-stone-300" />
            <p className="text-sm">
              {isZh ? '本周为休假或导论，请翻阅圣经研读。' : 'No passage loaded.'}
            </p>
          </div>
        ) : (
          verses.map((verse) => {
            const block = getItemAfterVerse(verse.verse);

            return (
              <div key={`${verse.chapter}-${verse.verse}`} className="space-y-3">
                {/* Verse Row */}
                <div className="group flex items-start gap-3 py-1.5 px-2 -mx-2 rounded-lg hover:bg-stone-50 transition-colors">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-stone-100 text-stone-700 text-xs font-mono font-bold shrink-0 mt-0.5 select-none">
                    {verse.verse}
                  </span>

                  <div className="flex-1 space-y-1">
                    <p className={`${fontSizeClass} font-serif text-stone-900 tracking-wide`}>
                      {isZh ? verse.textZh : verse.textEn}
                    </p>

                    {showBilingual && (
                      <p className="text-xs text-stone-500 font-sans leading-relaxed border-t border-stone-100 pt-1">
                        <span className="font-medium text-stone-400 mr-1.5">
                          {isZh ? '[ESV]' : '[和合本]'}
                        </span>
                        {isZh ? verse.textEn : verse.textZh}
                      </p>
                    )}
                  </div>

                  {/* Plus Action Button next to verse */}
                  {!block && (
                    <button
                      onClick={() => handleAddBlockAfterVerse(verse.verse)}
                      className="p-1 px-2 rounded-md hover:bg-stone-900 hover:text-white text-stone-600 bg-stone-100 border border-stone-200 flex items-center gap-1 text-xs shrink-0 transition-colors shadow-2xs font-sans"
                      title={isZh ? `提炼浓缩至第 ${verse.verse} 节` : `Condense up to verse ${verse.verse}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium font-sans">
                        {isZh ? '提炼' : 'Condense'}
                      </span>
                    </button>
                  )}
                </div>

                {/* In-line Condensation Card (when inserted after this verse) */}
                {block && (
                  <div className="my-3.5 p-4 sm:p-5 rounded-xl border border-stone-300 bg-stone-50/90 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-stone-900 bg-white border border-stone-300 px-2.5 py-1 rounded shadow-2xs">
                          经文：{block.verseRef || computeRangeForVerse(verse.verse)}
                        </span>
                        <input
                          type="text"
                          value={block.verseRef}
                          onChange={(e) => handleUpdateBlock(block.id, { verseRef: e.target.value })}
                          placeholder="经节范围 (如 1:1-1:5)"
                          className="text-xs font-mono font-medium text-stone-700 bg-white border border-stone-300 rounded px-2.5 py-1 w-32 focus:outline-none focus:ring-1 focus:ring-stone-400"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveBlock(block.id)}
                        className="text-stone-400 hover:text-red-600 p-1.5 rounded transition-colors"
                        title="删除此提炼块"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* LARGE TEXTAREA for user's condensation */}
                    <textarea
                      rows={4}
                      value={isZh ? block.summaryZh : block.summaryEn}
                      onChange={(e) =>
                        handleUpdateBlock(
                          block.id,
                          isZh ? { summaryZh: e.target.value } : { summaryEn: e.target.value }
                        )
                      }
                      placeholder={
                        isZh
                          ? '在此输入该段经文的提炼词与总结（例如：保罗阐明使徒身份，特派传扬论及耶稣基督的福音）...'
                          : 'Type your condensation and summary of this passage here...'
                      }
                      className="w-full p-4 text-sm sm:text-base rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-500 font-sans leading-relaxed min-h-[120px]"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Bottom Finish Action */}
        <div className="pt-6 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500 font-sans">
            {isZh
              ? `已记录 ${(record.contentList || []).length} 个经文浓缩段落`
              : `${(record.contentList || []).length} condensation blocks created`}
          </span>

          <button
            onClick={onNextStep}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors shadow-2xs font-sans"
          >
            <span>{isZh ? '完成内容列项，进入经文分段' : 'Continue to Divisions'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
