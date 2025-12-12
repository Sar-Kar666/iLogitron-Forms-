# iLogitron Forms

A powerful, modern form builder application built with Next.js, featuring a drag-and-drop interface, real-time analytics, and customizable themes. Designed to be a robust alternative to Google Forms.

![Logo](/logo.png)

## 🚀 Features

- **Intuitive Form Builder**
  - Drag-and-drop question reordering using `@dnd-kit`.
  - Multiple question types: Short Text, Paragraph, Multiple Choice (Checkboxes, Dropdowns coming soon).
  - Essential validations (Required fields).

- **Dynamic Theme Customization**
  - Live preview of theme changes.
  - Customize Primary Color and Background Color.
  - Dark Mode support out of the box.

- **Real-time Analytics**
  - Visual response summaries with Pie Charts and Bar Charts (`recharts`).
  - Individual response viewing.

- **Secure & Scalable**
  - Authentication via Google (NextAuth.js).
  - PostgreSQL database with Prisma ORM.
  - Type-safe development with TypeScript and Zod.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Database**: PostgreSQL (Supabase / Neon)
- **ORM**: Prisma
- **Auth**: NextAuth.js (Auth.js)
- **Drag & Drop**: @dnd-kit
- **Charts**: Recharts

## ⚡ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL Database URL

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sar-Kar666/iLogitron-Forms-.git
   cd ilogitron-forms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/db?schema=public"
   DIRECT_URL="postgresql://user:password@host:port/db?schema=public" # If using Supabase/Pooling
   
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Database Migration**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to start building forms.

## 🚢 Deployment

Detailed deployment instructions for Vercel are available in the [Deployment Guide](.agent/workflows/deploy_to_vercel.md).

## 🤝 Contributing

Contributions are welcome! Please run linting commands before submitting a PR.

```bash
npm run lint
```

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
