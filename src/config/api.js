export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'http://localhost:8080' : 'https://vnsmk-back.onrender.com');

export const SOCKET_URL = API_BASE_URL;

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/api/health`,
  
  session: {
    qr: `${API_BASE_URL}/api/session/qr`,
    pairing: `${API_BASE_URL}/api/session/pairing`,
    get: (sessionId) => `${API_BASE_URL}/api/session/${sessionId}`,
    delete: (sessionId) => `${API_BASE_URL}/api/session/${sessionId}`,
    files: (sessionId) => `${API_BASE_URL}/api/session/${sessionId}/files`,
    fileList: (sessionId) => `${API_BASE_URL}/api/session/${sessionId}/filelist`,
    downloadFile: (sessionId, fileName) => `${API_BASE_URL}/api/session/${sessionId}/file/${fileName}`
  },
  
  plugins: `${API_BASE_URL}/api/plugins`,
  faqs: `${API_BASE_URL}/api/faqs`,
  publicData: `${API_BASE_URL}/api/public-data`,
  
  admin: {
    data: `${API_BASE_URL}/api/admin-data`,
    stats: `${API_BASE_URL}/api/admin/stats`,
    sessions: `${API_BASE_URL}/api/admin/sessions`,
    plugins: `${API_BASE_URL}/api/admin/plugins`,
    faqs: `${API_BASE_URL}/api/admin/faqs`,
    support: `${API_BASE_URL}/api/admin/support`
  },
  
  auth: {
    github: `${API_BASE_URL}/auth/github`
  }
};

export default {
  API_BASE_URL,
  SOCKET_URL,
  API_ENDPOINTS
};