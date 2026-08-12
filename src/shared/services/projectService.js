import { PROJECT_STORAGE_KEY } from '../constants/storageKeys';

export const projectService = {
  loadAll() {
    const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify([]));
      return [];
    }

    try {
      const projects = JSON.parse(raw);
      return Array.isArray(projects) ? projects : [];
    } catch {
      return [];
    }
  },

  saveAll(projects) {
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
    return projects;
  },
};
