import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Database, 
  Users, 
  MessageSquare, 
  HelpCircle, 
  Download,
  Shield,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/utils/adminApi';
import AdminGuard from '@/components/AdminGuard';

// Import admin components
import SessionManagement from '@/components/admin/SessionManagement';
import PluginManagement from '@/components/admin/PluginManagement';
import FAQManagement from '@/components/admin/FAQManagement';
import SupportManagement from '@/components/admin/SupportManagement';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('sessions');
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalPlugins: 0,
    pendingPlugins: 0,
    totalFAQs: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await adminApi.getStats();
      if (data.success !== false) {
        setStats(data);
      } else {
        toast.error(data.error || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch admin stats. Please check your permissions.');
    }
  };

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Admin Panel</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Complete management dashboard for Vinsmoke Bot
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Plugins</p>
                <p className="text-2xl font-bold">{stats.totalPlugins}</p>
              </div>
              <Database className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Plugins</p>
                <p className="text-2xl font-bold text-orange-500">{stats.pendingPlugins}</p>
              </div>
              <Settings className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total FAQs</p>
                <p className="text-2xl font-bold">{stats.totalFAQs}</p>
              </div>
              <HelpCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="plugins" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Plugins
          </TabsTrigger>
          <TabsTrigger value="faqs" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <SessionManagement onStatsUpdate={fetchStats} />
        </TabsContent>

        <TabsContent value="plugins">
          <PluginManagement onStatsUpdate={fetchStats} />
        </TabsContent>

        <TabsContent value="faqs">
          <FAQManagement onStatsUpdate={fetchStats} />
        </TabsContent>

        <TabsContent value="support">
          <SupportManagement onStatsUpdate={fetchStats} />
        </TabsContent>
      </Tabs>
      </div>
    </AdminGuard>
  );
};

export default AdminPage;