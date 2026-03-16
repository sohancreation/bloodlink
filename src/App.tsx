import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import DonorDashboard from "./pages/DonorDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DonationTracker from "./pages/DonationTracker";
import FirstAid from "./pages/FirstAid";
import PaymentPage from "./pages/PaymentPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/login" element={<Login />} />
                <Route path="/donor" element={<ProtectedRoute allowedRole="donor"><DonorDashboard /></ProtectedRoute>} />
                <Route path="/donor/search" element={<ProtectedRoute allowedRole="donor"><DonorDashboard /></ProtectedRoute>} />
                <Route path="/donor/create" element={<ProtectedRoute allowedRole="donor"><DonorDashboard /></ProtectedRoute>} />
                <Route path="/donor/first-aid" element={<ProtectedRoute allowedRole="donor"><FirstAid /></ProtectedRoute>} />
                <Route path="/donor/history" element={<ProtectedRoute allowedRole="donor"><DonorDashboard /></ProtectedRoute>} />
                <Route path="/donor/map" element={<ProtectedRoute allowedRole="donor"><DonorDashboard /></ProtectedRoute>} />
                <Route path="/donor/credits" element={<ProtectedRoute allowedRole="donor"><DonorDashboard /></ProtectedRoute>} />
                <Route path="/donor/tracker" element={<ProtectedRoute allowedRole="donor"><DonationTracker /></ProtectedRoute>} />
                <Route path="/hospital" element={<ProtectedRoute allowedRole="hospital"><HospitalDashboard /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
