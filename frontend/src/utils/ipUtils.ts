/**
 * IP Utilities
 * Functions to get user's IP address for anonymous quota tracking
 */

/** IP response from ipify API */
interface IpifyResponse {
  ip: string;
}

let cachedIP: string | null = null;

/**
 * Get user's public IP address
 * Uses ipify API (free, no auth required)
 */
export async function getUserIP(): Promise<string> {
  // Return cached IP if available
  if (cachedIP) {
    return cachedIP;
  }

  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json() as IpifyResponse;
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
export function clearCachedIP(): void {
  cachedIP = null;
}
