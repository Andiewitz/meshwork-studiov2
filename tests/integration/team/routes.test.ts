import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerTeamRoutes } from '@server/modules/team/routes';

// Mock the teamStorage methods
const mockCreateTeam = vi.fn();
const mockGetTeam = vi.fn();
const mockIsTeamMember = vi.fn();
const mockIsTeamOwner = vi.fn();
const mockGetTeamMembers = vi.fn();

vi.mock('@server/modules/team/storage', () => ({
  teamStorage: {
    createTeam: (...args: any[]) => mockCreateTeam(...args),
    getTeam: (...args: any[]) => mockGetTeam(...args),
    isTeamMember: (...args: any[]) => mockIsTeamMember(...args),
    isTeamOwner: (...args: any[]) => mockIsTeamOwner(...args),
    getTeamMembers: (...args: any[]) => mockGetTeamMembers(...args),
  }
}));

// Mock AuthModule for middleware
vi.mock('@server/modules/auth', () => ({
  AuthModule: {
    middleware: {
      isAuthenticated: (req: any, res: any, next: any) => {
        if (req.headers['x-test-user-id']) {
          req.user = { id: req.headers['x-test-user-id'] };
          next();
        } else {
          res.status(401).json({ message: "Not authenticated" });
        }
      }
    }
  }
}));

// Mock CSRF
vi.mock('@server/middleware/csrf', () => ({
  csrfProtection: (req: any, res: any, next: any) => next(),
}));

const setupTestApp = () => {
  const app = express();
  app.use(express.json());
  registerTeamRoutes(app);
  return app;
};

describe('Team Routes Integration Tests (IDOR & Validation)', () => {
  let app: express.Express;

  beforeEach(() => {
    app = setupTestApp();
    vi.clearAllMocks();
  });

  describe('POST /api/teams (Create Team)', () => {
    it('should create a team if valid name is provided', async () => {
      mockCreateTeam.mockResolvedValue({
        id: 'team_1',
        name: 'Design Team',
        ownerId: 'user_A',
        inviteCode: 'MX-ABCDEF'
      });

      const res = await request(app)
        .post('/api/teams')
        .set('x-test-user-id', 'user_A')
        .send({ name: 'Design Team' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Design Team');
      expect(mockCreateTeam).toHaveBeenCalledWith('Design Team', 'user_A');
    });

    it('should reject empty team names', async () => {
      const res = await request(app)
        .post('/api/teams')
        .set('x-test-user-id', 'user_A')
        .send({ name: '   ' });

      expect(res.status).toBe(400);
      expect(mockCreateTeam).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/teams/:id (Get Team Details)', () => {
    it('should block access if the user is not a team member (IDOR)', async () => {
      // Simulate user not being a member
      mockIsTeamMember.mockResolvedValue(false);

      const res = await request(app)
        .get('/api/teams/team_1')
        .set('x-test-user-id', 'hacker_user');

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Not a member of this team');
      expect(mockGetTeam).not.toHaveBeenCalled();
    });

    it('should return team details if user is a member', async () => {
      mockIsTeamMember.mockResolvedValue(true);
      mockGetTeam.mockResolvedValue({ id: 'team_1', name: 'Design Team' });
      mockGetTeamMembers.mockResolvedValue([
        { id: 'member_1', userId: 'user_A', role: 'owner' }
      ]);

      const res = await request(app)
        .get('/api/teams/team_1')
        .set('x-test-user-id', 'user_A');

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Design Team');
      expect(res.body.members.length).toBe(1);
    });
  });

});
