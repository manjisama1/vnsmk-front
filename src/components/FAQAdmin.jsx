import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';
import { adminApi } from '@/utils/adminApi';

const FAQAdmin = () => {
    const { faqs, refreshData } = useData();
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: '',
        tags: ''
    });
    const [editingFaq, setEditingFaq] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Available categories (extracted from existing FAQs + common ones)
    const availableCategories = [
        'Getting Started',
        'Security', 
        'Plugins',
        'Sessions',
        'Troubleshooting',
        'Support',
        'Features'
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.question || !formData.answer || !formData.category) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const faqData = {
                question: formData.question,
                answer: formData.answer,
                category: formData.category,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
            };

            if (editingFaq) {
                await adminApi.updateFAQ(editingFaq.id, faqData);
                toast.success('FAQ updated successfully!');
                setEditingFaq(null);
            } else {
                await adminApi.addFAQ(faqData);
                toast.success('FAQ added successfully!');
            }

            // Refresh data and clear form
            await refreshData();
            clearForm();
        } catch (error) {
            console.error('FAQ operation error:', error);
            toast.error(error.message || 'Failed to save FAQ');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (faq) => {
        setEditingFaq(faq);
        setFormData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            tags: faq.tags ? faq.tags.join(', ') : ''
        });
    };

    const handleDelete = async (faqId) => {
        if (!confirm('Are you sure you want to delete this FAQ?')) return;

        setLoading(true);
        try {
            await adminApi.deleteFAQ(faqId);
            toast.success('FAQ deleted successfully!');
            await refreshData();
        } catch (error) {
            console.error('Delete FAQ error:', error);
            toast.error(error.message || 'Failed to delete FAQ');
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setFormData({
            question: '',
            answer: '',
            category: '',
            tags: ''
        });
        setEditingFaq(null);
    };

    // Filter FAQs based on search term
    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Add/Edit FAQ Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Question *</label>
                                    <Input
                                        value={formData.question}
                                        onChange={(e) => handleInputChange('question', e.target.value)}
                                        placeholder="Enter the FAQ question"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Category *</label>
                                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableCategories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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

                            <div>
                                <label className="block text-sm font-medium mb-2">Answer *</label>
                                <Textarea
                                    value={formData.answer}
                                    onChange={(e) => handleInputChange('answer', e.target.value)}
                                    placeholder="Enter the detailed answer"
                                    rows={8}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {editingFaq ? 'Updating...' : 'Adding...'}
                                    </>
                                ) : (
                                    editingFaq ? 'Update FAQ' : 'Add FAQ'
                                )}
                            </Button>
                            <Button type="button" variant="outline" onClick={clearForm}>
                                {editingFaq ? 'Cancel' : 'Clear'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* FAQ List */}
            <Card>
                <CardHeader>
                    <CardTitle>Manage FAQs ({faqs.length})</CardTitle>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search FAQs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredFaqs.map((faq) => (
                            <div key={faq.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm text-muted-foreground">
                                            {faq.category}
                                        </h4>
                                        <h3 className="font-semibold">{faq.question}</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(faq)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(faq.id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                    {faq.answer.length > 150 
                                        ? faq.answer.substring(0, 150) + '...' 
                                        : faq.answer
                                    }
                                </p>
                                {faq.tags && faq.tags.length > 0 && (
                                    <div className="flex gap-1 flex-wrap">
                                        {faq.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-muted text-xs rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {filteredFaqs.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                {searchTerm ? 'No FAQs match your search.' : 'No FAQs found.'}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default FAQAdmin;