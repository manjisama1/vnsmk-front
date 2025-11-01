import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, RefreshCw } from 'lucide-react';
import { HighlightedText } from '@/utils/textHighlight.jsx';
import { useData } from '@/contexts/DataContext';

const FAQPage = () => {
  const [openItems, setOpenItems] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Use global cached data - single API call for entire app!
  const { faqs, categories, loading, refreshData } = useData();

  // Data is now loaded automatically via useAppData hook

  // Filter and search FAQs
  const filteredFAQs = useMemo(() => {
    let filteredFaqs = faqs;

    // Filter by category
    if (selectedCategory !== 'All') {
      filteredFaqs = filteredFaqs.filter(faq => faq.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filteredFaqs = filteredFaqs.filter(faq =>
        faq.question.toLowerCase().includes(lowercaseQuery) ||
        faq.answer.toLowerCase().includes(lowercaseQuery) ||
        faq.category.toLowerCase().includes(lowercaseQuery) ||
        faq.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    }

    return filteredFaqs;
  }, [faqs, searchQuery, selectedCategory]);

  const toggleItem = (id) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setOpenItems(new Set());
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Find answers to common questions about Vinsmoke bot
        </p>

        {/* Search and Filter Section */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 mr-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
            </div>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs"
              >
                {category}
              </Button>
            ))}
            {(searchQuery || selectedCategory !== 'All') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear filters
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshData}
              disabled={loading}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            {searchQuery ? (
              <>Showing {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} for "{searchQuery}"</>
            ) : (
              <>Showing {filteredFAQs.length} FAQ{filteredFAQs.length !== 1 ? 's' : ''} in {selectedCategory}</>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Items */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading FAQs...</p>
        </div>
      ) : filteredFAQs.length > 0 ? (
        <div className="space-y-4">
          {filteredFAQs.map((item) => {
            const isOpen = openItems.has(item.id);

            return (
              <Card key={item.id} className={`border-border transition-all duration-300 ${isOpen ? 'border-primary shadow-md' : 'hover:border-primary/50'}`}>
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors duration-200"
                  onClick={() => toggleItem(item.id)}
                >
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                          {item.category}
                        </span>
                      </div>
                      <span>{item.question}</span>
                    </div>
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                      <Plus className="w-4 h-4 text-primary" />
                    </div>
                  </CardTitle>
                </CardHeader>

                {isOpen && (
                  <CardContent className="pt-0 pb-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="text-muted-foreground leading-relaxed mb-4 whitespace-pre-wrap break-words">
                      <HighlightedText text={item.answer} />
                    </div>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No FAQs found</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
          <Button variant="outline" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      )}

      {/* Additional Help Section */}
      <Card className="mt-12 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-primary/20">
        <CardContent className="py-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Still have questions?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you get the most out of Vinsmoke bot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:manjisamaa@gmail.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors duration-200"
            >
              Contact Support
            </a>
            <a
              href="https://t.me/+ajJtuJa1wVxmOTRl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors duration-200"
            >
              Join Community
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQPage;