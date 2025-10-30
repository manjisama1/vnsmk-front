import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Filter, Plus, Search, Copy, Heart, MessageCircle, ExternalLink, Sticker, Image as ImageIcon, Smile, Github } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useLikes } from '@/contexts/LikeContext';
import { API_ENDPOINTS } from '@/config/api';

const PluginsPage = () => {
  const { user, requireAuth, showLogin, setShowLogin, startGitHubLogin, loading: authLoading } = useAuth();
  const { plugins, loading, refreshData } = useData();
  const { toggleLike, getPendingLikeStatus } = useLikes();
  
  const [filteredPlugins, setFilteredPlugins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('recent');
  const [statusFilter, setStatusFilter] = useState('all'); // all, approved, pending
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [backendError, setBackendError] = useState(false);

  // Form state for adding plugins
  const [newPlugin, setNewPlugin] = useState({
    name: '',
    description: '',
    type: '',
    gistLink: '',

  });

  const typeIcons = {
    sticker: Sticker,
    media: ImageIcon,
    fun: Smile,
  };

  const typeColors = {
    sticker: 'bg-blue-100 text-blue-800 border-blue-200',
    media: 'bg-green-100 text-green-800 border-green-200',
    fun: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  // Data is now loaded automatically via DataProvider - no more API calls!
  
  useEffect(() => {
    filterAndSortPlugins();
  }, [plugins, searchTerm, typeFilter, sortFilter, statusFilter]);

  const filterAndSortPlugins = () => {
    let filtered = [...plugins];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(plugin =>
        plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plugin.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(plugin => plugin.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'approved') {
        filtered = filtered.filter(plugin => plugin.status === 'approved' || !plugin.status);
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(plugin => plugin.status === 'pending');
      }
    }

    // Apply sorting
    switch (sortFilter) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'old':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'liked':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'az':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredPlugins(filtered);
  };

  const handleAddPlugin = async (e) => {
    e.preventDefault();

    if (!newPlugin.name || !newPlugin.description || !newPlugin.type || !newPlugin.gistLink) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const pluginData = {
        ...newPlugin,
        author: user?.name || user?.login || 'Anonymous'
      };

      const response = await fetch(API_ENDPOINTS.plugins, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pluginData),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh data to get updated plugins list
        await refreshData();
        setNewPlugin({ name: '', description: '', type: '', gistLink: '' });
        setShowAddDialog(false);
        toast.success('Your plugin has been submitted! Wait for approval.', {
          duration: 5000
        });
      } else {
        throw new Error(data.error || 'Failed to add plugin');
      }
    } catch (error) {
      console.error('Add Plugin Error:', error);
      toast.error(error.message || 'Failed to add plugin');
    }
  };

  const handleLikePlugin = (pluginId) => {
    requireAuth(() => {
      if (!user) {
        return;
      }

      const plugin = plugins.find(p => p.id === pluginId);
      const currentlyLiked = plugin?.likedBy?.includes(user.id.toString()) || false;
      const pendingStatus = getPendingLikeStatus(pluginId);
      const actualStatus = pendingStatus !== undefined ? pendingStatus : currentlyLiked;
      
      toggleLike(pluginId, user.id.toString(), actualStatus);
      
      const newStatus = !actualStatus;
      toast.success(newStatus ? 'Plugin liked!' : 'Plugin unliked!');
    });
  };

  const copyGistLink = (gistUrl) => {
    navigator.clipboard.writeText(gistUrl);
    toast.success('Gist link copied to clipboard!');
  };

  const shareToWhatsApp = (pluginName, gistUrl) => {
    const message = `Check out this awesome plugin: ${pluginName}\n\nGist Link: ${gistUrl}\n\nInstall it on your Vinsmoke Bot!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getTypeColor = (type) => {
    return typeColors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading plugins...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex-1">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Plugin Library</h1>
            {plugins.filter(p => p.status === 'pending').length > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                {plugins.filter(p => p.status === 'pending').length} Pending
              </Badge>
            )}

          </div>
          <p className="text-lg text-muted-foreground">
            Discover and manage plugins to extend your bot's functionality
          </p>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search plugins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-base"
            />
          </div>
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter & Sort</SheetTitle>
                  <SheetDescription>
                    Customize how plugins are displayed
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <Label>Plugin Type</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="sticker">Stickers</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="fun">Fun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="approved">Approved Only</SelectItem>
                        <SelectItem value="pending">Pending Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select value={sortFilter} onValueChange={setSortFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="old">Most Old</SelectItem>
                        <SelectItem value="liked">Most Liked</SelectItem>
                        <SelectItem value="az">A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button
              className="bg-primary hover:bg-primary-hover flex-1 sm:flex-none"
              onClick={() => requireAuth(() => setShowAddDialog(true))}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Plugin
            </Button>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Plugin</DialogTitle>
                  <DialogDescription>
                    Share your custom plugin with the community. Your plugin will be reviewed by our team before being made available to all users.
                  </DialogDescription>
                </DialogHeader>
                

                <form onSubmit={handleAddPlugin} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Plugin Name *</Label>
                    <Input
                      id="name"
                      placeholder="My Awesome Plugin"
                      value={newPlugin.name}
                      onChange={(e) => setNewPlugin({ ...newPlugin, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what your plugin does..."
                      value={newPlugin.description}
                      onChange={(e) => setNewPlugin({ ...newPlugin, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={newPlugin.type}
                      onValueChange={(value) => setNewPlugin({ ...newPlugin, type: value })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select plugin type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sticker">Sticker</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="fun">Fun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gistLink">Gist Link *</Label>
                    <Input
                      id="gistLink"
                      type="url"
                      placeholder="https://gist.github.com/..."
                      value={newPlugin.gistLink}
                      onChange={(e) => setNewPlugin({ ...newPlugin, gistLink: e.target.value })}
                      required
                    />
                  </div>


                  <DialogFooter className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-primary hover:bg-primary-hover">
                      Add Plugin
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Plugins Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPlugins.map((plugin) => {
            const TypeIcon = typeIcons[plugin.type];
            const isPending = plugin.status === 'pending';
            const isApproved = plugin.status === 'approved' || !plugin.status;
            
            return (
              <Card 
                key={plugin.id} 
                className={`border-border transition-all duration-300 flex flex-col ${
                  isPending 
                    ? 'opacity-60 bg-muted/30 border-muted cursor-not-allowed' 
                    : 'hover:shadow-lg card-hover'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className={`text-lg ${isPending ? 'text-muted-foreground' : ''}`}>
                          {plugin.name}
                        </CardTitle>
                        {isPending && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                            Pending Approval
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">by {plugin.author}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getTypeColor(plugin.type)} border ${isPending ? 'opacity-60' : ''}`}>
                        {TypeIcon && <TypeIcon className="w-3 h-3 mr-1" />}
                        {plugin.type}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className={`text-sm ${isPending ? 'text-muted-foreground/70' : ''}`}>
                    {plugin.description}
                    {isPending && (
                      <span className="block text-xs text-yellow-600 mt-2 font-medium">
                        ⏳ This plugin is awaiting admin approval
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => !isPending && copyGistLink(plugin.gistLink)}
                        className={`text-xs ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isPending}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => !isPending && handleLikePlugin(plugin.id)}
                        className={`text-xs ${
                          isPending 
                            ? 'opacity-50 cursor-not-allowed' 
                            : (() => {
                                const currentlyLiked = user && plugin.likedBy && plugin.likedBy.includes(user.id.toString());
                                const pendingStatus = getPendingLikeStatus(plugin.id);
                                const actualStatus = pendingStatus !== undefined ? pendingStatus : currentlyLiked;
                                return actualStatus
                                  ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                  : '';
                              })()
                        }`}
                        disabled={isPending}
                      >
                        <Heart 
                          className={`w-3 h-3 mr-1 ${
                            (() => {
                              const currentlyLiked = user && plugin.likedBy && plugin.likedBy.includes(user.id.toString());
                              const pendingStatus = getPendingLikeStatus(plugin.id);
                              const actualStatus = pendingStatus !== undefined ? pendingStatus : currentlyLiked;
                              return actualStatus && !isPending ? 'fill-red-500 text-red-500' : '';
                            })()
                          }`} 
                        />
                        {plugin.likes}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => !isPending && shareToWhatsApp(plugin.name, plugin.gistLink)}
                        className={`text-xs ${
                          isPending 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                        }`}
                        disabled={isPending}
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        WhatsApp
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => !isPending && window.open(plugin.gistLink, '_blank')}
                      className={`text-xs ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isPending}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredPlugins.length === 0 && !loading && (
          <div className="text-center py-16">
            {backendError ? (
              // Maintenance message when backend is down
              <div>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Website Under Maintenance</h3>
                <p className="text-muted-foreground mb-4">
                  We're currently performing maintenance on our servers. Please check back later.
                </p>
                <p className="text-sm text-muted-foreground">
                  Sorry for the inconvenience. We'll be back online soon!
                </p>
              </div>
            ) : (
              // No plugins found message when backend is working
              <div>
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No plugins found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Login Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              Sign in with GitHub to add plugins and like content
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
    </div>
  );
};

export default PluginsPage;