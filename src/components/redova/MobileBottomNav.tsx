import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Search, PlusCircle, Clock, MapPin, Coins, Building2, Package, Crown, Shield, Activity, Stethoscope, MoreHorizontal } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

interface NavItem {
  path: string;
  icon: any;
  label: string;
}

export const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { profile } = useAuth();
  const role = profile?.role;
  const [moreOpen, setMoreOpen] = useState(false);

  const donorPrimary: NavItem[] = [
    { path: '/donor', icon: LayoutDashboard, label: t('Dashboard') },
    { path: '/donor/search', icon: Search, label: t('Search') },
    { path: '/donor/create', icon: PlusCircle, label: t('Post') },
    { path: '/donor/credits', icon: Coins, label: t('Credits') },
  ];

  const donorMore: NavItem[] = [
    { path: '/donor/first-aid', icon: Stethoscope, label: t('First Aid') },
    { path: '/donor/history', icon: Clock, label: t('History') },
    { path: '/donor/map', icon: MapPin, label: t('Map') },
    { path: '/donor/tracker', icon: Activity, label: t('Tracker') },
  ];

  const hospitalPrimary: NavItem[] = [
    { path: '/hospital', icon: Building2, label: t('Home') },
    { path: '/payment', icon: Crown, label: t('Plans') },
  ];

  const adminPrimary: NavItem[] = [
    { path: '/admin', icon: Shield, label: t('Admin') },
  ];

  const primaryMap: Record<string, NavItem[]> = { donor: donorPrimary, hospital: hospitalPrimary, admin: adminPrimary };
  const moreMap: Record<string, NavItem[]> = { donor: donorMore };

  const primaryItems = role ? (primaryMap[role] || []) : [];
  const moreItems = role ? (moreMap[role] || []) : [];

  if (primaryItems.length === 0) return null;

  const allMoreActive = moreItems.some(item => location.pathname === item.path);

  return (
    <>
      {/* More menu overlay */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute bottom-16 left-0 right-0 bg-card border-t border-border rounded-t-2xl shadow-lg p-3 pb-2">
            <div className="grid grid-cols-4 gap-2">
              {moreItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(item.path);
                      setMoreOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-colors ${isActive ? 'bg-primary/10' : 'hover:bg-secondary'}`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-[10px] font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border px-1 pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex items-center justify-around h-14">
          {primaryItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMoreOpen(false); }}
                className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-primary rounded-b-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* More button for extra items */}
          {moreItems.length > 0 && (
            <button
              onClick={() => setMoreOpen(prev => !prev)}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors"
            >
              {(allMoreActive && !moreOpen) && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-primary rounded-b-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <MoreHorizontal className={`w-5 h-5 ${moreOpen || allMoreActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] font-semibold ${moreOpen || allMoreActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {t('More')}
              </span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
};
