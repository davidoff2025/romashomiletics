import { HomileticsRecord, Division } from '../types/bsf';

const STORAGE_PREFIX = 'bsf_romans_2026_';

export function createDefaultRecord(lessonId: string): HomileticsRecord {
  return {
    lessonId,
    contentList: [],
    subjectSentenceZh: '',
    subjectSentenceEn: '',
    aimZh: '',
    aimEn: '',
    divisions: [],
    personalNotesZh: '',
    personalNotesEn: '',
    isCompleted: false,
    lastModified: Date.now(),
  };
}

export function loadHomileticsRecord(lessonId: string): HomileticsRecord {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}record_${lessonId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.contentList) {
        parsed.contentList = [];
      }
      if (!parsed.divisions) {
        parsed.divisions = [];
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load homiletics record:', err);
  }
  return createDefaultRecord(lessonId);
}

export function saveHomileticsRecord(record: HomileticsRecord): void {
  try {
    record.lastModified = Date.now();
    localStorage.setItem(`${STORAGE_PREFIX}record_${record.lessonId}`, JSON.stringify(record));
  } catch (err) {
    console.error('Failed to save homiletics record:', err);
  }
}

export function getCompletedLessons(): Set<string> {
  const completed = new Set<string>();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_PREFIX}record_`)) {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed.isCompleted && parsed.lessonId) {
            completed.add(parsed.lessonId);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error scanning completed lessons:', err);
  }
  return completed;
}

export function exportAllData(): string {
  const allData: Record<string, any> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      allData[key] = localStorage.getItem(key);
    }
  }
  return JSON.stringify(allData, null, 2);
}

export function importAllData(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    Object.keys(parsed).forEach((k) => {
      if (k.startsWith(STORAGE_PREFIX)) {
        localStorage.setItem(k, parsed[k]);
      }
    });
    return true;
  } catch (err) {
    console.error('Failed to import data:', err);
    return false;
  }
}
