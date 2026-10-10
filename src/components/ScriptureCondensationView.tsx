import React, { useState, useMemo } from 'react';
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
  Sparkles,
  Highlighter,
} from 'lucide-react';

interface ScriptureCondensationViewProps {
  lesson: Lesson;
  record: HomileticsRecord;
  language: LanguageMode;
  onUpdateRecord: (updated: HomileticsRecord) => void;
  onNextStep: () => void;
}

// Common Chinese stop words / auxiliary particles to avoid noise
const CHINESE_STOP_WORDS = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
  '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
  '自己', '这', '那', '与', '及', '以', '其', '于', '为', '而', '则', '之', '所',
  '或', '若', '但', '因', '并', '从', '向', '对', '把', '被', '让', '使', '给',
  '等', '将', '能', '已', '此', '又', '后', '前', '中', '大', '小', '多', '少',
  '他', '她', '它', '他们', '我们', '你们', '这个', '那个', '因为', '所以',
  '虽然', '但是', '如果', '而且', '或者', '不仅', '还有', '以及', '就是', '可以'
]);

// Special single character biblical sacred words
const SACRED_SINGLE_CHARS = new Set(['神', '主']);

// English stop words
const ENGLISH_STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'they', 'them', 'their',
  'have', 'been', 'were', 'will', 'would', 'could', 'should', 'about', 'into',
  'unto', 'also', 'some', 'what', 'which', 'when', 'then', 'there', 'here',
  'your', 'you', 'his', 'her', 'our', 'are', 'was', 'not', 'but', 'all'
]);

/**
 * Extract meaningful keywords/phrases from user summary that appear in scripture text
 */
function extractMatchingKeywords(
  userInput: string,
  versesText: string,
  isZh: boolean
): string[] {
  if (!userInput || !versesText) return [];
  const found = new Set<string>();

  if (isZh) {
    const segments = userInput
      .split(/[\s,，.。!！?？;；:：、\n\r"“”'‘’()（）《》〈〉【】[\]—…\-~/～]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const segment of segments) {
      // Check sacred single characters
      for (const char of segment) {
        if (SACRED_SINGLE_CHARS.has(char) && versesText.includes(char)) {
          found.add(char);
        }
      }

      // Check entire segment if short enough
      if (segment.length >= 2 && segment.length <= 10 && !CHINESE_STOP_WORDS.has(segment)) {
        if (versesText.includes(segment)) {
          found.add(segment);
        }
      }

      // Check n-grams from length 5 down to 2
      const len = segment.length;
      for (let n = Math.min(len, 5); n >= 2; n--) {
        for (let i = 0; i <= len - n; i++) {
          const sub = segment.substring(i, i + n);
          if (!CHINESE_STOP_WORDS.has(sub) && versesText.includes(sub)) {
            found.add(sub);
          }
        }
      }
    }
  } else {
    // English word extraction
    const words = userInput.toLowerCase().split(/[^a-zA-Z0-9']+/).filter(Boolean);
    const lowerVerse = versesText.toLowerCase();

    for (const word of words) {
      if (word.length >= 3 && !ENGLISH_STOP_WORDS.has(word)) {
        if (lowerVerse.includes(word)) {
          found.add(word);
        }
      }
    }
  }

  // Sort by length descending, and limit to top 20
  return Array.from(found)
    .sort((a, b) => b.length - a.length)
    .slice(0, 20);
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
  const [highlightMatches, setHighlightMatches] = useState(true);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
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

  // Concatenate all verses text for matching
  const fullPassageText = useMemo(() => {
    return verses.map((v) => (isZh ? v.textZh : v.textEn)).join(' ');
  }, [verses, isZh]);

  // Extract keywords per block and globally
  const blockKeywordsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    (record.contentList || []).forEach((item) => {
      const text = isZh ? item.summaryZh : item.summaryEn;
      if (text && text.trim().length > 0) {
        const kw = extractMatchingKeywords(text, fullPassageText, isZh);
        map.set(item.id, kw);
      } else {
        map.set(item.id, []);
      }
    });
    return map;
  }, [record.contentList, fullPassageText, isZh]);

  // Compute active keywords: if a specific block is active and has keywords, use its keywords; otherwise combine all
  const activeKeywords = useMemo(() => {
    if (activeBlockId && blockKeywordsMap.has(activeBlockId)) {
      const specific = blockKeywordsMap.get(activeBlockId)!;
      if (specific.length > 0) return specific;
    }

    // Combine all
    const all = new Set<string>();
    blockKeywordsMap.forEach((kws) => {
      kws.forEach((k) => all.add(k));
    });
    return Array.from(all).sort((a, b) => b.length - a.length);
  }, [activeBlockId, blockKeywordsMap]);

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
    const newId = `item_${Date.now()}_${verseNum}`;
    const newItem: ContentListItem = {
      id: newId,
      afterVerse: verseNum,
      verseRef: autoRange,
      summaryZh: '',
      summaryEn: '',
    };

    const updatedList = [...(record.contentList || []), newItem].sort(
      (a, b) => (a.afterVerse || 0) - (b.afterVerse || 0)
    );

    setActiveBlockId(newId);
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
    if (activeBlockId === id) {
      setActiveBlockId(null);
    }
    notifySave({
      ...record,
      contentList: (record.contentList || []).filter((item) => item.id !== id),
    });
  };

  /**
   * Render scripture text with matching keywords highlighted
   */
  const renderHighlightedVerse = (text: string) => {
    if (!highlightMatches || activeKeywords.length === 0) {
      return text;
    }

    const pattern = activeKeywords
      .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');

    if (!pattern) return text;

    const regex = new RegExp(`(${pattern})`, isZh ? 'g' : 'gi');
    const parts = text.split(regex);

    if (parts.length <= 1) return text;

    return (
      <>
        {parts.map((part, idx) => {
          const isMatch = isZh
            ? activeKeywords.includes(part)
            : activeKeywords.some((k) => k.toLowerCase() === part.toLowerCase());

          if (isMatch) {
            return (
              <mark
                key={idx}
                className="bg-amber-100 text-amber-950 font-medium px-1 py-0.5 rounded border-b border-amber-400/80 shadow-2xs transition-colors duration-150 inline"
                title={isZh ? `提炼文本框匹配字词：“${part}”` : `Matched condensation term: "${part}"`}
              >
                {part}
              </mark>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </>
    );
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
              ? '通读整段经文并在节后点击“+ 提炼”插入文本框；输入字词将自动与经文联动高亮'
              : 'Read full passage, click "+" to add condensation boxes. Typed words highlight in scripture.'}
          </p>
        </div>

        {/* Font size, Bilingual & Keyword Highlight Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {saveToast && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 font-sans mr-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isZh ? '已自动暂存' : 'Saved'}
            </span>
          )}

          {/* Keyword Match Toggle */}
          <button
            onClick={() => setHighlightMatches(!highlightMatches)}
            className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-all flex items-center gap-1.5 shadow-2xs ${
              highlightMatches
                ? 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-300/50'
                : 'bg-white text-stone-600 border-stone-200 hover:text-stone-900'
            }`}
            title={isZh ? '开启/关闭输入字词与经文的联动高亮' : 'Toggle keyword highlight matching'}
          >
            <Highlighter className={`w-3.5 h-3.5 ${highlightMatches ? 'text-amber-600' : 'text-stone-400'}`} />
            <span>
              {isZh
                ? highlightMatches
                  ? `经文高亮 (${activeKeywords.length})`
                  : '经文高亮: 关'
                : highlightMatches
                  ? `Highlights (${activeKeywords.length})`
                  : 'Highlights: Off'}
            </span>
          </button>

          {/* Bilingual Toggle */}
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

          {/* Font Size Selector */}
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
                <div className="group flex items-start gap-3 py-1.5 px-2 -mx-2 rounded-lg hover:bg-stone-50/80 transition-colors">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-stone-100 text-stone-700 text-xs font-mono font-bold shrink-0 mt-0.5 select-none">
                    {verse.verse}
                  </span>

                  <div className="flex-1 space-y-1">
                    <p className={`${fontSizeClass} font-serif text-stone-900 tracking-wide`}>
                      {renderHighlightedVerse(isZh ? verse.textZh : verse.textEn)}
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
                      className="p-1 px-2.5 rounded-md hover:bg-amber-600 hover:text-white text-stone-700 bg-stone-100 hover:border-amber-600 border border-stone-200 flex items-center gap-1 text-xs shrink-0 transition-all shadow-2xs font-sans group-hover:bg-amber-50 group-hover:border-amber-300 group-hover:text-amber-900"
                      title={isZh ? `提炼浓缩至第 ${verse.verse} 节` : `Condense up to verse ${verse.verse}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium font-sans">
                        {isZh ? '提炼' : 'Condense'}
                      </span>
                    </button>
                  )}
                </div>

                {/* In-line Condensation Card with elevated hover, shadow and glow */}
                {block && (() => {
                  const isActive = activeBlockId === block.id;
                  const blockKeywords = blockKeywordsMap.get(block.id) || [];
                  const summaryText = isZh ? block.summaryZh : block.summaryEn;
                  const hasContent = (summaryText || '').trim().length > 0;

                  return (
                    <div
                      className={`my-4 p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
                        isActive
                          ? 'border-amber-400 bg-white ring-2 ring-amber-400/30 shadow-lg -translate-y-0.5'
                          : 'border-stone-200/90 bg-stone-50/90 hover:border-amber-300 hover:shadow-md hover:bg-white hover:-translate-y-0.5'
                      }`}
                      onClick={() => setActiveBlockId(block.id)}
                    >
                      {/* Card Header Bar */}
                      <div className="flex items-center justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-mono font-bold px-2.5 py-1 rounded shadow-2xs transition-colors ${
                              isActive
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-white text-stone-900 border border-stone-300'
                            }`}
                          >
                            经文：{block.verseRef || computeRangeForVerse(verse.verse)}
                          </span>

                          <input
                            type="text"
                            value={block.verseRef}
                            onChange={(e) =>
                              handleUpdateBlock(block.id, { verseRef: e.target.value })
                            }
                            placeholder="经节范围 (如 1:1-1:5)"
                            className="text-xs font-mono font-medium text-stone-700 bg-white border border-stone-300 rounded px-2.5 py-1 w-32 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                          />

                          {/* Matched keywords preview badge */}
                          {highlightMatches && blockKeywords.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              <span>{isZh ? `已匹配 ${blockKeywords.length} 处经文` : `${blockKeywords.length} terms matched`}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {hasContent && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded font-mono font-medium">
                              {summaryText.length} {isZh ? '字' : 'chars'}
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveBlock(block.id);
                            }}
                            className="text-stone-400 hover:text-red-600 p-1.5 rounded transition-colors"
                            title="删除此提炼块"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Elevated Textarea with rich glow and hover shadow */}
                      <div className="relative">
                        <textarea
                          rows={4}
                          value={summaryText}
                          onFocus={() => setActiveBlockId(block.id)}
                          onChange={(e) =>
                            handleUpdateBlock(
                              block.id,
                              isZh ? { summaryZh: e.target.value } : { summaryEn: e.target.value }
                            )
                          }
                          placeholder={
                            isZh
                              ? '在此输入该段经文的提炼词与总结（如：保罗奉召为使徒，特派传神的福音...）。匹配经文字词将实时在上方高亮呈现！'
                              : 'Type your condensation and summary here (e.g. Paul called as an apostle, set apart for the gospel of God). Matched words will highlight in the text above!'
                          }
                          className={`w-full p-4 text-sm sm:text-base rounded-lg border font-sans leading-relaxed min-h-[120px] transition-all duration-200 outline-none ${
                            isActive
                              ? 'border-amber-500 bg-white ring-4 ring-amber-500/15 shadow-[0_4px_24px_rgba(245,158,11,0.12)]'
                              : 'border-stone-300 bg-white hover:border-amber-300 hover:shadow-xs focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 focus:shadow-[0_4px_24px_rgba(245,158,11,0.12)]'
                          }`}
                        />
                      </div>

                      {/* Display matched word chips if available */}
                      {highlightMatches && blockKeywords.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-stone-200/70 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] text-stone-500 font-sans">
                            {isZh ? '经文匹配词：' : 'Matched Terms:'}
                          </span>
                          {blockKeywords.map((kw, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-medium bg-amber-100/80 text-amber-950 border border-amber-300 px-2 py-0.5 rounded-md shadow-2xs font-sans inline-flex items-center gap-0.5"
                            >
                              <span>{kw}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
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
