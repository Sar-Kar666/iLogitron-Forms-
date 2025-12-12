---
description: How to deploy the iLogitron Forms application to Vercel
---

# Deploying to Vercel

Follow these steps to deploy your Next.js application to Vercel.

## 1. Prerequisites

Ensure you have the following:
- A [Vercel Account](https://vercel.com).
- A [GitHub Account](https://github.com).
- A hosted PostgreSQL database (e.g., Supabase, Neon, or Vercel Postgres).

## 2. Push Code to GitHub

If you haven't already, push your code to a GitHub repository.

```bash
git init
git add .
git commit -m "Initial commit"
# Create a new repo on GitHub and follow instructions to push
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

## 3. Import Project in Vercel

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository.

## 4. Configure Build Settings

Vercel usually detects Next.js automatically.
- **Framework Preset**: Next.js
- **Root Directory**: `./` (leave default)
- **Build Command**: `next build` (default)
- **Output Directory**: `.next` (default)

## 5. Configure Environment Variables

Expand the **"Environment Variables"** section and add the following keys from your `.env` file. **Do not paste keys directly into the repo**.

| Key | Description |
|-----|-------------|
| `DATABASE_URL` | Connection string to your PostgreSQL database (Transaction/Pooled mode if separate). |
| `DIRECT_URL` | Direct connection string to your database (Required for Prisma migrations if using pooling). |
| `NEXTAUTH_SECRET` | A random string used to encrypt session tokens. Generate one with `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Set this to your Vercel URL (e.g., `https://your-project.vercel.app`) or custom domain. Vercel automatically sets `VERCEL_URL` however explicit configuration prevents issues. |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console. |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console. |

> **Note**: You may need to update your **Google Cloud Console** authorized redirect URIs to include your new Vercel domain:
> `https://your-project.vercel.app/api/auth/callback/google`

## 6. Deploy

1. Click **"Deploy"**.
2. Wait for the build to complete.
3. If the build fails due to database connection, ensure your database accepts connections from Vercel.

## 7. Post-Deployment

- **Run Migrations**: Vercel can run migrations during build if you add `npx prisma migrate deploy` to your build command, but usually, it's safer to run them manually or via a separate script.
    - You can override the "Install Command" in Vercel settings to: `npm install && npx prisma generate`
    - Or add a `"postinstall": "prisma generate"` script to `package.json`.

- **Verify**: Open your deployed URL and try logging in.
