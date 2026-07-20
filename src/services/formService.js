import { SAMPLE_FORMS } from '../schemas/sampleForms';

const STORAGE_KEY = 'enterprise-form-builder';

export const formService = {
  loadAll() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_FORMS));
      return SAMPLE_FORMS;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      return SAMPLE_FORMS;
    }
  },
  saveAll(forms) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
    return forms;
  },
};
