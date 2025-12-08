o help me set up the personal access token# Petty Cash System

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

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

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

## Deployment

The application can be deployed to Vercel or any platform that supports Next.js serverless functions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.