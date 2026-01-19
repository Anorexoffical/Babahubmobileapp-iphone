// src/utils/image.js

// Fallback image URL for missing or invalid images
export const FALLBACK_IMAGE = 'https://via.placeholder.com/150/6366F1/FFFFFF?text=No+Image';
                               

// Get the API base URL from your axios/http client or env
import http from '../api/http';
const API_BASE_URL = http.defaults.baseURL;

/**
 * Returns a valid image URL for use in <Image /> components.
 * - If imagePath is falsy, returns a fallback image.
 * - If imagePath is already a full URL, returns as is.
 * - Otherwise, prepends API_BASE_URL.
 * @param {string} imagePath
 * @returns {string}
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return FALLBACK_IMAGE;
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

/**
 * Normalizes image URL for cart/wishlist/offline use.
 * - If imageUrl is falsy, returns fallback.
 * - If imageUrl is already a full URL (babahub.co or http), returns as is.
 * - Otherwise, prepends API_BASE_URL.
 * @param {string} imageUrl
 * @returns {string}
 */
export function normalizeImageUrl(imageUrl) {
  if (!imageUrl) return FALLBACK_IMAGE;
  if (imageUrl.includes('babahub.co')) return imageUrl;
  if (imageUrl.startsWith('http')) return imageUrl;
  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
