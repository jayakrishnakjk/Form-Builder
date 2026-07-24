import { FORM_STORAGE_KEY } from '../constants/storageKeys';
import { SAMPLE_FORMS } from '../schemas/sampleForms';

export const formService = {
  loadAll() {
    const raw = localStorage.getItem(FORM_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(SAMPLE_FORMS));
      return SAMPLE_FORMS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SAMPLE_FORMS;
    }
  },
  saveAll(forms) {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(forms));
    return forms;
  },
};
