import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback = () => {
  const { handleAuthCallback } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (token) {
      handleAuthCallback(token);
      // Redirect to plugins page after successful login
      setTimeout(() => {
        window.location.href = '/plugins';
      }, 1000);
    } else if (error) {
      console.error('OAuth error:', error);
      // Redirect to home page on error
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  }, [handleAuthCallback]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Completing authentication...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;