// Admin Configuration
// Change this to your GitHub username to grant admin access

export const ADMIN_CONFIG = {
  // Your GitHub username (case-sensitive)
  adminUsername: 'manjisama1',

  // Optional: Add multiple admin usernames
  adminUsernames: [
    'manjisama1',
    // Add more admin usernames here if needed
    // 'another-admin-username',
  ],

  // Admin verification method
  verificationMethod: 'github-username', // Currently only supports 'github-username'
};

// Helper function to check if a user is admin
export const isAdmin = (user) => {
  if (!user || !user.login) return false;

  // Check if user is in admin list
  return ADMIN_CONFIG.adminUsernames.includes(user.login);
};

export default ADMIN_CONFIG;