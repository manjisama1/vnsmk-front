import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Github, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { secureAdminCheck, rateLimiter } from '@/utils/security';

const AdminGuard = ({ children }) => {
  const { user, startGitHubLogin } = useAuth();

  // Check for rate limiting
  const isLocked = rateLimiter.isLocked('github_login');
  const attempts = rateLimiter.getAttempts('github_login');

  // Show rate limit warning if locked
  if (isLocked) {
    const lockoutEnd = attempts.lastAttempt + (15 * 60 * 1000); // 15 minutes
    const remainingTime = Math.ceil((lockoutEnd - Date.now()) / 60000);
    
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-md">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Account Temporarily Locked</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-red-700">
              Too many failed login attempts. Please try again in {remainingTime} minutes.
            </p>
            <div className="text-sm text-red-600 bg-red-100 p-3 rounded-md">
              <p><strong>Failed Attempts:</strong> {attempts.count}/5</p>
              <p><strong>Try Again:</strong> {remainingTime} minutes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-md">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-red-700">
              Please login with GitHub to access the admin panel.
            </p>
            <Button
              onClick={startGitHubLogin}
              className="w-full bg-[#24292e] hover:bg-[#1a1e22] text-white"
            >
              <Github className="w-4 h-4 mr-2" />
              Login with GitHub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is admin with enhanced security
  if (!secureAdminCheck(user)) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-md">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-orange-800">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-orange-700">
              You don't have admin privileges to access this panel.
            </p>
            <div className="text-sm text-orange-600 bg-orange-100 p-3 rounded-md">
              <p><strong>Current User:</strong> {user.name || user.login}</p>
              <p><strong>Required:</strong> Admin privileges</p>
            </div>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="w-full"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is admin, render the admin panel
  return children;
};

export default AdminGuard;