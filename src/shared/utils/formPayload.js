import { CONTAINER_TYPES } from '@/shared/constants/fieldCatalog';
import { flattenFields } from './tree';

const NON_PAYLOAD_FIELD_TYPES = new Set([
  ...CONTAINER_TYPES,
  'button',
  'heading',
  'divider',
  'html',
]);

export const isFormPayloadField = (field) =>
  Boolean(field?.objectKey) && !NON_PAYLOAD_FIELD_TYPES.has(field.type);

export const buildFormPayload = (formData, layoutChildren = []) => {
  const payload = {};

  flattenFields(layoutChildren).forEach((field) => {
    if (isFormPayloadField(field)) {
      payload[field.objectKey] = formData[field.objectKey] ?? field.defaultValue ?? '';
    }
  });

  return payload;
};

export const createFormDataFromLayout = (layoutChildren = []) =>
  buildFormPayload({}, layoutChildren);
