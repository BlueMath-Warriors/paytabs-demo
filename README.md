# PayTabs Integration Demo Platform

A Next.js demo platform for managing PayTabs API credentials, creating PayLinks, and receiving webhook notifications.

## Features

- **User Authentication**: Simple email/password authentication with NextAuth.js
- **API Credentials Management**: Store and manage multiple PayTabs API credentials (Server Key + Profile ID)
- **PayLink Creation**: Create payment links via PayTabs API with dynamic webhook callbacks
- **Webhook Handling**: Receive and verify PayTabs webhook notifications with HMAC signature verification
- **Webhook Logs**: View all received webhook notifications with verification status

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Neon Postgres (serverless, Vercel-compatible)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS 4

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

1. Create a free account at [Neon](https://neon.tech)
2. Create a new project and get your connection string
3. Copy `.env.example` to `.env` (if it exists) or create a `.env` file with:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### Step 1: Create Neon Database
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string

### Step 2: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/paytab-demo.git
git push -u origin main
```

### Step 3: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project" and import your repository
3. Add environment variables:
   - `DATABASE_URL` - Your Neon connection string
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your Vercel URL (update after first deploy)
4. Click Deploy!

### Step 4: Initialize Database
After deployment, run the database migration:
```bash
DATABASE_URL="your-neon-connection-string" npx prisma db push
```

### Step 5: Update NEXTAUTH_URL
After first deploy, update `NEXTAUTH_URL` in Vercel to your actual URL (e.g., `https://paytab-demo.vercel.app`)

## Usage

1. **Sign Up**: Create an account with email and password
2. **Add Credentials**: Go to "API Credentials" and add your PayTabs Server Key and Profile ID
3. **Create PayLink**: Use "Create PayLink" to generate payment links
4. **Monitor Webhooks**: Check "Webhook Logs" to see payment notifications

## PayTabs Integration

### Getting API Credentials

1. Log into PayTabs Merchant Dashboard
2. Navigate to Developers > API Keys > Key Management
3. Generate new API keys
4. Copy the Server Key and Profile ID

### Webhook Configuration

The platform automatically sets up webhooks for each user:
- Webhook URL format: `https://your-domain.com/api/webhook/[userId]`
- Each user gets a unique webhook endpoint
- Webhooks are verified using HMAC SHA256 signature

### Webhook Verification

PayTabs sends webhooks with a `Signature` header containing an HMAC SHA256 hash of the request body. The platform:
- Calculates the hash using the user's Server Key
- Compares it with the signature header
- Logs verification status for each webhook

## Project Structure

```
app/
├── login/               # Login page
├── signup/              # Signup page
├── payment-result/      # Payment result page (public)
├── dashboard/           # Protected dashboard
│   ├── page.js          # Dashboard home
│   ├── credentials/     # API credentials management
│   ├── paylinks/        # PayLink creation
│   ├── webhooks/        # Webhook logs
│   └── payment-result/  # Payment result (authenticated)
├── api/
│   ├── auth/            # NextAuth routes
│   ├── credentials/     # Credential CRUD
│   ├── paylinks/        # PayLink creation
│   ├── payment-return/  # PayTabs return handler
│   ├── webhook/[userId]/ # Webhook receiver
│   └── webhooks/        # Webhook logs API
lib/
├── auth.js              # NextAuth configuration
├── prisma.js            # Prisma client
└── paytabs.js           # PayTabs API helper
prisma/
└── schema.prisma        # Database schema
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon Postgres connection string | Yes |
| `NEXTAUTH_SECRET` | Secret key for JWT signing | Yes |
| `NEXTAUTH_URL` | Base URL of your application | Yes |

## License

MIT
