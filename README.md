# BookShelf Scanner 📚

A web-based book catalog application with barcode scanning for organizing personal libraries by genre.

## Features

- 📱 Real barcode scanning using device camera
- 🔍 Automatic book metadata lookup via Google Books API
- 📊 Genre-based organization and statistics
- 🎯 Unlimited scanning capacity
- 💾 PostgreSQL database storage
- 📱 Mobile-responsive design
- 🔄 Camera switching (front/back)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/bookshelf-scanner.git
   cd bookshelf-scanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo "VITE_GOOGLE_BOOKS_API_KEY=your_google_books_api_key" > .env
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## Manual GitHub Deployment

### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/bookshelf-scanner.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variable: `VITE_GOOGLE_BOOKS_API_KEY`
   - Deploy!

3. **Set up Database**
   - Create a Neon PostgreSQL database
   - Add `DATABASE_URL` environment variable in Vercel

### Option 2: Railway

1. **Connect GitHub**
   - Visit [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Configure environment variables

### Option 3: Netlify

1. **Build for Static Hosting**
   ```bash
   npm run build
   ```
   
2. **Deploy to Netlify**
   - Drag and drop the `dist` folder to Netlify
   - Configure environment variables

## Environment Variables

```env
VITE_GOOGLE_BOOKS_API_KEY=your_google_books_api_key
DATABASE_URL=your_postgresql_connection_string
```

## Getting Google Books API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Books API
4. Create credentials (API Key)
5. Add the key to your environment variables

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Barcode Scanning**: ZXing library
- **Build Tool**: Vite
- **Hosting**: Vercel/Railway/Netlify ready

## Project Structure

```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # App pages
│   │   ├── hooks/        # Custom hooks
│   │   └── services/     # API services
├── server/           # Express backend
├── shared/           # Shared types/schemas
└── DEPLOYMENT.md     # Detailed deployment guide
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking

## Features in Detail

### Barcode Scanning
- Real-time ISBN barcode detection
- Camera switching between front/back
- Manual ISBN entry for backup
- Demo mode for testing

### Book Management
- Automatic metadata lookup
- Genre classification
- Duplicate detection
- Search and filter
- CSV export

### Mobile-First Design
- Responsive layout
- Touch-friendly interface
- Camera integration
- Progressive Web App ready

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For deployment issues, check the [DEPLOYMENT.md](DEPLOYMENT.md) guide or create an issue on GitHub.