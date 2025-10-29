import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Copy, Check } from 'lucide-react';
import { faqCategories } from '@/data/faqData';

const FAQAdmin = () => {
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: '',
        tags: ''
    });
    const [copied, setCopied] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const generateFAQCode = () => {
        if (!formData.question || !formData.answer || !formData.category) {
            alert('Please fill in all required fields');
            return;
        }

        const tagsArray = formData.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        const faqObject = {
            id: 'NEXT_ID', // User needs to replace with next available ID
            category: formData.category,
            question: formData.question,
            answer: formData.answer,
            tags: tagsArray
        };

        const codeString = `  ${JSON.stringify(faqObject, null, 2).replace(/^/gm, '  ')},`;
        setGeneratedCode(codeString);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const clearForm = () => {
        setFormData({
            question: '',
            answer: '',
            category: '',
            tags: ''
        });
        setGeneratedCode('');
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        FAQ Admin - Add New FAQ
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
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
                                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {faqCategories.filter(cat => cat !== 'All').map((category) => (
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
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button onClick={generateFAQCode}>
                            Generate Code
                        </Button>
                        <Button variant="outline" onClick={clearForm}>
                            Clear Form
                        </Button>
                    </div>

                    {/* Generated Code */}
                    {generatedCode && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium">Generated FAQ Code</label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-2"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>
                            </div>
                            <div className="bg-muted p-4 rounded-md">
                                <pre className="text-sm overflow-x-auto">
                                    <code>{generatedCode}</code>
                                </pre>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p><strong>Instructions:</strong></p>
                                <p>1. Copy the generated code above</p>
                                <p>2. Open <code>src/data/faqData.js</code></p>
                                <p>3. Replace "NEXT_ID" with the next available ID number</p>
                                <p>4. Add the code to the faqData array</p>
                                <p>5. If you used a new category, add it to the faqCategories array</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default FAQAdmin;