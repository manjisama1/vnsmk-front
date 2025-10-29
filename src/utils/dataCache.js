// Data Caching Utility with 30-minute expiration
class DataCache {
  constructor() {
    this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
    this.CACHE_KEYS = {
      PUBLIC_DATA: 'vinsmoke_public_data',
      ADMIN_DATA: 'vinsmoke_admin_data',
      USER_DATA: 'vinsmoke_user_data'
    };
  }

  // Set data with timestamp
  setCache(key, data) {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expires: Date.now() + this.CACHE_DURATION
    };
    
    try {
      localStorage.setItem(key, JSON.stringify(cacheData));
      console.log(`📦 Cached ${key} for 30 minutes`);
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  // Get data if not expired
  getCache(key) {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const now = Date.now();

      // Check if expired
      if (now > cacheData.expires) {
        localStorage.removeItem(key);
        console.log(`⏰ Cache expired for ${key}`);
        return null;
      }

      const remainingTime = Math.round((cacheData.expires - now) / 60000);
      console.log(`✅ Using cached ${key} (${remainingTime}min remaining)`);
      return cacheData.data;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      localStorage.removeItem(key);
      return null;
    }
  }

  // Clear specific cache
  clearCache(key) {
    localStorage.removeItem(key);
    console.log(`🗑️ Cleared cache for ${key}`);
  }

  // Clear all caches
  clearAllCache() {
    Object.values(this.CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🗑️ Cleared all caches');
  }

  // Check if cache exists and is valid
  isCacheValid(key) {
    const cached = this.getCache(key);
    return cached !== null;
  }

  // Get cache info for debugging
  getCacheInfo(key) {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return { exists: false };

      const cacheData = JSON.parse(cached);
      const now = Date.now();
      const remainingTime = Math.max(0, cacheData.expires - now);

      return {
        exists: true,
        expired: now > cacheData.expires,
        remainingTime: Math.round(remainingTime / 60000),
        size: new Blob([cached]).size
      };
    } catch {
      return { exists: false, error: true };
    }
  }
}

// Create singleton instance
const dataCache = new DataCache();

// Public API functions
export const setPublicDataCache = (data) => {
  dataCache.setCache(dataCache.CACHE_KEYS.PUBLIC_DATA, data);
};

export const getPublicDataCache = () => {
  return dataCache.getCache(dataCache.CACHE_KEYS.PUBLIC_DATA);
};

export const setAdminDataCache = (data) => {
  dataCache.setCache(dataCache.CACHE_KEYS.ADMIN_DATA, data);
};

export const getAdminDataCache = () => {
  return dataCache.getCache(dataCache.CACHE_KEYS.ADMIN_DATA);
};

export const clearPublicCache = () => {
  dataCache.clearCache(dataCache.CACHE_KEYS.PUBLIC_DATA);
};

export const clearAdminCache = () => {
  dataCache.clearCache(dataCache.CACHE_KEYS.ADMIN_DATA);
};

export const clearAllCache = () => {
  dataCache.clearAllCache();
};

export const getCacheInfo = () => {
  return {
    publicData: dataCache.getCacheInfo(dataCache.CACHE_KEYS.PUBLIC_DATA),
    adminData: dataCache.getCacheInfo(dataCache.CACHE_KEYS.ADMIN_DATA)
  };
};

export default dataCache;