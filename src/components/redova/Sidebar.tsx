import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Building2, Shield, LogOut, Droplets, LayoutDashboard, Search, PlusCircle, Clock, MapPin, Stethoscope, Activity, Coins, Crown } from 'lucide-react';
import RedovaLogo from '@/assets/redova-logo.png';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  path: string;
  icon: any;
  label: string;
  role?: string;
  section?: boolean;
}

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { signOut, user, profile } = useAuth();

  const role = profile?.role;

  const homeMap: Record<string, string> = {
    donor: '/donor',
    hospital: '/hospital',
    admin: '/admin',
  };
  const homePath = role ? homeMap[role] : '/';

  const donorNav: NavItem[] = [
    { path: '/donor', icon: LayoutDashboard, label: t('Dashboard') },
    { path: '/donor/search', icon: Search, label: t('AI Search') },
    { path: '/donor/create', icon: PlusCircle, label: t('+ Request') },
    { path: '/donor/first-aid', icon: Stethoscope, label: t('প্রাথমিক চিকিৎসা') },
    { path: '/donor/history', icon: Clock, label: t('history') },
    { path: '/donor/map', icon: MapPin, label: t('map') },
    { path: '/donor/tracker', icon: Activity, label: t('রক্তদান ট্র্যাকার') },
    { path: '/donor/credits', icon: Coins, label: t('Buy Credits') },
  ];

  const hospitalNav: NavItem[] = [
    { path: '/hospital', icon: Building2, label: t('Hospital') },
    { path: '/payment', icon: Crown, label: t('Subscription') },
  ];

  const adminNav: NavItem[] = [
    { path: '/admin', icon: Shield, label: t('Admin') },
  ];

  const navMap: Record<string, NavItem[]> = {
    donor: donorNav,
    hospital: hospitalNav,
    admin: adminNav,
  };

  const navItems = role ? (navMap[role] || []) : [];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="relative flex flex-col items-center py-6 bg-card rounded-3xl shadow-surface h-full border border-border/70">
      <div className="pointer-events-none absolute top-4 bottom-4 right-0 w-1 rounded-full bg-gradient-to-b from-destructive/20 via-destructive to-destructive/20" />
      <Link to={homePath} className="mb-8">
        <img src={RedovaLogo} alt="Redova" className="w-10 h-10 rounded-xl object-contain" />
      </Link>

      <div className="flex-1 flex flex-col gap-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors group"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
              <span className="absolute left-full ml-2 bg-card text-card-foreground text-xs font-medium px-2 py-1 rounded-lg shadow-surface-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {user && (
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      )}
    </nav>
  );
};

export { Sidebar };
