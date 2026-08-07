import { FORM_SUBMISSIONS_KEY } from '@/shared/constants/storageKeys';

export const normalizeActionUrl = (rawUrl = '') => {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return '';
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const saveFormSubmission = (formId, payload) => {
  if (!formId) {
    return;
  }

  try {
    const raw = localStorage.getItem(FORM_SUBMISSIONS_KEY);
    const store = raw ? JSON.parse(raw) : {};
    const entries = Array.isArray(store[formId]) ? store[formId] : [];

    entries.push({
      submittedAt: new Date().toISOString(),
      data: payload,
    });

    store[formId] = entries;
    localStorage.setItem(FORM_SUBMISSIONS_KEY, JSON.stringify(store));
  } catch {
    localStorage.setItem(
      FORM_SUBMISSIONS_KEY,
      JSON.stringify({
        [formId]: [{ submittedAt: new Date().toISOString(), data: payload }],
      }),
    );
  }
};
