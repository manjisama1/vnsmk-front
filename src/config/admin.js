// Admin Configuration
// Configure admin users to match backend authentication

export const ADMIN_CONFIG = {
  // Get admin user IDs from environment variable (comma-separated)
  // Primary: Use GitHub user IDs (more secure, never change)
  adminUserIds: import.meta.env.VITE_ADMIN_USER_IDS 
    ? import.meta.env.VITE_ADMIN_USER_IDS.split(',').map(id => id.trim()).filter(Boolean)
    : [], // Empty array if not configured

  // Fallback: Use GitHub usernames (can change, less secure)
  adminUsernames: import.meta.env.VITE_ADMIN_USERS 
    ? import.meta.env.VITE_ADMIN_USERS.split(',').map(username => username.trim()).filter(Boolean)
    : [], // Empty array if not configured

  // Admin verification method (supports both ID and username)
  verificationMethod: 'github-hybrid', // Supports both user ID and username
};

// Helper function to check if a user is admin (matches backend logic)
export const isAdmin = (user) => {
  if (!user) return false;

  // Primary check: User ID (most secure, never changes)
  if (user.id && ADMIN_CONFIG.adminUserIds.length > 0) {
    const isAdminById = ADMIN_CONFIG.adminUserIds.includes(user.id.toString());
    if (isAdminById) {
      console.log(`✅ Frontend: Admin access granted by ID: ${user.id} (${user.login})`);
      return true;
    }
  }

  // Fallback check: Username (less secure, can change)
  if (user.login && ADMIN_CONFIG.adminUsernames.length > 0) {
    const isAdminByUsername = ADMIN_CONFIG.adminUsernames.includes(user.login);
    if (isAdminByUsername) {
      console.log(`✅ Frontend: Admin access granted by username: ${user.login} (ID: ${user.id})`);
      console.log(`💡 Consider updating frontend config to use user ID: ${user.id}`);
      return true;
    }
  }

  // No admin access
  console.log(`🚫 Frontend: Admin access denied: ${user.login} (ID: ${user.id})`);
  return false;
};

export default ADMIN_CONFIG;