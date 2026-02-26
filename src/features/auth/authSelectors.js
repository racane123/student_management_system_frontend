/**
 * Auth selectors – permission-based UI logic.
 */

/**
 * Get current user from state.
 */
export const selectUser = (state) => state.auth?.user ?? null;

/**
 * Get permissions array for the logged-in user.
 */
export const selectPermissions = (state) => {
  const user = state.auth?.user ?? null;
  return Array.isArray(user?.permissions) ? user.permissions : [];
};

/**
 * Check if the user has a specific permission.
 * SUPER_ADMIN is treated as having all permissions.
 *
 * @example
 * const canCreateStudent = useSelector(selectHasPermission('CREATE_STUDENT'));
 */
export const selectHasPermission = (permissionName) => (state) => {
  const user = state.auth?.user ?? null;
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  const permissions = Array.isArray(user.permissions) ? user.permissions : [];
  return permissions.includes(permissionName);
};

/**
 * Check if the user has any of the given permissions.
 */
export const selectHasAnyPermission = (permissionNames) => (state) => {
  const user = state.auth?.user ?? null;
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  const permissions = Array.isArray(user.permissions) ? user.permissions : [];
  return permissionNames.some((p) => permissions.includes(p));
};

/**
 * Check if the user has all of the given permissions.
 */
export const selectHasAllPermissions = (permissionNames) => (state) => {
  const user = state.auth?.user ?? null;
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  const permissions = Array.isArray(user.permissions) ? user.permissions : [];
  return permissionNames.every((p) => permissions.includes(p));
};
