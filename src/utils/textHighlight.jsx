export const parseHighlightedText = (text) => {
  if (!text) return text;

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
    },
    {
      regex: /pink`([^`]+)`/g,
      style: {
        background: '#fdf2f8',
        color: '#be185d',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    },
    {
      regex: /cyan`([^`]+)`/g,
      style: {
        background: '#ecfeff',
        color: '#0891b2',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    },
    {
      regex: /indigo`([^`]+)`/g,
      style: {
        background: '#eef2ff',
        color: '#4338ca',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    },
    {
      regex: /teal`([^`]+)`/g,
      style: {
        background: '#f0fdfa',
        color: '#0f766e',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    },
    {
      regex: /lime`([^`]+)`/g,
      style: {
        background: '#f7fee7',
        color: '#365314',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    },
    {
      regex: /rose`([^`]+)`/g,
      style: {
        background: '#fff1f2',
        color: '#be123c',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    },
    {
      regex: /gray`([^`]+)`/g,
      style: {
        background: '#f9fafb',
        color: '#374151',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    },
    {
      regex: /emerald`([^`]+)`/g,
      style: {
        background: '#ecfdf5',
        color: '#047857',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    },
    {
      regex: /violet`([^`]+)`/g,
      style: {
        background: '#f5f3ff',
        color: '#6d28d9',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    },
    {
      regex: /amber`([^`]+)`/g,
      style: {
        background: '#fffbeb',
        color: '#d97706',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    },
    {
      regex: /grey`([^`]+)`/g,
      style: {
        background: '#f3f4f6',
        color: '#4b5563',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    },
    {
      regex: /black1`([^`]+)`/g,
      style: {
        background: '#f9fafb',
        color: '#111827',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    },
    {
      regex: /black2`([^`]+)`/g,
      style: {
        background: '#f3f4f6',
        color: '#1f2937',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    },
    {
      regex: /black3`([^`]+)`/g,
      style: {
        background: '#e5e7eb',
        color: '#374151',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    },
    {
      regex: /black4`([^`]+)`/g,
      style: {
        background: '#d1d5db',
        color: '#4b5563',
        padding: '4px 8px',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '0 2px'
      }
    }
  ];

  let parts = [{ text, isHighlight: false }];

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
        if (match.index > lastIndex) {
          newParts.push({
            text: part.text.slice(lastIndex, match.index),
            isHighlight: false
          });
        }

        newParts.push({
          text: match[1],
          isHighlight: true,
          style
        });

        lastIndex = match.index + match[0].length;
      });

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

export const getHighlightColors = () => [
  { name: 'Red', syntax: 'red`text`', example: 'red`Important`' },
  { name: 'Blue', syntax: 'blue`text`', example: 'blue`Information`' },
  { name: 'Yellow', syntax: 'yellow`text`', example: 'yellow`Warning`' },
  { name: 'Green', syntax: 'green`text`', example: 'green`Success`' },
  { name: 'Purple', syntax: 'purple`text`', example: 'purple`Feature`' },
  { name: 'Orange', syntax: 'orange`text`', example: 'orange`Note`' },
  { name: 'Pink', syntax: 'pink`text`', example: 'pink`Special`' },
  { name: 'Cyan', syntax: 'cyan`text`', example: 'cyan`Cool`' },
  { name: 'Indigo', syntax: 'indigo`text`', example: 'indigo`Deep`' },
  { name: 'Teal', syntax: 'teal`text`', example: 'teal`Fresh`' },
  { name: 'Lime', syntax: 'lime`text`', example: 'lime`Bright`' },
  { name: 'Rose', syntax: 'rose`text`', example: 'rose`Love`' },
  { name: 'Gray', syntax: 'gray`text`', example: 'gray`Neutral`' },
  { name: 'Emerald', syntax: 'emerald`text`', example: 'emerald`Nature`' },
  { name: 'Violet', syntax: 'violet`text`', example: 'violet`Magic`' },
  { name: 'Amber', syntax: 'amber`text`', example: 'amber`Warm`' },
  { name: 'Grey', syntax: 'grey`text`', example: 'grey`Muted`' },
  { name: 'Black Light', syntax: 'black1`text`', example: 'black1`Subtle`' },
  { name: 'Black Medium', syntax: 'black2`text`', example: 'black2`Soft`' },
  { name: 'Black Dark', syntax: 'black3`text`', example: 'black3`Bold`' },
  { name: 'Black Deep', syntax: 'black4`text`', example: 'black4`Strong`' }
];

export default { parseHighlightedText, HighlightedText, getHighlightColors };