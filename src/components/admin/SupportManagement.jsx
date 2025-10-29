import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  RefreshCw, 
  Instagram,
  Mail,
  MessageCircle,
  Github,
  Globe,
  Copy,
  Check,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/utils/adminApi';

const SupportManagement = ({ onStatsUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [contactData, setContactData] = useState({
    instagram: '@manjisama1',
    email: 'manjisamaa@gmail.com',
    telegram: 'https://t.me/+ajJtuJa1wVxmOTRl',
    github: 'https://github.com/manjisama1/vinsmoke',
    documentation: 'https://github.com/manjisama1/vinsmoke',
    responseTime: '24 hours',
    supportDescription: 'Get help with Vinsmoke bot setup, troubleshooting, and feature requests.'
  });

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSupportData();
      if (data && typeof data === 'object') {
        setContactData(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error fetching contact data:', error);
      toast.error('Error fetching contact data. Please check your admin permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setContactData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveContactData = async () => {
    setLoading(true);
    try {
      const data = await adminApi.updateSupportData(contactData);
      if (data.success !== false) {
        toast.success('Contact information updated successfully');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        toast.error(data.error || 'Failed to update contact information');
      }
    } catch (error) {
      console.error('Error saving contact data:', error);
      toast.error('Error saving contact information. Please check your admin permissions.');
    } finally {
      setLoading(false);
    }
  };

  const downloadContactData = async () => {
    try {
      const dataStr = JSON.stringify(contactData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contact-info-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Contact data downloaded');
    } catch (error) {
      console.error('Error downloading contact data:', error);
      toast.error('Error downloading contact data');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const testLink = (url, label) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      toast.info(`${label}: ${url}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Button onClick={saveContactData} disabled={loading}>
            {saved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
          <Button variant="outline" onClick={fetchContactData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <Button variant="outline" onClick={downloadContactData}>
          <Download className="w-4 h-4 mr-2" />
          Download Config
        </Button>
      </div>

      {/* Contact Information Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Instagram */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Instagram className="w-4 h-4 text-pink-500" />
                Instagram Handle
              </label>
              <div className="flex gap-2">
                <Input
                  value={contactData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  placeholder="@username"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(contactData.instagram, 'Instagram')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Mail className="w-4 h-4 text-blue-500" />
                Email Address
              </label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={contactData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@example.com"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(contactData.email, 'Email')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Telegram */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <MessageCircle className="w-4 h-4 text-blue-400" />
                Telegram Community
              </label>
              <div className="flex gap-2">
                <Input
                  value={contactData.telegram}
                  onChange={(e) => handleInputChange('telegram', e.target.value)}
                  placeholder="https://t.me/..."
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testLink(contactData.telegram, 'Telegram')}
                >
                  <Globe className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* GitHub */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Github className="w-4 h-4 text-gray-700" />
                GitHub Repository
              </label>
              <div className="flex gap-2">
                <Input
                  value={contactData.github}
                  onChange={(e) => handleInputChange('github', e.target.value)}
                  placeholder="https://github.com/..."
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testLink(contactData.github, 'GitHub')}
                >
                  <Globe className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Documentation */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Globe className="w-4 h-4 text-green-500" />
                Documentation URL
              </label>
              <div className="flex gap-2">
                <Input
                  value={contactData.documentation}
                  onChange={(e) => handleInputChange('documentation', e.target.value)}
                  placeholder="https://docs.example.com"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testLink(contactData.documentation, 'Documentation')}
                >
                  <Globe className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Response Time */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <RefreshCw className="w-4 h-4 text-orange-500" />
                Response Time
              </label>
              <Input
                value={contactData.responseTime}
                onChange={(e) => handleInputChange('responseTime', e.target.value)}
                placeholder="24 hours"
              />
            </div>
          </div>

          {/* Support Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Support Description</label>
            <Textarea
              value={contactData.supportDescription}
              onChange={(e) => handleInputChange('supportDescription', e.target.value)}
              placeholder="Describe what kind of support you provide..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Preview - How it appears to users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">{contactData.supportDescription}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-background rounded-md">
                <Instagram className="w-4 h-4 text-pink-500" />
                <span className="text-sm">{contactData.instagram}</span>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-background rounded-md">
                <Mail className="w-4 h-4 text-blue-500" />
                <span className="text-sm">{contactData.email}</span>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-background rounded-md">
                <MessageCircle className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Telegram Community</span>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <strong>Response Time:</strong> {contactData.responseTime}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="text-sm space-y-2">
            <p><strong>Instructions:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Update contact information and click "Save Changes"</li>
              <li>Use the test buttons (🌐) to verify links work correctly</li>
              <li>Copy buttons help you quickly copy information</li>
              <li>Changes will be reflected across all pages immediately</li>
              <li>Download config to backup your contact settings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportManagement;