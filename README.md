# BloodLink — Emergency Blood Response Network

BloodLink is an AI-powered emergency health and blood response platform that connects blood donors, patients, hospitals, blood banks, pharmacies, and ambulances in real time. It features smart donor matching, emergency service search, a live crisis map, and AI-powered first-aid guidance to help save lives during critical situations.

## Setup Instructions

1. **Install dependencies**:
   ```sh
   npm install
   ```
2. **Setup environment variables**:
   Create a `.env` file containing your Supabase credentials:
   ```env
   VITE_SUPABASE_PROJECT_ID="your-project-id"
   VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   ```
3. **Run for local development**:
   ```sh
   npm run dev
   ```
4. **Build for production**:
   ```sh
   npm run build
   ```

## Tech Stack
- Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn-ui
- Backend: Supabase (Auth, Database, Edge Functions)
- Deployment: GitHub Pages
