function ProjectTable({ getFormsCount, projects, onDelete, onEdit, onView }) {
  if (!projects.length) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <div className="display-6 text-muted mb-3">
            <i className="bi bi-folder2-open" />
          </div>
          <h2 className="h5">No projects yet</h2>
          <p className="text-muted mb-0">Create a project to start grouping your forms.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card">
      <div className="project-table-wrap">
        <table className="table align-middle mb-0 project-table">
          <thead>
            <tr>
              <th scope="col">Logo</th>
              <th scope="col">Project Name</th>
              <th scope="col">URL</th>
              {/* <th className="description-column" scope="col">Description</th> */}
              {/* <th scope="col">Primary</th> */}
              {/* <th scope="col">Secondary</th> */}
              <th scope="col">Forms Count</th>
              <th scope="col">Created Date</th>
              <th className="text-end" scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td data-label="Logo">
                  {project.logo ? (
                    <img alt="" className="project-logo-thumb" src={project.logo} />
                  ) : (
                    <span className="project-logo-fallback">
                      <i className="bi bi-building" />
                    </span>
                  )}
                </td>
                <td className="fw-semibold" data-label="Project Name">{project.name}</td>
                <td data-label="URL">
                  <span className="text-break">{project.url}</span>
                </td>
                {/* <td className="project-description-cell text-muted" data-label="Description">{project.description || 'No description'}</td>
                <td data-label="Colors">
                  <span className="project-color-pair">
                    <span className="project-color-swatch" style={{ backgroundColor: primaryColor }} />
                  </span>
                  <span className="visually-hidden">Primary {primaryColor}, secondary {secondaryColor}</span>
                </td>
                <td data-label="Colors">
                  <span className="project-color-pair">
                    <span className="project-color-swatch" style={{ backgroundColor: secondaryColor }} />
                  </span>
                </td> */}
                <td data-label="Forms Count">
                  <span className="badge rounded-pill text-bg-light border">{getFormsCount(project)}</span>
                </td>
                <td data-label="Created Date">{new Date(project.createdAt).toLocaleDateString()}</td>
                <td data-label="Actions">
                  <div className="d-flex justify-content-end gap-2 flex-wrap">
                    <button className="btn btn-light btn-sm action-icon" onClick={() => onView(project.id)} type="button">
                      <i className="bi bi-eye" />
                      {/* <span>View</span> */}
                    </button>
                    <button className="btn btn-light btn-sm action-icon" onClick={() => onEdit(project)} type="button">
                      <i className="bi bi-pencil" />
                      {/* <span>Edit</span> */}
                    </button>
                    <button className="btn btn-light btn-sm action-icon text-danger" onClick={() => onDelete(project.id)} type="button">
                      <i className="bi bi-trash" />
                      {/* <span>Delete</span> */}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProjectTable;
