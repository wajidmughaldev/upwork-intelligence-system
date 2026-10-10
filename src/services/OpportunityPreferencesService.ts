export interface TrustedScoringPreferences {
  preferredJobTypes: Array<'fixed' | 'hourly'>;
  minFixedBudget: number | null;
  minHourlyRate: number | null;
  strongestSkills: string[];
}

const STORAGE_KEY = 'uoi_trusted_scoring_preferences_v1';

function safeString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 80;
}

function safeNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function safeSkills(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(safeString).map((skill) => skill.trim()))].slice(0, 20);
}

function safeJobTypes(value: unknown): Array<'fixed' | 'hourly'> {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((type): type is 'fixed' | 'hourly' => type === 'fixed' || type === 'hourly'))];
}

function normalize(value: unknown): TrustedScoringPreferences | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const preferences = {
    preferredJobTypes: safeJobTypes(raw.preferredJobTypes),
    minFixedBudget: safeNumber(raw.minFixedBudget),
    minHourlyRate: safeNumber(raw.minHourlyRate),
    strongestSkills: safeSkills(raw.strongestSkills),
  };

  if (
    preferences.preferredJobTypes.length === 0 &&
    preferences.minFixedBudget === null &&
    preferences.minHourlyRate === null &&
    preferences.strongestSkills.length === 0
  ) {
    return null;
  }

  return preferences;
}

export const opportunityPreferencesService = {
  load(): TrustedScoringPreferences | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? normalize(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  },

  save(preferences: TrustedScoringPreferences): TrustedScoringPreferences | null {
    if (typeof window === 'undefined') return null;
    const safe = normalize(preferences);
    if (!safe) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    return safe;
  },

  clear(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  },
};
