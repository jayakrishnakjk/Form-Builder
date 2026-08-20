import { MASTER_FORM_STORAGE_KEY } from '../constants/storageKeys';
import { createSupabaseCollectionService } from './supabaseCollection';

export const masterFormService = createSupabaseCollectionService(
  'master_forms',
  MASTER_FORM_STORAGE_KEY,
);
