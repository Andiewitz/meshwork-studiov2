/**
 * Shared workspace permission helpers.
 *
 * Lives in server/lib so both the workspace module and team module (and any
 * future module) can import it without creating cross-module dependencies.
 *
 * When individual modules are extracted to microservices, this file becomes
 * a shared library package (e.g., @meshwork/permissions).
 */

export type EffectiveRole =
  "workspace-owner" | "owner" | "admin" | "editor" | "viewer" | null;

const ROLE_RANK: Record<string, number> = {
  "workspace-owner": 5,
  owner: 5,
  admin: 4,
  editor: 3,
  viewer: 2,
};

function rank(role: EffectiveRole): number {
  return role ? (ROLE_RANK[role] ?? 0) : 0;
}

export function canDeleteWorkspace(role: EffectiveRole): boolean {
  return rank(role) >= ROLE_RANK.admin;
}

export function canManageWorkspace(role: EffectiveRole): boolean {
  return rank(role) >= ROLE_RANK.admin;
}

export function canEditWorkspace(role: EffectiveRole): boolean {
  return rank(role) >= ROLE_RANK.editor;
}

export function canViewWorkspace(role: EffectiveRole): boolean {
  return rank(role) >= ROLE_RANK.viewer;
}
