# Manual GitHub Deployment Guide

## Overview
This guide explains how to deploy the BookShelf Scanner app manually to GitHub Pages or other static hosting services.

## Prerequisites
- GitHub account
- Git installed locally
- Node.js 18+ installed

## Deployment Options

### Option 1: GitHub Pages (Frontend Only)
Since this is a full-stack app, you'll need to modify it for frontend-only deployment.

#### Steps:
1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/bookshelf-scanner.git
   git push -u origin main
   ```

2. **Modify for Frontend-Only**
   - Remove server dependencies from package.json
   - Update the app to use localStorage instead of the backend
   - Modify book lookup to work client-side only

3. **Build and Deploy**
   ```bash
   npm run build
   # Push dist folder to gh-pages branch
   ```

### Option 2: Full-Stack Deployment (Recommended)

#### Services that support full-stack Node.js apps:
- **Vercel** (Easy deployment with GitHub integration)
- **Netlify** (With serverless functions)
- **Railway** (Full backend support)
- **Render** (Free tier available)

#### For Vercel:
1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Environment Variables**
   - Add VITE_GOOGLE_BOOKS_API_KEY in Vercel dashboard
   - Configure database connection

#### For Railway:
1. **Connect GitHub Repository**
   - Go to railway.app
   - Connect your GitHub repo
   - Configure environment variables

2. **Add Railway Configuration**
   Create `railway.toml`:
   ```toml
   [build]
   builder = "nixpacks"
   
   [deploy]
   startCommand = "npm run dev"
   ```

## Required Environment Variables
```env
VITE_GOOGLE_BOOKS_API_KEY=your_google_books_api_key
DATABASE_URL=your_database_connection_string
```

## Database Options for Production
1. **Neon** (PostgreSQL) - Free tier available
2. **Supabase** (PostgreSQL) - Free tier available
3. **PlanetScale** (MySQL) - Free tier available

## Build Configuration
The app is already configured with Vite for production builds:
```bash
npm run build  # Creates dist/ folder
```

## Important Notes
- The camera/barcode scanning features work best on HTTPS
- GitHub Pages only supports static sites (no backend)
- For full functionality, use a platform that supports Node.js backends
- Make sure to configure CORS properly for production

## Recommended Deployment Flow
1. Push code to GitHub repository
2. Deploy to Vercel/Railway for full functionality
3. Configure environment variables
4. Set up production database
5. Test barcode scanning on mobile devices

## Security Considerations
- Never commit API keys to the repository
- Use environment variables for all secrets
- Configure proper CORS settings
- Validate all user inputs on the backend