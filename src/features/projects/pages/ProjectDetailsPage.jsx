import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormBuilder } from '@/shared/hooks/useFormBuilder';
import { useProjects } from '@/shared/hooks/useProjects';
import { useToast } from '@/shared/hooks/useToast';
import { setBuilderReturnProjectId } from '@/shared/utils/builderNavigation';
import { ROUTES } from '@/shared/constants/routes';

function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { deleteForm, forms, loadForm } = useFormBuilder();
  const { getProjectById, updateProject, projects } = useProjects();
  const project = getProjectById(projectId);

  useEffect(() => {
    if (!projectId || !projects.length) {
      return;
    }
    if (!getProjectById(projectId)) {
      navigate(ROUTES.dashboard, { replace: true });
    }
  }, [getProjectById, navigate, projectId, projects.length]);

  const savedForms = project
    ? forms.filter(
        (form) =>
          form.metadata?.projectId === project.id && form.metadata?.savedToProject === true,
      )
    : [];
  const sampleForms = project?.sampleForms || [];
  const allFormsCount = sampleForms.length + savedForms.length;

  useEffect(() => {
    if (!project) {
      return;
    }

    // Only remove abandoned drafts once on enter — not on every forms update.
    const abandoned = forms.filter(
      (form) =>
        form.metadata?.projectId === project.id && form.metadata?.savedToProject === false,
    );
    if (!abandoned.length) {
      return;
    }
    const timer = window.setTimeout(() => {
      abandoned.forEach((form) => deleteForm(form.id));
    }, 50);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  if (!project) {
    return (
      <div className="page-stack">
        <div className="alert alert-light border mb-0">Loading project…</div>
      </div>
    );
  }

  const openBuilder = (formId) => {
    setBuilderReturnProjectId(project.id);
    if (formId) {
      loadForm(formId);
      navigate(`/builder/${formId}`);
      return;
    }
    navigate(`/builder/new?projectId=${project.id}`);
  };

  const handleCreateForm = () => {
    openBuilder();
  };

  const handleDeleteForm = (formId) => {
    const form = savedForms.find((f) => f.id === formId);
    deleteForm(formId);
    showToast(form ? `Form "${form.name}" deleted.` : 'Form deleted.', 'success');
  };

  const handleDeleteSampleForm = (formId) => {
    const form = sampleForms.find((f) => f.id === formId);
    updateProject(project.id, {
      sampleForms: sampleForms.filter((form) => form.id !== formId),
    });
    showToast(form ? `Sample form "${form.name}" deleted.` : 'Sample form deleted.', 'success');
  };

  return (
    <div className="page-stack project-details-page">
      <div className="d-flex flex-wrap gap-2 justify-content-end align-items-center">
        <button className="btn btn-primary btn-sm" onClick={handleCreateForm} type="button">
          <i className="bi bi-plus-circle me-2" />
          Create Form
        </button>
      </div>

      <div className="project-detail-card">
        {/* {project.logo ? (
          <img alt="" className="project-detail-logo" src={project.logo} />
        ) : (
          <div className="project-detail-logo project-detail-logo--empty">
            {project.name.slice(0, 2).toUpperCase()}
          </div>
        )} */}
        <div className="flex-grow-1 min-w-0">
          <span className="eyebrow">Project Forms</span>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            {/* <h2 className="dashboard-title mb-0">{project.name}</h2> */}
            {/* <span className="project-color-chip">
              <span className="project-color-swatch" style={{ backgroundColor: primaryColor }} />
              Primary {primaryColor}
            </span>
            <span className="project-color-chip">
              <span className="project-color-swatch" style={{ backgroundColor: secondaryColor }} />
              Secondary {secondaryColor}
            </span> */}
          </div>
          {/* <div className="text-muted text-break mb-2">{project.url}</div> */}
          {/* <p className="mb-0">{project.description || 'No description provided.'}</p> */}
        </div>
        <div className="detail-count-card">
          <span>{allFormsCount}</span>
          <small>Forms</small>
        </div>
      </div>

      <div className="surface-card p-4">
        <div className="d-flex flex-wrap justify-content-between gap-2 align-items-center mb-3">
          <div>
            <h2 className="h5 mb-1">Forms</h2>
            <p className="text-muted mb-0">Sample forms plus forms created for this project.</p>
          </div>

        </div>

        {allFormsCount ? (
          <div className="row g-4">
            {sampleForms.map((form) => (
              <div className="col-lg-4 col-md-6 col-12" key={form.id}>
                <div className="form-card h-100">
                <div>
                  <h3 className="h6 mb-1">{form.name}</h3>
                  <div className="small text-muted">Sample project form</div>
                </div>
                <div className="form-actions">
                  {/* <span className={`badge ${form.status === 'published' ? 'text-bg-success' : 'text-bg-warning'}`}>
                    {form.status}
                  </span> */}
                   <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => openBuilder(form.id)}
                      type="button"
                    >
                      Edit Form1
                    </button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteSampleForm(form.id)} type="button">Delete</button>
                </div>
              </div>
              </div>
            ))}

            {savedForms.map((form) => (
              <div className="col-lg-4 col-md-6 col-12" key={form.id}>
                <div className="form-card h-100">
                  <div className="min-w-0">
                    <div className="d-flex flex-wrap gap-2 align-items-center mb-1">
                      <h3 className="h6 mb-0">{form.name}</h3>
                      {/* <span className={`badge ${form.status === 'published' ? 'text-bg-success' : 'text-bg-warning'}`}>
                      {form.status}
                    </span> */}
                      <div className="form-actions">
                        <button
                          className="btn btn-sm"
                          onClick={() => openBuilder(form.id)}
                          type="button"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn  btn-sm"
                          onClick={() => handleDeleteForm(form.id)}
                          type="button"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                        <button className="btn  btn-sm" type="button"><i className="bi bi-check-circle me-1"></i></button>
                      </div>
                    </div>
                    <p className="text-muted small mb-1">{form.description}</p>
                    <div className="small text-muted">
                      Version {form.version || 1} - {(form.fields || []).length} nodes
                    </div>
                </div>

              </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-project-forms">
            <h3 className="h6">No forms have been created for this project.</h3>
            <p className="text-muted mb-3">Create a form here to associate it with this project.</p>
            <button className="btn btn-primary" onClick={handleCreateForm} type="button">
              Create Form
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetailsPage;
