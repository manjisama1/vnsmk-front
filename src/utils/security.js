// Frontend Security Utilities
import { isAdmin } from '@/config/admin';

// Security constants
const SECURITY_CONFIG = {
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes in milliseconds
  STORAGE_KEY_PREFIX: 'vinsmoke_',
  ALLOWED_DOMAINS: ['localhost', '127.0.0.1'], // Add your production domains here
};

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// HTML encoding for display
export const encodeHTML = (str) => {
  if (typeof str !== 'string') return str;
  
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

// Secure localStorage wrapper
export const secureStorage = {
  set: (key, value, expiry = SECURITY_CONFIG.TOKEN_EXPIRY) => {
    try {
      const item = {
        value: value,
        timestamp: Date.now(),
        expiry: expiry
      };
      localStorage.setItem(SECURITY_CONFIG.STORAGE_KEY_PREFIX + key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  },

  get: (key) => {
    try {
      const itemStr = localStorage.getItem(SECURITY_CONFIG.STORAGE_KEY_PREFIX + key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      const now = Date.now();

      // Check if item has expired
      if (item.timestamp + item.expiry < now) {
        localStorage.removeItem(SECURITY_CONFIG.STORAGE_KEY_PREFIX + key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Storage retrieval error:', error);
      localStorage.removeItem(SECURITY_CONFIG.STORAGE_KEY_PREFIX + key);
      return null;
    }
  },

  remove: (key) => {
    localStorage.removeItem(SECURITY_CONFIG.STORAGE_KEY_PREFIX + key);
  },

  clear: () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(SECURITY_CONFIG.STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Rate limiting for login attempts
export const rateLimiter = {
  getAttempts: (identifier) => {
    const attempts = secureStorage.get(`login_attempts_${identifier}`) || { count: 0, lastAttempt: 0 };
    return attempts;
  },

  recordAttempt: (identifier, success = false) => {
    const attempts = rateLimiter.getAttempts(identifier);
    
    if (success) {
      // Reset on successful login
      secureStorage.remove(`login_attempts_${identifier}`);
      return { allowed: true, remaining: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS };
    } else {
      // Increment failed attempts
      const newAttempts = {
        count: attempts.count + 1,
        lastAttempt: Date.now()
      };
      
      secureStorage.set(`login_attempts_${identifier}`, newAttempts, SECURITY_CONFIG.LOCKOUT_DURATION);
      
      return {
        allowed: newAttempts.count < SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
        remaining: Math.max(0, SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - newAttempts.count),
        lockedUntil: newAttempts.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS 
          ? newAttempts.lastAttempt + SECURITY_CONFIG.LOCKOUT_DURATION 
          : null
      };
    }
  },

  isLocked: (identifier) => {
    const attempts = rateLimiter.getAttempts(identifier);
    if (attempts.count < SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) return false;
    
    const lockoutEnd = attempts.lastAttempt + SECURITY_CONFIG.LOCKOUT_DURATION;
    return Date.now() < lockoutEnd;
  }
};

// Validate user data structure
export const validateUserData = (userData) => {
  if (!userData || typeof userData !== 'object') return false;
  
  // Required fields for GitHub user
  const requiredFields = ['id', 'login', 'avatar_url'];
  const hasRequiredFields = requiredFields.every(field => userData[field]);
  
  if (!hasRequiredFields) return false;
  
  // Validate data types
  if (typeof userData.id !== 'number') return false;
  if (typeof userData.login !== 'string') return false;
  if (typeof userData.avatar_url !== 'string') return false;
  
  // Validate URL format for avatar
  try {
    new URL(userData.avatar_url);
  } catch {
    return false;
  }
  
  return true;
};

// Secure token validation
export const validateAuthToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  
  try {
    // Decode base64 token
    const decoded = atob(token);
    const userData = JSON.parse(decoded);
    
    // Validate user data structure
    if (!validateUserData(userData)) {
      throw new Error('Invalid user data structure');
    }
    
    return userData;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
};

// Content Security Policy helpers
export const cspHelpers = {
  // Generate nonce for inline scripts (if needed)
  generateNonce: () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, array));
  },

  // Validate external URLs
  isAllowedURL: (url) => {
    try {
      const urlObj = new URL(url);
      
      // Allow GitHub URLs
      if (urlObj.hostname === 'github.com' || urlObj.hostname === 'api.github.com') {
        return true;
      }
      
      // Allow avatar URLs
      if (urlObj.hostname === 'avatars.githubusercontent.com' || urlObj.hostname === 'ui-avatars.com') {
        return true;
      }
      
      // Allow local development
      if (SECURITY_CONFIG.ALLOWED_DOMAINS.includes(urlObj.hostname)) {
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  }
};

// Admin privilege validation with additional security
export const secureAdminCheck = (user) => {
  if (!user || !validateUserData(user)) return false;
  
  // Check if user is in admin list
  if (!isAdmin(user)) return false;
  
  // Additional security: Check if user data hasn't been tampered with
  const storedUser = secureStorage.get('user');
  if (!storedUser || storedUser.id !== user.id || storedUser.login !== user.login) {
    return false;
  }
  
  return true;
};

// Session security
export const sessionSecurity = {
  // Generate session fingerprint
  generateFingerprint: () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Security fingerprint', 2, 2);
    
    return {
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      canvas: canvas.toDataURL(),
      userAgent: navigator.userAgent.substring(0, 100) // Truncate for storage
    };
  },

  // Validate session fingerprint
  validateFingerprint: (stored) => {
    const current = sessionSecurity.generateFingerprint();
    
    // Allow some flexibility for screen resolution and timezone
    const criticalMatch = 
      stored.language === current.language &&
      stored.platform === current.platform &&
      stored.canvas === current.canvas;
    
    return criticalMatch;
  }
};

// Error handling with security considerations
export const secureErrorHandler = (error, context = 'Unknown') => {
  // Log error securely (don't expose sensitive data)
  const sanitizedError = {
    message: error.message || 'Unknown error',
    context: context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent.substring(0, 50)
  };
  
  console.error('Security Error:', sanitizedError);
  
  // Don't expose internal error details to user
  return 'An error occurred. Please try again.';
};

export default {
  sanitizeInput,
  encodeHTML,
  secureStorage,
  rateLimiter,
  validateUserData,
  validateAuthToken,
  cspHelpers,
  secureAdminCheck,
  sessionSecurity,
  secureErrorHandler,
  SECURITY_CONFIG
};