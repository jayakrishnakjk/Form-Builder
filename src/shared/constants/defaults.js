import { CONTAINER_TYPES } from './fieldCatalog';
import { createId, titleCase } from '../utils/tree';

export const DEFAULT_FIELD_OPTIONS = [
  { label: 'Option 1', value: 'option_1' },
  { label: 'Option 2', value: 'option_2' },
];

export const createBaseField = (type) => {
  const baseLabel = titleCase(type.replace(/([A-Z])/g, ' $1'));
  const field = {
    id: createId(type),
    name: `${type}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    label: baseLabel,
    placeholder: `Enter ${baseLabel}`,
    objectKey: `${type}_${Math.random().toString(36).slice(2, 6)}`,
    description: '',
    tooltip: '',
    defaultValue: type === 'checkbox' || type === 'switch' ? false : '',
    required: false,
    disabled: false,
    readonly: false,
    hidden: false,
    visible: true,
    order: 0,
    width: type === 'column' ? 6 : 12,
    className: '',
    style: {},
    validation: {
      required: false,
      minLength: '',
      maxLength: '',
      regex: '',
      email: false,
      phone: false,
      number: false,
      decimal: false,
      minValue: '',
      maxValue: '',
      futureDate: false,
      pastDate: false,
      customValidation: '',
      message: '',
    },
    errorMessages: {},
    helpText: '',
    apiBinding: {
      sourceType: 'static',
      endpoint: '',
      method: 'GET',
      labelKey: 'label',
      valueKey: 'value',
      parentKey: '',
      headers: {},
      queryParams: {},
      options: [],
    },
    events: {
      onLoad: '',
      onChange: '',
      onBlur: '',
      onFocus: '',
      onClick: '',
      onSelect: '',
      onUpload: '',
      onValidate: '',
      onSubmit: '',
    },
    permissions: {
      create: ['admin'],
      edit: ['admin'],
      view: ['admin', 'user'],
      delete: ['admin'],
    },
    metadata: {},
    conditionalLogic: [],
    formula: '',
  };

  if (['select', 'multiselect', 'radio', 'autocomplete'].includes(type)) {
    field.apiBinding.options = DEFAULT_FIELD_OPTIONS.map((option) => ({ ...option }));
    field.defaultValue = type === 'multiselect' ? [] : '';
  }

  if (type === 'rating') {
    field.defaultValue = 0;
    field.metadata.maxRating = 5;
  }

  if (type === 'heading') {
    field.defaultValue = 'Section Heading';
    field.placeholder = '';
    field.metadata.level = 'h4';
  }

  if (type === 'divider') {
    field.placeholder = '';
  }

  if (type === 'html') {
    field.defaultValue = '<div class="alert alert-info">HTML block</div>';
    field.placeholder = '';
  }

  if (type === 'dynamicTable') {
    field.defaultValue = [];
    field.metadata.columns = [
      { key: 'item', label: 'Item', type: 'text', required: true },
      { key: 'quantity', label: 'Quantity', type: 'number', required: true },
      { key: 'amount', label: 'Amount', type: 'number', required: false },
    ];
    field.metadata.pageSize = 5;
    field.metadata.searchable = true;
    field.metadata.sortable = true;
  }

  if (type === 'repeater') {
    field.defaultValue = [];
    field.metadata.fields = [
      createBaseField('text'),
      createBaseField('number'),
    ].map((item, index) => ({
      ...item,
      label: index === 0 ? 'Item Name' : 'Quantity',
      objectKey: index === 0 ? 'itemName' : 'quantity',
    }));
  }

  if (type === 'signature') {
    field.defaultValue = '';
    field.metadata.penColor = '#0d6efd';
  }

  if (type === 'file' || type === 'image') {
    field.defaultValue = [];
    field.metadata.multiple = true;
    field.metadata.maxFileSizeMb = 5;
    field.metadata.allowedExtensions = type === 'image' ? ['png', 'jpg', 'jpeg', 'webp'] : ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg'];
  }

  if (type === 'button') {
    field.label = 'Button';
    field.placeholder = '';
    field.defaultValue = '';
    field.required = false;
    field.validation.required = false;
    field.metadata.buttonAction = 'button';
    field.metadata.variant = 'primary';
    field.metadata.buttonColor = '#6610f2';
    field.metadata.callApiOnClick = true;
    field.metadata.apiUrl = '';
    field.metadata.successToastMessage = '';
  }

  if (type === 'richtext') {
    field.defaultValue = '<p>Enter rich text here...</p>';
  }

  if (CONTAINER_TYPES.includes(type)) {
    field.placeholder = '';
    field.metadata = {
      ...field.metadata,
      columns: type === 'row' ? [6, 6] : [],
      buttonsInline: false,
    };
    field.children = [];
  }

  return field;
};

/** Remaining Bootstrap grid units (out of 12) in a row. */
export const getRemainingRowWidth = (children = []) => {
  const used = children.reduce((sum, child) => sum + (Number(child.width) || 6), 0);
  return Math.max(0, 12 - used);
};

/**
 * When a row was built with 2Column/3Column, metadata.columns holds each slot width.
 * After removing columns, return that template so empty slots can show separate drop zones.
 */
export const getRowSlotTemplate = (row) => {
  const template = row?.metadata?.columns;
  const children = row?.children || [];
  if (!Array.isArray(template) || template.length === 0) {
    return null;
  }
  const total = template.reduce((sum, width) => sum + (Number(width) || 0), 0);
  if (total !== 12 || children.length >= template.length) {
    return null;
  }
  const matchesTemplate = children.every(
    (child, index) => (Number(child.width) || 6) === (Number(template[index]) || 6),
  );
  return matchesTemplate ? template : null;
};

/** Create N equal-width Bootstrap columns (12-grid). */
export const createEqualColumns = (count = 2) => {
  const safeCount = Math.max(1, Number(count) || 1);
  const width = Math.floor(12 / safeCount);
  return Array.from({ length: safeCount }, (_, index) => {
    const column = createBaseField('column');
    column.width = width;
    column.label = `Column ${index + 1}`;
    return column;
  });
};

export const createEmptyForm = (overrides = {}) => ({
  id: createId('form'),
  name: 'Form Name',
  description: 'Form Description',
  status: 'draft',
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  layout: {
    id: 'root',
    type: 'root',
    label: 'Root',
    children: [],
  },
  fields: [],
  metadata: {
    category: 'General',
    tags: ['enterprise', 'dynamic-form'],
  },
  versionHistory: [],
  settings: {
    submitLabel: 'Submit',
    resetLabel: 'Reset',
    showProgress: false,
  },
  ...overrides,
});
