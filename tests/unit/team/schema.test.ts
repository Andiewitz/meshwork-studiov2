import { describe, it, expect } from 'vitest';
import {
  insertTeamSchema,
  insertTeamMemberSchema,
  joinTeamSchema,
  teams,
  teamMembers,
  teamWorkspaces,
} from '@shared/schema';

describe('Team Schema (Unit)', () => {

  // ─── insertTeamSchema ──────────────────────────────────────────────

  describe('insertTeamSchema', () => {
    it('accepts valid team data', () => {
      const result = insertTeamSchema.safeParse({
        name: 'Design Team Alpha',
        ownerId: 'user-123',
        inviteCode: 'MX-ABCDEF',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing name', () => {
      const result = insertTeamSchema.safeParse({
        ownerId: 'user-123',
        inviteCode: 'MX-ABCDEF',
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing ownerId', () => {
      const result = insertTeamSchema.safeParse({
        name: 'Team Alpha',
        inviteCode: 'MX-ABCDEF',
      });
      expect(result.success).toBe(false);
    });
  });

  // ─── insertTeamMemberSchema ────────────────────────────────────────

  describe('insertTeamMemberSchema', () => {
    it('accepts valid member data', () => {
      const result = insertTeamMemberSchema.safeParse({
        teamId: 'team-123',
        userId: 'user-456',
        role: 'member',
        color: '#FF6600',
      });
      expect(result.success).toBe(true);
    });

    it('accepts member without optional role', () => {
      const result = insertTeamMemberSchema.safeParse({
        teamId: 'team-123',
        userId: 'user-456',
        color: '#FF6600',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing teamId', () => {
      const result = insertTeamMemberSchema.safeParse({
        userId: 'user-456',
        color: '#FF6600',
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing userId', () => {
      const result = insertTeamMemberSchema.safeParse({
        teamId: 'team-123',
        color: '#FF6600',
      });
      expect(result.success).toBe(false);
    });
  });

  // ─── joinTeamSchema ────────────────────────────────────────────────

  describe('joinTeamSchema', () => {
    it('accepts valid invite code (4 chars)', () => {
      expect(joinTeamSchema.safeParse({ inviteCode: 'ABCD' }).success).toBe(true);
    });

    it('accepts valid invite code (8 chars)', () => {
      expect(joinTeamSchema.safeParse({ inviteCode: 'MX-12345' }).success).toBe(true);
    });

    it('rejects empty invite code', () => {
      expect(joinTeamSchema.safeParse({ inviteCode: '' }).success).toBe(false);
    });

    it('rejects invite code over 10 chars', () => {
      expect(joinTeamSchema.safeParse({ inviteCode: 'MX-1234567890' }).success).toBe(false);
    });

    it('rejects missing inviteCode field', () => {
      expect(joinTeamSchema.safeParse({}).success).toBe(false);
    });
  });

  // ─── Table Definitions ─────────────────────────────────────────────

  describe('Table definitions', () => {
    it('teams table is defined', () => {
      expect(teams).toBeDefined();
    });

    it('teamMembers table is defined', () => {
      expect(teamMembers).toBeDefined();
    });

    it('teamWorkspaces table is defined', () => {
      expect(teamWorkspaces).toBeDefined();
    });
  });
});
