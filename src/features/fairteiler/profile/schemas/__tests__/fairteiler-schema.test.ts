import { describe, it, expect } from 'vitest';
import { fairteilerProfileSchema } from '../fairteiler-profile-schema';

describe('fairteilerProfileSchema', () => {
  describe('name field validation', () => {
    it('should accept valid name with minimum length', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject name shorter than 2 characters', () => {
      const invalidData = {
        name: 'T',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Bitte gib mindestens 2 Zeichen ein',
        );
      }
    });

    it('should reject empty name after trimming', () => {
      const invalidData = {
        name: '   ',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name erforderlich');
      }
    });

    it('should trim whitespace from name', () => {
      const validData = {
        name: '  Test Fairteiler  ',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Fairteiler');
      }
    });

    it('should require name field', () => {
      const invalidData = {
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type');
      }
    });
  });

  describe('geoLat field validation', () => {
    it('should accept valid latitude coordinate', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should trim whitespace from geoLat', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '  48.909090  ',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.geoLat).toBe('48.909090');
      }
    });

    it('should reject empty geoLat after trimming', () => {
      const invalidData = {
        name: 'Test Fairteiler',
        geoLat: '   ',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Standortkoordinaten erforderlich',
        );
      }
    });

    it('should require geoLat field', () => {
      const invalidData = {
        name: 'Test Fairteiler',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type');
      }
    });
  });

  describe('geoLng field validation', () => {
    it('should accept valid longitude coordinate', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should trim whitespace from geoLng', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '  9.918239  ',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.geoLng).toBe('9.918239');
      }
    });

    it('should reject empty geoLng after trimming', () => {
      const invalidData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '   ',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Standortkoordinaten erforderlich',
        );
      }
    });

    it('should require geoLng field', () => {
      const invalidData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type');
      }
    });

    it('should accept negative longitude coordinates', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '-9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept negative latitude coordinates', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '-48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('address field validation', () => {
    it('should accept null address', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept valid address with minimum length', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: 'Musterstraße 123',
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept empty string address', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: '',
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should trim whitespace from address', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: '  Musterstraße 123  ',
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.address).toBe('Musterstraße 123');
      }
    });
  });

  describe('optional fields validation', () => {
    it('should accept null geoLink', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept valid geoLink string', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: 'https://maps.google.com/example',
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept null website', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept valid website string', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: 'https://example.com',
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('thumbnail field validation', () => {
    it('should accept null thumbnail', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept existing URL string', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: 'https://example.com/image.jpg',
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept valid JPEG file under size limit', () => {
      const mockFile = new File(['test content'], 'test.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      // Mock file size to be under limit
      Object.defineProperty(mockFile, 'size', {
        value: 2000000, // 2MB
        writable: false,
      });

      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: mockFile,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept valid PNG file under size limit', () => {
      const mockFile = new File(['test content'], 'test.png', {
        type: 'image/png',
        lastModified: Date.now(),
      });

      Object.defineProperty(mockFile, 'size', {
        value: 1000000, // 1MB
        writable: false,
      });

      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: mockFile,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept valid JPG file under size limit', () => {
      const mockFile = new File(['test content'], 'test.jpg', {
        type: 'image/jpg',
        lastModified: Date.now(),
      });

      Object.defineProperty(mockFile, 'size', {
        value: 500000, // 0.5MB
        writable: false,
      });

      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: mockFile,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject file over 3MB size limit', () => {
      const mockFile = new File(['test content'], 'test.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      Object.defineProperty(mockFile, 'size', {
        value: 4000000, // 4MB - over limit
        writable: false,
      });

      const invalidData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: mockFile,
      };

      const result = fairteilerProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Maximale Dateigröße darf 3 Megabyte nicht überschreiten.',
        );
      }
    });

    it('should reject non-image file types', () => {
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
        lastModified: Date.now(),
      });

      Object.defineProperty(mockFile, 'size', {
        value: 1000000, // 1MB - under limit
        writable: false,
      });

      const invalidData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: mockFile,
      };

      const result = fairteilerProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Es werden nur folgende Formate unterstützt: .jpg, .jpeg und .png',
        );
      }
    });

    it('should reject unsupported image formats', () => {
      const mockFile = new File(['test content'], 'test.gif', {
        type: 'image/gif',
        lastModified: Date.now(),
      });

      Object.defineProperty(mockFile, 'size', {
        value: 1000000, // 1MB - under limit
        writable: false,
      });

      const invalidData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: mockFile,
      };

      const result = fairteilerProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Es werden nur folgende Formate unterstützt: .jpg, .jpeg und .png',
        );
      }
    });
  });

  describe('complete form validation', () => {
    it('should validate complete form with all fields', () => {
      const validData = {
        name: 'Mein Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: 'Musterstraße 123, 12345 Berlin',
        geoLink: 'https://maps.google.com/example',
        website: 'https://mein-fairteiler.de',
        thumbnail: 'https://example.com/existing-image.jpg',
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Mein Fairteiler');
        expect(result.data.geoLat).toBe('48.909090');
        expect(result.data.geoLng).toBe('9.918239');
        expect(result.data.address).toBe('Musterstraße 123, 12345 Berlin');
        expect(result.data.geoLink).toBe('https://maps.google.com/example');
        expect(result.data.website).toBe('https://mein-fairteiler.de');
        expect(result.data.thumbnail).toBe(
          'https://example.com/existing-image.jpg',
        );
      }
    });

    it('should validate minimal form with only required fields', () => {
      const validData = {
        name: 'Minimal Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Minimal Fairteiler');
        expect(result.data.geoLat).toBe('48.909090');
        expect(result.data.geoLng).toBe('9.918239');
        expect(result.data.address).toBe(null);
        expect(result.data.geoLink).toBe(null);
        expect(result.data.website).toBe(null);
        expect(result.data.thumbnail).toBe(null);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle name with exactly 2 characters', () => {
      const validData = {
        name: 'AB',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle file exactly at 3MB limit', () => {
      const mockFile = new File(['test content'], 'test.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      Object.defineProperty(mockFile, 'size', {
        value: 3000000, // Exactly 3MB
        writable: false,
      });

      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.909090',
        geoLng: '9.918239',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: mockFile,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle very long coordinate strings', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '48.90909012345678',
        geoLng: '9.91823912345678',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle coordinate edge values', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '90.0',
        geoLng: '180.0',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle minimal coordinate values', () => {
      const validData = {
        name: 'Test Fairteiler',
        geoLat: '0',
        geoLng: '0',
        address: null,
        geoLink: null,
        website: null,
        thumbnail: null,
      };

      const result = fairteilerProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
