import { SAMPLE_PROJECTS } from '../constants/sampleProjects';

const STORAGE_KEY = 'enterprise-form-builder-projects';

export const projectService = {
  loadAll() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_PROJECTS));
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return projects;
  },
};
