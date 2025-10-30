import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { toast } from 'sonner';

const LikeContext = createContext();

export const useLikes = () => {
  const context = useContext(LikeContext);
  if (!context) {
    throw new Error('useLikes must be used within a LikeProvider');
  }
  return context;
};

export const LikeProvider = ({ children }) => {
  const [pendingLikes, setPendingLikes] = useState({});
  const [processing, setProcessing] = useState(false);
  const timeoutRef = useRef(null);

  const BATCH_DELAY = 5 * 60 * 1000; // 5 minutes

  const addPendingLike = (pluginId, userId, isLiked) => {
    setPendingLikes(prev => ({
      ...prev,
      [pluginId]: { userId, isLiked, timestamp: Date.now() }
    }));

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      processPendingLikes();
    }, BATCH_DELAY);
  };

  const processPendingLikes = async () => {
    if (Object.keys(pendingLikes).length === 0) return;

    setProcessing(true);
    const likesToProcess = { ...pendingLikes };
    setPendingLikes({});

    try {
      const promises = Object.entries(likesToProcess).map(([pluginId, { userId, isLiked }]) =>
        fetch(`${API_ENDPOINTS.plugins}/${pluginId}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        })
      );

      await Promise.all(promises);
    } catch (error) {
      console.error('Error processing likes:', error);
      setPendingLikes(prev => ({ ...prev, ...likesToProcess }));
    } finally {
      setProcessing(false);
    }
  };

  const toggleLike = (pluginId, userId, currentlyLiked) => {
    addPendingLike(pluginId, userId, !currentlyLiked);
    return !currentlyLiked;
  };

  const getPendingLikeStatus = (pluginId) => {
    return pendingLikes[pluginId]?.isLiked;
  };

  const hasPendingLikes = () => {
    return Object.keys(pendingLikes).length > 0;
  };

  const getRemainingTime = () => {
    if (!timeoutRef.current) return 0;
    const oldestTimestamp = Math.min(...Object.values(pendingLikes).map(p => p.timestamp));
    const elapsed = Date.now() - oldestTimestamp;
    return Math.max(0, BATCH_DELAY - elapsed);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const value = {
    toggleLike,
    getPendingLikeStatus,
    hasPendingLikes,
    getRemainingTime,
    processing,
    pendingCount: Object.keys(pendingLikes).length
  };

  return (
    <LikeContext.Provider value={value}>
      {children}
    </LikeContext.Provider>
  );
};