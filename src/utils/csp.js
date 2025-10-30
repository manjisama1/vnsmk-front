export const CSP_CONFIG = {
  directives: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      'https://cdn.jsdelivr.net',
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:',
    ],
    'img-src': [
      "'self'",
      'data:',
      'https://avatars.githubusercontent.com',
      'https://ui-avatars.com',
      'https://github.com',
    ],
    'connect-src': [
      "'self'",
      'https://api.github.com',
      'https://github.com',
      'ws://localhost:*',
      'wss://localhost:*',
    ],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
  },

  generateHeader: () => {
    const directives = Object.entries(CSP_CONFIG.directives)
      .map(([key, values]) => {
        if (values.length === 0) return key;
        return `${key} ${values.join(' ')}`;
      })
      .join('; ');
    
    return directives;
  },

  applyMetaTag: () => {
    const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingMeta) {
      existingMeta.remove();
    }

    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = CSP_CONFIG.generateHeader();
    document.head.appendChild(meta);
  },

  isAllowedSource: (url, directive = 'default-src') => {
    try {
      const urlObj = new URL(url);
      const allowedSources = CSP_CONFIG.directives[directive] || CSP_CONFIG.directives['default-src'];
      
      return allowedSources.some(source => {
        if (source === "'self'") {
          return urlObj.origin === window.location.origin;
        }
        if (source.startsWith('https://')) {
          return urlObj.origin === source || urlObj.hostname.endsWith(source.replace('https://', ''));
        }
        return false;
      });
    } catch {
      return false;
    }
  }
};

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

export const applySecurityHeaders = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔒 Security Headers (should be set by server in production):', SECURITY_HEADERS);
    console.log('🔒 Content Security Policy:', CSP_CONFIG.generateHeader());
  }
};

export default {
  CSP_CONFIG,
  SECURITY_HEADERS,
  applySecurityHeaders
};