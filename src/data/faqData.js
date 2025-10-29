// FAQ Data - Easily expandable
// 
// HOW TO ADD NEW FAQs:
// 1. Add a new object to the faqData array below
// 2. Use the next available ID number
// 3. Choose an appropriate category (or create a new one)
// 4. Add relevant tags for better searchability
// 5. If you create a new category, add it to the faqCategories array
//
// EXAMPLE NEW FAQ:
// {
//   id: 11,
//   category: "New Category",
//   question: "Your question here?",
//   answer: "Your detailed answer here.",
//   tags: ["tag1", "tag2", "tag3"]
// }
//
// AVAILABLE CATEGORIES: Getting Started, Security, Plugins, Sessions, Troubleshooting, Support

export const faqData = [
  {
    id: 1,
    category: "Getting Started",
    question: "How do I connect my WhatsApp to the Vinsmoke bot?",
    answer: "You can connect your WhatsApp using either QR code scanning or pairing code method. Go to the Session page and choose your preferred method. For QR code, simply scan the generated code with your WhatsApp app. For pairing code, enter your phone number and use the generated code in your WhatsApp settings.",
    tags: ["connection", "setup", "whatsapp"]
  },
  {
    id: 2,
    category: "Security",
    question: "Is my data secure with Vinsmoke bot?",
    answer: "Yes, absolutely! All sessions are end-to-end encrypted and stored securely on our servers. We use industry-standard encryption protocols and don't have access to your personal messages or data. Your session files are isolated and protected with advanced security measures.",
    tags: ["security", "privacy", "data"]
  },
  {
    id: 3,
    category: "Plugins",
    question: "How do I install and use plugins?",
    answer: "Browse the plugins page to find the plugin you want. Click the 'Copy' button to get the gist link, then use the WhatsApp button to get installation instructions sent directly to your WhatsApp. You can also filter plugins by type (sticker, media, fun) and sort them by popularity or date.",
    tags: ["plugins", "installation", "usage"]
  },
  {
    id: 4,
    category: "Plugins",
    question: "Can I create and submit my own plugins?",
    answer: "Yes! You can create and submit your own plugins using the 'Add Plugin' feature in the plugins section. Just provide the plugin name, description, type (sticker, media, or fun), and the gist link containing your plugin code. Once submitted, other users can discover and use your plugin.",
    tags: ["plugins", "development", "submission"]
  },
  {
    id: 5,
    category: "Sessions",
    question: "What happens if I lose my session ID?",
    answer: "If you lose your session ID, you'll need to create a new session by going through the connection process again. Make sure to save your session ID in a secure place like a password manager. We recommend copying it immediately after connection and storing it safely.",
    tags: ["session", "recovery", "backup"]
  },
  {
    id: 6,
    category: "Sessions",
    question: "How many devices can I connect to one bot instance?",
    answer: "Currently, each session supports one WhatsApp account connection at a time. If you need to manage multiple WhatsApp accounts, you'll need to create separate sessions for each account. Each session gets its own unique session ID.",
    tags: ["session", "multiple", "devices"]
  },
  {
    id: 7,
    category: "Plugins",
    question: "What types of plugins are available?",
    answer: "We have three main categories of plugins: Sticker plugins for creating and managing sticker packs, Media plugins for downloading content from various platforms like YouTube and Instagram, and Fun plugins for entertainment features like memes, quotes, and games.",
    tags: ["plugins", "types", "categories"]
  },
  {
    id: 8,
    category: "Troubleshooting",
    question: "How do I troubleshoot connection issues?",
    answer: "If you're having connection issues, try these steps: 1) Make sure your phone has a stable internet connection, 2) Ensure WhatsApp is updated to the latest version, 3) Try generating a new QR code or pairing code, 4) Clear your browser cache and try again, 5) Check if your firewall or antivirus is blocking the connection.",
    tags: ["troubleshooting", "connection", "issues"]
  },
  {
    id: 9,
    category: "Plugins",
    question: "Is there a limit to how many plugins I can use?",
    answer: "There's no strict limit on the number of plugins you can install, but keep in mind that having too many active plugins might affect your bot's performance. We recommend starting with essential plugins and adding more as needed based on your requirements.",
    tags: ["plugins", "limits", "performance"]
  },
  {
    id: 10,
    category: "Support",
    question: "How do I get support if I encounter issues?",
    answer: "You can reach out to us through multiple channels: Follow us on Instagram @manjisama1 for quick updates and support, send detailed queries to manjisamaa@gmail.com, or join our Telegram community at https://t.me/+ajJtuJa1wVxmOTRl for community support and announcements.",
    tags: ["support", "contact", "help"]
  }
];

// FAQ Categories for filtering
export const faqCategories = [
  "All",
  "Getting Started",
  "Security",
  "Plugins",
  "Sessions",
  "Troubleshooting",
  "Support"
];

// Helper function to get FAQs by category
export const getFAQsByCategory = (category) => {
  if (category === "All") return faqData;
  return faqData.filter(faq => faq.category === category);
};

// Helper function to search FAQs
export const searchFAQs = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return faqData.filter(faq => 
    faq.question.toLowerCase().includes(lowercaseQuery) ||
    faq.answer.toLowerCase().includes(lowercaseQuery) ||
    faq.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};