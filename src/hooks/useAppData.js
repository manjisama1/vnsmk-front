// Custom hook for managing app data with caching
import { useState, useEffect, useCallback } from 'react';
import { 
  getPublicDataCache, 
  setPublicDataCache, 
  getAdminDataCache, 
  setAdminDataCache,
  clearPublicCache,
  clearAdminCache 
} from '@/utils/dataCache';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/config/admin';

export const useAppData = () => {
  const { user } = useAuth();
  const [publicData, setPublicData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch public data (FAQs, Plugins)
  const fetchPublicData = useCallback(async (forceRefresh = false) => {
    try {
      // Try cache first unless force refresh
      if (!forceRefresh) {
        const cached = getPublicDataCache();
        if (cached) {
          setPublicData(cached);
          return cached;
        }
      }

      console.log('🌐 Fetching fresh public data...');
      const response = await fetch(API_ENDPOINTS.publicData);
      const data = await response.json();

      if (data.success) {
        setPublicDataCache(data);
        setPublicData(data);
        return data;
      } else {
        throw new Error(data.error || 'Failed to fetch public data');
      }
    } catch (err) {
      console.error('Public data fetch error:', err);
      setError(err.message);
      
      // Try to use stale cache as fallback
      const cached = getPublicDataCache();
      if (cached) {
        console.log('📦 Using stale cache as fallback');
        setPublicData(cached);
        return cached;
      }
      
      throw err;
    }
  }, []);

  // Fetch admin data
  const fetchAdminData = useCallback(async (forceRefresh = false) => {
    if (!user || !isAdmin(user)) return null;

    try {
      // Try cache first unless force refresh
      if (!forceRefresh) {
        const cached = getAdminDataCache();
        if (cached) {
          setAdminData(cached);
          return cached;
        }
      }

      console.log('👑 Fetching fresh admin data...');
      const response = await fetch(API_ENDPOINTS.admin.data, {
        headers: {
          'Authorization': `Bearer ${btoa(JSON.stringify(user))}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();

      if (data.success) {
        setAdminDataCache(data);
        setAdminData(data);
        return data;
      } else {
        throw new Error(data.error || 'Failed to fetch admin data');
      }
    } catch (err) {
      console.error('Admin data fetch error:', err);
      setError(err.message);
      throw err;
    }
  }, [user]);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Always fetch public data
        await fetchPublicData();

        // Fetch admin data if user is admin
        if (user && isAdmin(user)) {
          await fetchAdminData();
        }
      } catch (err) {
        console.error('Data initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [user, fetchPublicData, fetchAdminData]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await fetchPublicData(true); // Force refresh
      
      if (user && isAdmin(user)) {
        await fetchAdminData(true); // Force refresh
      }
    } catch (err) {
      console.error('Data refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, fetchPublicData, fetchAdminData]);

  // Clear cache and refresh
  const clearCacheAndRefresh = useCallback(async () => {
    clearPublicCache();
    clearAdminCache();
    await refreshData();
  }, [refreshData]);

  // Update local data after mutations
  const updatePublicData = useCallback((updater) => {
    setPublicData(current => {
      const updated = typeof updater === 'function' ? updater(current) : updater;
      setPublicDataCache(updated);
      return updated;
    });
  }, []);

  const updateAdminData = useCallback((updater) => {
    setAdminData(current => {
      const updated = typeof updater === 'function' ? updater(current) : updater;
      setAdminDataCache(updated);
      return updated;
    });
  }, []);

  return {
    // Data
    publicData,
    adminData,
    loading,
    error,
    
    // Actions
    refreshData,
    clearCacheAndRefresh,
    updatePublicData,
    updateAdminData,
    
    // Getters for specific data
    faqs: publicData?.faqs || [],
    plugins: publicData?.plugins || [],
    categories: publicData?.categories || [],
    
    // Admin specific
    adminStats: adminData?.stats || null,
    adminSessions: adminData?.sessions || [],
    adminFaqs: adminData?.faqs || [],
    adminPlugins: adminData?.plugins || []
  };
};

export default useAppData;