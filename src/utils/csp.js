// Content Security Policy Configuration
export const CSP_CONFIG = {
  // Define allowed sources for different content types
  directives: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Required for Vite in development
      'https://cdn.jsdelivr.net', // For any CDN scripts if needed
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for styled-components and CSS-in-JS
      'https://fonts.googleapis.com',
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:', // For base64 encoded fonts
    ],
    'img-src': [
      "'self'",
      'data:', // For base64 images
      'https://avatars.githubusercontent.com', // GitHub avatars
      'https://ui-avatars.com', // Fallback avatars
      'https://github.com', // GitHub images
    ],
    'connect-src': [
      "'self'",
      'https://api.github.com', // GitHub API
      'https://github.com', // GitHub OAuth
      'ws://localhost:*', // WebSocket for development
      'wss://localhost:*', // Secure WebSocket for development
    ],
    'frame-src': ["'none'"], // Prevent framing
    'object-src': ["'none'"], // Prevent object/embed
    'base-uri': ["'self'"], // Restrict base URI
    'form-action': ["'self'"], // Restrict form submissions
    'frame-ancestors': ["'none'"], // Prevent being framed
    'upgrade-insecure-requests': [], // Upgrade HTTP to HTTPS in production
  },

  // Generate CSP header string
  generateHeader: () => {
    const directives = Object.entries(CSP_CONFIG.directives)
      .map(([key, values]) => {
        if (values.length === 0) return key;
        return `${key} ${values.join(' ')}`;
      })
      .join('; ');
    
    return directives;
  },

  // Apply CSP via meta tag (fallback method)
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

  // Validate if a URL is allowed by CSP
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

// Security headers configuration
export const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

// Apply security headers (for development testing)
export const applySecurityHeaders = () => {
  // Note: In production, these should be set by the server
  // This is mainly for development awareness
  
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