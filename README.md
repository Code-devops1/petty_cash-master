# Petty Cash System

A comprehensive solution for managing petty cash expenses and approvals within organizations.

## Overview

The Petty Cash System is designed to streamline the process of managing small-scale cash transactions within a company. It provides a centralized platform for employees to submit expense requests, managers to review and approve them, and administrators to track and analyze all transactions.

## Features

- **User Authentication**: Secure login and registration system
- **Expense Management**: Submit, track, and manage expense requests
- **Approval Workflow**: Multi-level approval process for expenses
- **Transaction Tracking**: Complete history of all financial transactions
- **Analytics Dashboard**: Visualize spending patterns and trends
- **M-Pesa Integration**: Process mobile payments through M-Pesa
- **Role-based Access Control**: Different permissions for admins, managers, and employees

## Technology Stack

- **Frontend**: Next.js 15, React 19
- **UI Components**: Radix UI, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Authentication and Database)
- **State Management**: React Context, React Hook Form
- **Charts**: Recharts
- **Validation**: Zod
- **Build Tool**: Next.js Built-in
- **Package Manager**: pnpm

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ (Recommended: Node.js 20+)
- pnpm (Recommended package manager for this project)

## Quick Setup

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd petty_cash_system
   ```

2. Install dependencies using pnpm (recommended):
   ```bash
   pnpm install
   ```
   
   Note: This project uses pnpm for better disk space efficiency. If you don't have pnpm installed:
   ```bash
   npm install -g pnpm
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

1. Create a new Supabase project at [https://supabase.com/](https://supabase.com/)
2. Run the SQL scripts in the `scripts/` directory in order:
   - [01-create-tables.sql](file:///C:/Users/Administrator/Downloads/petty_cash-master/petty_cash-master/scripts/01-create-tables.sql)
   - [02-seed-data.sql](file:///C:/Users/Administrator/Downloads/petty_cash-master/petty_cash-master/scripts/02-seed-data.sql)
   - And any other necessary scripts

## Project Structure

```
app/              # Next.js app directory with pages and API routes
components/       # Reusable UI components
hooks/            # Custom React hooks
lib/              # Utility functions and Supabase integration
public/           # Static assets
scripts/          # Database schema and seed files
styles/           # Global styles
```

## Available Scripts

- `pnpm dev` - Runs the app in development mode
- `pnpm build` - Builds the app for production
- `pnpm start` - Runs the built app in production mode
- `pnpm lint` - Runs the linter

## Recommended Development Workflow

1. Use pnpm as your package manager to avoid conflicts with existing lock files
2. Make sure to run database migrations when pulling updates
3. Check the scripts directory for any new migration files

## Troubleshooting

### Dependency Issues

If you encounter issues with dependencies:

1. Remove existing lock files and node_modules:
   ```bash
   rm -rf node_modules package-lock.json pnpm-lock.yaml
   ```

2. Reinstall with pnpm:
   ```bash
   pnpm install
   ```

### Environment Variables

Ensure all required environment variables are set in your `.env.local` file.

## Deployment

The application can be deployed to Vercel or any platform that supports Next.js serverless functions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.