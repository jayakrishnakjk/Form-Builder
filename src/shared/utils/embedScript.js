export const buildEmbedScript = ({
  baseUrl = typeof window !== 'undefined' ? window.location.origin : '',
  formId,
  formName = 'Form',
}) => {
  const origin = baseUrl.replace(/\/$/, '');
  const safeTitle = String(formName).replace(/"/g, '&quot;');

  return `<script
  async
  src="${origin}/form-embed.js"
  data-form-id="${formId}"
  data-api-url="${origin}"
  data-form-title="${safeTitle}"
></script>`;
};
