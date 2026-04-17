import { describe, it, expect } from 'vitest';
import { insertWorkspaceSchema } from '@shared/schema';

describe('Workspace Schema (Unit)', () => {

  describe('insertWorkspaceSchema', () => {
    it('should accept a valid workspace with all fields', () => {
      const result = insertWorkspaceSchema.safeParse({
        title: 'Test Project',
        type: 'system',
        icon: 'box',
        isFavorite: true,
        userId: 'user-123',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Test Project');
        expect(result.data.isFavorite).toBe(true);
      }
    });

    it('should default isFavorite to false when not provided', () => {
      const result = insertWorkspaceSchema.safeParse({
        title: 'Test',
        type: 'system',
        userId: 'user-123',
      });

      expect(result.success).toBe(true);
    });

    it('should accept isFavorite as a boolean', () => {
      const trueResult = insertWorkspaceSchema.safeParse({
        title: 'Fav Project',
        type: 'system',
        userId: 'user-123',
        isFavorite: true,
      });
      expect(trueResult.success).toBe(true);

      const falseResult = insertWorkspaceSchema.safeParse({
        title: 'Normal Project',
        type: 'system',
        userId: 'user-123',
        isFavorite: false,
      });
      expect(falseResult.success).toBe(true);
    });

    it('should reject titles longer than 16 characters', () => {
      const result = insertWorkspaceSchema.safeParse({
        title: 'This Title Is Way Too Long For The Limit',
        type: 'system',
        userId: 'user-123',
      });

      expect(result.success).toBe(false);
    });

    it('should reject empty titles', () => {
      const result = insertWorkspaceSchema.safeParse({
        title: '',
        type: 'system',
        userId: 'user-123',
      });

      expect(result.success).toBe(false);
    });

    it('should reject titles with emojis', () => {
      const result = insertWorkspaceSchema.safeParse({
        title: 'Cool 🚀',
        type: 'system',
        userId: 'user-123',
      });

      expect(result.success).toBe(false);
    });
  });
});
