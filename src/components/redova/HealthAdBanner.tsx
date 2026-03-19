import { useState, useEffect } from 'react';
import { Heart, Droplets, Shield, Apple } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const healthTips = [
  { icon: Droplets, titleKey: 'Stay Hydrated', descKey: 'Drink at least 8 glasses of water daily to maintain healthy blood volume.', color: 'text-info' },
  { icon: Heart, titleKey: 'Regular Checkups', descKey: 'Get your blood pressure and hemoglobin checked every 6 months.', color: 'text-primary' },
  { icon: Shield, titleKey: 'Iron-Rich Foods', descKey: 'Spinach, red meat, and lentils help maintain healthy iron levels for donation.', color: 'text-success' },
  { icon: Apple, titleKey: 'Post-Donation Care', descKey: 'Rest for 15 minutes and have a snack after donating blood. Avoid heavy lifting for 24 hours.', color: 'text-warning' },
];

export const HealthAdBanner = () => {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % healthTips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const tip = healthTips[index];

  return (
    <div className="bg-card rounded-2xl p-4 shadow-surface border border-border/50">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 ${tip.color}`}>
          <tip.icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">💡 {t('Health Tip')}</p>
          <p className="text-xs font-bold text-foreground">{t(tip.titleKey)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{t(tip.descKey)}</p>
        </div>
      </div>
      <div className="flex justify-center gap-1 mt-2">
        {healthTips.map((_, i) => (
          <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>
    </div>
  );
};
