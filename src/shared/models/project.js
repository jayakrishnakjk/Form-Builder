export const createProject = ({
  name,
  url,
  description = '',
  primaryColor = '#6610f2',
  secondaryColor = '#475569',
  logo = '',
} = {}) => {
  const now = new Date().toISOString();

  return {
    id: `project_${crypto.randomUUID()}`,
    name: name?.trim() || '',
    url: url?.trim() || '',
    description: description?.trim() || '',
    primaryColor,
    secondaryColor,
    logo,
    createdAt: now,
    updatedAt: now,
  };
};
