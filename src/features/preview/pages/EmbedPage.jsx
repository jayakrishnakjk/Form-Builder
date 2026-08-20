import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import FormPreview from '@/features/preview/components/FormPreview';
import { useLoadedForm } from '@/shared/hooks/useLoadedForm';
import { getEmbeddedFormFromHash } from '@/shared/utils/embedFormData';

function EmbedPage() {
  const { formId } = useParams();
  const { hash } = useLocation();

  // Cross-site iframes get partitioned localStorage, so the form definition
  // travels in the URL hash; local storage is only a same-site fallback.
  const embeddedForm = useMemo(() => getEmbeddedFormFromHash(hash), [hash]);
  const storedForm = useLoadedForm(formId);
  const form = embeddedForm || storedForm;

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
