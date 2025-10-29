import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  const CACHE_KEY = 'vinsmoke_app_data';

  // Check if cache is valid
  const isCacheValid = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return false;

      const { timestamp } = JSON.parse(cached);
      return Date.now() - timestamp < CACHE_DURATION;
    } catch {
      return false;
    }
  };

  // Get cached data
  const getCachedData = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data: cachedData, timestamp } = JSON.parse(cached);
      const remainingTime = Math.round((timestamp + CACHE_DURATION - Date.now()) / 60000);
      
      console.log(`📦 Using cached data (${remainingTime}min remaining)`);
      return cachedData;
    } catch {
      return null;
    }
  };

  // Save data to cache
  const setCachedData = (newData) => {
    try {
      const cacheData = {
        data: newData,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('💾 Data cached for 30 minutes');
    } catch (error) {
      console.error('Cache save error:', error);
    }
  };

  // Fetch all data from backend
  const fetchAllData = async (forceRefresh = false) => {
    // Use cache if valid and not forcing refresh
    if (!forceRefresh && isCacheValid()) {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        setLastFetch(Date.now());
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🌐 Fetching all app data...');
      const response = await fetch(API_ENDPOINTS.publicData);
      const result = await response.json();

      if (result.success) {
        setData(result);
        setCachedData(result);
        setLastFetch(Date.now());
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Data fetch error:', err);
      setError(err.message);
      
      // Try to use stale cache as fallback
      const cachedData = getCachedData();
      if (cachedData) {
        console.log('📦 Using stale cache as fallback');
        setData(cachedData);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Refresh data
  const refreshData = () => {
    fetchAllData(true);
  };

  // Clear cache
  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    console.log('🗑️ Cache cleared');
  };

  const value = {
    // Data
    faqs: data?.faqs || [],
    plugins: data?.plugins || [],
    categories: data?.categories || ['All'],
    
    // State
    loading,
    error,
    lastFetch,
    
    // Actions
    refreshData,
    clearCache,
    
    // Cache info
    isCacheValid: isCacheValid(),
    cacheAge: lastFetch ? Math.round((Date.now() - lastFetch) / 60000) : null
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};