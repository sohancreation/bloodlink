<div align="center">
  <img src="https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/ad574f8a-22da-47e4-a28f-99a3dd112ae5" alt="BloodLink Banner" width="100%" />

  # 🩸 BloodLink
  **Emergency Blood Response & Health Network**

  [![React](https://img.shields.io/badge/React-18.3-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
</div>

<br />

## 📖 Overview

**BloodLink** is an AI-powered emergency health and blood response platform designed to bridge the gap between those in critical need and those who can help. 

By seamlessly connecting blood donors, patients, hospitals, blood banks, pharmacies, and ambulances in real-time, BloodLink ensures that life-saving resources are always just a click away.

---

## ✨ Key Features

- 👤 **Smart Donor Matching**: AI-driven algorithms instantly match specific blood type requirements with nearby eligible donors.
- 🏥 **Emergency Service Search**: Rapid locator for nearby hospitals, blood banks, pharmacies, and ambulances.
- 🗺️ **Live Crisis Map**: Interactive geographic visualization of ongoing blood requests and available resources.
- 🤖 **AI First-Aid Guidance**: Integrated AI assistant that provides immediate, reliable first-aid instructions during critical situations.
- 🔒 **Secure Authorization**: Multi-role authentication (Donor, Hospital, Admin) ensures data security and appropriate access levels.
- 💳 **Credit & Reward System**: Built-in gamification that rewards frequent donors.

---

## 🛠️ Technology Stack

Our modern stack ensures blazing-fast speeds, reliability, and security:

### Frontend
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **State Management**: [React Query (TanStack)](https://tanstack.com/query/latest)
- **Maps**: [React Leaflet](https://react-leaflet.js.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Backend & Infrastructure
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Cloud Functions**: Supabase Edge Functions (Deno)
- **AI Integration**: Custom Lovable API Endpoints
- **CI/CD**: GitHub Actions (Deployed to GitHub Pages)

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/sohancreation/bloodlink.git
cd bloodlink
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root of your project and add your Supabase credentials:
```env
VITE_SUPABASE_PROJECT_ID="your_project_id"
VITE_SUPABASE_URL="https://your_project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your_anon_key"
```

### 4. Run the Development Server
```bash
npm run dev
```
Your application will be available at `http://localhost:8080`.

---

## 📦 Building for Production

To create a production-optimized build:
```bash
npm run build
```
This command generates static assets into the `dist/` folder, ready for deployment.

---

## 🚀 Deployment (GitHub Pages)

This project features automated deployments. Simply push your code to the `main` branch, and GitHub Actions will handle the build and deploy process directly to [GitHub Pages](https://sohancreation.github.io/bloodlink/).

*Note: The React Router is explicitly configured using `import.meta.env.BASE_URL` to flawlessly support GitHub Pages sub-directory pathing.*

---

## 🤝 Contributing

We welcome contributions to make BloodLink better!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
  <p>Built with ❤️ to save lives.</p>
</div>
