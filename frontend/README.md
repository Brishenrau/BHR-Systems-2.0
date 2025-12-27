# BHR Systems 2.0 - Frontend

React + TypeScript frontend application for BHR Systems 2.0.

## Features

- ✅ Modern React + TypeScript setup
- ✅ Login page with authentication
- ✅ Protected routes
- ✅ Dynamic menu system (reads from database)
- ✅ Flexible architecture for future schema changes
- ✅ Tailwind CSS for styling

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── common/     # Reusable components (Button, Input, etc.)
│   │   ├── features/   # Feature-specific components
│   │   └── layout/     # Layout components (Header, Sidebar, Menu)
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   ├── store/          # State management (Zustand)
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── public/             # Static assets
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Backend API Requirements

The frontend expects the following API endpoints:

### Authentication
- `POST /api/v1/auth/login` - Login with pay number and password
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Menu
- `GET /api/v1/menu/user-menu` - Get menu structure for current user
- `GET /api/v1/menu/programs` - Get all programs (admin)

## Notes

- The menu system dynamically loads from `BHR_MENHEADER` and `BHR_PGRAMCODE` tables
- User permissions are managed through `BHR_ACCESSMDL`
- All database types are defined in `src/types/database.types.ts` - update these when the schema changes

