# ConstructOS

A comprehensive Construction Business Operating System (ERP/CMS/CRM) built for modern construction businesses.

## Features

### Core Systems
- 📊 **Dashboard & Analytics** - Real-time business overview
- 👥 **CRM** - Managing Clients, Contractors, Consultants
- 💼 **Opportunities Pipeline** - Kanban boards with drag-and-drop
- 🏗️ **Project Management** - Full project lifecycle tracking
- 💰 **Financial Management** - Estimates, Invoices, Integration ready
- 📧 **Communication Hub** - Email client, Chat, Notes
- 👤 **Client Portal** - External client access
- 📚 **Knowledge Base** - Documentation & resources
- 📝 **Activity Tracking** - Complete audit trail

### Advanced Features
- 🔐 **Granular Permissions System** - Role-based access control with custom permissions
- 🎨 **Theme System** - Light, Dark, and Auto modes
- 🧩 **Modular Architecture** - Reusable components and modules
- ⚡ **Modern Tech Stack** - React, TypeScript, Tailwind CSS, Vite

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Zustand
- **Routing**: React Router
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run typecheck` - Type check without emitting

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # Base UI components (Button, Card, Input, etc.)
│   ├── layout/      # Layout components (Header, Sidebar, AppLayout)
│   └── permissions/ # Permission-related components
├── pages/           # Page components
├── stores/          # Zustand state stores
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
└── lib/             # Utility functions
```

## Roles & Permissions

The system includes the following default roles:

- **Super Admin** - Full system access
- **Admin** - Administrative access (almost all permissions)
- **Project Manager** - Manage projects and teams
- **Sub-Contractor** - Access to assigned projects
- **Consultant** - Consultant-level access
- **Professional** - Professional user access
- **Client** - Client portal access

Custom roles and permissions can be created with granular control.

## License

Proprietary - All rights reserved

