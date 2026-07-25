// helper/src/features/live-coding/draft-storage.ts

export interface DraftData {
  language: string;
  code: string;
  updatedAt: number;
  cursorPosition?: { lineNumber: number; column: number };
  scrollTop?: number;
}

export interface DraftStorage {
  saveDraft(problemSlug: string, draft: DraftData): void;
  loadDraft(problemSlug: string, language?: string): DraftData | null;
  clearDraft(problemSlug: string, language?: string): void;
  getLastLanguage(): string | null;
  saveLastLanguage(lang: string): void;
}

const DRAFT_PREFIX = 'pg_draft_';
const LAST_LANG_KEY = 'pg_lang';

export class LocalDraftStorage implements DraftStorage {
  saveDraft(problemSlug: string, draft: DraftData): void {
    try {
      const key = `${DRAFT_PREFIX}${problemSlug}_${draft.language}`;
      localStorage.setItem(key, JSON.stringify(draft));
      // Save legacy single key for backwards compatibility
      localStorage.setItem(`${DRAFT_PREFIX}${problemSlug}`, JSON.stringify(draft));
    } catch {
      // Silently ignore storage quota or private browsing exceptions
    }
  }

  loadDraft(problemSlug: string, language?: string): DraftData | null {
    try {
      if (language) {
        const langKey = `${DRAFT_PREFIX}${problemSlug}_${language}`;
        const rawLang = localStorage.getItem(langKey);
        if (rawLang) return JSON.parse(rawLang) as DraftData;
      }
      const rawFallback = localStorage.getItem(`${DRAFT_PREFIX}${problemSlug}`);
      if (!rawFallback) return null;
      const parsed = JSON.parse(rawFallback) as DraftData;
      if (!language || parsed.language === language) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  clearDraft(problemSlug: string, language?: string): void {
    try {
      if (language) {
        localStorage.removeItem(`${DRAFT_PREFIX}${problemSlug}_${language}`);
      } else {
        localStorage.removeItem(`${DRAFT_PREFIX}${problemSlug}`);
      }
    } catch {
      // Ignore
    }
  }

  getLastLanguage(): string | null {
    try {
      return localStorage.getItem(LAST_LANG_KEY);
    } catch {
      return null;
    }
  }

  saveLastLanguage(lang: string): void {
    try {
      localStorage.setItem(LAST_LANG_KEY, lang);
    } catch {
      // Ignore
    }
  }
}
