import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { sanitizeInput, encodeHTML } from '@/utils/security';
import { AlertTriangle } from 'lucide-react';

// Secure Input wrapper component
export const SecureInput = ({ 
  value, 
  onChange, 
  maxLength = 1000,
  allowHTML = false,
  pattern = null,
  type = 'text',
  ...props 
}) => {
  const [error, setError] = useState('');

  const handleChange = useCallback((e) => {
    let inputValue = e.target.value;
    
    // Apply length limit
    if (inputValue.length > maxLength) {
      setError(`Input too long. Maximum ${maxLength} characters allowed.`);
      return;
    }
    
    // Apply pattern validation if provided
    if (pattern && !pattern.test(inputValue)) {
      setError('Invalid input format.');
      return;
    }
    
    // Sanitize input if HTML is not allowed
    if (!allowHTML) {
      inputValue = sanitizeInput(inputValue);
    }
    
    // Clear error if validation passes
    setError('');
    
    // Call original onChange with sanitized value
    onChange({
      ...e,
      target: {
        ...e.target,
        value: inputValue
      }
    });
  }, [onChange, maxLength, allowHTML, pattern]);

  return (
    <div className="space-y-1">
      <Input
        {...props}
        type={type}
        value={value}
        onChange={handleChange}
        className={error ? 'border-red-500' : ''}
      />
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertTriangle className="w-3 h-3" />
          {error}
        </div>
      )}
      <div className="text-xs text-muted-foreground">
        {value?.length || 0}/{maxLength} characters
      </div>
    </div>
  );
};

// Secure Textarea wrapper component
export const SecureTextarea = ({ 
  value, 
  onChange, 
  maxLength = 5000,
  allowHTML = false,
  ...props 
}) => {
  const [error, setError] = useState('');

  const handleChange = useCallback((e) => {
    let inputValue = e.target.value;
    
    // Apply length limit
    if (inputValue.length > maxLength) {
      setError(`Input too long. Maximum ${maxLength} characters allowed.`);
      return;
    }
    
    // Sanitize input if HTML is not allowed
    if (!allowHTML) {
      inputValue = sanitizeInput(inputValue);
    }
    
    // Clear error if validation passes
    setError('');
    
    // Call original onChange with sanitized value
    onChange({
      ...e,
      target: {
        ...e.target,
        value: inputValue
      }
    });
  }, [onChange, maxLength, allowHTML]);

  return (
    <div className="space-y-1">
      <Textarea
        {...props}
        value={value}
        onChange={handleChange}
        className={error ? 'border-red-500' : ''}
      />
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertTriangle className="w-3 h-3" />
          {error}
        </div>
      )}
      <div className="text-xs text-muted-foreground">
        {value?.length || 0}/{maxLength} characters
      </div>
    </div>
  );
};

// Secure display component for user-generated content
export const SecureDisplay = ({ content, allowHTML = false, className = '' }) => {
  if (!content) return null;
  
  const displayContent = allowHTML ? content : encodeHTML(content);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={allowHTML ? { __html: displayContent } : undefined}
    >
      {!allowHTML && displayContent}
    </div>
  );
};

export default {
  SecureInput,
  SecureTextarea,
  SecureDisplay
};