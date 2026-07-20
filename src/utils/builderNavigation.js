const RETURN_PROJECT_KEY = 'formbuilder:returnProjectId';

export const setBuilderReturnProjectId = (projectId) => {
  if (projectId) {
    sessionStorage.setItem(RETURN_PROJECT_KEY, String(projectId));
  }
};

export const getBuilderReturnProjectId = () => sessionStorage.getItem(RETURN_PROJECT_KEY);

export const clearBuilderReturnProjectId = () => {
  sessionStorage.removeItem(RETURN_PROJECT_KEY);
};
