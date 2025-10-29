// Text highlighting utility for FAQ content
// Supports: red`text`, blue`text`, yellow`text`, green`text`, purple`text`, orange`text`

export const parseHighlightedText = (text) => {
  if (!text) return text;

  // Define highlight patterns and their corresponding inline styles
  const patterns = [
    {
      regex: /red`([^`]+)`/g,
      style: {
        background: '#fef2f2',
        color: '#991b1b',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    },
    {
      regex: /blue`([^`]+)`/g,
      style: {
        background: '#eff6ff',
        color: '#1e40af',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    },
    {
      regex: /yellow`([^`]+)`/g,
      style: {
        background: '#fefce8',
        color: '#a16207',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    },
    {
      regex: /green`([^`]+)`/g,
      style: {
        background: '#f0fdf4',
        color: '#166534',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    },
    {
      regex: /purple`([^`]+)`/g,
      style: {
        background: '#faf5ff',
        color: '#7c3aed',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    },
    {
      regex: /orange`([^`]+)`/g,
      style: {
        background: '#fff7ed',
        color: '#c2410c',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    }
  ];

  let parts = [{ text, isHighlight: false }];

  // Process each pattern
  patterns.forEach(({ regex, style }) => {
    const newParts = [];
    
    parts.forEach(part => {
      if (part.isHighlight) {
        newParts.push(part);
        return;
      }

      const matches = [...part.text.matchAll(regex)];
      if (matches.length === 0) {
        newParts.push(part);
        return;
      }

      let lastIndex = 0;
      matches.forEach(match => {
        // Add text before match
        if (match.index > lastIndex) {
          newParts.push({
            text: part.text.slice(lastIndex, match.index),
            isHighlight: false
          });
        }

        // Add highlighted text
        newParts.push({
          text: match[1], // The captured group (text inside backticks)
          isHighlight: true,
          style
        });

        lastIndex = match.index + match[0].length;
      });

      // Add remaining text
      if (lastIndex < part.text.length) {
        newParts.push({
          text: part.text.slice(lastIndex),
          isHighlight: false
        });
      }
    });

    parts = newParts;
  });

  return parts;
};

// React component to render highlighted text
export const HighlightedText = ({ text, className = "" }) => {
  const parts = parseHighlightedText(text);

  if (typeof parts === 'string') {
    return <span className={className}>{parts}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, index) => (
        part.isHighlight ? (
          <span key={index} style={part.style}>
            {part.text}
          </span>
        ) : (
          <span key={index}>{part.text}</span>
        )
      ))}
    </span>
  );
};

// Helper function to get available highlight colors
export const getHighlightColors = () => [
  { name: 'Red', syntax: 'red`text`', example: 'red`Important`' },
  { name: 'Blue', syntax: 'blue`text`', example: 'blue`Information`' },
  { name: 'Yellow', syntax: 'yellow`text`', example: 'yellow`Warning`' },
  { name: 'Green', syntax: 'green`text`', example: 'green`Success`' },
  { name: 'Purple', syntax: 'purple`text`', example: 'purple`Feature`' },
  { name: 'Orange', syntax: 'orange`text`', example: 'orange`Note`' }
];

export default { parseHighlightedText, HighlightedText, getHighlightColors };