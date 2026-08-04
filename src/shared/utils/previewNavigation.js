const PREVIEW_DRAFT_KEY = 'formbuilder:previewDraft';

export const setPreviewDraftForTab = (form) => {
  if (form?.id) {
    sessionStorage.setItem(PREVIEW_DRAFT_KEY, JSON.stringify(form));
  }
};

export const getPreviewDraftForTab = (formId) => {
  try {
    const raw = sessionStorage.getItem(PREVIEW_DRAFT_KEY);
    if (!raw) {
      return null;
    }
    const draft = JSON.parse(raw);
    return draft?.id === formId ? draft : null;
  } catch {
    return null;
  }
};
