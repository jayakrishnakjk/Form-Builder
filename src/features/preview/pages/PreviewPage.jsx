import { useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import FormPreview from '@/features/preview/components/FormPreview';
import { useFormBuilder } from '@/shared/hooks/useFormBuilder';
import { getPreviewDraftForTab } from '@/shared/utils/previewNavigation';

function PreviewPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isStandalone = searchParams.get('standalone') === '1';
  const { forms, activeForm, loadForm, getPreviewDraft, returnToBuilderFromPreview } =
    useFormBuilder();

  useEffect(() => {
    if (formId) {
      loadForm(formId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const previewDraft = getPreviewDraft();
  const tabPreviewDraft = getPreviewDraftForTab(formId);
  const form = useMemo(() => {
    if (previewDraft?.id === formId) {
      return previewDraft;
    }
    if (tabPreviewDraft?.id === formId) {
      return tabPreviewDraft;
    }
    return forms.find((item) => item.id === formId) || activeForm;
  }, [previewDraft, tabPreviewDraft, formId, forms, activeForm]);

  const goToBuilder = () => {
    const targetId = formId || form?.id;
    if (!targetId) {
      navigate('/dashboard');
      return;
    }
    returnToBuilderFromPreview(targetId);
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

  const formPreview = (
    <FormPreview
      form={form}
      onSubmitted={() => {
        if (!isStandalone && form.metadata?.projectId) {
          navigate(`/projects/${form.metadata.projectId}`);
        }
      }}
    />
  );

  if (isStandalone) {
    return <div className="standalone-preview-page">{formPreview}</div>;
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
        {formPreview}
      </div>
    </div>
  );
}

export default PreviewPage;
