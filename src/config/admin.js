export const ADMIN_CONFIG = {
  adminUserIds: import.meta.env.VITE_ADMIN_USER_IDS
    ? import.meta.env.VITE_ADMIN_USER_IDS.split(',').map(id => id.trim()).filter(Boolean)
    : [],
  adminUsernames: import.meta.env.VITE_ADMIN_USERS
    ? import.meta.env.VITE_ADMIN_USERS.split(',').map(username => username.trim()).filter(Boolean)
    : [],
  verificationMethod: 'github-hybrid',
};

export const isAdmin = (user) => {
  if (!user) return false;

  if (user.id && ADMIN_CONFIG.adminUserIds.length > 0) {
    const isAdminById = ADMIN_CONFIG.adminUserIds.includes(user.id.toString());
    if (isAdminById) {
      console.log(`Admin access by ID: ${user.id} (${user.login})`);
      return true;
    }
  }

  if (user.login && ADMIN_CONFIG.adminUsernames.length > 0) {
    const isAdminByUsername = ADMIN_CONFIG.adminUsernames.includes(user.login);
    if (isAdminByUsername) {
      console.log(`Admin access by username: ${user.login} (${user.id})`);
      console.log(`Update config to use ID: ${user.id}`);
      return true;
    }
  }

  console.log(`Access denied: ${user.login} (${user.id})`);
  return false;
};

export default ADMIN_CONFIG;
