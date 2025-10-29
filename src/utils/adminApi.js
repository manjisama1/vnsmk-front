// Admin API utility functions with enhanced security
import { secureAdminCheck, secureStorage, secureErrorHandler, validateUserData } from '@/utils/security';
import { API_BASE_URL } from '@/config/api';

const getAuthHeaders = () => {
  try {
    // Get user data from secure storage
    const userData = secureStorage.get('user');
    if (!userData) {
      throw new Error('Not authenticated');
    }

    // Validate user data structure
    if (!validateUserData(userData)) {
      throw new Error('Invalid user data');
    }

    // Check admin privileges with enhanced security
    if (!secureAdminCheck(userData)) {
      throw new Error('Admin privileges required');
    }

    // Create secure token from user data
    const token = btoa(JSON.stringify({
      id: userData.id,
      login: userData.login,
      timestamp: Date.now()
    }));
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Requested-With': 'XMLHttpRequest' // CSRF protection
    };
  } catch (error) {
    throw new Error(secureErrorHandler(error, 'Auth Headers'));
  }
};

// Secure API wrapper
const secureApiCall = async (endpoint, options = {}) => {
  try {
    // Construct full URL using API_BASE_URL
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });

    // Check if response is ok
    if (!response.ok) {
      if (response.status === 401) {
        // Clear storage and redirect to login
        secureStorage.clear();
        window.location.href = '/?manji=admin';
        throw new Error('Authentication expired');
      }
      if (response.status === 403) {
        throw new Error('Access denied');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Validate content type for JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
  } catch (error) {
    throw new Error(secureErrorHandler(error, `API Call: ${endpoint}`));
  }
};

export const adminApi = {
  // Stats
  async getStats() {
    return await secureApiCall('/api/admin/stats');
  },

  // Sessions
  async getSessions() {
    return await secureApiCall('/api/admin/sessions');
  },

  async deleteSession(sessionId) {
    // Validate sessionId
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('Invalid session ID');
    }
    return await secureApiCall(`/api/admin/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'DELETE'
    });
  },

  async downloadSessions() {
    return await secureApiCall('/api/admin/sessions/download');
  },

  // Plugins
  async getPlugins() {
    return await secureApiCall('/api/admin/plugins');
  },

  async updatePluginStatus(pluginId, status) {
    // Validate inputs
    if (!pluginId || typeof pluginId !== 'string') {
      throw new Error('Invalid plugin ID');
    }
    if (!['approved', 'pending', 'rejected'].includes(status)) {
      throw new Error('Invalid status');
    }
    
    return await secureApiCall(`/api/admin/plugins/${encodeURIComponent(pluginId)}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  async deletePlugin(pluginId) {
    if (!pluginId || typeof pluginId !== 'string') {
      throw new Error('Invalid plugin ID');
    }
    return await secureApiCall(`/api/admin/plugins/${encodeURIComponent(pluginId)}`, {
      method: 'DELETE'
    });
  },

  async downloadPlugins() {
    return await secureApiCall('/api/admin/plugins/download');
  },

  // Support
  async getSupportData() {
    return await secureApiCall('/api/admin/support');
  },

  async updateSupportData(data) {
    // Validate data structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid support data');
    }
    
    return await secureApiCall('/api/admin/support', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // FAQs
  async getFAQs() {
    return await secureApiCall('/api/admin/faqs');
  },

  async addFAQ(faqData) {
    // Validate FAQ data
    if (!faqData || typeof faqData !== 'object') {
      throw new Error('Invalid FAQ data');
    }
    if (!faqData.question || !faqData.answer || !faqData.category) {
      throw new Error('Missing required FAQ fields');
    }
    
    return await secureApiCall('/api/admin/faqs', {
      method: 'POST',
      body: JSON.stringify(faqData)
    });
  },

  async updateFAQ(id, faqData) {
    // Validate inputs
    if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
      throw new Error('Invalid FAQ ID');
    }
    if (!faqData || typeof faqData !== 'object') {
      throw new Error('Invalid FAQ data');
    }
    
    return await secureApiCall(`/api/admin/faqs/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(faqData)
    });
  },

  async deleteFAQ(id) {
    if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
      throw new Error('Invalid FAQ ID');
    }
    return await secureApiCall(`/api/admin/faqs/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  async downloadFAQs() {
    return await secureApiCall('/api/admin/faqs/download');
  }
};

export default adminApi;