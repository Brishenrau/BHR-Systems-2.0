# BHR Systems 2.0 - Backend API

Backend API server for BHR Systems 2.0, connecting to Oracle 10g database.

## Prerequisites

- Node.js 18+ and npm
- Oracle 10g Database
- Oracle Instant Client (if needed)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Update `.env` with your Oracle database credentials:
```env
ORACLE_USER=SADM
ORACLE_PASSWORD=your_password
ORACLE_CONNECTION_STRING=localhost:1521/XE
```

## Oracle Client Setup

### Windows
1. Download Oracle Instant Client from Oracle website
2. Extract to a folder (e.g., `C:\oracle\instantclient_10_2`)
3. Add the path to your `.env`:
```env
ORACLE_CLIENT_LIB_DIR=C:\\oracle\\instantclient_10_2
```

### Linux
1. Install Oracle Instant Client
2. Set `LD_LIBRARY_PATH` or configure in `.env`

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Menu
- `GET /api/v1/menu/user-menu` - Get user menu (requires auth)
- `GET /api/v1/menu/programs` - Get all programs (requires auth)

### Health Check
- `GET /health` - Server health check

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── repositories/    # Data access layer
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   └── app.ts           # Main application
├── .env                 # Environment variables
├── package.json
└── tsconfig.json
```

## Database Schema

The backend connects to the `SADM` schema in Oracle with the following tables:
- `BHR_PAYNUMBER` - User accounts
- `BHR_ACCESSMDL` - User access modules
- `BHR_MENHEADER` - Menu headers
- `BHR_PGRAMCODE` - Program codes
- `BHR_MODULCODE` - Module codes

## Troubleshooting

### Connection Issues
- Verify Oracle database is running
- Check connection string format: `hostname:port/service_name`
- Ensure Oracle Instant Client is installed and configured
- Check firewall settings

### Common Errors
- `ORA-12154: TNS:could not resolve the connect identifier` - Check connection string
- `ORA-01017: invalid username/password` - Verify credentials
- `NJS-045: cannot load the oracledb add-on` - Install Oracle Instant Client

## Notes

- Password authentication is currently not implemented (schema doesn't show password field)
- You may need to add password verification logic in `auth.service.ts`
- JWT tokens expire in 24 hours by default (configurable in `.env`)

