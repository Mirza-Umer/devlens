import { IpinfoService } from './ipinfo.service';

describe('IpinfoService', () => {
  let service: IpinfoService;

  beforeEach(() => {
    service = new IpinfoService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('resolveIp', () => {
    it('should normalize local IPv4 IP with localhost label', async () => {
      // Since it maps local IP to a deterministic mock IP, let's spy on lookupIp or verify it maps correctly.
      const lookupSpy = jest.spyOn((service as any).ipinfo, 'lookupIp').mockResolvedValue({
        city: 'Mountain View',
        region: 'California',
        country: 'US',
        loc: '37.4056,-122.0775',
        timezone: 'America/Los_Angeles',
        org: 'AS15169 Google LLC',
      });

      const result = await service.resolveIp('127.0.0.1 (Localhost)', 'test@example.com');
      
      expect(lookupSpy).toHaveBeenCalled();
      // 'test@example.com' deterministic hash should resolve to one of the mock IPs, which is a public IP
      const calledIp = lookupSpy.mock.calls[0][0];
      expect(calledIp).not.toContain('Localhost');
      expect(calledIp).not.toEqual('127.0.0.1');
      
      expect(result.city).toEqual('Mountain View');
      expect(result.country).toEqual('US');
    });

    it('should normalize local IPv6 IP with localhost label', async () => {
      const lookupSpy = jest.spyOn((service as any).ipinfo, 'lookupIp').mockResolvedValue({
        city: 'Sydney',
        region: 'New South Wales',
        country: 'AU',
        loc: '-33.8688,151.2093',
        timezone: 'Australia/Sydney',
        org: 'AS13335 Cloudflare, Inc.',
      });

      const result = await service.resolveIp('::ffff:127.0.0.1 (Localhost)', 'test@example.com');
      
      expect(lookupSpy).toHaveBeenCalled();
      const calledIp = lookupSpy.mock.calls[0][0];
      expect(calledIp).not.toContain('Localhost');
      expect(calledIp).not.toEqual('127.0.0.1');

      expect(result.city).toEqual('Sydney');
      expect(result.country).toEqual('AU');
    });

    it('should fall back to getMockLocationForIp if lookup fails', async () => {
      jest.spyOn((service as any).ipinfo, 'lookupIp').mockRejectedValue(new Error('API Error'));

      const result = await service.resolveIp('127.0.0.1 (Localhost)', 'test@example.com');
      expect(result).toBeDefined();
      expect(result.city).toBeDefined();
      expect(result.country).toBeDefined();
    });

    it('should use MOCK_IP from environment if specified', async () => {
      process.env.MOCK_IP = '8.8.8.8';
      const lookupSpy = jest.spyOn((service as any).ipinfo, 'lookupIp').mockResolvedValue({
        city: 'Mountain View',
        country: 'US',
      });

      await service.resolveIp('127.0.0.1 (Localhost)', 'test@example.com');
      expect(lookupSpy).toHaveBeenCalledWith('8.8.8.8');
      delete process.env.MOCK_IP;
    });

    it('should query with empty string when client is local and MOCK_IP is not specified', async () => {
      const lookupSpy = jest.spyOn((service as any).ipinfo, 'lookupIp').mockResolvedValue({
        city: 'Multan',
        country: 'PK',
      });

      await service.resolveIp('127.0.0.1 (Localhost)', 'test@example.com');
      expect(lookupSpy).toHaveBeenCalledWith('');
    });
  });
});
