import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormBuilder } from '../../hooks/useFormBuilder';

function FormToolbar() {
  const navigate = useNavigate();
  const {
    activeForm,
    updateFormMeta,
    clearForm,
    exportCurrentFormJson,
    saveActiveForm,
    capturePreviewDraft,
  } = useFormBuilder();
  const [prettyMode] = useState(true);
  const [showJsonStudio, setShowJsonStudio] = useState(false);
  const [saved, setSaved] = useState(false);

  const exportedJson = useMemo(() => exportCurrentFormJson(prettyMode), [exportCurrentFormJson, prettyMode]);
  const projectId = activeForm.metadata?.projectId;

  const handleSave = () => {
    saveActiveForm('Form saved');
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const handleSaveAndReturn = () => {
    handleSave();
    if (projectId) {
      navigate(`/projects/${projectId}`);
    }
  };

  const handlePreview = () => {
    if (!activeForm?.id) {
      return;
    }
    // Capture live canvas so Preview shows unsaved work.
    capturePreviewDraft();
    navigate(`/preview/${activeForm.id}`);
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body d-flex flex-column gap-3">
        {saved && (
          <div className="save-toast" role="status">
            <i className="bi bi-check-circle-fill" />
            Form saved successfully.
          </div>
        )}
        <div className="row g-3 align-items-center">
          <div className="col-12 col-xl-4">
            <input
              className="form-control form-control-lg"
              value={activeForm.name}
              onChange={(event) => updateFormMeta({ name: event.target.value })}
              placeholder="Form Name"
            />
          </div>
          <div className="col-12 col-xl-3">
            <textarea
            className="form-control"
            value={activeForm.description}
            onChange={(event) => updateFormMeta({ description: event.target.value })}
            placeholder="Form Description"
            rows={2}
          />
            {/* <input
              className="form-control"
              value={activeForm.description}
              onChange={(event) => updateFormMeta({ description: event.target.value })}
              placeholder="Form Description"
            /> */}
          </div>
          <div className="col-12 col-xl-5 d-flex">
            <button className="btn btn-primary" onClick={handleSave} type="button">
              <i className="bi bi-save me-2" />Save
            </button>
            {/* {projectId && (
              <button className="btn btn-outline-primary" onClick={handleSaveAndReturn} type="button">
                Save & Return
              </button>
            )} */}
            <button className="btn btn-outline-primary " onClick={handlePreview} type="button">
              Preview Form
            </button>
            <button className="btn btn-outline-dark" onClick={() => setShowJsonStudio((value) => !value)} type="button">
              JSON
            </button>
            <button className="btn btn-outline-danger" onClick={clearForm} type="button">
              Clear Form
            </button>
          </div>
        </div>

        {showJsonStudio && (
          <div className="row g-3 pt-2 border-top">
            <div className="col-12 col-lg-12">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Show JSON</h6>
              </div>
              <textarea className="form-control font-monospace small" rows="16" readOnly value={exportedJson} />
              <div className="d-flex gap-2 mt-2">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => navigator.clipboard.writeText(exportedJson)}
                  type="button"
                >
                  Copy JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FormToolbar;
