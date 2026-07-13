import { Injectable } from '@nestjs/common';
import IPinfoWrapper from 'node-ipinfo';
import * as net from 'net';

@Injectable()
export class IpinfoService {
  private ipinfo: IPinfoWrapper;

  constructor() {
    const token = process.env.IPINFO_TOKEN || '';
    this.ipinfo = new IPinfoWrapper(token);
  }

  async resolveIp(ip: string, email?: string): Promise<{
    city?: string;
    region?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
    timezone?: string;
    org?: string;
  }> {
    let targetIp = ip ? ip.trim() : '';
    
    // Normalize IP: extract the IP portion if it contains extra information (e.g. "127.0.0.1 (Localhost)")
    if (targetIp) {
      targetIp = targetIp.split(/\s+/)[0];
      targetIp = targetIp.replace(/[()\[\]]/g, '');
    }

    if (targetIp.startsWith('::ffff:')) {
      targetIp = targetIp.substring(7);
    }

    const isLocal = this.isPrivateOrLocalIp(targetIp);
    if (isLocal) {
      const envMockIp = process.env.MOCK_IP;
      if (envMockIp) {
        targetIp = envMockIp;
      } else {
        // Use empty string to resolve the server's (developer's) public IP
        targetIp = '';
      }
    }

    try {
      // Look up using the node-ipinfo wrapper
      const data = await this.ipinfo.lookupIp(targetIp);
      
      let latitude: string | undefined;
      let longitude: string | undefined;

      if (data.loc) {
        const [lat, lon] = data.loc.split(',');
        latitude = lat;
        longitude = lon;
      }

      return {
        city: data.city,
        region: data.region,
        country: data.country,
        latitude,
        longitude,
        timezone: data.timezone,
        org: data.org,
      };
    } catch (error) {
      console.error(`Failed to lookup IPinfo for IP ${targetIp || 'server-public-ip'}:`, error);
      // Return deterministic mock IP details as fallback if offline / rate limited
      const mockIp = this.getDeterministicMockIp(email || 'default@example.com');
      return this.getMockLocationForIp(mockIp);
    }
  }

  private isPrivateOrLocalIp(ip: string): boolean {
    if (!ip) return true;
    if (ip === 'localhost' || ip === '') {
      return true;
    }
    
    // If it's not a valid IP address, treat it as private/local so it maps to a mock IP
    if (net.isIP(ip) === 0) {
      return true;
    }

    if (ip === '127.0.0.1' || ip === '::1') {
      return true;
    }
    
    const parts = ip.split('.');
    if (parts.length === 4) {
      const first = parseInt(parts[0], 10);
      const second = parseInt(parts[1], 10);
      if (first === 10) return true;
      if (first === 172 && second >= 16 && second <= 31) return true;
      if (first === 192 && second === 168) return true;
    }
    return false;
  }

  private getDeterministicMockIp(email: string): string {
    const mockIps = [
      '8.8.8.8',          // Mountain View, US
      '1.1.1.1',          // Sydney, AU
      '185.190.140.10',   // London, GB
      '103.102.166.224',  // Tokyo, JP
      '177.39.248.0',     // Rio de Janeiro, BR
      '102.22.140.0',     // Cairo, EG
      '197.210.64.0',     // Lagos, NG
      '115.110.128.0',    // Mumbai, IN
      '202.83.16.0',      // Auckland, NZ
      '194.24.160.0',     // Berlin, DE
    ];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % mockIps.length;
    return mockIps[index];
  }

  private getMockLocationForIp(ip: string): any {
    const fallbacks: Record<string, any> = {
      '8.8.8.8': { city: 'Mountain View', region: 'California', country: 'US', latitude: '37.4056', longitude: '-122.0775', timezone: 'America/Los_Angeles', org: 'AS15169 Google LLC' },
      '1.1.1.1': { city: 'Sydney', region: 'New South Wales', country: 'AU', latitude: '-33.8688', longitude: '151.2093', timezone: 'Australia/Sydney', org: 'AS13335 Cloudflare, Inc.' },
      '185.190.140.10': { city: 'London', region: 'England', country: 'GB', latitude: '51.5074', longitude: '-0.1278', timezone: 'Europe/London', org: 'AS12576 EE Limited' },
      '103.102.166.224': { city: 'Tokyo', region: 'Tokyo', country: 'JP', latitude: '35.6762', longitude: '139.6503', timezone: 'Asia/Tokyo', org: 'AS2516 KDDI CORPORATION' },
      '177.39.248.0': { city: 'Rio de Janeiro', region: 'Rio de Janeiro', country: 'BR', latitude: '-22.9068', longitude: '-43.1729', timezone: 'America/Sao_Paulo', org: 'AS28573 Claro S.A.' },
      '102.22.140.0': { city: 'Cairo', region: 'Cairo', country: 'EG', latitude: '30.0444', longitude: '31.2357', timezone: 'Africa/Cairo', org: 'AS8452 TE Data' },
      '197.210.64.0': { city: 'Lagos', region: 'Lagos', country: 'NG', latitude: '6.5244', longitude: '3.3792', timezone: 'Africa/Lagos', org: 'AS29465 MTN Nigeria Communications PLC' },
      '115.110.128.0': { city: 'Mumbai', region: 'Maharashtra', country: 'IN', latitude: '19.0760', longitude: '72.8777', timezone: 'Asia/Kolkata', org: 'AS45878 Tata Communications Limited' },
      '202.83.16.0': { city: 'Auckland', region: 'Auckland', country: 'NZ', latitude: '-36.8485', longitude: '174.7633', timezone: 'Pacific/Auckland', org: 'AS4771 Spark New Zealand Trading Limited' },
      '194.24.160.0': { city: 'Berlin', region: 'Berlin', country: 'DE', latitude: '52.5200', longitude: '13.4050', timezone: 'Europe/Berlin', org: 'AS3320 Deutsche Telekom AG' },
    };
    return fallbacks[ip] || {
      city: 'Mountain View',
      region: 'California',
      country: 'US',
      latitude: '37.4056',
      longitude: '-122.0775',
      timezone: 'America/Los_Angeles',
      org: 'AS15169 Google LLC',
    };
  }
}
