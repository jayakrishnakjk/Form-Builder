import { encodeFormForEmbed } from './embedFormData';
import { resolveLayoutWithMasterForms } from './masterFormUtils';

// Master form refs are expanded here because the embed page cannot
// read master forms from the builder's (partitioned) localStorage.
const resolveFormForEmbed = (form, masterForms) => {
  if (!form) {
    return null;
  }
  return {
    ...form,
    layout: {
      ...form.layout,
      children: resolveLayoutWithMasterForms(form.layout?.children || [], masterForms),
    },
  };
};

const getEmbedConfig = ({
  baseUrl = typeof window !== 'undefined' ? window.location.origin : '',
  formId,
  formName = 'Form',
  form = null,
  masterForms = [],
}) => {
  const origin = baseUrl.replace(/\/$/, '');
  const safeTitle = String(formName).replace(/"/g, '&quot;');
  const containerId = `formbuilder-embed-${formId}`;
  const formData = encodeFormForEmbed(resolveFormForEmbed(form, masterForms));

  return { origin, safeTitle, formId, formName, containerId, formData };
};

export const EMBED_SNIPPET_TABS = [
  { id: 'html', label: 'HTML' },
  { id: 'react', label: 'React' },
  { id: 'angular', label: 'Angular' },
  { id: 'bootstrap', label: 'Bootstrap' },
];

export const buildEmbedScript = (options) => {
  const { origin, safeTitle, formId, formData } = getEmbedConfig(options);

  return `<script
  async
  src="${origin}/form-embed.js"
  data-form-id="${formId}"
  data-api-url="${origin}"
  data-form-title="${safeTitle}"
  data-form-data="${formData}"
></script>`;
};

export const buildReactEmbedSnippet = (options) => {
  const { origin, safeTitle, formId, containerId, formData } = getEmbedConfig(options);

  return `import { useEffect } from 'react';

export function EmbeddedForm() {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = '${origin}/form-embed.js';
    script.setAttribute('data-form-id', '${formId}');
    script.setAttribute('data-api-url', '${origin}');
    script.setAttribute('data-form-title', '${safeTitle}');
    script.setAttribute('data-container-id', '${containerId}');
    script.setAttribute('data-form-data', '${formData}');
    document.body.appendChild(script);

    return () => {
      script.remove();
      document.getElementById('${containerId}')?.remove();
    };
  }, []);

  return <div id="${containerId}" />;
}`;
};

export const buildAngularEmbedSnippet = (options) => {
  const { origin, safeTitle, formId, containerId, formData } = getEmbedConfig(options);

  return `import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-embedded-form',
  standalone: true,
  template: \`<div id="${containerId}"></div>\`,
})
export class EmbeddedFormComponent implements OnInit, OnDestroy {
  private script?: HTMLScriptElement;

  ngOnInit(): void {
    this.script = document.createElement('script');
    this.script.async = true;
    this.script.src = '${origin}/form-embed.js';
    this.script.setAttribute('data-form-id', '${formId}');
    this.script.setAttribute('data-api-url', '${origin}');
    this.script.setAttribute('data-form-title', '${safeTitle}');
    this.script.setAttribute('data-container-id', '${containerId}');
    this.script.setAttribute('data-form-data', '${formData}');
    document.body.appendChild(this.script);
  }

  ngOnDestroy(): void {
    this.script?.remove();
    document.getElementById('${containerId}')?.remove();
  }
}`;
};

export const buildBootstrapEmbedSnippet = (options) => {
  const { origin, safeTitle, formId, containerId, formName, formData } = getEmbedConfig(options);

  return `<div class="container py-4">
  <div class="card shadow-sm border-0">
    <div class="card-body">
      <h5 class="card-title mb-3">${formName || 'Form'}</h5>
      <div id="${containerId}"></div>
      <script
        async
        src="${origin}/form-embed.js"
        data-form-id="${formId}"
        data-api-url="${origin}"
        data-form-title="${safeTitle}"
        data-container-id="${containerId}"
        data-form-data="${formData}"
      ></script>
    </div>
  </div>
</div>`;
};

export const buildEmbedSnippet = (tabId, options) => {
  switch (tabId) {
    case 'react':
      return buildReactEmbedSnippet(options);
    case 'angular':
      return buildAngularEmbedSnippet(options);
    case 'bootstrap':
      return buildBootstrapEmbedSnippet(options);
    case 'html':
    default:
      return buildEmbedScript(options);
  }
};

export const getEmbedSnippetLabel = (tabId) =>
  EMBED_SNIPPET_TABS.find((tab) => tab.id === tabId)?.label || 'HTML';
