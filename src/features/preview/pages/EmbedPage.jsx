import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import FormPreview from '@/features/preview/components/FormPreview';
import { useLoadedForm } from '@/shared/hooks/useLoadedForm';
import { getEmbeddedFormFromHash } from '@/shared/utils/embedFormData';

function EmbedPage() {
  const { formId } = useParams();
  const { hash } = useLocation();

  // Cross-site iframes get partitioned localStorage, so the form definition
  // travels in the URL hash; local storage is only a same-site fallback.
  const [hashState, setHashState] = useState({ form: null, resolved: false });
  const storedForm = useLoadedForm(formId);

  useEffect(() => {
    let active = true;
    setHashState({ form: null, resolved: false });
    getEmbeddedFormFromHash(hash).then((form) => {
      if (active) {
        setHashState({ form, resolved: true });
      }
    });
    return () => {
      active = false;
    };
  }, [hash]);

  if (!hashState.resolved) {
    return null;
  }

  const form = hashState.form || storedForm;

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
