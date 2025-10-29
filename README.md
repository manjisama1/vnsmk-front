# 🚀 Vinsmoke Bot Frontend

**Modern React frontend** for the Vinsmoke WhatsApp Bot management system.

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com/)

## ✨ Features

- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- ⚡ **Fast Performance** - Built with Vite for optimal speed
- 📱 **Mobile Friendly** - Responsive design for all devices
- 🔐 **Secure** - GitHub OAuth integration for admin features
- 🌐 **Real-time** - Socket.IO integration for live updates
- 🎯 **Production Ready** - Optimized for deployment

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Lightning fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

## 🚀 Quick Deploy to Vercel

### Option 1: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/manjisama1/vnsmk-front)

### Option 2: Manual Deploy
1. **Fork this repository**
2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your forked repository
3. **Configure:**
   - Framework: **Vite**
   - Root Directory: `frontend` (if monorepo)
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables:**
   ```bash
   VITE_API_BASE_URL=https://vnsmk-back.onrender.com
   ```
5. **Deploy!** - Vercel handles the rest

## ⚙️ Environment Configuration

### Required Variables
```bash
VITE_API_BASE_URL=https://your-backend-domain.com
```

### Optional Variables
```bash
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_APP_NAME=Vinsmoke Bot
VITE_APP_VERSION=1.0.0
```

## 🏃‍♂️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom hooks
│   ├── config/        # Configuration files
│   └── utils/         # Utility functions
├── public/            # Static assets
├── vercel.json        # Vercel configuration
└── package.json       # Dependencies and scripts
```

## 🌐 Alternative Deployment Options

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

### GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
"homepage": "https://yourusername.github.io/your-repo",
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize and deploy
firebase init hosting
firebase deploy
```

## 🔧 Configuration Files

- `vercel.json` - Vercel deployment configuration
- `.env.example` - Environment variables template
- `.env.production` - Production environment variables
- `vite.config.js` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration

## 🧪 Testing Your Deployment

After deployment, test these features:
- [ ] Home page loads correctly
- [ ] Session management (QR/Pairing code generation)
- [ ] Plugin browsing and submission
- [ ] FAQ section
- [ ] Admin login (if configured)
- [ ] Real-time Socket.IO connection

## 🚨 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify `VITE_API_BASE_URL` is set correctly
   - Check backend is deployed and accessible
   - Ensure CORS is configured on backend

2. **Build Failures**
   - Check Node.js version (18+ recommended)
   - Clear node_modules and reinstall
   - Verify all dependencies are installed

3. **Socket.IO Connection Issues**
   - Ensure backend supports Socket.IO
   - Check for CORS issues
   - Verify WebSocket support on hosting platform

### Debug Commands
```bash
# Check environment variables
npm run dev -- --debug

# Build with verbose output
npm run build -- --debug

# Check bundle size
npm run build && npx vite-bundle-analyzer dist
```

## 📞 Support

- **Backend Repository:** https://github.com/manjisama1/vnsmk-back
- **Issues:** Create an issue on GitHub
- **Documentation:** Check the backend README for API details

Your frontend is now ready for production deployment! 🎉