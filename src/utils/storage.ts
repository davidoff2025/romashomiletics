import { HomileticsRecord } from '../types/bsf';

const LEGACY_STORAGE_PREFIX = 'bsf_romans_2026_';
const CURRENT_USER_KEY = 'bsf_romans_active_user';
const USERS_LIST_KEY = 'bsf_romans_user_list';
export const DEFAULT_USER = 'Devin Wang';
export const SUGGESTED_USERS = ['Devin Wang', 'Larrylu'];

export function hasActiveUserSet(): boolean {
  try {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    return Boolean(saved && saved.trim());
  } catch (err) {
    console.error('Failed to check active user:', err);
    return false;
  }
}

export function getActiveUser(): string {
  try {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch (err) {
    console.error('Failed to get active user:', err);
  }
  return DEFAULT_USER;
}

export function setActiveUser(userName: string): string {
  const trimmed = userName.trim() || DEFAULT_USER;
  try {
    localStorage.setItem(CURRENT_USER_KEY, trimmed);
    const users = getUserList();
    if (!users.some((u) => u.toLowerCase() === trimmed.toLowerCase())) {
      users.push(trimmed);
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
    }
  } catch (err) {
    console.error('Failed to set active user:', err);
  }
  return trimmed;
}

export function getUserList(): string[] {
  try {
    const raw = localStorage.getItem(USERS_LIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to get user list:', err);
  }
  return [...SUGGESTED_USERS];
}

export function deleteUserProfile(userName: string): string {
  const target = userName.trim();
  const prefix = getUserPrefix(target);

  try {
    // Delete all records belonging to this user
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    // Update user list
    const users = getUserList().filter((u) => u.toLowerCase() !== target.toLowerCase());
    const remaining = users.length > 0 ? users : [DEFAULT_USER];
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(remaining));

    const active = getActiveUser();
    if (active.toLowerCase() === target.toLowerCase()) {
      setActiveUser(remaining[0]);
      return remaining[0];
    }
    return active;
  } catch (err) {
    console.error('Failed to delete user profile:', err);
    return getActiveUser();
  }
}

function sanitizeUserName(userName: string): string {
  return encodeURIComponent(userName.trim().toLowerCase());
}

export function getUserPrefix(userName?: string): string {
  const user = userName || getActiveUser();
  return `${LEGACY_STORAGE_PREFIX}u_${sanitizeUserName(user)}_`;
}

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

export function loadHomileticsRecord(lessonId: string, userName?: string): HomileticsRecord {
  const user = userName || getActiveUser();
  const userKey = `${getUserPrefix(user)}record_${lessonId}`;

  try {
    let raw = localStorage.getItem(userKey);

    // Backwards compatibility migration for Devin Wang or initial user
    if (!raw && user.toLowerCase() === DEFAULT_USER.toLowerCase()) {
      const legacyKey = `${LEGACY_STORAGE_PREFIX}record_${lessonId}`;
      const legacyRaw = localStorage.getItem(legacyKey);
      if (legacyRaw) {
        raw = legacyRaw;
        // Migrate to user-scoped key
        localStorage.setItem(userKey, legacyRaw);
      }
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.contentList) parsed.contentList = [];
      if (!parsed.divisions) parsed.divisions = [];
      return parsed;
    }
  } catch (err) {
    console.error(`Failed to load record for lesson ${lessonId} (user: ${user}):`, err);
  }
  return createDefaultRecord(lessonId);
}

export function saveHomileticsRecord(record: HomileticsRecord, userName?: string): void {
  const user = userName || getActiveUser();
  const userKey = `${getUserPrefix(user)}record_${record.lessonId}`;

  try {
    record.lastModified = Date.now();
    localStorage.setItem(userKey, JSON.stringify(record));
  } catch (err) {
    console.error(`Failed to save record for lesson ${record.lessonId} (user: ${user}):`, err);
  }
}

export function getCompletedLessons(userName?: string): Set<string> {
  const user = userName || getActiveUser();
  const prefix = getUserPrefix(user);
  const completed = new Set<string>();

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix) && key.includes('_record_')) {
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
    console.error(`Error scanning completed lessons for user ${user}:`, err);
  }
  return completed;
}

export function getUserStats(userName?: string): {
  completedCount: number;
  startedCount: number;
  totalLessons: number;
} {
  const user = userName || getActiveUser();
  const prefix = getUserPrefix(user);
  let completedCount = 0;
  let startedCount = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix) && key.includes('_record_')) {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed.isCompleted) completedCount++;
          const hasContent =
            (parsed.contentList && parsed.contentList.length > 0) ||
            (parsed.divisions && parsed.divisions.length > 0) ||
            Boolean(parsed.subjectSentenceZh || parsed.subjectSentenceEn || parsed.aimZh || parsed.aimEn);
          if (hasContent) startedCount++;
        }
      }
    }
  } catch (err) {
    console.error(`Error calculating user stats for ${user}:`, err);
  }

  return { completedCount, startedCount, totalLessons: 30 };
}

export function exportAllData(userName?: string): string {
  const user = userName || getActiveUser();
  const prefix = getUserPrefix(user);
  const data: Record<string, any> = {
    user,
    exportedAt: new Date().toISOString(),
    records: {},
  };

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          data.records[key] = JSON.parse(raw);
        }
      }
    }
  } catch (err) {
    console.error(`Failed to export data for ${user}:`, err);
  }

  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonStr: string, targetUserName?: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    const user = targetUserName || parsed.user || getActiveUser();
    const userPrefix = getUserPrefix(user);

    if (parsed.records && typeof parsed.records === 'object') {
      Object.entries(parsed.records).forEach(([k, val]) => {
        // Normalize key to this user
        const parts = k.split('_record_');
        const lessonId = parts[1];
        if (lessonId) {
          const newKey = `${userPrefix}record_${lessonId}`;
          localStorage.setItem(newKey, JSON.stringify(val));
        }
      });
      setActiveUser(user);
      return true;
    }
  } catch (err) {
    console.error('Failed to import data:', err);
  }
  return false;
}
