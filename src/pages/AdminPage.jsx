import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Database, MessageSquare, HelpCircle, Shield, Activity } from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import { AdminDataProvider, useAdminData } from '@/contexts/AdminDataContext';
import SessionManagement from '@/components/admin/SessionManagement';
import PluginManagement from '@/components/admin/PluginManagement';
import FAQManagement from '@/components/admin/FAQManagement';
import SupportManagement from '@/components/admin/SupportManagement';

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState('sessions');
  const { stats, refreshData } = useAdminData();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Admin Panel</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Complete management dashboard for Vinsmoke Bot
        </p>
      </div>

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
          <SessionManagement onStatsUpdate={refreshData} />
        </TabsContent>

        <TabsContent value="plugins">
          <PluginManagement onStatsUpdate={refreshData} />
        </TabsContent>

        <TabsContent value="faqs">
          <FAQManagement onStatsUpdate={refreshData} />
        </TabsContent>

        <TabsContent value="support">
          <SupportManagement onStatsUpdate={refreshData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const AdminPage = () => {
  return (
    <AdminGuard>
      <AdminDataProvider>
        <AdminContent />
      </AdminDataProvider>
    </AdminGuard>
  );
};

export default AdminPage;