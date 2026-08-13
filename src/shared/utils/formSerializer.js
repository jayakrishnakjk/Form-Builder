import { createBaseField } from '../constants/defaults';
import { cloneDeep, flattenFields } from './tree';

const SIMPLE_FIELD_KEYS = [
  'id',
  'name',
  'type',
  'label',
  'placeholder',
  'objectKey',
  'description',
  'tooltip',
  'defaultValue',
  'required',
  'disabled',
  'readonly',
  'hidden',
  'visible',
  'order',
  'width',
  'className',
  'errorMessages',
];

export const syncFormFields = (form) => ({
  ...form,
  updatedAt: new Date().toISOString(),
  fields: flattenFields(form.layout.children).map((field, index) => ({
    ...field,
    order: index + 1,
  })),
});

const simplifyField = (field) => {
  const simple = {};

  SIMPLE_FIELD_KEYS.forEach((key) => {
    if (field[key] !== undefined) {
      simple[key] = field[key];
    }
  });

  const options = field.apiBinding?.options;
  if (Array.isArray(options) && options.length > 0) {
    simple.options = options;
  }

  const apiBinding = field.apiBinding;
  if (apiBinding?.endpoint || apiBinding?.labelKey || apiBinding?.valueKey) {
    simple.apiBinding = {
      ...(apiBinding.endpoint ? { endpoint: apiBinding.endpoint } : {}),
      ...(apiBinding.labelKey ? { labelKey: apiBinding.labelKey } : {}),
      ...(apiBinding.valueKey ? { valueKey: apiBinding.valueKey } : {}),
    };
  }

  if (field.metadata && Object.keys(field.metadata).length > 0) {
    simple.metadata = field.metadata;
  }

  if (Array.isArray(field.children)) {
    simple.children = field.children.map(simplifyField);
  }

  return simple;
};

const toSimpleForm = (form) => ({
  id: form.id,
  name: form.name ?? '',
  description: form.description ?? '',
  createdAt: form.createdAt,
  updatedAt: form.updatedAt,
  layout: {
    id: form.layout?.id ?? 'root',
    type: form.layout?.type ?? 'root',
    label: form.layout?.label ?? 'Root',
    children: (form.layout?.children ?? []).map(simplifyField),
  },
});

export const exportJson = (form, pretty = true) =>
  JSON.stringify(toSimpleForm(cloneDeep(form)), null, pretty ? 2 : 0);

const restoreField = (field) => {
  if (!field || typeof field !== 'object') {
    return field;
  }

  const base = createBaseField(field.type || 'text');
  const importedOptions = field.options ?? field.apiBinding?.options;

  const restored = {
    ...base,
    ...field,
    validation: {
      ...base.validation,
      ...(field.validation || {}),
    },
    events: {
      ...base.events,
      ...(field.events || {}),
    },
    permissions: {
      ...base.permissions,
      ...(field.permissions || {}),
    },
    metadata: {
      ...base.metadata,
      ...(field.metadata || {}),
    },
    apiBinding: {
      ...base.apiBinding,
      ...(field.apiBinding || {}),
    },
  };

  if (Array.isArray(importedOptions)) {
    restored.apiBinding.options = importedOptions.map((option) => ({
      label: option.label ?? '',
      value: option.value ?? '',
    }));
  }

  delete restored.options;

  if (Array.isArray(field.children)) {
    restored.children = field.children.map(restoreField);
  }

  return restored;
};

const restoreForm = (form) => ({
  ...form,
  layout: {
    id: form.layout?.id ?? 'root',
    type: form.layout?.type ?? 'root',
    label: form.layout?.label ?? 'Root',
    ...(form.layout || {}),
    children: (form.layout?.children ?? []).map(restoreField),
  },
});

export const importJson = (jsonText) => {
  const parsed = typeof jsonText === 'string' ? JSON.parse(jsonText) : jsonText;
  return syncFormFields(restoreForm(parsed));
};
