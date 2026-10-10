import React from 'react';
import { calculateBsfWordCount } from '../utils/wordCounter';
import { LanguageMode } from '../types/bsf';

interface WordCountBadgeProps {
  text: string;
  language: LanguageMode;
  label?: string;
  showExplanation?: boolean;
}

export const WordCountBadge: React.FC<WordCountBadgeProps> = ({
  text,
  language,
  label,
  showExplanation = false,
}) => {
  const result = calculateBsfWordCount(text, language);
  const isZh = language === 'zh';
  const unit = isZh ? '字' : 'words';

  if (!text || text.trim() === '') {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-xs text-stone-500 font-sans">
      {label && <span className="font-medium text-stone-400">{label}</span>}
      <span className="font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
        {result.bsfCount} {unit}
      </span>

      {result.recognizedNamesAndPlaces.length > 0 && (
        <span className="text-stone-400 text-[11px]">
          ({[...new Set(result.recognizedNamesAndPlaces)].join('、')} 算1{unit})
        </span>
      )}
    </div>
  );
};
