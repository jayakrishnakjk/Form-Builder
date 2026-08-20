import { NON_INPUT_FIELD_TYPES } from '@/shared/constants/fieldTypes';

const isEmpty = (value) => value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}/;

export const validateField = (field, value, formData = {}) => {
  if (NON_INPUT_FIELD_TYPES.has(field.type)) {
    return [];
  }
  const errors = [];
  const { validation = {} } = field;

  if ((field.required || validation.required) && isEmpty(value)) {
    errors.push(validation.message || `${field.label} is required.`);
  }

  if (typeof value === 'string' && validation.minLength && value.length < Number(validation.minLength)) {
    errors.push(`${field.label} must be at least ${validation.minLength} characters.`);
  }

  if (typeof value === 'string' && validation.maxLength && value.length > Number(validation.maxLength)) {
    errors.push(`${field.label} must be less than ${validation.maxLength} characters.`);
  }

  if (validation.regex && typeof value === 'string' && value) {
    const regex = new RegExp(validation.regex);
    if (!regex.test(value)) {
      errors.push(validation.message || `${field.label} format is invalid.`);
    }
  }

  if (validation.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    errors.push(`${field.label} must be a valid email.`);
  }

  if ((validation.phone || field.type === 'phone') && value && !/^\d{10}$/.test(value)) {
    errors.push(`${field.label} must be a valid 10 digit phone number.`);
  }

  if ((validation.number || field.type === 'number') && value !== '' && Number.isNaN(Number(value))) {
    errors.push(`${field.label} must be a number.`);
  }

  if (validation.decimal && value !== '' && !/^[-+]?\d*\.?\d+$/.test(String(value))) {
    errors.push(`${field.label} must be a decimal number.`);
  }

  if (validation.minValue !== '' && value !== '' && Number(value) < Number(validation.minValue)) {
    errors.push(`${field.label} must be at least ${validation.minValue}.`);
  }

  if (validation.maxValue !== '' && value !== '' && Number(value) > Number(validation.maxValue)) {
    errors.push(`${field.label} must be at most ${validation.maxValue}.`);
  }

  if ((validation.futureDate || validation.pastDate) && value && DATE_PATTERN.test(String(value))) {
    const currentDate = new Date();
    const dateValue = new Date(value);
    if (validation.futureDate && dateValue <= currentDate) {
      errors.push(`${field.label} must be a future date.`);
    }
    if (validation.pastDate && dateValue >= currentDate) {
      errors.push(`${field.label} must be a past date.`);
    }
  }

  if (validation.customValidation) {
    try {
      const validator = new Function('value', 'formData', 'field', `return (${validation.customValidation});`);
      const result = validator(value, formData, field);
      if (result !== true && result !== undefined) {
        errors.push(typeof result === 'string' ? result : `${field.label} failed custom validation.`);
      }
    } catch {
      errors.push(`Custom validation error in ${field.label}.`);
    }
  }

  return errors;
};

export const validateForm = (layoutChildren = [], formData = {}) => {
  const errors = {};

  const walk = (nodes) => {
    nodes.forEach((node) => {
      if (node.children?.length) {
        walk(node.children);
        return;
      }
      if (NON_INPUT_FIELD_TYPES.has(node.type) || node.hidden || node.visible === false) {
        return;
      }
      const nodeErrors = validateField(node, formData[node.objectKey], formData);
      if (nodeErrors.length) {
        errors[node.objectKey] = nodeErrors;
      }
    });
  };

  walk(layoutChildren);
  return errors;
};
