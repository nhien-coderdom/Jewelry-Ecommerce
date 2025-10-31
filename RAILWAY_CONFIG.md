# Railway Configuration

## Project Structure
- `/server` - Strapi Backend
- `/client` - Next.js Frontend

## Services

### Server (Strapi)
- Root Directory: `/server`
- Dockerfile: `Dockerfile.prod`
- Port: 1337
- Database: PostgreSQL

### Client (Next.js)
- Root Directory: `/client`  
- Dockerfile: `Dockerfile.prod`
- Port: 3000

## Important Notes

### Build Context
Railway builds from the root directory by default. To build from a subdirectory:

**Option 1: Using Railway Dashboard**
1. Go to Service Settings
2. Set "Root Directory" to `server` or `client`
3. Set "Dockerfile Path" to `Dockerfile.prod`

**Option 2: Using railway.toml (Recommended)**
Create separate services with different configurations.

### Environment Variables

#### Server Required Variables
```
DATABASE_CLIENT=postgres
DATABASE_URL=${{Postgres.DATABASE_URL}}
APP_KEYS=generate-random-keys
API_TOKEN_SALT=generate-random
ADMIN_JWT_SECRET=generate-random
JWT_SECRET=generate-random
HOST=0.0.0.0
PORT=1337
NODE_ENV=production
```

#### Client Required Variables
```
NEXT_PUBLIC_STRAPI_API_URL=https://server-url.railway.app/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
NODE_ENV=production
PORT=3000
```

## Deployment

### Automatic Deployment
Railway will automatically deploy when you push to configured branch.

### Manual Deployment
```bash
railway up --service=server
railway up --service=client
```

## Troubleshooting

### Build Fails at "RUN npm install"
**Cause**: Railway is building from root directory instead of subdirectory.

**Solution**: 
1. Set "Root Directory" in Railway dashboard to `server` or `client`
2. Or use separate repositories for each service

### Cannot find package.json
**Cause**: Dockerfile context is wrong.

**Solution**:
1. Verify "Root Directory" setting
2. Check Dockerfile COPY commands
3. Ensure package.json exists in the subdirectory

### Database Connection Failed
**Cause**: Missing or incorrect DATABASE_URL.

**Solution**:
1. Add PostgreSQL service in Railway
2. Reference database variables: `${{Postgres.DATABASE_URL}}`
3. Check if database is in same project
