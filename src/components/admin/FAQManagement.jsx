import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, Search, RefreshCw, Plus, Edit, Save, Eye, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/utils/adminApi';
import { useAdminData } from '@/contexts/AdminDataContext';
import { HighlightedText, getHighlightColors } from '@/utils/textHighlight.jsx';

const FAQManagement = ({ onStatsUpdate }) => {
  const { faqs, loading, refreshData } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewFAQ, setPreviewFAQ] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    tags: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: '',
      tags: ''
    });
    setEditingId(null);
  };

  const handleAddFAQ = async () => {
    if (!formData.question || !formData.answer || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Process tags - convert comma-separated string to array
      const processedData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };
      
      const data = await adminApi.addFAQ(processedData);
      if (data.success !== false) {
        toast.success('FAQ added successfully!');
        refreshData();
        onStatsUpdate();
        clearForm();
        setShowAddDialog(false);
      } else {
        toast.error(data.error || 'Failed to add FAQ');
      }
    } catch (error) {
      console.error('Error adding FAQ:', error);
      toast.error('Error adding FAQ. Please check your admin permissions.');
    }
  };

  const handleEditFAQ = (faq) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      tags: Array.isArray(faq.tags) ? faq.tags.join(', ') : (faq.tags || '')
    });
    setEditingId(faq.id);
    setShowEditDialog(true);
  };

  const handleUpdateFAQ = async () => {
    if (!formData.question || !formData.answer || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Process tags - convert comma-separated string to array
      const processedData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };
      
      const data = await adminApi.updateFAQ(editingId, processedData);
      if (data.success !== false) {
        toast.success('FAQ updated successfully!');
        refreshData();
        onStatsUpdate();
        clearForm();
        setShowEditDialog(false);
      } else {
        toast.error(data.error || 'Failed to update FAQ');
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast.error('Error updating FAQ. Please check your admin permissions.');
    }
  };

  const handleDeleteFAQ = async (id) => {
    if (!confirm('Are you sure you want to delete this FAQ? This action cannot be undone.')) return;

    try {
      const data = await adminApi.deleteFAQ(id);
      if (data.success !== false) {
        toast.success('FAQ deleted successfully!');
        refreshData();
        onStatsUpdate();
      } else {
        toast.error(data.error || 'Failed to delete FAQ');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Error deleting FAQ. Please check your admin permissions.');
    }
  };

  const handlePreviewFAQ = (faq) => {
    setPreviewFAQ(faq);
    setShowPreviewDialog(true);
  };

  const downloadFAQData = async () => {
    try {
      const response = await adminApi.downloadFAQs();
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `faqs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('FAQ data downloaded');
      } else {
        toast.error('Failed to download FAQ data');
      }
    } catch (error) {
      console.error('Error downloading FAQ data:', error);
      toast.error('Error downloading FAQ data. Please check your admin permissions.');
    }
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const categories = [...new Set(faqs.map(f => f.category))].sort();

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Button onClick={() => { clearForm(); setShowAddDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add FAQ
          </Button>
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={downloadFAQData}>
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Highlight Colors Guide */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Text Highlighting Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {getHighlightColors().map((color) => (
              <div key={color.name} className="flex items-center gap-2">
                <code className="bg-muted px-1 rounded">{color.syntax}</code>
                <HighlightedText text={color.example} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQs List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading FAQs...</p>
            </CardContent>
          </Card>
        ) : filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Search className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No FAQs found matching your search' : 'No FAQs found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFAQs.map((faq) => (
            <Card key={faq.id} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-primary/10 text-primary">
                        {faq.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">ID: {faq.id}</span>
                      {faq.updatedAt && (
                        <span className="text-xs text-muted-foreground">
                          Updated: {new Date(faq.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewFAQ(faq)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditFAQ(faq)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteFAQ(faq.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <HighlightedText 
                      text={faq.answer} 
                      className="text-sm text-muted-foreground leading-relaxed"
                    />
                  </div>
                  
                  {faq.tags && faq.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {faq.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add FAQ Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New FAQ</DialogTitle>
            <DialogDescription>
              Create a new FAQ entry. Use color highlighting syntax like red`text` for emphasis.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Question *</label>
                <Input
                  value={formData.question}
                  onChange={(e) => handleInputChange('question', e.target.value)}
                  placeholder="Enter the FAQ question"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <Input
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Enter category (e.g., Getting Started, Features, etc.)"
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Answer *</label>
              <Textarea
                value={formData.answer}
                onChange={(e) => handleInputChange('answer', e.target.value)}
                placeholder="Enter the detailed answer. Use red`text`, blue`text`, yellow`text` for highlighting."
                rows={6}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <Input
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate tags with commas
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFAQ}>
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit FAQ Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>
              Update the FAQ entry. Use color highlighting syntax like red`text` for emphasis.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Question *</label>
                <Input
                  value={formData.question}
                  onChange={(e) => handleInputChange('question', e.target.value)}
                  placeholder="Enter the FAQ question"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <Input
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Enter category (e.g., Getting Started, Features, etc.)"
                  list="categories-edit"
                />
                <datalist id="categories-edit">
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Answer *</label>
              <Textarea
                value={formData.answer}
                onChange={(e) => handleInputChange('answer', e.target.value)}
                placeholder="Enter the detailed answer. Use red`text`, blue`text`, yellow`text` for highlighting."
                rows={6}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <Input
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFAQ}>
              <Save className="w-4 h-4 mr-2" />
              Update FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview FAQ Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>FAQ Preview</DialogTitle>
            <DialogDescription>
              Preview how the FAQ will appear to users with highlighting.
            </DialogDescription>
          </DialogHeader>
          
          {previewFAQ && (
            <div className="space-y-4 py-4">
              <div>
                <Badge className="bg-primary/10 text-primary mb-2">
                  {previewFAQ.category}
                </Badge>
                <h3 className="text-lg font-semibold">{previewFAQ.question}</h3>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <HighlightedText 
                  text={previewFAQ.answer} 
                  className="text-sm leading-relaxed"
                />
              </div>
              
              {previewFAQ.tags && previewFAQ.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {previewFAQ.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="font-medium">{filteredFAQs.length}</p>
              <p className="text-muted-foreground">Total FAQs</p>
            </div>
            {categories.slice(0, 3).map(category => (
              <div key={category} className="text-center">
                <p className="font-medium">
                  {filteredFAQs.filter(f => f.category === category).length}
                </p>
                <p className="text-muted-foreground">{category}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQManagement;