import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  delay?: number;
  onClick?: () => void;
}

export const StatCard = ({ icon: Icon, label, value, trend, delay = 0, onClick }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: 'spring', stiffness: 300, damping: 30 }}
    onClick={onClick}
    className={`bg-card rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-surface ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-primary/30 hover:shadow-md transition-all active:scale-[0.98]' : ''}`}
  >
    <div className="flex items-center justify-between mb-1.5 sm:mb-3">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      </div>
      {trend && (
        <span className="text-[10px] sm:text-xs font-medium text-success">{trend}</span>
      )}
    </div>
    <p className="text-lg sm:text-2xl font-bold text-card-foreground">{value}</p>
    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">{label}</p>
  </motion.div>
);