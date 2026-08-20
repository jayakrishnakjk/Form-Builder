import { FORM_STORAGE_KEY } from '../constants/storageKeys';
import { createSupabaseCollectionService } from './supabaseCollection';

export const formService = createSupabaseCollectionService('forms', FORM_STORAGE_KEY);
