# FAQ Management Guide

## Overview
The FAQ system is designed to be easily expandable and maintainable. All FAQ data is stored in `faqData.js` and can be easily modified without touching the UI components.

## Adding New FAQs

### Method 1: Direct Editing (Recommended)
1. Open `src/data/faqData.js`
2. Add a new object to the `faqData` array:

```javascript
{
  id: 11, // Use next available ID
  category: "Your Category",
  question: "Your question here?",
  answer: "Your detailed answer here.",
  tags: ["tag1", "tag2", "tag3"]
}
```

3. If using a new category, add it to the `faqCategories` array
4. Save the file - changes will be reflected immediately

### Method 2: Using FAQ Admin Component
1. Navigate to the FAQ Admin component (for development)
2. Fill in the form with your FAQ details
3. Click "Generate Code"
4. Copy the generated code and paste it into `faqData.js`
5. Replace "NEXT_ID" with the actual next ID number

## FAQ Structure

Each FAQ object has the following properties:

- `id` (number): Unique identifier
- `category` (string): Category for filtering
- `question` (string): The FAQ question
- `answer` (string): Detailed answer
- `tags` (array): Tags for search functionality

## Available Categories

Current categories:
- Getting Started
- Security
- Plugins
- Sessions
- Troubleshooting
- Support

To add a new category:
1. Add it to the `faqCategories` array
2. Use it in your FAQ objects

## Features

The FAQ system includes:
- **Search**: Full-text search across questions, answers, and tags
- **Category Filtering**: Filter FAQs by category
- **Expandable Cards**: Click to expand/collapse answers
- **Tag Display**: Visual tags for better organization
- **Responsive Design**: Works on all device sizes

## Best Practices

1. **Clear Questions**: Write questions as users would ask them
2. **Comprehensive Answers**: Provide step-by-step solutions
3. **Relevant Tags**: Use tags that users might search for
4. **Consistent Categories**: Use existing categories when possible
5. **Regular Updates**: Keep answers current with app changes

## File Structure

```
src/data/
├── faqData.js          # Main FAQ data file
├── FAQ_README.md       # This documentation
src/components/
├── FAQAdmin.jsx        # Admin component for adding FAQs
src/pages/
├── FAQPage.jsx         # Main FAQ display component
```

## Example FAQ Entry

```javascript
{
  id: 11,
  category: "Getting Started",
  question: "How do I reset my session?",
  answer: "To reset your session, go to the Session page and click 'Delete Session'. Then create a new session by generating a new QR code or pairing code. Make sure to save your new session ID securely.",
  tags: ["reset", "session", "delete", "new"]
}
```

This structure makes it easy to maintain and expand the FAQ system as your application grows!