import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormBuilder } from '../hooks/useFormBuilder';

/**
 * App home when Form Management dashboard is hidden.
 * Opens Builder (second screen) with the active/existing form.
 */
function InitialBuilderRedirect() {
  const navigate = useNavigate();
  const { activeFormId, forms, createForm } = useFormBuilder();

  useEffect(() => {
    const existingId = activeFormId || forms[0]?.id;
    if (existingId) {
      navigate(`/builder/${existingId}`, { replace: true });
      return;
    }

    const newId = createForm({ name: 'Form Name' });
    navigate(`/builder/${newId}`, { replace: true });
  }, [activeFormId, createForm, forms, navigate]);

  return null;
}

export default InitialBuilderRedirect;
