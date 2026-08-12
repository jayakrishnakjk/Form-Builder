import { useEffect, useMemo } from 'react';
import { useFormBuilder } from '@/shared/hooks/useFormBuilder';

/**
 * Loads a form by id and resolves draft/list/active fallbacks for preview & embed.
 */
export function useLoadedForm(formId, { preferPreviewDraft = false } = {}) {
  const { forms, activeForm, loadForm, getPreviewDraft } = useFormBuilder();

  useEffect(() => {
    if (formId) {
      loadForm(formId);
    }
    // One-shot load when route id changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const previewDraft = preferPreviewDraft ? getPreviewDraft() : null;

  return useMemo(() => {
    if (preferPreviewDraft && previewDraft?.id === formId) {
      return previewDraft;
    }
    const fromList = forms.find((item) => item.id === formId);
    if (fromList) {
      return fromList;
    }
    if (preferPreviewDraft) {
      return activeForm;
    }
    return activeForm?.id === formId ? activeForm : null;
  }, [activeForm, formId, forms, preferPreviewDraft, previewDraft]);
}
