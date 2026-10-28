
import { API_CONFIG } from "../config.js";

/**
 * Error khusus untuk request API Soniva.
 */
export class SpotifyClientError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = "SpotifyClientError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Membuat URL endpoint backend.
 * Contoh: /spotify/search menjadi
 * https://soniva-app.bonto.run/api/spotify/search
 */
function buildURL(path, query = {}) {
  const baseURL = API_CONFIG.baseURL.replace(/\/+$/, "");
  const endpoint = String(path).replace(/^\/+/, "");
  const url = new URL(`${baseURL}/${endpoint}`);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

/**
 * Request utama ke backend Soniva.
 */
export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    query = {},
    body,
    headers = {},
    timeout = API_CONFIG.timeout
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const requestHeaders = {
      Accept: "application/json",
      ...headers
    };

    const requestOptions = {
      method,
      headers: requestHeaders,
      signal: controller.signal
    };

    if (body !== undefined) {
      requestHeaders["Content-Type"] = "application/json";
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(buildURL(path, query), requestOptions);

    const contentType = response.headers.get("content-type") || "";
    let data = null;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : null;
    }

    if (!response.ok) {
      throw new SpotifyClientError(
        data?.error ||
          data?.message ||
          `Request gagal dengan status ${response.status}.`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof SpotifyClientError) {
      throw error;
    }

    if (error.name === "AbortError") {
      throw new SpotifyClientError(
        "Request timeout. Periksa koneksi internet dan coba lagi."
      );
    }

    throw new SpotifyClientError(
      "Tidak dapat terhubung ke server Soniva. Periksa koneksi atau URL backend.",
      0,
      { cause: error.message }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Shortcut untuk GET.
 */
export function apiGet(path, query = {}, options = {}) {
  return apiRequest(path, {
    ...options,
    method: "GET",
    query
  });
}

/**
 * Shortcut untuk POST.
 */
export function apiPost(path, body = {}, options = {}) {
  return apiRequest(path, {
    ...options,
    method: "POST",
    body
  });
}

/**
 * Shortcut untuk DELETE.
 */
export function apiDelete(path, options = {}) {
  return apiRequest(path, {
    ...options,
    method: "DELETE"
  });
}

/**
 * Memeriksa apakah backend dapat diakses.
 */
export async function checkBackend() {
  return apiGet("config");
        }
