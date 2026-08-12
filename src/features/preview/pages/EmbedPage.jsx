import { useParams } from 'react-router-dom';
import FormPreview from '@/features/preview/components/FormPreview';
import { useLoadedForm } from '@/shared/hooks/useLoadedForm';

function EmbedPage() {
  const { formId } = useParams();
  const form = useLoadedForm(formId);

  if (!form) {
    return (
      <div className="embed-page-shell">
        <div className="alert alert-warning mb-0">Form not found.</div>
      </div>
    );
  }

  return (
    <div className="embed-page-shell">
      <FormPreview form={form} />
    </div>
  );
}

export default EmbedPage;
