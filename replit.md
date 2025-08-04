# BookShelf Scanner - ISBN Catalog App

## Overview

BookShelf Scanner is a web-based book cataloging application designed to help users scan and organize their personal book collections. The app allows users to scan ISBN barcodes (or enter them manually), automatically fetch book metadata from external APIs, and organize books by genre in a digital library. Built as a full-stack web application, it features a React frontend with TypeScript, an Express.js backend, and PostgreSQL database integration using Drizzle ORM.

The application is designed to handle approximately 200 books and provides features like automatic genre classification, batch processing, duplicate detection, search functionality, and CSV export capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with React 18 and TypeScript, using Vite as the build tool. The UI framework leverages shadcn/ui components built on top of Radix UI primitives with Tailwind CSS for styling. The application uses a single-page architecture with wouter for client-side routing and TanStack Query for server state management.

Key architectural decisions:
- **Component Architecture**: Modular component structure with separation between UI components (`/components/ui/`) and business logic components (`/components/`)
- **State Management**: TanStack Query handles server state and caching, reducing the need for complex client-side state management
- **Styling System**: Tailwind CSS with CSS custom properties for theming, supporting both light and dark modes
- **Type Safety**: Full TypeScript integration with shared schema definitions between frontend and backend

### Backend Architecture
The server is built with Express.js using TypeScript and follows RESTful API conventions. The architecture emphasizes simplicity and maintainability.

Key architectural decisions:
- **API Structure**: RESTful endpoints under `/api/` namespace with clear resource-based routing
- **Request/Response Flow**: JSON-based communication with proper error handling and logging middleware
- **Development Setup**: Vite integration for development with hot module replacement
- **Modular Route Organization**: Routes are organized in separate modules for maintainability

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations.

Database design decisions:
- **Schema Definition**: Centralized schema in `/shared/schema.ts` using Drizzle's declarative approach
- **Data Models**: Two main entities - `users` for basic authentication and `books` for catalog entries
- **Book Metadata**: Comprehensive book storage including ISBN, title, author, publisher, cover URL, genre, categories array, and timestamps
- **Development Flexibility**: In-memory storage implementation for development/testing alongside PostgreSQL production setup

### Authentication and Authorization
Currently implements a basic user system with username/password authentication. The architecture supports expansion to more sophisticated auth mechanisms.

### External Service Integrations
The application integrates with multiple external APIs for book metadata lookup:

**Primary Data Source**: Google Books API
- Fetches comprehensive book metadata including categories
- Requires API key configuration via environment variables
- Provides high-quality data including cover images

**Fallback Data Source**: Open Library API
- Used when Google Books fails or returns insufficient data
- No API key required, making it reliable for fallback scenarios
- Provides alternative subject classifications

**Genre Mapping System**: 
The application includes a sophisticated genre mapping service that converts various category formats from different APIs into a standardized set of genres (Fiction, Science, History, Technology, Business, Philosophy, Art, Health, Travel, Children, Other).

**Barcode Scanning**: 
Web-based camera integration with simulation capabilities for development. The architecture supports integration with barcode scanning libraries like QuaggaJS or ZXing for production use.

### Performance and Scalability Considerations
- **Query Optimization**: TanStack Query provides intelligent caching and background updates
- **Rate Limiting**: Built-in consideration for external API rate limits with retry mechanisms
- **Batch Processing**: Support for scanning multiple books with progress tracking
- **Search Performance**: Database indexing on ISBN and full-text search capabilities
- **Export Functionality**: Efficient CSV generation for large datasets

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with modern hooks and concurrent features
- **Express.js**: Node.js web framework for the backend API
- **TypeScript**: Type safety across the entire application stack
- **Vite**: Build tool and development server with HMR support

### Database and ORM
- **PostgreSQL**: Primary database (via Neon serverless)
- **Drizzle ORM**: Type-safe database toolkit with migration support
- **@neondatabase/serverless**: Serverless PostgreSQL connection

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI components for accessibility
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library
- **Google Fonts**: Roboto and Material Icons

### State Management and API
- **TanStack React Query**: Server state management and caching
- **wouter**: Lightweight client-side routing

### Development and Build Tools
- **Vite**: Build tool with TypeScript and React plugins
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration
- **Replit Integration**: Development environment plugins and error handling

### External APIs
- **Google Books API**: Primary source for book metadata
- **Open Library API**: Fallback source for book information
- **Browser Camera API**: For barcode scanning functionality

### Validation and Utilities
- **Zod**: Runtime type validation and schema definition
- **clsx/twMerge**: CSS class manipulation utilities
- **date-fns**: Date manipulation and formatting