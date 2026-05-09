import { describe, it, expect } from 'vitest';
import { insertTeamSchema, insertTeamMemberSchema, joinTeamSchema } from '@shared/schema';

describe('Team Schema (Unit)', () => {

  describe('insertTeamSchema', () => {
    it('should accept a valid team', () => {
      const result = insertTeamSchema.safeParse({
        name: 'Design Team Alpha',
        ownerId: 'user-123',
        inviteCode: 'MX-ABCDEF',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing name', () => {
      const result = insertTeamSchema.safeParse({
        ownerId: 'user-123',
        inviteCode: 'MX-ABCDEF',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing ownerId', () => {
      const result = insertTeamSchema.safeParse({
        name: 'Team Alpha',
        inviteCode: 'MX-ABCDEF',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('insertTeamMemberSchema', () => {
    it('should accept a valid member', () => {
      const result = insertTeamMemberSchema.safeParse({
        teamId: 'team-123',
        userId: 'user-456',
        role: 'member',
        color: '#FF6600',
      });
      expect(result.success).toBe(true);
    });

    it('should accept member without role (uses default in DB)', () => {
      const result = insertTeamMemberSchema.safeParse({
        teamId: 'team-123',
        userId: 'user-456',
        color: '#FF6600',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('joinTeamSchema', () => {
    it('should accept valid invite code length', () => {
      const result = joinTeamSchema.safeParse({
        inviteCode: 'MX-12345', // 8 chars
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty invite code', () => {
      const result = joinTeamSchema.safeParse({
        inviteCode: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject too long invite code', () => {
      const result = joinTeamSchema.safeParse({
        inviteCode: 'MX-1234567890',
      });
      expect(result.success).toBe(false);
    });
  });

});
