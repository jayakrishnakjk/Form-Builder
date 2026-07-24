import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddProjectDialog from '@/features/projects/components/AddProjectDialog';
import ProjectTable from '@/features/projects/components/ProjectTable';
import { useFormBuilder } from '@/shared/hooks/useFormBuilder';
import { useProjects } from '@/shared/hooks/useProjects';
import { useToast } from '@/shared/hooks/useToast';

function ProjectDashboardPage() {
  const navigate = useNavigate();
  const { addProject, deleteProject, projects, updateProject } = useProjects();
  const { forms } = useFormBuilder();
  const { showToast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const openCreateDialog = () => {
    setEditingProject(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = (payload) => {
    if (editingProject) {
      updateProject(editingProject.id, payload);
    } else {
      addProject(payload);
    }
    setIsDialogOpen(false);
    setEditingProject(null);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleDelete = (projectId) => {
    deleteProject(projectId);
    const project = projects.find((p) => p.id === projectId);
    showToast(
      project
        ? `Project "${project.name}" deleted successfully.`
        : 'Project deleted successfully.',
      'success',
    );
  };

  const getProjectForms = (project) =>
    forms.filter((form) => form.metadata?.projectId === project.id && form.metadata?.savedToProject === true);
  const getFormsCount = (project) => (project.sampleForms?.length || 0) + getProjectForms(project).length;
  const sampleForms = projects.flatMap((project) => project.sampleForms || []);
  const savedProjectForms = forms.filter((form) => form.metadata?.projectId && form.metadata?.savedToProject === true);
  const totalForms = sampleForms.length + savedProjectForms.length;
  const publishedForms =
    sampleForms.filter((form) => form.status === 'published').length +
    savedProjectForms.filter((form) => form.status === 'published').length;
  const draftForms =
    sampleForms.filter((form) => form.status !== 'published').length +
    savedProjectForms.filter((form) => form.status !== 'published').length;

  const statCards = [
    { label: 'Total Projects', value: projects.length, icon: 'bi-folder2-open', tone: 'blue' },
    { label: 'Total Forms', value: totalForms, icon: 'bi-ui-checks-grid', tone: 'green' },
    { label: 'Published Forms', value: publishedForms, icon: 'bi-check2-circle', tone: 'cyan' },
    { label: 'Draft Forms', value: draftForms, icon: 'bi-pencil', tone: 'orange' },
  ];

  return (
    <div className="page-stack">
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">Workspace overview</span> 
          <h4 className="dashboard-title">Project Dashboard</h4>
        </div>
        <button className="btn btn-primary" onClick={openCreateDialog} type="button">
          <i className="bi bi-plus-circle me-2" />
          Create Project
        </button>
      </div>

      <div className="stats-grid">
        {statCards.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <span className={`stat-icon stat-icon--${stat.tone}`}>
              <i className={`bi ${stat.icon}`} />
            </span>
            <div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <ProjectTable
        getFormsCount={getFormsCount}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onView={(projectId) => navigate(`/projects/${projectId}`)}
        projects={projects}
      />

      <AddProjectDialog
        onCancel={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        project={editingProject}
        show={isDialogOpen}
      />
    </div>
  );
}

export default ProjectDashboardPage;
