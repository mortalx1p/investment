# CryptoVault — Professional Cryptocurrency Investment Platform

> ⚠️ **Legal Notice:** Cryptocurrency investments involve significant risk. Returns are not guaranteed. Users should conduct their own research before investing. This platform does not constitute financial advice.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT (via `jose`) + HTTP-only cookies
- **Email:** Nodemailer (SMTP)
- **Charts:** Recharts
- **Deployment:** Vercel + Vercel Postgres (or Neon / Supabase)

---

## Features

### User Features
- ✅ Registration, Login, Email Verification, Password Reset
- ✅ User Dashboard with balance overview and charts
- ✅ Crypto Deposit System (BTC, ETH, USDT TRC20/ERC20, BNB)
- ✅ Withdrawal requests with admin approval
- ✅ Investment Plans (Starter, Growth, Premium, Elite)
- ✅ Transaction history with filtering
- ✅ Real-time notifications
- ✅ Profile management and password change
- ✅ Mobile-responsive design

### Admin Features
- ✅ Admin Dashboard with analytics
- ✅ User management (suspend, activate, balance adjustment)
- ✅ Deposit management (approve/reject with email notifications)
- ✅ Withdrawal management (approve/reject with funds return)
- ✅ Investment plan CRUD (create, edit, pause, delete)
- ✅ Wallet address management (no code changes needed)
- ✅ System settings panel
- ✅ Audit logs for all actions

---

## Quick Start (Local Development)

### 1. Clone and Install

```bash
git clone <your-repo>
cd crypto-platform
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/cryptovault"
JWT_SECRET="your-min-32-char-secret-here-make-it-random"
JWT_REFRESH_SECRET="another-min-32-char-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your@gmail.com"
SMTP_PASS="your-gmail-app-password"
SMTP_FROM="CryptoVault <noreply@cryptovault.com>"
```

### 3. Set Up Database

```bash
# Push schema to database
npm run db:push

# Seed with admin user and default data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Default Admin Credentials:**
- Email: `admin@cryptovault.com`
- Password: `Admin@123456`

> ⚠️ Change the admin password immediately after first login.

---

## Deployment on Vercel

### Option A: Vercel + Neon Postgres (Recommended — Free Tier)

#### Step 1: Set Up Neon Database (Free)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project → copy the **Connection String** (starts with `postgresql://`)

#### Step 2: Deploy to Vercel

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/crypto-platform.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo

3. Set **Framework Preset** to `Next.js`

4. Add **Environment Variables** in Vercel dashboard:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Your Neon connection string |
   | `JWT_SECRET` | Random 64-char string |
   | `JWT_REFRESH_SECRET` | Another random 64-char string |
   | `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` |
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `587` |
   | `SMTP_SECURE` | `false` |
   | `SMTP_USER` | Your Gmail address |
   | `SMTP_PASS` | Your Gmail App Password |
   | `SMTP_FROM` | `CryptoVault <noreply@cryptovault.com>` |

5. Click **Deploy**

#### Step 3: Run Database Migrations on Vercel

After first deploy, run:
```bash
# Using Vercel CLI
npm i -g vercel
vercel env pull .env.production.local
DATABASE_URL="your-neon-url" npx prisma db push
DATABASE_URL="your-neon-url" npx ts-node prisma/seed.ts
```

Or use the Neon dashboard to run the SQL directly.

---

### Option B: Vercel + Vercel Postgres

1. In Vercel dashboard → **Storage** → **Create Database** → choose **Postgres**
2. Connect it to your project — Vercel auto-injects `DATABASE_URL`
3. Add remaining env variables (JWT secrets, SMTP, etc.)
4. Deploy

---

### Option C: Vercel + Supabase

1. Go to [supabase.com](https://supabase.com) → New Project
2. Settings → Database → Copy **Connection String (URI)**
3. Use that as `DATABASE_URL` in Vercel

---

## Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → **App Passwords**
3. Create an app password for "Mail"
4. Use that 16-char password as `SMTP_PASS`

For production, consider using [Resend](https://resend.com) or [SendGrid](https://sendgrid.com) for better deliverability.

---

## Post-Deployment Checklist

- [ ] Change admin password from default
- [ ] Update wallet addresses in Admin → Wallet Addresses
- [ ] Configure investment plans as needed
- [ ] Set minimum withdrawal amount in Admin → Settings
- [ ] Test deposit flow end-to-end
- [ ] Test withdrawal flow end-to-end
- [ ] Verify email notifications are working
- [ ] Update `NEXT_PUBLIC_APP_URL` to your live domain
- [ ] Set up a custom domain in Vercel

---

## Admin Access

After deployment:
1. Navigate to `/login`
2. Login with `admin@cryptovault.com` / `Admin@123456`
3. Go to `/admin` to access the admin panel
4. **Immediately** go to Profile → Security → Change password

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Login
│   ├── register/page.tsx           # Register
│   ├── forgot-password/page.tsx    # Forgot password
│   ├── reset-password/page.tsx     # Reset password
│   ├── dashboard/                  # User dashboard
│   ├── deposit/                    # Deposit flow
│   ├── withdraw/                   # Withdrawal flow
│   ├── investments/                # Investment plans
│   ├── transactions/               # Transaction history
│   ├── notifications/              # Notifications
│   ├── profile/                    # Profile settings
│   ├── admin/                      # Admin panel
│   │   ├── deposits/               # Deposit management
│   │   ├── withdrawals/            # Withdrawal management
│   │   ├── users/                  # User management
│   │   ├── plans/                  # Investment plan CRUD
│   │   ├── wallets/                # Wallet addresses
│   │   ├── settings/               # System settings
│   │   └── audit-logs/             # Audit trail
│   └── api/                        # API routes
├── components/
│   ├── ui/                         # Reusable UI components
│   ├── dashboard/Layout.tsx        # Dashboard sidebar
│   └── admin/Layout.tsx            # Admin sidebar
└── lib/
    ├── auth.ts                     # JWT auth utilities
    ├── db.ts                       # Prisma client
    ├── email.ts                    # Email service
    ├── rate-limit.ts               # Rate limiting
    ├── utils.ts                    # Helper functions
    └── validations.ts              # Zod schemas
```

---

## Security Features

- JWT authentication with HTTP-only cookies
- CSRF protection via SameSite cookies
- Rate limiting on auth endpoints
- Input validation with Zod
- XSS protection headers
- SQL injection protection via Prisma ORM
- Password hashing with bcrypt (cost factor 12)
- Audit logging for all admin actions
- Session expiry (7 days)

---

## Legal Disclaimer

This platform is provided as-is. You are responsible for:
- Complying with financial regulations in your jurisdiction
- Obtaining necessary licenses for operating investment platforms
- Implementing KYC/AML procedures as required by law
- Tax reporting obligations
- User data protection (GDPR, CCPA, etc.)

The platform displays risk warnings throughout. **Cryptocurrency investments involve significant risk. Returns are not guaranteed.**

---

## Support

For issues with the codebase, check:
- Database connection: ensure `DATABASE_URL` is correct
- Email issues: verify SMTP credentials and app password
- Build errors: run `npm run build` locally first
- Prisma errors: run `npx prisma generate` then rebuild
