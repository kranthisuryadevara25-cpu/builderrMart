# BuildMart AI - Construction Materials E-commerce Platform

## Overview

BuildMart AI is a web-based e-commerce platform for trading construction materials including cement, steel, plumbing, and electrical supplies. The system is designed with a multi-tenant architecture supporting three user roles: Owner Admin, Vendor Manager Admin, and individual Vendors. The platform enables comprehensive product and category management with role-based access controls and vendor-specific product isolation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Authentication**: Context-based authentication system with role-based access control

### Backend Architecture
- **Runtime**: Node.js with Express.js for the REST API server
- **Language**: TypeScript for full-stack type safety
- **Session Management**: Express sessions with secure cookie configuration
- **Authentication**: bcrypt for password hashing with role-based middleware
- **Validation**: Zod schemas for request validation and type safety
- **Database Access**: Drizzle ORM for type-safe database operations

### Database Design
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Core Tables**:
  - **Users**: Stores user credentials, roles (owner_admin, vendor_manager, vendor), and metadata
  - **Categories**: Hierarchical category structure with self-referencing parent relationships
  - **Products**: Product catalog with vendor association, dynamic specifications (JSONB), quantity-based pricing slabs (JSONB), and flexible charge structures (JSONB)

### Role-Based Access Control
- **Owner Admin**: Full system access across all vendors and products
- **Vendor Manager**: Administrative access to all vendor products and categories
- **Vendor**: Restricted access to only their own products with filtered views
- **Implementation**: Middleware-based role checking with context-aware data filtering

### Dynamic Data Architecture
The system uses JSONB fields for flexible, schema-less data storage:
- **Product Specifications**: Dynamic key-value pairs for material properties (grade, size, etc.)
- **Quantity Slabs**: Flexible pricing tiers based on quantity ranges
- **Dynamic Charges**: Configurable additional fees (loading, delivery, etc.)

This approach allows administrators and vendors to add custom fields without database schema changes.

### Build and Development
- **Development**: Vite for fast development server and hot module replacement
- **Build Process**: Vite for frontend bundling, esbuild for server-side compilation
- **TypeScript**: Strict type checking across the entire codebase
- **Path Aliases**: Organized imports with @ prefix for client code and @shared for common types

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations and schema management

### Authentication & Security
- **bcryptjs**: Password hashing for secure credential storage
- **express-session**: Server-side session management
- **jsonwebtoken**: JWT token handling for authentication

### UI and Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Consistent icon library

### Development Tools
- **TanStack Query**: Server state management and API caching
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition
- **Wouter**: Lightweight routing for single-page application navigation

### Payment Processing
- **Stripe**: Payment gateway integration for transaction processing (React Stripe.js components)

### Optional Integrations
- **Supabase**: Alternative backend infrastructure (included as dependency but not actively used in current architecture)
- **Replit**: Development environment specific tooling and error handling