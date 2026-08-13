import { MASTER_FORM_STORAGE_KEY } from '../constants/storageKeys';

export const masterFormService = {
  loadAll() {
    const raw = localStorage.getItem(MASTER_FORM_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MASTER_FORM_STORAGE_KEY, JSON.stringify([]));
      return [];
    }

    try {
      const items = JSON.parse(raw);
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  },

  saveAll(items) {
    localStorage.setItem(MASTER_FORM_STORAGE_KEY, JSON.stringify(items));
    return items;
  },
};
