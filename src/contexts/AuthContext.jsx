import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  secureStorage,
  validateUserData,
  validateAuthToken,
  rateLimiter,
  sessionSecurity,
  secureErrorHandler
} from '@/utils/security';
import { API_ENDPOINTS } from '@/config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const lastProcessedToken = useRef(null);

  // Load user from secure storage on app start
  useEffect(() => {
    try {
      const savedUser = secureStorage.get('user');

      if (savedUser) {
        // Basic validation only for now
        if (validateUserData(savedUser)) {
          // Restore user session without showing welcome message
          setUser(savedUser);
          rateLimiter.recordAttempt(savedUser.login, true); // Reset rate limiting
        } else {
          // Clear invalid data
          secureStorage.clear();
        }
      }
    } catch (error) {
      console.error('Error loading saved user:', error);
      // Clear potentially corrupted data
      secureStorage.clear();
    }
    setLoading(false);
  }, []);

  const login = (userData, showWelcome = true) => {
    try {
      // Basic validation
      if (!validateUserData(userData)) {
        throw new Error('Invalid user data');
      }

      // Store user data securely
      secureStorage.set('user', userData);

      // Record successful login for rate limiting
      rateLimiter.recordAttempt(userData.login, true);

      setUser(userData);
      setShowLogin(false);

      // Show welcome message for new logins with a small delay
      if (showWelcome) {
        setTimeout(() => {
          toast.success(`Welcome back, ${userData.name || userData.login}!`);
        }, 500); // Small delay to ensure page has settled
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const logout = () => {
    try {
      // Clear all secure storage
      secureStorage.clear();
      setUser(null);
      toast.success('Successfully logged out!');
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear even if there's an error
      setUser(null);
      secureStorage.clear();
      toast.success('Logged out!');
    }
  };

  const requireAuth = (callback) => {
    if (user && !loading) {
      callback();
    } else if (!loading) {
      setShowLogin(true);
    }
  };

  const startGitHubLogin = () => {
    try {
      // Check rate limiting before allowing login attempt
      const identifier = 'github_login';
      if (rateLimiter.isLocked(identifier)) {
        toast.error('Too many login attempts. Please try again later.');
        return;
      }

      // Redirect to backend GitHub OAuth route
      window.location.href = API_ENDPOINTS.auth.github;
    } catch (error) {
      console.error('GitHub Login Error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const handleAuthCallback = (token, state) => {
    // Prevent duplicate processing only if currently processing
    if (isProcessingAuth) {
      return;
    }

    // Check if we've already successfully processed this exact token
    if (lastProcessedToken.current === token && user) {
      return; // Already processed and user is logged in
    }

    lastProcessedToken.current = token;
    setIsProcessingAuth(true);

    try {
      // Validate and parse token
      const userData = validateAuthToken(token);
      if (!userData) {
        throw new Error('Invalid authentication token');
      }

      // Record successful login attempt
      rateLimiter.recordAttempt(userData.login, true);

      login(userData);
      setShowLogin(false);
    } catch (error) {
      console.error('Auth callback error:', error);

      // Record failed attempt if we have user info
      if (error.userData?.login) {
        rateLimiter.recordAttempt(error.userData.login, false);
      }

      toast.error('Authentication failed. Please try again.');
    } finally {
      // Reset processing flag after a short delay to ensure it doesn't get stuck
      setTimeout(() => setIsProcessingAuth(false), 100);
    }
  };

  const value = {
    user,
    showLogin,
    setShowLogin,
    login,
    logout,
    requireAuth,
    startGitHubLogin,
    handleAuthCallback,
    loading,
    isProcessingAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};