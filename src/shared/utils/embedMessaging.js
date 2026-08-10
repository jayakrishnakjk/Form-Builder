export const FORM_EMBED_MESSAGE_TYPE = 'formbuilder:submit';

export const isEmbeddedPreview = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

export const postEmbedSubmit = ({ formId, payload, redirectUrl = '' }) => {
  window.parent.postMessage(
    {
      type: FORM_EMBED_MESSAGE_TYPE,
      formId,
      payload,
      redirectUrl,
      submittedAt: new Date().toISOString(),
    },
    '*',
  );
};
