import axios from 'axios';

/**
 * Shared HTTP client for field option APIs and builder dialogs.
 */
export const apiClient = axios.create({
  timeout: 15000,
});
