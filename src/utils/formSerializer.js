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

export const parseJsonInput = (value) => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

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

  if (field.metadata && Object.keys(field.metadata).length > 0) {
    simple.metadata = field.metadata;
  }

  if (Array.isArray(field.children)) {
    simple.children = field.children.map(simplifyField);
  }

  return simple;
};

export const toSimpleForm = (form) => ({
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

export const importJson = (jsonText) => {
  const parsed = typeof jsonText === 'string' ? JSON.parse(jsonText) : jsonText;
  return syncFormFields(parsed);
};
