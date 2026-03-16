import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'donor' | 'hospital' | 'admin';
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile && profile.role !== allowedRole) {
    const roleMap: Record<string, string> = {
      donor: '/donor',
      hospital: '/hospital',
      admin: '/admin',
    };
    return <Navigate to={roleMap[profile.role] || '/login'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
