import { useNavigate, useParams } from 'react-router-dom';
import FormPreview from '@/features/preview/components/FormPreview';
import { ROUTES } from '@/shared/constants/routes';
import { useFormBuilder } from '@/shared/hooks/useFormBuilder';
import { useLoadedForm } from '@/shared/hooks/useLoadedForm';

function PreviewPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { returnToBuilderFromPreview } = useFormBuilder();
  const form = useLoadedForm(formId, { preferPreviewDraft: true });

  const goToBuilder = () => {
    const targetId = formId || form?.id;
    if (!targetId) {
      navigate(ROUTES.dashboard);
      return;
    }
    returnToBuilderFromPreview(targetId);
    // Replace preview entry so Create Form → Back goes to project, not Preview.
    navigate(ROUTES.builder(targetId), { replace: true });
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
              navigate(ROUTES.projectDetails(form.metadata.projectId));
            }
          }}
        />
      </div>
    </div>
  );
}

export default PreviewPage;
