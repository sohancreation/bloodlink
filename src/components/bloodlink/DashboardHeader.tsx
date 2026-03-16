import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import bloodlinkLogo from '@/assets/bloodlink-logo.png';

interface DashboardHeaderProps {
  subtitle: string;
  children?: React.ReactNode;
}

export const DashboardHeader = ({ subtitle, children }: DashboardHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-5 py-3 bg-card rounded-2xl border border-border shadow-sm overflow-hidden gap-3"
    >
      {/* Decorative accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-primary/60 to-transparent" />

      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
            <img src={bloodlinkLogo} alt="BloodLink" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-card" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
              Blood<span className="text-primary">Link</span>
            </h1>
            <Droplets className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/50" />
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate max-w-[200px] sm:max-w-none">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {children}
      </div>
    </motion.div>
  );
};