import { useNavigate } from 'react-router-dom';
import { useFormBuilder } from '@/shared/hooks/useFormBuilder';
import { useToast } from '@/shared/hooks/useToast';

function DashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    forms,
    createForm,
    loadForm,
    deleteForm,
    duplicateForm,
    publishForm,
    draftForm,
  } = useFormBuilder();

  const handleCreate = () => {
    const newId = createForm({ name: 'Form Name' });
    showToast('Form created successfully.', 'success');
    navigate(`/builder/${newId}`);
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="card border-0 shadow-sm">
        <div className="card-body d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-center">
          <div>
            <h2 className="h4 mb-1">Form Builder</h2>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={handleCreate} type="button">
              <i className="bi bi-plus-circle me-2" />Create Form
            </button>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {forms.map((form) => (
          <div className="col-12 col-xl-6" key={form.id}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <h3 className="h5 mb-0">{form.name}</h3>
                      <span className={`badge ${form.status === 'published' ? 'text-bg-success' : 'text-bg-warning'}`}>
                        {form.status}
                      </span>
                    </div>
                    <p className="text-muted mb-1">{form.description}</p>
                    <div className="small text-muted">
                      Version {form.version} • {form.fields.length} nodes • {form.versionHistory?.length || 0} history entries
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-light"
                    type="button"
                    onClick={() => {
                      loadForm(form.id);
                      navigate(`/preview/${form.id}`);
                    }}
                  >
                    Preview
                  </button>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => {
                      loadForm(form.id);
                      navigate(`/builder/${form.id}`);
                    }}
                    type="button"
                  >
                    Edit Form
                  </button>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => { duplicateForm(form.id); showToast(`Form "${form.name}" duplicated.`, 'success'); }} type="button">
                    Duplicate
                  </button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => { deleteForm(form.id); showToast(`Form "${form.name}" deleted.`, 'success'); }} type="button">
                    Delete
                  </button>
                  <button className="btn btn-outline-success btn-sm" onClick={() => { publishForm(form.id); showToast(`Form "${form.name}" published.`, 'success'); }} type="button">
                    Publish
                  </button>
                  <button className="btn btn-outline-warning btn-sm" onClick={() => { draftForm(form.id); showToast(`Form "${form.name}" set to draft.`, 'success'); }} type="button">
                    Draft
                  </button>
                </div>

                <details>
                  <summary className="small fw-semibold cursor-pointer">Version History</summary>
                  <ul className="list-group list-group-flush mt-2">
                    {(form.versionHistory || []).slice(0, 5).map((version) => (
                      <li className="list-group-item px-0" key={version.id}>
                        <div className="fw-semibold">v{version.version}</div>
                        <div className="small text-muted">{version.note}</div>
                      </li>
                    ))}
                    {!form.versionHistory?.length && <li className="list-group-item px-0 small text-muted">No versions yet.</li>}
                  </ul>
                </details>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
