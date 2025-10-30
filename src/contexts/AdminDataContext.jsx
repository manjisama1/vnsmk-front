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
  const [pendingChanges, setPendingChanges] = useState({
    plugins: {},
    faqs: {},
    sessions: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fetchAllAdminData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await adminApi.getBulkAdminData();

      if (result.success) {
        setData({
          stats: result.stats || { totalSessions: 0, totalPlugins: 0, pendingPlugins: 0, totalFAQs: 0 },
          sessions: result.sessions || [],
          plugins: result.plugins || [],
          faqs: result.faqs || []
        });
        setPendingChanges({ plugins: {}, faqs: {}, sessions: {} });
        setHasUnsavedChanges(false);
      } else {
        throw new Error(result.error || 'Failed to fetch admin data');
      }
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

  const updatePlugin = (pluginId, updates) => {
    setPendingChanges(prev => ({
      ...prev,
      plugins: {
        ...prev.plugins,
        [pluginId]: { ...prev.plugins[pluginId], ...updates }
      }
    }));
    setHasUnsavedChanges(true);
  };

  const updateFAQ = (faqId, updates) => {
    setPendingChanges(prev => ({
      ...prev,
      faqs: {
        ...prev.faqs,
        [faqId]: { ...prev.faqs[faqId], ...updates }
      }
    }));
    setHasUnsavedChanges(true);
  };

  const deletePlugin = (pluginId) => {
    setPendingChanges(prev => ({
      ...prev,
      plugins: {
        ...prev.plugins,
        [pluginId]: { ...prev.plugins[pluginId], _deleted: true }
      }
    }));
    setHasUnsavedChanges(true);
  };

  const deleteFAQ = (faqId) => {
    setPendingChanges(prev => ({
      ...prev,
      faqs: {
        ...prev.faqs,
        [faqId]: { ...prev.faqs[faqId], _deleted: true }
      }
    }));
    setHasUnsavedChanges(true);
  };

  const addFAQ = (faqData) => {
    const tempId = `temp_${Date.now()}`;
    setPendingChanges(prev => ({
      ...prev,
      faqs: {
        ...prev.faqs,
        [tempId]: { ...faqData, _isNew: true }
      }
    }));
    setHasUnsavedChanges(true);
  };

  const saveAllChanges = async () => {
    try {
      setLoading(true);

      const changes = [];

      Object.entries(pendingChanges.plugins).forEach(([id, pluginChanges]) => {
        if (pluginChanges._deleted) {
          changes.push({ type: 'deletePlugin', id });
        } else {
          changes.push({ type: 'updatePlugin', id, data: pluginChanges });
        }
      });

      Object.entries(pendingChanges.faqs).forEach(([id, faqChanges]) => {
        if (faqChanges._deleted) {
          changes.push({ type: 'deleteFAQ', id });
        } else if (faqChanges._isNew) {
          changes.push({ type: 'addFAQ', data: faqChanges });
        } else {
          changes.push({ type: 'updateFAQ', id, data: faqChanges });
        }
      });

      await adminApi.saveBulkChanges(changes);
      await fetchAllAdminData();

      return true;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const discardChanges = () => {
    setPendingChanges({ plugins: {}, faqs: {}, sessions: {} });
    setHasUnsavedChanges(false);
  };

  const getPluginWithChanges = (pluginId) => {
    const original = data.plugins.find(p => p.id === pluginId);
    const changes = pendingChanges.plugins[pluginId];
    return changes ? { ...original, ...changes } : original;
  };

  const getFAQWithChanges = (faqId) => {
    const original = data.faqs.find(f => f.id === faqId);
    const changes = pendingChanges.faqs[faqId];
    return changes ? { ...original, ...changes } : original;
  };

  const getAllPluginsWithChanges = () => {
    return data.plugins
      .map(plugin => getPluginWithChanges(plugin.id))
      .filter(plugin => !pendingChanges.plugins[plugin.id]?._deleted)
      .concat(
        Object.entries(pendingChanges.plugins)
          .filter(([_, changes]) => changes._isNew)
          .map(([id, changes]) => ({ ...changes, id }))
      );
  };

  const getAllFAQsWithChanges = () => {
    return data.faqs
      .map(faq => getFAQWithChanges(faq.id))
      .filter(faq => !pendingChanges.faqs[faq.id]?._deleted)
      .concat(
        Object.entries(pendingChanges.faqs)
          .filter(([_, changes]) => changes._isNew)
          .map(([id, changes]) => ({ ...changes, id }))
      );
  };

  const value = {
    ...data,
    loading,
    error,
    hasUnsavedChanges,
    refreshData,
    updatePlugin,
    updateFAQ,
    deletePlugin,
    deleteFAQ,
    addFAQ,
    saveAllChanges,
    discardChanges,
    getPluginWithChanges,
    getFAQWithChanges,
    getAllPluginsWithChanges,
    getAllFAQsWithChanges,
    plugins: getAllPluginsWithChanges(),
    faqs: getAllFAQsWithChanges()
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};