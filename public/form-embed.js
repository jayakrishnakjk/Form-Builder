(function () {
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

  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/embed/' + encodeURIComponent(formId);
  iframe.title = script.getAttribute('data-form-title') || 'Embedded Form';
  iframe.style.width = script.getAttribute('data-width') || '100%';
  iframe.style.height = script.getAttribute('data-height') || '640px';
  iframe.style.border = '0';
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('allow', 'clipboard-write');

  container.innerHTML = '';
  container.appendChild(iframe);
})();
