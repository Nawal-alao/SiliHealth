# 🚀 HealID - Quick Start Guide

## Prerequisites

- Node.js >= 16
- PostgreSQL (ou configurer SQLite pour dev)
- npm

## 1️⃣ Backend Setup & Start

```bash
cd backend

# Install dependencies
npm install

# Configure environment (create .env if needed)
# Example .env:
# DATABASE_URL="postgresql://user:password@localhost:5432/healid"
# JWT_SECRET="your-secret-key"

# Generate Prisma client
npm run prisma:generate

# Create/migrate database (if first time)
npm run prisma:migrate

# Start development server
npm run start:dev
```

The backend will listen on `http://localhost:4000`

### Backend API Routes

- `POST /api/signup` - Register new user
- `POST /api/login` - Login (returns JWT token)
- `GET /api/patients/profile` - Get authenticated patient profile
- `GET /api/qr/access/:patientId` - Get patient minimal info (public)
- `POST /api/qr/log-access` - Log QR access (public)
- `GET /api/qr/scan/:secureToken` - Scan QR by token
- `POST /api/qr/generate/:patientId` - Generate new QR (agents only)
- `POST /api/qr/emergency/:secureToken` - Emergency access (agents only)

## 2️⃣ Frontend Setup & Start

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will listen on `http://localhost:3000`

### Frontend Key Pages

- `/` - Home page
- `/login` - Login form
- `/signup` - Registration form
- `/dashboard-patient` - Patient dashboard (requires auth)
- `/dashboard-agent` - Agent dashboard (requires auth)
- `/qr-access/{patientId}` - Public QR access page
- `/system-settings` - Settings page (theme, language, notifications)

## 3️⃣ Quick Manual Tests

### Test 1: Login (Fix verify)
1. Go to `http://localhost:3000/login`
2. Enter email and password
3. Expected: **No page reload**, redirects to dashboard via JavaScript
4. Check browser console: Should show `✅ Redirection exécutée`

### Test 2: Theme Toggle (Dark Mode)
1. Click the moon/sun icon (top right)
2. Expected: Page background changes to dark/light
3. Verify: `localStorage.getItem('healid_theme')` should change

### Test 3: Patient QR Code
1. Login as patient
2. Go to `/dashboard-patient`
3. Expected: QR code image appears in "Mon QR Code Santé" section
4. QR encodes: `http://localhost:3000/qr-access/{patientId}`

### Test 4: Public QR Access
1. Open QR page: `http://localhost:3000/qr-access/{patientId}`
2. Expected: Shows minimal patient info (name, ID)
3. Button: "Demander accès au dossier complet"
4. Check backend logs: `/api/qr/log-access` called successfully

### Test 5: Emergency Mode
1. Open: `http://localhost:3000/qr-access/{patientId}?emergency=true`
2. Expected: Shows vital info banner "🚨 MODE URGENCE ACTIVÉ"
3. Displays: Blood type, allergies, medications, chronic conditions, emergency contact
4. Verify: Device fingerprint and timestamp logged

## 4️⃣ Database Inspection

### PostgreSQL

```sql
-- Check activity logs
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10;

-- Check emergency logs
SELECT * FROM emergency_logs ORDER BY created_at DESC LIMIT 10;

-- Check users
SELECT id, email, role, is_active FROM users;

-- Check patients
SELECT patient_id, first_name, last_name, blood_type FROM patients;
```

### SQLite (if using SQLite for dev)

```sql
.open healid.db
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10;
```

## 5️⃣ Troubleshooting

### Backend won't start
- Check `DATABASE_URL` environment variable
- Verify PostgreSQL is running: `psql -U postgres`
- Check port 4000 is free: `lsof -i :4000`

### Frontend can't reach backend
- Verify backend is running on 4000
- Check browser console for CORS errors
- Verify `API_BASE` in frontend code is `http://localhost:4000`

### QR code not generating
- Check internet connection (uses qr-server.com API)
- Verify patient ID is valid UUID
- Check browser console for fetch errors

### Theme not persisting
- Check localStorage is enabled in browser
- Try private/incognito mode test
- Check for localStorage quota errors

### Login redirect not working
- Check browser console for JavaScript errors
- Verify form has `data-api="/api/login"`
- Check network tab for POST request response
- Verify backend returns `{ ok: true, token, user }`

## 6️⃣ Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/healid
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
PORT=4000
```

### Frontend (no .env needed, uses http://localhost:4000)

## 7️⃣ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "POST request failed, redirecting to GET" | ✅ Fixed - submit handler now intercepts all forms with `data-api` |
| "QR code not scanning" | ✅ Fixed - scanner now accepts URLs, tokens, and legacy format |
| "Dark mode doesn't persist" | ✅ Fixed - localStorage persist added with fallback |
| "Patient not found on QR access" | Check patient ID is valid and in DB |
| "Emergency log not recorded" | Verify `/api/qr/log-access` endpoint working in backend |
| "Login redirects to wrong dashboard" | Check user.role is `patient` or `agent_de_sante` |

## 8️⃣ Production Checklist

- [ ] Set `JWT_SECRET` to a strong random value
- [ ] Use production PostgreSQL with backups
- [ ] Enable HTTPS
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS properly
- [ ] Add rate limiting on auth endpoints
- [ ] Monitor emergency access logs
- [ ] Test backup/restore process
- [ ] Set up proper logging
- [ ] Review security headers

## 9️⃣ Documentation References

- Backend: See `backend/README.md`
- Frontend: See `frontend/README.md`
- Database: See `backend/prisma/schema.prisma`
- E2E Tests: See `e2e/README.md`

## 10️⃣ Support

For issues or questions:
1. Check the logs in both terminal windows
2. Inspect browser DevTools (F12)
3. Review the relevant service README
4. Check database directly for data consistency

---

**Happy coding! 🎉**
