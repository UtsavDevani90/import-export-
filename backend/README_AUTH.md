# Backend — Authentication & Database Initialization

## 🎯 Quick Start

### Development

```bash
cd backend
npm install
npm start
```

The server will:
1. Connect to PostgreSQL database
2. **Automatically seed admin accounts** (if they don't exist)
3. Start listening on port 5000

### Production (Render)

Just push to GitHub. Render will automatically:
1. Install dependencies
2. Start the server with `npm start`
3. Auto-seed admin accounts on startup
4. Begin accepting API requests

---

## 🔐 Admin Account Seeding (AUTO)

### How It Works

**On startup, `initializeDatabase()` runs and:**

```
1. ✅ Connects to PostgreSQL
2. ✅ Verifies `admins` table exists
3. ✅ Checks for existing admin accounts
4. ✅ If missing → Creates with bcrypt hashed passwords
5. ✅ Is idempotent (safe to run multiple times)
```

### Default Accounts (Development)

```
Email: utsavdevani90@gmail.com
Password: TanzoraAdmin123
Role: superadmin

Email: arjun@tanzoraexport.com
Password: Admin@1234
Role: admin
```

### Production Accounts (Custom)

Set in Render environment variables:

```env
ADMIN_NAME=Your Name
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=SecurePassword123!
```

If set, a single admin account will be created/updated with these credentials.

---

## 📂 Key Files

### New Files

| File | Purpose |
|------|---------|
| `utils/initializeDB.js` | Auto-initialization system |
| `../DEPLOYMENT_GUIDE.md` | Full deployment documentation |

### Modified Files

| File | Change |
|------|--------|
| `server.js` | Added `initializeDatabase()` call on startup |
| `.env.example` | Added `ADMIN_*` variables documentation |

---

## 🧪 Testing

### Local Testing

```bash
# Test login endpoint
$uri = "http://localhost:5000/api/auth/login"
$body = @{ email = "utsavdevani90@gmail.com"; password = "TanzoraAdmin123" } | ConvertTo-Json
Invoke-WebRequest -Uri $uri -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": { "id": "...", "email": "...", "role": "superadmin" },
    "token": "eyJhbGc..."
  }
}
```

### Debug Endpoint

```bash
# Check if admin exists in database
GET /api/auth/debug-connection?email=utsavdevani90@gmail.com
```

---

## 🔄 Database Migrations

Migrations are stored in `migrations/` and can be run with:

```bash
node run-migration.js
node run-migration-002.js
```

The initialization system will verify that tables exist before seeding.

---

## 📝 Environment Variables

### Required

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET=your-secret-key
NODE_ENV=production
CLIENT_URL=https://your-frontend.com
```

### Optional (Production)

```env
ADMIN_NAME=Admin Name
ADMIN_EMAIL=admin@domain.com
ADMIN_PASSWORD=SecurePassword123!
```

---

## 🚨 Troubleshooting

### Issue: "Invalid email or password"

**Check:**
1. Are migrations run? → `node run-migration.js`
2. Does admin exist? → `GET /api/auth/debug-connection?email=...`
3. Is password hashed? → Check Neon console, look for `$2a$` prefix

**Fix:**
```bash
node utils/seed-admin.js
```

### Issue: Database connection fails

**Check:**
1. Is `DATABASE_URL` set correctly?
2. Is PostgreSQL running?
3. Can you reach the database?

**Debug:**
```bash
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

### Issue: Server crashes on startup

Check the logs for initialization errors. The system won't crash but will log warnings.

---

## 🔒 Security

- ✅ Passwords hashed with bcrypt (cost factor 12)
- ✅ Never store plaintext passwords
- ✅ Use environment variables for secrets
- ✅ Change default credentials after first login
- ✅ Use HTTPS in production (Render handles this)

---

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | Public | Create new admin |
| POST | `/api/auth/login` | Public | Admin login |
| GET | `/api/auth/me` | Admin | Get profile |
| PUT | `/api/auth/change-password` | Admin | Change password |
| POST | `/api/auth/logout` | Admin | Logout |
| GET | `/api/auth/debug-connection` | Public | Debug admin lookup |

---

## 🚀 Deployment Checklist

- [ ] Push code to GitHub
- [ ] Render automatically redeploys
- [ ] Check Render logs for initialization success
- [ ] Test login on deployed frontend
- [ ] Change default admin password in production
- [ ] Monitor error logs for issues

---

## 💡 Tips

1. **Check initialization logs on startup:**
   ```
   [DB INIT] Starting automatic database initialization...
   [DB INIT] Admins table verified
   ✅  Admin seeded: email@example.com
   ```

2. **Never skip migrations:**
   - Make sure `admins` table exists before initializing

3. **Test in development first:**
   - Use local PostgreSQL before deploying to Neon

4. **Monitor production logs:**
   - Render dashboard → Logs tab

---

## 📞 Questions?

Refer to `../DEPLOYMENT_GUIDE.md` for full documentation on deployment and troubleshooting.
