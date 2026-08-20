/**
 * Embed host script — keep keys in sync with:
 * - src/shared/constants/storageKeys.js → FORM_SUBMISSIONS_KEY
 * - src/shared/utils/embedMessaging.js → FORM_EMBED_MESSAGE_TYPE
 */
(function () {
  var STORAGE_KEY = 'formbuilder:form-submissions';
  var MESSAGE_TYPE = 'formbuilder:submit';

  var script =
    document.currentScript ||
    document.querySelector('script[data-form-id][src*="form-embed.js"]');

  if (!script) {
    return;
  }

  var formId = script.getAttribute('data-form-id');
  if (!formId) {
    return;
  }

  var baseUrl = (script.getAttribute('data-api-url') || window.location.origin).replace(/\/$/, '');
  var containerId = script.getAttribute('data-container-id') || 'formbuilder-embed-' + formId;
  var container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    script.parentNode.insertBefore(container, script.nextSibling);
  }

  function saveSubmission(targetFormId, payload, submittedAt) {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var store = raw ? JSON.parse(raw) : {};
      var entries = Array.isArray(store[targetFormId]) ? store[targetFormId] : [];

      entries.push({
        submittedAt: submittedAt || new Date().toISOString(),
        data: payload,
      });

      store[targetFormId] = entries;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          [targetFormId]: [{ submittedAt: submittedAt || new Date().toISOString(), data: payload }],
        }),
      );
    }
  }

  var formData = script.getAttribute('data-form-data') || '';

  var iframe = document.createElement('iframe');
  iframe.src =
    baseUrl +
    '/embed/' +
    encodeURIComponent(formId) +
    (formData ? '#data=' + formData : '');
  iframe.title = script.getAttribute('data-form-title') || 'Embedded Form';
  iframe.style.width = script.getAttribute('data-width') || '100%';
  iframe.style.height = script.getAttribute('data-height') || '640px';
  iframe.style.border = '0';
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('allow', 'clipboard-write');

  window.addEventListener('message', function (event) {
    var data = event.data;
    if (!data || data.type !== MESSAGE_TYPE) {
      return;
    }

    if (event.source !== iframe.contentWindow) {
      return;
    }

    if (data.formId) {
      saveSubmission(data.formId, data.payload || {}, data.submittedAt);
    }

    if (data.redirectUrl) {
      window.open(data.redirectUrl, '_blank', 'noopener,noreferrer');
    }
  });

  container.innerHTML = '';
  container.appendChild(iframe);
})();
