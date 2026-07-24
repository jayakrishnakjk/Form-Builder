import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProjectContext } from './projectContextValue';
import { createProject } from '../models/project';
import { projectService } from '../services/projectService';

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(() => projectService.loadAll());

  useEffect(() => {
    projectService.saveAll(projects);
  }, [projects]);

  const addProject = useCallback((payload) => {
    const project = createProject(payload);
    setProjects((current) => [project, ...current]);
    return project;
  }, []);

  const updateProject = useCallback((projectId, patch) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              ...patch,
              updatedAt: new Date().toISOString(),
            }
          : project,
      ),
    );
  }, []);

  const deleteProject = useCallback((projectId) => {
    setProjects((current) => current.filter((project) => project.id !== projectId));
  }, []);

  const getProjectById = useCallback(
    (projectId) => projects.find((project) => project.id === projectId) || null,
    [projects],
  );

  const value = useMemo(
    () => ({
      projects,
      addProject,
      updateProject,
      deleteProject,
      getProjectById,
    }),
    [addProject, deleteProject, getProjectById, projects, updateProject],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}
