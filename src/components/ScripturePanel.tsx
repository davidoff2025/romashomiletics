import React, { useState } from 'react';
import { Lesson, ScriptureVerse, LanguageMode } from '../types/bsf';
import { getVersesForLesson } from '../data/romansScriptures';
import { BookOpen, Copy, Check, ZoomIn, ZoomOut, Eye, ArrowRightLeft, Plus } from 'lucide-react';

interface ScripturePanelProps {
  lesson: Lesson;
  language: LanguageMode;
  onToggleLanguage: () => void;
  onSelectVerseAsDivision?: (rangeStr: string) => void;
  onAddContentItemFromVerse?: (verse: ScriptureVerse) => void;
}

export const ScripturePanel: React.FC<ScripturePanelProps> = ({
  lesson,
  language,
  onToggleLanguage,
  onSelectVerseAsDivision,
  onAddContentItemFromVerse,
}) => {
  const isZh = language === 'zh';
  const verses = getVersesForLesson(lesson);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);
  const [addedVerse, setAddedVerse] = useState<number | null>(null);
  const [showBilingualCompare, setShowBilingualCompare] = useState(false);

  const handleCopyVerse = (verse: ScriptureVerse) => {
    const textToCopy = `罗马书 ${verse.chapter}:${verse.verse} ${isZh ? verse.textZh : verse.textEn}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedVerse(verse.verse);
    setTimeout(() => setCopiedVerse(null), 1800);
  };

  const handleAddVerse = (verse: ScriptureVerse) => {
    if (onAddContentItemFromVerse) {
      onAddContentItemFromVerse(verse);
      setAddedVerse(verse.verse);
      setTimeout(() => setAddedVerse(null), 1800);
    }
  };

  const fontSizeClass = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
  }[fontSize];

  return (
    <div className="bg-white rounded-xl border border-stone-200/90 shadow-2xs flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-stone-900 text-base">
              {isZh ? lesson.scriptureRange : lesson.scriptureRangeEn}
            </span>
            {lesson.isHomileticsStar && (
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded font-medium">
                ★ {isZh ? '重点讲道法经文' : 'Homiletics Focus'}
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {isZh ? `本周教义：${lesson.doctrine}` : `Doctrine: ${lesson.doctrineEn}`} · {lesson.date}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Compare Drawer Toggle */}
          <button
            onClick={() => setShowBilingualCompare(!showBilingualCompare)}
            className={`p-1.5 rounded-md border text-xs font-medium transition-colors flex items-center gap-1 ${
              showBilingualCompare
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-600 border-stone-200 hover:text-stone-900'
            }`}
            title={isZh ? '开启/关闭双语对照' : 'Toggle Bilingual Compare'}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isZh ? '双语对照' : 'Compare'}</span>
          </button>

          {/* Font Controls */}
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

      {/* Scripture Body */}
      <div className="p-6 overflow-y-auto flex-1 font-serif">
        {lesson.isVacationBreak ? (
          <div className="py-16 text-center text-stone-500 font-sans">
            <BookOpen className="w-10 h-10 mx-auto text-stone-300 mb-3" />
            <h4 className="font-serif font-medium text-stone-800 text-lg mb-1">
              {isZh ? lesson.theme : lesson.themeEn}
            </h4>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              {lesson.specialNote || (isZh ? '本周为休假复习周，请默想已学过的罗马书真理与原则。' : 'Vacation break. Meditate on the truths of Romans.')}
            </p>
          </div>
        ) : verses.length === 0 ? (
          <div className="py-16 text-center text-stone-500 font-sans">
            <p className="text-sm">
              {isZh ? '暂无直接对应的特定章节经文，请翻开圣经研读。' : 'No specific text loaded. Please refer to your Bible.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {verses.map((verse) => (
              <div
                key={`${verse.chapter}-${verse.verse}`}
                className="group relative rounded-lg p-2.5 -mx-2.5 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-stone-100 text-stone-700 text-xs font-mono font-bold shrink-0 mt-0.5 select-none">
                    {verse.verse}
                  </span>

                  <div className="flex-1 space-y-1.5">
                    {/* Primary Mode Text */}
                    <p className={`${fontSizeClass} text-stone-900 tracking-wide font-normal`}>
                      {isZh ? verse.textZh : verse.textEn}
                    </p>

                    {/* Bilingual Comparison Text (Shown when toggle is ON) */}
                    {showBilingualCompare && (
                      <p className="text-xs text-stone-500 font-sans leading-relaxed border-t border-stone-100 pt-1">
                        <span className="font-medium text-stone-400 mr-1.5">
                          {isZh ? '[ESV]' : '[和合本]'}
                        </span>
                        {isZh ? verse.textEn : verse.textZh}
                      </p>
                    )}
                  </div>

                  {/* Actions - Plus Condense button & Copy */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    <button
                      onClick={() => handleAddVerse(verse)}
                      className={`px-1.5 py-0.5 rounded-md border text-xs flex items-center gap-1 transition-all shadow-2xs font-sans ${
                        addedVerse === verse.verse
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-900 hover:text-white hover:border-stone-900'
                      }`}
                      title={isZh ? '加入第一步：内容列项与经文浓缩' : 'Add to Step 1: Content Listing'}
                    >
                      {addedVerse === verse.verse ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : (
                        <Plus className="w-3 h-3 text-stone-600 group-hover:text-stone-900" />
                      )}
                      <span className="text-[11px] font-medium">
                        {addedVerse === verse.verse ? (isZh ? '已加入' : 'Added') : (isZh ? '提炼' : 'Condense')}
                      </span>
                    </button>

                    <button
                      onClick={() => handleCopyVerse(verse)}
                      className="p-1 rounded hover:bg-stone-200/70 text-stone-400 hover:text-stone-800 opacity-0 group-hover:opacity-100 transition-opacity"
                      title={isZh ? '复制此节经文' : 'Copy verse'}
                    >
                      {copiedVerse === verse.verse ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="px-5 py-2.5 bg-stone-50/90 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between font-sans">
        <span>
          {isZh ? '译本：和合本 (CUV)' : 'Translation: English Standard Version (ESV)'}
        </span>
        <button
          onClick={onToggleLanguage}
          className="text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1"
        >
          <ArrowRightLeft className="w-3 h-3" />
          <span>{isZh ? '切为英文经文' : 'Switch to Chinese'}</span>
        </button>
      </div>
    </div>
  );
};
