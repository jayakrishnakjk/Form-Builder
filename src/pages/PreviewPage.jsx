import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormPreview from '../components/preview/FormPreview';
import { useFormBuilder } from '../hooks/useFormBuilder';

function PreviewPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { forms, activeForm, loadForm, getPreviewDraft } = useFormBuilder();

  useEffect(() => {
    if (formId) {
      loadForm(formId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const previewDraft = getPreviewDraft();
  const form = useMemo(() => {
    if (previewDraft?.id === formId) {
      return previewDraft;
    }
    return forms.find((item) => item.id === formId) || activeForm;
  }, [previewDraft, formId, forms, activeForm]);

  const goToBuilder = () => {
    const targetId = formId || form?.id;
    if (!targetId) {
      navigate('/dashboard');
      return;
    }
    // Replace preview entry so Create Form → Back goes to project, not Preview.
    navigate(`/builder/${targetId}`, { replace: true });
  };

  if (!form) {
    return (
      <div className="alert alert-warning mb-0">
        Form not found.{' '}
        <button className="btn btn-link p-0 align-baseline" onClick={goToBuilder} type="button">
          Go to Builder
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      <div className="d-flex flex-column gap-3">
        <div className="card border-0 shadow-sm">
          <div className="card-body d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-center">
            <div>
              <h2 className="h4 mb-1">Preview Mode</h2>
            </div>
            <button className="btn btn-outline-primary" onClick={goToBuilder} type="button">
              Back to Builder
            </button>
          </div>
        </div>
        <FormPreview
          form={form}
          onSubmitted={() => {
            if (form.metadata?.projectId) {
              navigate(`/projects/${form.metadata.projectId}`);
            }
          }}
        />
      </div>
    </div>
  );
}

export default PreviewPage;
