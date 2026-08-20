import { isSupabaseConfigured, supabase } from './supabaseClient';

const SAVE_DEBOUNCE_MS = 500;

const readLegacyLocalStorage = (key) => {
  if (!key) {
    return [];
  }
  try {
    const items = JSON.parse(localStorage.getItem(key));
    return Array.isArray(items) ? items.filter((item) => item?.id) : [];
  } catch {
    return [];
  }
};

/**
 * Creates a Supabase-backed collection service with the same shape the app
 * already uses: loadAll() and saveAll(items).
 *
 * Each item is stored as one row: { id, data (jsonb), created_at, updated_at }.
 * saveAll is debounced because the builder saves on every state change.
 *
 * If the table is empty and old localStorage data exists (pre-Supabase),
 * it is migrated once and the localStorage key is removed.
 */
export function createSupabaseCollectionService(table, legacyStorageKey) {
  let saveTimer = null;
  let pendingItems = null;

  const flush = async (items) => {
    const rows = items.map((item) => ({
      id: item.id,
      data: item,
      updated_at: new Date().toISOString(),
    }));

    if (rows.length) {
      const { error } = await supabase.from(table).upsert(rows);
      if (error) {
        console.error(`Failed to save ${table} to Supabase:`, error.message);
        return;
      }
    }

    // Remove rows that no longer exist in the app state (deleted items).
    const ids = items.map((item) => item.id).filter(Boolean);
    let deleteQuery = supabase.from(table).delete();
    if (ids.length) {
      deleteQuery = deleteQuery.not(
        'id',
        'in',
        `(${ids.map((id) => `"${String(id).replace(/"/g, '')}"`).join(',')})`,
      );
    } else {
      deleteQuery = deleteQuery.neq('id', '');
    }

    const { error: deleteError } = await deleteQuery;
    if (deleteError) {
      console.error(`Failed to clean up ${table} in Supabase:`, deleteError.message);
    }
  };

  return {
    async loadAll() {
      if (!isSupabaseConfigured) {
        return [];
      }

      const { data, error } = await supabase
        .from(table)
        .select('id, data')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Failed to load ${table} from Supabase:`, error.message);
        return [];
      }

      const items = (data || []).map((row) => row.data).filter(Boolean);
      if (items.length) {
        return items;
      }

      // One-time migration of pre-Supabase localStorage data.
      const legacyItems = readLegacyLocalStorage(legacyStorageKey);
      if (legacyItems.length) {
        await flush(legacyItems);
        localStorage.removeItem(legacyStorageKey);
        console.info(`Migrated ${legacyItems.length} item(s) from localStorage to Supabase table "${table}".`);
      }
      return legacyItems;
    },

    saveAll(items) {
      if (!isSupabaseConfigured || !Array.isArray(items)) {
        return items;
      }

      pendingItems = items;
      if (saveTimer) {
        clearTimeout(saveTimer);
      }
      saveTimer = setTimeout(() => {
        saveTimer = null;
        flush(pendingItems);
      }, SAVE_DEBOUNCE_MS);

      return items;
    },
  };
}
