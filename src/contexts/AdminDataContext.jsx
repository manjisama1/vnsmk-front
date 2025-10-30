import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '@/utils/adminApi';

const AdminDataContext = createContext();

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};

export const AdminDataProvider = ({ children }) => {
  const [data, setData] = useState({
    stats: { totalSessions: 0, totalPlugins: 0, pendingPlugins: 0, totalFAQs: 0 },
    sessions: [],
    plugins: [],
    faqs: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllAdminData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [stats, sessions, plugins, faqs] = await Promise.all([
        adminApi.getStats(),
        adminApi.getSessions(),
        adminApi.getPlugins(),
        adminApi.getFAQs()
      ]);

      setData({
        stats: stats.success !== false ? stats : { totalSessions: 0, totalPlugins: 0, pendingPlugins: 0, totalFAQs: 0 },
        sessions: sessions.success !== false ? sessions.sessions || [] : [],
        plugins: plugins.success !== false ? plugins.plugins || [] : [],
        faqs: faqs.success !== false ? faqs.faqs || [] : []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const refreshData = () => {
    fetchAllAdminData();
  };

  const value = {
    ...data,
    loading,
    error,
    refreshData
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};