import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import FormPreview from '@/features/preview/components/FormPreview';
import { useFormBuilder } from '@/shared/hooks/useFormBuilder';

function EmbedPage() {
  const { formId } = useParams();
  const { forms, activeForm, loadForm } = useFormBuilder();

  useEffect(() => {
    if (formId) {
      loadForm(formId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const form = useMemo(
    () => forms.find((item) => item.id === formId) || (activeForm?.id === formId ? activeForm : null),
    [activeForm, formId, forms],
  );

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
