/**
 * Encodes a full form definition so it can travel inside the embed snippet.
 * Needed because browsers partition localStorage for cross-site iframes,
 * so the embed page cannot read forms saved in the builder's storage.
 *
 * The JSON is gzip-compressed (browser-native CompressionStream) before
 * base64url encoding to keep the snippet as small as possible.
 */

const GZIP_MAGIC_0 = 0x1f;
const GZIP_MAGIC_1 = 0x8b;

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

const pipeThrough = async (bytes, transform) => {
  const stream = new Blob([bytes]).stream().pipeThrough(transform);
  const buffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(buffer);
};

export const encodeFormForEmbed = async (form) => {
  if (!form) {
    return '';
  }
  try {
    const raw = new TextEncoder().encode(JSON.stringify(form));
    if (typeof CompressionStream !== 'undefined') {
      return toBase64Url(await pipeThrough(raw, new CompressionStream('gzip')));
    }
    return toBase64Url(raw);
  } catch {
    return '';
  }
};

export const decodeEmbeddedForm = async (encoded) => {
  if (!encoded) {
    return null;
  }
  try {
    let bytes = fromBase64Url(encoded);
    if (bytes[0] === GZIP_MAGIC_0 && bytes[1] === GZIP_MAGIC_1) {
      bytes = await pipeThrough(bytes, new DecompressionStream('gzip'));
    }
    const form = JSON.parse(new TextDecoder().decode(bytes));
    return form && typeof form === 'object' ? form : null;
  } catch {
    return null;
  }
};

export const getEmbeddedFormFromHash = async (
  hash = typeof window !== 'undefined' ? window.location.hash : '',
) => {
  if (!hash) {
    return null;
  }
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return decodeEmbeddedForm(params.get('data'));
};
