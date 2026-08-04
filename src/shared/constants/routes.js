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
  embed: (formId) => `/embed/${formId}`,
  settings: '/settings',
};
