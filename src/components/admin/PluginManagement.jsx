import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, Search, RefreshCw, Check, X, Eye, Calendar, User, Heart, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/utils/adminApi';
import { useAdminData } from '@/contexts/AdminDataContext';

const PluginManagement = ({ onStatsUpdate }) => {
  const { plugins, loading, refreshData, updatePlugin, deletePlugin } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const updatePluginStatus = (pluginId, status) => {
    updatePlugin(pluginId, { status });
    toast.success(`Plugin ${status}! Click "Save Changes" to apply.`);
  };

  const handleDeletePlugin = (pluginId) => {
    if (!confirm('Are you sure you want to delete this plugin? Click "Save Changes" to apply the deletion.')) return;

    deletePlugin(pluginId);
    toast.success('Plugin marked for deletion! Click "Save Changes" to apply.');
  };

  const downloadPluginData = () => {
    try {
      const dataStr = JSON.stringify(plugins, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plugins-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Plugin data downloaded');
    } catch (error) {
      console.error('Error downloading plugin data:', error);
      toast.error('Error downloading plugin data.');
    }
  };

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || plugin.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'sticker': return 'bg-blue-100 text-blue-800';
      case 'media': return 'bg-purple-100 text-purple-800';
      case 'fun': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Button onClick={refreshData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={downloadPluginData}>
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Plugins List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading plugins...</p>
            </CardContent>
          </Card>
        ) : filteredPlugins.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Eye className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery || filterStatus !== 'all' ? 'No plugins found matching your criteria' : 'No plugins found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPlugins.map((plugin) => (
            <Card key={plugin.id} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{plugin.name}</CardTitle>
                      <Badge className={getStatusColor(plugin.status)}>
                        {plugin.status || 'pending'}
                      </Badge>
                      <Badge className={getTypeColor(plugin.type)}>
                        {plugin.type}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{plugin.description}</p>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {plugin.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updatePluginStatus(plugin.id, 'approved')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updatePluginStatus(plugin.id, 'rejected')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePlugin(plugin.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Author</p>
                      <p className="text-muted-foreground">{plugin.author}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Likes</p>
                      <p className="text-muted-foreground">{plugin.likes || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Created</p>
                      <p className="text-muted-foreground">
                        {plugin.createdAt ? new Date(plugin.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Gist Link</p>
                      <a 
                        href={plugin.gistLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-xs"
                      >
                        View Code
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="font-medium">{filteredPlugins.length}</p>
              <p className="text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-yellow-600">
                {filteredPlugins.filter(p => p.status === 'pending').length}
              </p>
              <p className="text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-green-600">
                {filteredPlugins.filter(p => p.status === 'approved').length}
              </p>
              <p className="text-muted-foreground">Approved</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-red-600">
                {filteredPlugins.filter(p => p.status === 'rejected').length}
              </p>
              <p className="text-muted-foreground">Rejected</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginManagement;