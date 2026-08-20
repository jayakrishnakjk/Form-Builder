/**
 * Encodes a full form definition so it can travel inside the embed snippet.
 * Needed because browsers partition localStorage for cross-site iframes,
 * so the embed page cannot read forms saved in the builder's storage.
 */

const toBase64Url = (bytes) => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (encoded) => {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export const encodeFormForEmbed = (form) => {
  if (!form) {
    return '';
  }
  try {
    const json = JSON.stringify(form);
    return toBase64Url(new TextEncoder().encode(json));
  } catch {
    return '';
  }
};

export const decodeEmbeddedForm = (encoded) => {
  if (!encoded) {
    return null;
  }
  try {
    const json = new TextDecoder().decode(fromBase64Url(encoded));
    const form = JSON.parse(json);
    return form && typeof form === 'object' ? form : null;
  } catch {
    return null;
  }
};

export const getEmbeddedFormFromHash = (hash = typeof window !== 'undefined' ? window.location.hash : '') => {
  if (!hash) {
    return null;
  }
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return decodeEmbeddedForm(params.get('data'));
};
