/**
 * Draft persistence abstraction layer.
 *
 * Components must never access localStorage directly.
 * They use the DraftStorage interface so the backing store
 * can be swapped (LocalDraftStorage → DatabaseDraftStorage)
 * without touching any UI code.
 */

export interface DraftData {
  language: string;
  code: string;
  updatedAt: number;
}

export interface DraftStorage {
  saveDraft(problemSlug: string, draft: DraftData): void;
  loadDraft(problemSlug: string): DraftData | null;
  clearDraft(problemSlug: string): void;
  getLastLanguage(): string | null;
  saveLastLanguage(lang: string): void;
}

const DRAFT_PREFIX = 'pg_draft_';
const LAST_LANG_KEY = 'pg_lang';

/** localStorage-backed implementation. Used in production until DB sync is available. */
export class LocalDraftStorage implements DraftStorage {
  saveDraft(problemSlug: string, draft: DraftData): void {
    try {
      localStorage.setItem(`${DRAFT_PREFIX}${problemSlug}`, JSON.stringify(draft));
    } catch {
      // Silently ignore — quota exceeded or private browsing
    }
  }

  loadDraft(problemSlug: string): DraftData | null {
    try {
      const raw = localStorage.getItem(`${DRAFT_PREFIX}${problemSlug}`);
      if (!raw) return null;
      return JSON.parse(raw) as DraftData;
    } catch {
      return null;
    }
  }

  clearDraft(problemSlug: string): void {
    try {
      localStorage.removeItem(`${DRAFT_PREFIX}${problemSlug}`);
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
