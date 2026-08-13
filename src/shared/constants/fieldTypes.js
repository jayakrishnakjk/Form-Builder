import { CONTAINER_TYPES } from '@/shared/constants/fieldCatalog';

/** Non-data controls skipped by validation. */
export const NON_INPUT_FIELD_TYPES = new Set([
  'button',
  'heading',
  'paragraph',
  'divider',
  'html',
  'hidden',
]);

/** Layout + display types excluded from submit payload / form data. */
export const NON_PAYLOAD_FIELD_TYPES = new Set([
  ...CONTAINER_TYPES,
  'button',
  'heading',
  'paragraph',
  'divider',
  'html',
]);
