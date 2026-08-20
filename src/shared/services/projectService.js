import { PROJECT_STORAGE_KEY } from '../constants/storageKeys';
import { createSupabaseCollectionService } from './supabaseCollection';

export const projectService = createSupabaseCollectionService('projects', PROJECT_STORAGE_KEY);
