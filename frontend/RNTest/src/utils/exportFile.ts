import ReactNativeBlobUtil from 'react-native-blob-util';
import Share from 'react-native-share';
import { store } from '../store';
import { getBaseUrl } from './network';

export type ExportFormat = 'csv' | 'xlsx';

const MIME_TYPES: Record<ExportFormat, string> = {
  csv: 'text/csv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

/**
 * Downloads an authenticated export (CSV/XLSX) straight to the app's cache
 * directory and opens the native share sheet so the user can save/forward it.
 *
 * Implementation note (bare RN 0.86, no Expo):
 * `apiClient` (axios over RN's XHR polyfill) is intentionally NOT used for this
 * call. `responseType: 'blob'`/`'arraybuffer'` support in RN's XHR/fetch
 * polyfill is inconsistent across engines/versions for binary payloads (it's
 * especially unreliable for .xlsx), and even when a Blob-like object comes
 * back there is no built-in way to persist it to disk without bridging through
 * another native module anyway. `react-native-blob-util`'s own `.fetch()` is
 * purpose-built for exactly this "authenticated download straight to a file"
 * pattern: it streams the HTTP response directly to a path on disk (via
 * `config({ path, fileCache: true })`) and hands back a real file path, so it
 * sidesteps the Blob polyfill question entirely. We therefore bypass
 * `skillService.exportSkills`/`categoryService` axios calls for this one flow
 * and issue the authenticated request ourselves, reading the access token from
 * the Redux store the same way `apiClient`'s request interceptor does.
 *
 * Files are written to `CacheDir` (the app's own private storage), not to
 * shared/external storage, so no `WRITE_EXTERNAL_STORAGE`/`READ_EXTERNAL_STORAGE`
 * manifest permissions are needed under modern scoped storage — the file is
 * handed to the share sheet via a `file://` URI and the receiving app (or the
 * user, via "Save to Files"/"Save to Downloads") takes it from there.
 */
export const downloadAndShareExport = async (
  endpoint: string,
  params: Record<string, unknown> | undefined,
  format: ExportFormat,
  filenamePrefix: string,
): Promise<void> => {
  const state = store.getState();
  const token = state.auth.accessToken;
  const baseUrl = getBaseUrl();

  const query = new URLSearchParams();
  const allParams: Record<string, unknown> = { ...params, format };
  Object.entries(allParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });

  const filename = `${filenamePrefix}-${Date.now()}.${format}`;
  const destPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${filename}`;

  const response = await ReactNativeBlobUtil.config({
    path: destPath,
    fileCache: true,
  }).fetch('GET', `${baseUrl}${endpoint}?${query.toString()}`, {
    Authorization: token ? `Bearer ${token}` : '',
  });

  const status = response.info().status;
  if (status < 200 || status >= 300) {
    // Clean up the (likely error-body) file we just wrote before surfacing the failure.
    try {
      response.flush();
    } catch {
      // ignore cleanup errors
    }
    throw new Error(`Export request failed with status ${status}`);
  }

  const filePath = response.path();

  await Share.open({
    url: `file://${filePath}`,
    type: MIME_TYPES[format],
    filename,
    failOnCancel: false,
  });
};
