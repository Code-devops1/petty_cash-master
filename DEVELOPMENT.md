# Development Guide

This document provides detailed instructions for setting up and developing the Petty Cash System.

## Prerequisites

- Node.js 18+ (Node.js 20+ recommended)
- pnpm (recommended package manager)
- Git

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd petty_cash_system
```

### 2. Install Dependencies

We recommend using pnpm for better disk space efficiency and faster installs:

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install project dependencies
pnpm install
```

> ⚠️ **Important**: This project is configured to use pnpm. Using npm or yarn may cause dependency conflicts.

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Database Setup

### 1. Create Supabase Project

1. Go to [https://supabase.com/](https://supabase.com/) and create a new project
2. Copy your project URL and API keys

### 2. Run Database Migrations

Execute the SQL scripts in the `scripts/` directory in numerical order:

```bash
# Connect to your Supabase database and run these scripts in order:
1. scripts/01-create-tables.sql
2. scripts/02-seed-data.sql
3. Any additional scripts as needed
```

## Development Workflow

### Running the Development Server

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
pnpm build
```

### Running Production Build Locally

```bash
pnpm start
```

## Package Management Best Practices

### Using pnpm

This project uses pnpm for dependency management. Key benefits include:

- Disk space efficiency through symlinks
- Faster installations
- Strict dependency resolution

Always use pnpm commands:
- `pnpm add <package>` - Add a dependency
- `pnpm remove <package>` - Remove a dependency
- `pnpm install` - Install all dependencies
- `pnpm update` - Update dependencies

### Avoiding Dependency Conflicts

To prevent dependency conflicts:

1. Always use the same package manager (pnpm)
2. Do not commit lock files from other package managers
3. If you encounter issues, remove all lock files and node_modules:
   ```bash
   rm -rf node_modules package-lock.json pnpm-lock.yaml yarn.lock
   pnpm install
   ```

## Project Structure Guidelines

```
app/                 # Next.js App Router pages and layouts
├── api/            # API routes
├── auth/           # Authentication pages
├── dashboard/      # Dashboard pages for different roles
└── ...             # Other pages

components/          # Reusable UI components
├── ui/             # shadcn/ui components
├── charts/         # Chart components
└── ...             # Other custom components

hooks/               # Custom React hooks
lib/                 # Utility functions and integrations
├── actions.ts      # Server actions
├── supabase/       # Supabase integration
└── ...             # Other utilities

public/              # Static assets
scripts/             # Database schemas and migrations
styles/              # Global styles
```

## Code Quality

### Linting

Run the linter to check for code quality issues:

```bash
pnpm lint
```

### Type Checking

TypeScript type checking is integrated with Next.js. Errors will appear in your terminal and browser console during development.

## Troubleshooting

### Common Issues

#### 1. Module not found errors

If you see module not found errors:

```bash
# Clear pnpm cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 2. Environment variables not loading

Ensure your `.env.local` file is in the root directory and contains all required variables.

#### 3. Database connection issues

Verify your Supabase credentials in `.env.local` and check that your database is accessible.

### Performance Tips

1. Use `pnpm dev` for development (faster than `pnpm start`)
2. Enable hot reloading in your IDE
3. Use React DevTools for debugging component hierarchies

## Deployment

### Vercel Deployment

1. Push your code to GitHub/GitLab
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Manual Deployment

Build the application:

```bash
pnpm build
```

Then serve the built files using any static hosting service or Node.js server.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Commit your changes
6. Push to your fork
7. Create a pull request

Follow the existing code style and commit message conventions.