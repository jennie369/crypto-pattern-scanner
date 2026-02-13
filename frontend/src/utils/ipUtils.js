/**
 * IP Utilities
 * Functions to get user's IP address for anonymous quota tracking
 */

let cachedIP = null;

/**
 * Get user's public IP address
 * Uses ipify API (free, no auth required)
 */
export async function getUserIP() {
  // Return cached IP if available
  if (cachedIP) {
    return cachedIP;
  }

  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    cachedIP = data.ip;
    return cachedIP;
  } catch (error) {
    console.error('Error fetching IP:', error);
    // Fallback to a placeholder if IP fetch fails
    return 'unknown';
  }
}

/**
 * Clear cached IP (useful for testing)
 */
export function clearCachedIP() {
  cachedIP = null;
}
