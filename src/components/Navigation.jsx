import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquare, Plug, HelpCircle, HeadphonesIcon, Home, User, Github, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Navigation = () => {
  const { user, showLogin, setShowLogin, logout, startGitHubLogin } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Determine current page from URL
  const getCurrentPage = () => {
    if (searchParams.get('manji') === 'admin') return 'admin';
    if (location.pathname === '/session') return 'session';
    if (location.pathname === '/plugins') return 'plugins';
    if (location.pathname === '/faq') return 'faq';
    if (location.pathname === '/support') return 'support';
    return 'home';
  };

  const currentPage = getCurrentPage();



  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'session', label: 'Session', icon: MessageSquare, path: '/session' },
    { id: 'plugins', label: 'Plugins', icon: Plug, path: '/plugins' },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, path: '/faq' },
    { id: 'support', label: 'Support', icon: HeadphonesIcon, path: '/support' },
  ];



  const handleLogout = () => {
    logout();
    setShowProfile(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="Vinsmoke Bot Logo"
                className="w-8 h-8"
                onError={(e) => {
                  // Fallback to icon if logo fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-8 h-8 bg-primary rounded-lg items-center justify-center hidden">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <span className="text-lg font-bold text-foreground">Vinsmoke</span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? 'default' : 'ghost'}
                  className={`transition-all duration-300 ${currentPage === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  asChild
                >
                  <Link to={item.path}>
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}

            {/* Profile Button */}
            <div className="ml-4">
              {user ? (
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full p-0"
                  onClick={() => setShowProfile(true)}
                >
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.login)}&background=6366f1&color=fff`;
                    }}
                  />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="h-8 w-8 rounded-full p-0"
                  onClick={() => setShowLogin(true)}
                >
                  <User className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? 'default' : 'ghost'}
                  size="sm"
                  className={currentPage === item.id ? 'bg-primary' : ''}
                  asChild
                >
                  <Link to={item.path}>
                    <Icon className="w-4 h-4" />
                  </Link>
                </Button>
              );
            })}

            {/* Mobile Profile Button */}
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className="p-0"
                onClick={() => setShowProfile(true)}
              >
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="h-6 w-6 rounded-full"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.login)}&background=6366f1&color=fff`;
                  }}
                />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLogin(true)}
              >
                <User className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>
              Manage your account settings
            </DialogDescription>
          </DialogHeader>
          {user && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <img
                src={user.avatar_url}
                alt={user.name}
                className="h-20 w-20 rounded-full border-2 border-border"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.login)}&background=6366f1&color=fff&size=80`;
                }}
              />
              <div className="text-center">
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">@{user.login}</p>
              </div>
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(user.html_url, '_blank')}
                >
                  <Github className="w-4 h-4 mr-2" />
                  View GitHub
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              Sign in with GitHub to access all features
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Github className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Welcome to Vinsmoke Bot</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Login with GitHub to add plugins, like content, and access personalized features.
              </p>
            </div>
            <Button
              onClick={startGitHubLogin}
              className="w-full bg-[#24292e] hover:bg-[#1a1e22] text-white"
            >
              <Github className="w-4 h-4 mr-2" />
              Continue with GitHub
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navigation;