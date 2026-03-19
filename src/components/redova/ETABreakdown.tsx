import { motion } from 'framer-motion';
import { Timer, MapPin, Clock, Truck } from 'lucide-react';
import { DonorMatchETA } from '@/types/Redova';
import { useLanguage } from '@/contexts/LanguageContext';

interface ETABreakdownProps {
  eta: DonorMatchETA;
  distance: number;
  donorName?: string;
}

export const ETABreakdown = ({ eta, distance, donorName }: ETABreakdownProps) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-surface p-5 border border-border"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center">
          <Timer className="w-4 h-4 text-info" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">{t('Emergency Blood Response Timer')}</h3>
          {donorName && <p className="text-xs text-muted-foreground">{donorName}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" /> {t('Donor Distance')}
          </span>
          <span className="text-sm font-bold text-foreground">{distance} km</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" /> {t('Preparation Time')}
          </span>
          <span className="text-sm font-bold text-foreground">{eta.prepMinutes} min</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="w-4 h-4" /> {t('Travel Time')}
          </span>
          <span className="text-sm font-bold text-foreground">{eta.travelMinutes} min</span>
        </div>
        
        <div className="border-t border-border pt-3 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">➡️ Total ETA</span>
            <motion.span
              key={eta.totalMinutes}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="text-lg font-black text-primary"
            >
              {eta.totalMinutes} {t('minutes')}
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
