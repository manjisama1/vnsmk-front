import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import './index.css';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { LikeProvider } from './contexts/LikeContext';
import Navigation from './components/Navigation';
import SessionPage from './pages/SessionPage';
import PluginsPage from './pages/PluginsPage';
import FAQPage from './pages/FAQPage';
import SupportPage from './pages/SupportPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import { toast } from 'sonner';
import { isAdmin } from '@/config/admin';
import { applySecurityHeaders } from '@/utils/csp';
import { secureStorage } from '@/utils/security';

const AppContent = () => {
  const { handleAuthCallback, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const processedTokenRef = useRef(null);

  useEffect(() => {
    // Initialize security features
    applySecurityHeaders();
    
    // Handle OAuth callback and admin access
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const state = searchParams.get('state');
    const manji = searchParams.get('manji');
    

    
    if (manji === 'admin') {
      // Store admin request to handle after auth context loads
      sessionStorage.setItem('pendingAdminAccess', 'true');
      // Clean up URL immediately but stay on current path
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('manji');
      window.history.replaceState({}, document.title, newUrl.pathname + newUrl.search);
    } else if (token && processedTokenRef.current !== token) {
      // Mark this token as processed to prevent duplicate processing
      processedTokenRef.current = token;
      
      handleAuthCallback(token, state);
      
      // Clean up URL parameters immediately to prevent repeated calls
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('token');
      newUrl.searchParams.delete('state');
      window.history.replaceState({}, document.title, newUrl.pathname + newUrl.search);
      
      // Stay on current page after login (don't redirect)
    } else if (error) {
      console.error('OAuth error:', error);
      
      // Show appropriate error message
      if (error === 'github_api_error') {
        toast.error('GitHub authentication failed. Please try again later.');
      } else if (error === 'access_denied') {
        toast.error('GitHub access was denied. Please try again.');
      } else {
        toast.error('Authentication failed. Please try again.');
      }
      
      // Clean up URL but stay on current path
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('token');
      newUrl.searchParams.delete('error');
      newUrl.searchParams.delete('state');
      window.history.replaceState({}, document.title, newUrl.pathname + newUrl.search);
    }
  }, [handleAuthCallback, navigate, location.search]); // Use location.search to detect URL changes

  // Handle admin access after auth context is loaded
  useEffect(() => {
    const pendingAdminAccess = sessionStorage.getItem('pendingAdminAccess');
    
    if (pendingAdminAccess && !loading) {
      sessionStorage.removeItem('pendingAdminAccess');
      
      if (user) {
        if (isAdmin(user)) {
          // Navigate to admin panel
          navigate('/?manji=admin', { replace: true });
          toast.success(`Welcome to admin panel, ${user.name || user.login}!`);
        } else {
          toast.error(`Access denied. Current user: ${user.login}. Admin privileges required.`);
          navigate('/', { replace: true });
        }
      } else {
        toast.error('Please login first to access admin panel.');
        navigate('/', { replace: true });
      }
    }
  }, [user, loading, navigate, location.pathname, searchParams]);

  if (loading) {
    return (
      <div className="App min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        {/* Show Admin Panel when manji=admin query param is present, otherwise show regular routes */}
        {searchParams.get('manji') === 'admin' ? (
          <AdminPage />
        ) : (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/session" element={<SessionPage />} />
            <Route path="/plugins" element={<PluginsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        )}
      </main>
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <LikeProviderWrapper>
            <AppContent />
          </LikeProviderWrapper>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
};

const LikeProviderWrapper = ({ children }) => {
  const { refreshData } = useData();
  
  return (
    <LikeProvider onDataRefresh={refreshData}>
      {children}
    </LikeProvider>
  );
}

export default App;