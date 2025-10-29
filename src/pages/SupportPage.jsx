import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Instagram, Mail, MessageCircle, ExternalLink } from 'lucide-react';

const SupportPage = () => {
  const supportChannels = [
    {
      icon: Instagram,
      title: 'Instagram',
      description: 'Follow us for updates, tips, and quick support responses',
      handle: '@manjisama1',
      url: 'https://instagram.com/manjisama1',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 hover:bg-pink-100',
      borderColor: 'border-pink-200',
      responseTime: 'Within 24 hours',
      bestFor: 'Quick questions and updates'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us detailed queries, bug reports, and feature requests',
      handle: 'manjisamaa@gmail.com',
      url: 'mailto:manjisamaa@gmail.com',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      borderColor: 'border-blue-200',
      responseTime: 'Within 24 hours',
      bestFor: 'Technical issues and detailed inquiries'
    },
    {
      icon: MessageCircle,
      title: 'Telegram Group',
      description: 'Join our community for announcements, tips, and peer support',
      handle: 'Vinsmoke Community',
      url: 'https://t.me/+ajJtuJa1wVxmOTRl',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      borderColor: 'border-blue-200',
      responseTime: 'Within 24 hours',
      bestFor: 'Community discussions and announcements'
    }
  ];



  const commonTopics = [
    {
      title: 'Connection Issues',
      description: 'Problems with QR code or pairing code connection',
      tags: ['QR Code', 'Pairing', 'WhatsApp']
    },
    {
      title: 'Plugin Installation',
      description: 'Help with installing and configuring plugins',
      tags: ['Plugins', 'Installation', 'Configuration']
    },
    {
      title: 'Session Management',
      description: 'Managing and troubleshooting bot sessions',
      tags: ['Sessions', 'Management', 'Troubleshooting']
    },
    {
      title: 'Feature Requests',
      description: 'Suggestions for new features and improvements',
      tags: ['Features', 'Suggestions', 'Feedback']
    }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Get Support</h1>
        <p className="text-lg text-muted-foreground">
          Need help? We're here to assist you with any questions or issues you might have.
        </p>
      </div>



      {/* Support Channels */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Contact Channels</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supportChannels.map((channel, idx) => {
            const Icon = channel.icon;
            return (
              <Card key={idx} className={`border-border hover:shadow-lg transition-all duration-300 card-hover ${channel.borderColor}`}>
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 ${channel.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${channel.color}`} />
                  </div>
                  <CardTitle className="text-xl mb-2">{channel.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {channel.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Handle:</span>
                      <span className="font-mono text-foreground">{channel.handle}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Response:</span>
                      <span className="text-foreground">{channel.responseTime}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Best for:</span>
                      <span className="text-foreground ml-1">{channel.bestFor}</span>
                    </div>
                  </div>
                  
                  <Button 
                    asChild
                    className={`w-full ${channel.bgColor} ${channel.color} border ${channel.borderColor} hover:shadow-md`}
                    variant="outline"
                  >
                    <a href={channel.url} target="_blank" rel="noopener noreferrer">
                      Contact via {channel.title}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Common Support Topics */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Common Support Topics</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {commonTopics.map((topic, idx) => (
            <Card key={idx} className="border-border hover:border-primary/50 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-lg">{topic.title}</CardTitle>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {topic.tags.map((tag, tagIdx) => (
                    <span 
                      key={tagIdx}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Emergency Support */}
      <Card className="bg-gradient-to-br from-destructive/5 via-destructive/3 to-transparent border-destructive/20">
        <CardContent className="py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Critical Issues?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              If you're experiencing critical issues that prevent you from using the bot, please reach out immediately via email with "URGENT" in the subject line.
            </p>
            <Button 
              asChild
              variant="destructive"
              size="lg"
            >
              <a href="mailto:manjisamaa@gmail.com?subject=URGENT - Critical Issue">
                Report Critical Issue
                <Mail className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <div className="mt-12">
        <Card className="bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-primary/20">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Before You Contact Us
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Check out our FAQ section for quick answers to common questions, or browse our documentation for detailed guides.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                size="lg"
                asChild
              >
                <Link to="/faq">View FAQ</Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                asChild
              >
                <a 
                  href="https://github.com/manjisama1/vinsmoke" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Read Documentation
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupportPage;