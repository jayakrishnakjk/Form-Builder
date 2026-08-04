export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  projects: '/projects',
  projectDetails: (projectId) => `/projects/${projectId}`,
  forms: '/forms',
  builder: (formId) => `/builder/${formId}`,
  builderNew: (projectId) =>
    projectId ? `/builder/new?projectId=${projectId}` : '/builder/new',
  preview: (formId) => `/preview/${formId}`,
  previewStandalone: (formId) => `/preview/${formId}?standalone=1`,
  settings: '/settings',
};
