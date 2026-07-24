import { PROJECT_STORAGE_KEY } from '../constants/storageKeys';
import { SAMPLE_PROJECTS } from '../constants/sampleProjects';

export const projectService = {
  loadAll() {
    const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(SAMPLE_PROJECTS));
      return SAMPLE_PROJECTS;
    }

    try {
      const projects = JSON.parse(raw);
      return Array.isArray(projects) && projects.length ? projects : SAMPLE_PROJECTS;
    } catch {
      return SAMPLE_PROJECTS;
    }
  },

  saveAll(projects) {
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
    return projects;
  },
};
