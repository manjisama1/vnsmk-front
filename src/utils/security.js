import { isAdmin } from '@/config/admin';

const SECURITY_CONFIG = {
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000,
  STORAGE_KEY_PREFIX: 'vinsmoke_',
  ALLOWED_DOMAINS: ['localhost', '127.0.0.1'],
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

export const encodeHTML = (str) => {
  if (typeof str !== 'string') return str;
  
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

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

export const rateLimiter = {
  getAttempts: (identifier) => {
    const attempts = secureStorage.get(`login_attempts_${identifier}`) || { count: 0, lastAttempt: 0 };
    return attempts;
  },

  recordAttempt: (identifier, success = false) => {
    const attempts = rateLimiter.getAttempts(identifier);
    
    if (success) {
      secureStorage.remove(`login_attempts_${identifier}`);
      return { allowed: true, remaining: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS };
    } else {
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

export const validateUserData = (userData) => {
  if (!userData || typeof userData !== 'object') return false;
  
  const requiredFields = ['id', 'login', 'avatar_url'];
  const hasRequiredFields = requiredFields.every(field => userData[field]);
  
  if (!hasRequiredFields) return false;
  
  if (typeof userData.id !== 'number') return false;
  if (typeof userData.login !== 'string') return false;
  if (typeof userData.avatar_url !== 'string') return false;
  
  try {
    new URL(userData.avatar_url);
  } catch {
    return false;
  }
  
  return true;
};

export const validateAuthToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  
  try {
    const decoded = atob(token);
    const userData = JSON.parse(decoded);
    
    if (!validateUserData(userData)) {
      throw new Error('Invalid user data structure');
    }
    
    return userData;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
};

export const cspHelpers = {
  generateNonce: () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, array));
  },

  isAllowedURL: (url) => {
    try {
      const urlObj = new URL(url);
      
      if (urlObj.hostname === 'github.com' || urlObj.hostname === 'api.github.com') {
        return true;
      }
      
      if (urlObj.hostname === 'avatars.githubusercontent.com' || urlObj.hostname === 'ui-avatars.com') {
        return true;
      }
      
      if (SECURITY_CONFIG.ALLOWED_DOMAINS.includes(urlObj.hostname)) {
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  }
};

export const secureAdminCheck = (user) => {
  if (!user || !validateUserData(user)) return false;
  
  if (!isAdmin(user)) return false;
  
  const storedUser = secureStorage.get('user');
  if (!storedUser || storedUser.id !== user.id || storedUser.login !== user.login) {
    return false;
  }
  
  return true;
};

export const sessionSecurity = {
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
      canvas: canvas.toDataURL(),
      userAgent: navigator.userAgent.substring(0, 100)
    };
  },

  validateFingerprint: (stored) => {
    const current = sessionSecurity.generateFingerprint();
    
    const criticalMatch = 
      stored.language === current.language &&
      stored.canvas === current.canvas;
    
    return criticalMatch;
  }
};

export const secureErrorHandler = (error, context = 'Unknown') => {
  const sanitizedError = {
    message: error.message || 'Unknown error',
    context: context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent.substring(0, 50)
  };
  
  console.error('Security Error:', sanitizedError);
  
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