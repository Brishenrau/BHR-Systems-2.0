# Backend Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create a `.env` file in the `backend` folder:

```env
# Oracle Database Configuration
ORACLE_USER=SADM
ORACLE_PASSWORD=your_actual_password
ORACLE_CONNECTION_STRING=localhost:1521/XE

# If you need to specify Oracle Client library path:
# ORACLE_CLIENT_LIB_DIR=C:\\oracle\\instantclient_10_2

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (change this!)
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=24h

# CORS (frontend URL)
CORS_ORIGIN=http://localhost:5173
```

### 3. Oracle Instant Client Setup

#### For Windows:
1. Download Oracle Instant Client 10g from Oracle website
2. Extract to a folder (e.g., `C:\oracle\instantclient_10_2`)
3. Add to `.env`:
   ```env
   ORACLE_CLIENT_LIB_DIR=C:\\oracle\\instantclient_10_2
   ```

#### For Linux:
1. Install Oracle Instant Client
2. Set `LD_LIBRARY_PATH` or configure in `.env`

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

### 5. Test the Connection

Visit: `http://localhost:3000/health`

You should see:
```json
{
  "success": true,
  "message": "BHR Systems API is running",
  "timestamp": "..."
}
```

## Connection String Formats

### Basic Format:
```
hostname:port/service_name
```
Example: `localhost:1521/XE`

### TNS Format:
```
(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=XE)))
```

## Troubleshooting

### Error: "NJS-045: cannot load the oracledb add-on"
- Install Oracle Instant Client
- Set `ORACLE_CLIENT_LIB_DIR` in `.env`
- Restart the server

### Error: "ORA-12154: TNS:could not resolve the connect identifier"
- Check your connection string format
- Verify database is running
- Check network connectivity

### Error: "ORA-01017: invalid username/password"
- Verify `ORACLE_USER` and `ORACLE_PASSWORD` in `.env`
- Check user permissions in Oracle

## Next Steps

1. Test database connection
2. Test login endpoint: `POST http://localhost:3000/api/v1/auth/login`
3. Test menu endpoint: `GET http://localhost:3000/api/v1/menu/user-menu` (requires auth token)

## API Testing

### Login Example:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"payNumber":"YOUR_PAY_NUMBER","password":"YOUR_PASSWORD"}'
```

### Get Menu (with token):
```bash
curl -X GET http://localhost:3000/api/v1/menu/user-menu \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

