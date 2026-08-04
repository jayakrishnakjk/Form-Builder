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
  const [prettyMode] = useState(true);
  const [showJsonStudio, setShowJsonStudio] = useState(false);
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);

  const exportedJson = useMemo(() => exportJson(activeForm, prettyMode), [activeForm, prettyMode]);

  const handleSave = () => {
    saveActiveForm('Form saved');
    showToast('Form saved successfully.', 'success');

    const projectId =
      activeForm.metadata?.projectId || getBuilderReturnProjectId();
    if (projectId) {
      setBuilderReturnProjectId(projectId);
      navigate(`/projects/${projectId}`, { replace: true });
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
    <div className="card border-0 shadow-sm">
      <div className="card-body d-flex flex-column gap-3">
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
          <div className="col-12 col-xl-5 d-flex gap-2">
            <button className="btn btn-primary" onClick={handleSave} type="button">
              <i className="bi bi-save me-2" />Save
            </button>
            <button className="btn btn-outline-primary " onClick={handlePreview} type="button">
              Preview Form
            </button>
            <button
              className="btn btn-outline-secondary"
              disabled={!activeForm?.id}
              onClick={() => setShowEmbedDialog(true)}
              type="button"
            >
              Embed Script
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
