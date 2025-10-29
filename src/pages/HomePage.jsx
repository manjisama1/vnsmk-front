import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plug, HelpCircle, HeadphonesIcon, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/config/admin';

const HomePage = () => {
  const { user } = useAuth();

  const accessAdminPanel = () => {
    if (user && isAdmin(user)) {
      window.location.href = '/?manji=admin';
    } else {
      window.location.href = '/?manji=admin';
    }
  };
  const navigationOptions = [
    {
      id: 'session',
      icon: MessageSquare,
      title: 'Session',
      description: 'Connect your WhatsApp with QR code or pairing code',
      path: '/session',
    },
    {
      id: 'plugins',
      icon: Plug,
      title: 'Plugins',
      description: 'Browse and manage plugins to extend bot functionality',
      path: '/plugins',
    },
    {
      id: 'faq',
      icon: HelpCircle,
      title: 'FAQ',
      description: 'Find answers to frequently asked questions',
      path: '/faq',
    },
    {
      id: 'support',
      icon: HeadphonesIcon,
      title: 'Support',
      description: 'Get help and contact our support team',
      path: '/support',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-6">
            <span className="text-sm font-medium text-primary px-3 py-1">Vinsmoke Bot Manager</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Manage Your WhatsApp Bot
            <span className="block text-primary mt-2">Like a Pro</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Complete control panel for your Vinsmoke WhatsApp bot with session management, plugin ecosystem, and powerful customization options.
          </p>
        </div>

        {/* Navigation Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {navigationOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Link key={option.id} to={option.path}>
                <Card className="border-border hover:shadow-lg transition-all duration-300 card-hover cursor-pointer group">
                
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors duration-300">
                    {option.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {option.description}
                  </CardDescription>
                </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Admin Access Button (only for admins) */}
        {user && isAdmin(user) && (
          <div className="text-center mt-12">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-2 text-primary">Admin Access</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Welcome, {user.name || user.login}! You have admin privileges.
              </p>
              <Button 
                onClick={accessAdminPanel} 
                className="w-full bg-primary hover:bg-primary-hover"
              >
                <Shield className="w-4 h-4 mr-2" />
                Open Admin Panel
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;