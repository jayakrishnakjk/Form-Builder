import { FORM_STORAGE_KEY } from '../constants/storageKeys';

export const formService = {
  loadAll() {
    const raw = localStorage.getItem(FORM_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },
  saveAll(forms) {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(forms));
    return forms;
  },
};
