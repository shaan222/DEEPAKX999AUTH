/**
 * HWID and IP Tracking Utilities
 * Provides functions for hardware ID hashing, IP geolocation, and device management
 */

import { createHash } from 'crypto';
import { IPRecord, DeviceInfo } from './types';

/**
 * Hash an HWID using SHA-256 for privacy and security
 * @param hwid - Raw hardware identifier string
 * @returns Hashed HWID string
 */
export function hashHWID(hwid: string): string {
  if (!hwid) {
    return '';
  }
  return createHash('sha256').update(hwid).digest('hex');
}

/**
 * Verify if a raw HWID matches a hashed HWID
 * @param rawHWID - The raw HWID to check
 * @param hashedHWID - The stored hashed HWID
 * @returns True if they match
 */
export function verifyHWID(rawHWID: string, hashedHWID: string): boolean {
  return hashHWID(rawHWID) === hashedHWID;
}

/**
 * Get geolocation data for an IP address
 * Uses ip-api.com free tier (45 requests/minute limit)
 * @param ip - IP address to lookup
 * @returns Geolocation data or null if failed
 */
export async function getIPGeolocation(ip: string): Promise<{
  country?: string;
  city?: string;
  isp?: string;
} | null> {
  // Skip geolocation for local/private IPs
  if (ip === 'unknown' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.') || ip === '::1' || ip === '127.0.0.1') {
    return { country: 'Local', city: 'Local', isp: 'Local Network' };
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,isp`, {
      method: 'GET',
      headers: { 'User-Agent': 'Auth-API-System' },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.status !== 'success') {
      return null;
    }

    return {
      country: data.country,
      city: data.city,
      isp: data.isp,
    };
  } catch (error) {
    console.error('IP geolocation lookup failed:', error);
    return null;
  }
}

/**
 * Calculate geographic distance between two locations (rough estimate)
 * @param country1 - First country
 * @param country2 - Second country
 * @returns Distance category: 'same', 'nearby', 'far'
 */
function getLocationDistance(country1?: string, country2?: string): 'same' | 'nearby' | 'far' {
  if (!country1 || !country2) {
    return 'same';
  }
  if (country1 === country2) {
    return 'same';
  }
  
  // Simple regional grouping for suspicious activity detection
  const regions: { [key: string]: string[] } = {
    'North America': ['United States', 'Canada', 'Mexico'],
    'Europe': ['United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Poland', 'Ukraine', 'Romania'],
    'Asia': ['China', 'India', 'Japan', 'South Korea', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines'],
    'South America': ['Brazil', 'Argentina', 'Colombia', 'Chile', 'Peru'],
    'Oceania': ['Australia', 'New Zealand'],
    'Middle East': ['Saudi Arabia', 'United Arab Emirates', 'Turkey', 'Israel', 'Iran'],
    'Africa': ['South Africa', 'Nigeria', 'Egypt', 'Kenya', 'Morocco'],
  };

  // Check if both countries are in the same region
  for (const region in regions) {
    const countries = regions[region];
    if (countries.includes(country1) && countries.includes(country2)) {
      return 'nearby';
    }
  }

  return 'far';
}

/**
 * Detect suspicious activity based on IP records
 * Flags licenses that show multiple IPs from different geographic regions within short time periods
 * @param ipRecords - Array of IP records for a license
 * @param maxDevices - Maximum devices allowed for this license
 * @returns True if suspicious activity detected
 */
export function detectSuspiciousActivity(ipRecords: IPRecord[], maxDevices: number): boolean {
  if (!ipRecords || ipRecords.length <= 1) {
    return false;
  }

  // Single-device licenses with multiple IPs from different countries is suspicious
  if (maxDevices === 1 && ipRecords.length > 3) {
    const countries = new Set(ipRecords.map(r => r.country).filter(Boolean));
    if (countries.size > 2) {
      return true; // More than 2 different countries for single-device license
    }
  }

  // Check for rapid location changes (same day, different continents)
  const recentIPs = ipRecords.filter(record => {
    const lastSeen = new Date(record.lastSeen);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24; // Last 24 hours
  });

  if (recentIPs.length >= 2) {
    // Check if recent IPs are from vastly different locations
    for (let i = 0; i < recentIPs.length - 1; i++) {
      for (let j = i + 1; j < recentIPs.length; j++) {
        const distance = getLocationDistance(recentIPs[i].country, recentIPs[j].country);
        if (distance === 'far') {
          return true; // IPs from different continents within 24 hours
        }
      }
    }
  }

  return false;
}

/**
 * Add or update an IP record in the IP addresses array
 * @param ipRecords - Existing IP records array
 * @param newIP - New IP address to add/update
 * @param geoData - Geolocation data for the IP
 * @returns Updated IP records array
 */
export function updateIPRecords(
  ipRecords: IPRecord[] | undefined,
  newIP: string,
  geoData: { country?: string; city?: string; isp?: string } | null
): IPRecord[] {
  const records = ipRecords || [];
  const now = new Date().toISOString();

  // Check if IP already exists
  const existingIndex = records.findIndex(r => r.ip === newIP);

  if (existingIndex >= 0) {
    // Update existing record
    records[existingIndex].lastSeen = now;
  } else {
    // Add new IP record
    records.push({
      ip: newIP,
      firstSeen: now,
      lastSeen: now,
      country: geoData?.country,
      city: geoData?.city,
      isp: geoData?.isp,
      isSuspicious: false,
    });
  }

  return records;
}

/**
 * Check if a license is within its grace period
 * @param gracePeriodEndsAt - Grace period end timestamp
 * @returns True if still within grace period
 */
export function isWithinGracePeriod(gracePeriodEndsAt?: string): boolean {
  if (!gracePeriodEndsAt) {
    return false;
  }
  const endDate = new Date(gracePeriodEndsAt);
  const now = new Date();
  return now < endDate;
}

/**
 * Calculate grace period end date (48 hours from now)
 * @returns ISO timestamp for 48 hours from now
 */
export function calculateGracePeriodEnd(): string {
  const now = new Date();
  const gracePeriodEnd = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours
  return gracePeriodEnd.toISOString();
}

/**
 * Find a device in the authorizedHWIDs array by hashed HWID
 * @param authorizedHWIDs - Array of authorized devices
 * @param hashedHWID - Hashed HWID to search for
 * @returns DeviceInfo or undefined if not found
 */
export function findDeviceByHWID(authorizedHWIDs: DeviceInfo[] | undefined, hashedHWID: string): DeviceInfo | undefined {
  if (!authorizedHWIDs) {
    return undefined;
  }
  return authorizedHWIDs.find(device => device.hwid === hashedHWID);
}

/**
 * Add a new device to the authorized devices list
 * @param authorizedHWIDs - Existing authorized devices
 * @param hashedHWID - Hashed HWID of the new device
 * @param ip - IP address of the device
 * @returns Updated authorized devices array
 */
export function addAuthorizedDevice(
  authorizedHWIDs: DeviceInfo[] | undefined,
  hashedHWID: string,
  ip: string
): DeviceInfo[] {
  const devices = authorizedHWIDs || [];
  const now = new Date().toISOString();

  devices.push({
    hwid: hashedHWID,
    lockedAt: now,
    lastUsed: now,
    ipAddresses: [ip],
  });

  return devices;
}

/**
 * Update an existing device's last used time and IP addresses
 * @param device - Device to update
 * @param ip - Current IP address
 * @returns Updated device info
 */
export function updateDeviceActivity(device: DeviceInfo, ip: string): DeviceInfo {
  const now = new Date().toISOString();
  
  // Add IP if not already in the list
  if (!device.ipAddresses.includes(ip)) {
    device.ipAddresses.push(ip);
  }

  return {
    ...device,
    lastUsed: now,
  };
}

