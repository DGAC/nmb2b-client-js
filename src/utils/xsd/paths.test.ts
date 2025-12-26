import { describe, expect, test } from 'vitest';
import path from 'node:path';
import { B2B_VERSION } from '../../constants.js';
import { getServiceWSDLFilePath, getXSDCacheDirectory } from './paths.js';

const XSD_CACHE_PATH = '/tmp/b2b-xsd';

describe(getXSDCacheDirectory, () => {
  describe('when XSD_ENDPOINT is not set', () => {
    test('should return the standard versioned path', () => {
      const dir = getXSDCacheDirectory({ XSD_PATH: XSD_CACHE_PATH });
      expect(dir).toBe(
        path.join(XSD_CACHE_PATH, `${B2B_VERSION}-network-manager`),
      );
    });
  });

  describe('when XSD_ENDPOINT is set', () => {
    test('should return a path containing the version', () => {
      const xsdEndpoint = 'https://example.com/wsdl';
      const dir = getXSDCacheDirectory({
        XSD_PATH: XSD_CACHE_PATH,
        xsdEndpoint,
      });

      expect(dir).toContain(B2B_VERSION);
    });

    test('should return a different path than standard', () => {
      const xsdEndpoint = 'https://example.com/wsdl';
      const dir = getXSDCacheDirectory({
        XSD_PATH: XSD_CACHE_PATH,
        xsdEndpoint,
      });
      const standardDir = getXSDCacheDirectory({ XSD_PATH: XSD_CACHE_PATH });

      expect(dir).not.toBe(standardDir);
    });

    test('should return different paths for different endpoints', () => {
      const dir1 = getXSDCacheDirectory({
        XSD_PATH: XSD_CACHE_PATH,
        xsdEndpoint: 'https://a.com',
      });
      const dir2 = getXSDCacheDirectory({
        XSD_PATH: XSD_CACHE_PATH,
        xsdEndpoint: 'https://b.com',
      });

      expect(dir1).not.toBe(dir2);
    });

    test('should return stable paths for the same endpoint', () => {
      const endpoint = 'https://stable.com';
      const dir1 = getXSDCacheDirectory({
        XSD_PATH: XSD_CACHE_PATH,
        xsdEndpoint: endpoint,
      });
      const dir2 = getXSDCacheDirectory({
        XSD_PATH: XSD_CACHE_PATH,
        xsdEndpoint: endpoint,
      });

      expect(dir1).toBe(dir2);
    });
  });
});

describe(getServiceWSDLFilePath, () => {
  test('should return the full path to the WSDL file', () => {
    const filePath = getServiceWSDLFilePath({
      service: 'Flow',
      flavour: 'OPS',
      XSD_PATH: XSD_CACHE_PATH,
    });

    const expectedDir = path.join(
      XSD_CACHE_PATH,
      `${B2B_VERSION}-network-manager`,
    );
    const expectedFile = `Flow_OPS_${B2B_VERSION}.wsdl`;
    expect(filePath).toBe(path.join(expectedDir, expectedFile));
  });
});
