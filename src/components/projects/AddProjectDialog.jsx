import { useEffect, useState } from 'react';

const INITIAL_FORM = {
  name: '',
  url: '',
  description: '',
  primaryColor: '#6610f2',
  secondaryColor: '#475569',
  logo: '',
};

function AddProjectDialog({ show, onCancel, onSubmit, project }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      setFormData(
        project
          ? {
              name: project.name,
              url: project.url,
              description: project.description || '',
              primaryColor: project.primaryColor || project.brandingColor || '#6610f2',
              secondaryColor: project.secondaryColor || '#475569',
              logo: project.logo || '',
            }
          : INITIAL_FORM,
      );
      setErrors({});
    }
  }, [project, show]);

  if (!show) {
    return null;
  }

  const validate = () => {
    const nextErrors = {};
    if (!formData.name.trim()) {
      nextErrors.name = 'Project name is required.';
    }
    if (!formData.url.trim()) {
      nextErrors.url = 'Project URL is required.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors((current) => ({ ...current, logo: 'Project logo must be an image file.' }));
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((current) => ({ ...current, logo: reader.result }));
      setErrors((current) => {
        const nextErrors = { ...current };
        delete nextErrors.logo;
        return nextErrors;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="modal-backdrop-shell" role="presentation">
      <div className="modal d-block project-modal" role="dialog" aria-modal="true" aria-labelledby="projectDialogTitle">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <form className="modal-content border-0 shadow" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h2 className="app-header-title" id="projectDialogTitle">
                {project ? 'Edit Project' : 'Create New Project'}
              </h2>
              <button className="btn-close" onClick={onCancel} type="button" aria-label="Close" />
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="projectName">
                    Project Name
                  </label>
                  <input
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    id="projectName"
                    name="name"
                    onChange={handleChange}
                    type="text"
                    value={formData.name}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="projectUrl">
                    Project URL
                  </label>
                  <input
                    className={`form-control ${errors.url ? 'is-invalid' : ''}`}
                    id="projectUrl"
                    name="url"
                    onChange={handleChange}
                    type="text"
                    value={formData.url}
                  />
                  {errors.url && <div className="invalid-feedback">{errors.url}</div>}
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="projectDescription">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="projectDescription"
                    name="description"
                    onChange={handleChange}
                    rows="3"
                    value={formData.description}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label" htmlFor="primaryColor">
                    Primary Color
                  </label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      className="form-control form-control-color"
                      id="primaryColor"
                      name="primaryColor"
                      onChange={handleChange}
                      title="Choose primary color"
                      type="color"
                      value={formData.primaryColor}
                    />
                    <span className="text-muted small">{formData.primaryColor}</span>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label" htmlFor="secondaryColor">
                    Secondary Color
                  </label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      className="form-control form-control-color"
                      id="secondaryColor"
                      name="secondaryColor"
                      onChange={handleChange}
                      title="Choose secondary color"
                      type="color"
                      value={formData.secondaryColor}
                    />
                    <span className="text-muted small">{formData.secondaryColor}</span>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label" htmlFor="projectLogo">
                    Project Logo
                  </label>
                  <input
                    accept="image/*"
                    className={`form-control ${errors.logo ? 'is-invalid' : ''}`}
                    id="projectLogo"
                    onChange={handleLogoChange}
                    type="file"
                  />
                  {errors.logo && <div className="invalid-feedback">{errors.logo}</div>}
                </div>
                {formData.logo && (
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-2">
                      <img alt="" className="project-logo-preview" src={formData.logo} />
                      <span className="small text-muted">Logo selected</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onCancel} type="button">
                Cancel
              </button>
              <button className="btn btn-primary" type="submit">
                {project ? 'Save' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </div>
  );
}

export default AddProjectDialog;
