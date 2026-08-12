import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormBuilder } from '@/shared/hooks/useFormBuilder';
import { useToast } from '@/shared/hooks/useToast';
import { exportJson } from '@/shared/utils/formSerializer';
import { ROUTES } from '@/shared/constants/routes';
import {
  getBuilderReturnProjectId,
  setBuilderReturnProjectId,
} from '@/shared/utils/builderNavigation';
import EmbedScriptDialog from './EmbedScriptDialog';

function FormToolbar() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    activeForm,
    updateFormMeta,
    clearForm,
    saveActiveForm,
    capturePreviewDraft,
  } = useFormBuilder();
  const [showJsonStudio, setShowJsonStudio] = useState(false);
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);

  const exportedJson = useMemo(() => exportJson(activeForm, true), [activeForm]);

  const handleSave = () => {
    saveActiveForm('Form saved');
    showToast('Form saved successfully.', 'success');

    const projectId =
      activeForm.metadata?.projectId || getBuilderReturnProjectId();
    if (projectId) {
      setBuilderReturnProjectId(projectId);
      navigate(ROUTES.projectDetails(projectId), { replace: true });
    }
  };

  const handlePreview = () => {
    if (!activeForm?.id) {
      return;
    }
    // Capture live canvas so Preview shows unsaved work.
    capturePreviewDraft();
    navigate(ROUTES.preview(activeForm.id));
  };

  return (
    <div className="card border-0 shadow-sm form-toolbar-card">
      <div className="card-body form-toolbar-body">
        <div className="form-toolbar-layout">
          <div className="form-toolbar-meta">
            <div className="form-toolbar-field">
              <label className="form-toolbar-label" htmlFor="formToolbarName">
                Form name
              </label>
              <input
                className="form-control form-toolbar-name"
                id="formToolbarName"
                onChange={(event) => updateFormMeta({ name: event.target.value })}
                placeholder="Enter form name"
                type="text"
                value={activeForm.name}
              />
            </div>
            <div className="form-toolbar-field form-toolbar-field--description">
              <label className="form-toolbar-label" htmlFor="formToolbarDescription">
                Description
              </label>
              <input
                className="form-control form-toolbar-description"
                id="formToolbarDescription"
                onChange={(event) => updateFormMeta({ description: event.target.value })}
                placeholder="Short form description"
                type="text"
                value={activeForm.description}
              />
            </div>
          </div>

          <div className="form-toolbar-actions" role="toolbar" aria-label="Form actions">
            <button className="btn btn-primary form-toolbar-btn" onClick={handleSave} type="button">
              <i className="bi bi-save" />
              <span>Save</span>
            </button>
            <button className="btn btn-outline-primary form-toolbar-btn" onClick={handlePreview} type="button">
              <i className="bi bi-eye" />
              <span>Preview</span>
            </button>
            <button
              className="btn btn-outline-secondary form-toolbar-btn"
              disabled={!activeForm?.id}
              onClick={() => setShowEmbedDialog(true)}
              type="button"
            >
              <i className="bi bi-code-slash" />
              <span>Embed</span>
            </button>
            <button
              className={`btn form-toolbar-btn ${showJsonStudio ? 'btn-secondary' : 'btn-outline-secondary'}`}
              onClick={() => setShowJsonStudio((value) => !value)}
              type="button"
            >
              <i className="bi bi-braces" />
              <span>JSON</span>
            </button>
            <button className="btn btn-outline-danger form-toolbar-btn" onClick={clearForm} type="button">
              <i className="bi bi-trash" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {showJsonStudio && (
          <div className="form-toolbar-json">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Show JSON</h6>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => navigator.clipboard.writeText(exportedJson)}
                type="button"
              >
                <i className="bi bi-clipboard me-1" />
                Copy JSON
              </button>
            </div>
            <textarea className="form-control font-monospace small" rows="16" readOnly value={exportedJson} />
          </div>
        )}

        {showEmbedDialog && activeForm?.id && (
          <EmbedScriptDialog
            formId={activeForm.id}
            formName={activeForm.name}
            onClose={() => setShowEmbedDialog(false)}
          />
        )}
      </div>
    </div>
  );
}

export default FormToolbar;
