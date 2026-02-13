# 🎉 Scan & Match - ESN Speed Dating App

A modern speed dating app for ESN Porto events with QR code scanning, real-time matching, and Instagram integration.

## ✨ Features

- **🔐 Dual Auth**: Quick anonymous join or traditional email signup
- **📱 QR Code Badges**: Each user gets a unique scannable profile badge
- **📷 QR Scanner**: Built-in camera scanner to connect with other attendees
- **❤️ Voting System**: Like people you met after the event
- **🎯 Mutual Matches**: See your matches when admin reveals them
- **👥 Admin Panel**: Control voting periods and match reveals in real-time
- **🌐 Realtime Updates**: All users see changes instantly via Supabase Realtime

## 🏗️ Tech Stack

- **Next.js 15** with App Router & Turbopack
- **TypeScript** for type safety
- **Supabase** for auth, database & realtime
- **Tailwind CSS** + **shadcn/ui** for UI
- **QR Code** generation & scanning

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- A Supabase project ([create one free](https://supabase.com))

### 2. Clone & Install

```bash
cd esn-speed-dating
npm install
```

### 3. Configure Supabase

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Run the database migration in your Supabase SQL Editor:
```bash
# Copy the contents of:
supabase/migrations/001_speed_dating_schema.sql
# And paste it into Supabase SQL Editor
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📊 Database Schema

The migration creates:
- **profiles** - User profiles (extends existing table with `instagram_handle`)
- **connections** - Who scanned whom (one-way connections)
- **likes** - Who liked whom during voting period
- **app_settings** - Singleton table for global app state

## 🎮 How It Works

### For Attendees

1. **Sign Up** → Quick join (anonymous) or with email
2. **Get Badge** → Show your QR code to others
3. **Scan People** → Use the floating scan button to connect
4. **Vote** → When admin opens voting, like people you enjoyed meeting
5. **See Matches** → When admin reveals matches, see mutual likes

### For Admins

1. **Get Admin Role** → Update your profile in Supabase:
```sql
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id';
```

2. **Access Admin Panel** → Navigate to `/admin`

3. **Control Event Flow**:
   - Start with voting **closed**, matches **hidden**
   - During event: people scan each other
   - After event: **open voting** → attendees can like their connections
   - When voting ends: **reveal matches** → everyone sees mutual matches

## 🔒 Security Features

- Row Level Security (RLS) on all tables
- Users can only:
  - View their own connections
  - Like when voting is open
  - See incoming likes when matches are revealed
  - Admins can update app settings

## 📱 Routes

- `/` - Landing (redirects to /signup or /my-badge)
- `/signup` - Registration (anonymous or email)
- `/login` - Email login
- `/my-badge` - Your QR code profile
- `/my-connections` - List of people you scanned + voting
- `/admin` - Admin control panel (admins only)

## 🎨 Customization

### Change Branding

Edit `app/(app)/layout.tsx`:
```tsx
<h1>Your Event Name</h1>
```

### Modify Gender Options

Edit `app/(auth)/signup/page.tsx` to add/remove options.

### Styling

All UI uses Tailwind + shadcn. Modify `app/globals.css` for theme changes.

## 📦 Deployment

### Vercel (Recommended)

```bash
vercel --prod
```

Add environment variables in Vercel dashboard.

### Other Platforms

Build the production bundle:
```bash
npm run build
npm start
```

## 🐛 Troubleshooting

**Issue**: Anonymous users can't update profile
- **Fix**: RLS policy might need adjustment. Check Supabase policies.

**Issue**: Realtime not working
- **Fix**: Ensure `ALTER PUBLICATION supabase_realtime ADD TABLE app_settings;` was run in migration.

**Issue**: Admin can't change settings
- **Fix**: Make sure your user has `role = 'admin'` in profiles table.

## 📄 License

MIT

## 🤝 Contributing

Built with ❤️ for ESN Porto events!
