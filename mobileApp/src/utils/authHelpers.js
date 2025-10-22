export const normalizeUser = (raw) => {
  if (!raw) return null;

  const roles = Array.isArray(raw.roles) ? raw.roles : [];
  const roleName = roles[0] || null; // e.g., "super-admin" | "manager" | "user"

  const permissionNames = Array.isArray(raw.permissions) ? raw.permissions : [];

  return { ...raw, roles, roleName, permissionNames };
};
