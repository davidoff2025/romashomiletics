export type LanguageMode = 'zh' | 'en';

export interface Lesson {
  id: string;
  lessonNum: string;
  date: string;
  theme: string;
  themeEn: string;
  doctrine: string;
  doctrineEn: string;
  scriptureRange: string;
  scriptureRangeEn: string;
  isHomileticsStar: boolean;
  fellowship?: string;
  specialNote?: string;
  chapter?: number;
  startVerse?: number;
  endVerse?: number;
  isVacationBreak?: boolean;
}

export interface ScriptureVerse {
  chapter: number;
  verse: number;
  textZh: string;
  textEn: string;
}

export interface ContentListItem {
  id: string;
  afterVerse?: number; // 经文浓缩块插入在哪一节之后（如 5 表示在 1:5 之后）
  verseRef: string;    // 经节范围，如 "1:1-1:5"
  summaryZh: string;
  summaryEn: string;
}

export interface Division {
  id: string;
  startVerse?: number;
  endVerse?: number;
  startChapter?: number;
  endChapter?: number;
  rangeText: string;
  titleZh: string;
  titleEn: string;
  principleZh: string;
  principleEn: string;
  app1Zh: string;
  app1En: string;
  app2Zh: string;
  app2En: string;
}

export interface HomileticsRecord {
  lessonId: string;
  contentList: ContentListItem[]; // 步骤1：内容列项与经文浓缩（建议10-20项）
  divisions: Division[];          // 步骤2：经文分段（2-4段）
  subjectSentenceZh: string;      // 步骤3：主题句/命题句（20字内）
  subjectSentenceEn: string;
  aimZh: string;                  // 步骤4：主旨/核心目的
  aimEn: string;
  personalNotesZh?: string;
  personalNotesEn?: string;
  isCompleted: boolean;
  lastModified: number;
}

export interface WordCountResult {
  rawCount: number;
  bsfCount: number;
  maxLimit: number;
  recognizedNamesAndPlaces: string[];
  isValid: boolean;
  language: LanguageMode;
  explanation: string;
}
