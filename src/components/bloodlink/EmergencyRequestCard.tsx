import { motion } from 'framer-motion';
import { URGENCY_CONFIG } from '@/data/mock-data';
import { useLanguage } from '@/contexts/LanguageContext';
import { Timer, X, Phone, MapPin, User } from 'lucide-react';
import { DonorMatchETA } from '@/types/bloodlink';

interface EmergencyRequestCardProps {
  request: any;
  onAccept?: () => void;
  onDecline?: () => void;
  onDetails?: () => void;
  compact?: boolean;
  eta?: DonorMatchETA;
  distance?: number;
}

export const EmergencyRequestCard = ({ request, onAccept, onDecline, onDetails, compact, eta, distance }: EmergencyRequestCardProps) => {
  const bloodType = request.bloodType || request.blood_type;
  const hospitalName = request.hospitalName || request.hospital_name;
  const unitsNeeded = request.unitsNeeded || request.units_needed;
  const patientCondition = request.patientCondition || request.patient_condition;
  const requesterName = request.requesterName || request.requester_name;
  const requesterMobile = request.requesterMobile || request.requester_mobile;
  const upozilla = request.upozilla;
  const zilla = request.zilla;
  const urgencyKey = request.urgency as keyof typeof URGENCY_CONFIG;
  const urgency = URGENCY_CONFIG[urgencyKey];
  const { t } = useLanguage();

  if (!urgency) return null;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative overflow-hidden rounded-2xl bg-card p-5 shadow-surface border-l-4 border-primary"
    >
      {urgencyKey === 'CRITICAL' && (
        <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-ring" />
        </div>
      )}

      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${urgency.className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot} animate-pulse`} />
            {urgency.label}
          </span>
          <h3 className="text-xl font-bold mt-2 text-card-foreground">{bloodType} {t('Required')}</h3>
          <p className="text-muted-foreground text-sm font-medium">{hospitalName}</p>
          {!compact && patientCondition && (
            <p className="text-muted-foreground/70 text-xs mt-1">{patientCondition}</p>
          )}
        </div>
        <div className="bg-secondary p-3 rounded-xl text-center">
          <span className="text-xl font-mono-tabular font-bold text-card-foreground">{unitsNeeded}</span>
          <span className="text-[10px] block text-muted-foreground">{t('units')}</span>
        </div>
      </div>

      {/* Requester Contact Details */}
      {!compact && (requesterName || requesterMobile || upozilla) && (
        <div className="mt-3 bg-secondary/50 rounded-xl p-3 space-y-1.5">
          {requesterName && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="font-medium text-card-foreground">{requesterName}</span>
            </div>
          )}
          {requesterMobile && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
              <a href={`tel:${requesterMobile}`} className="text-primary hover:underline font-medium">{requesterMobile}</a>
            </div>
          )}
          {(upozilla || zilla) && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-muted-foreground">{[upozilla, zilla].filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* ETA Display */}
      {eta && !compact && (
        <div className="mt-3 bg-info/5 border border-info/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-4 h-4 text-info" />
            <span className="text-xs font-bold text-info uppercase tracking-wider">{t('Estimated Response Time')}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('Distance')}: {distance} km</span>
            <span>{t('Prep')}: {eta.prepMinutes}m</span>
            <span>{t('Travel')}: {eta.travelMinutes}m</span>
            <span className="text-sm font-black text-primary">➡️ {eta.totalMinutes} min</span>
          </div>
        </div>
      )}

      {!compact && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={onAccept}
            className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors active:scale-[0.98]"
          >
            {t('Accept Mission')}
          </button>
          {onDecline && (
            <button
              onClick={onDecline}
              className="px-4 py-2.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm font-bold hover:bg-destructive/20 transition-colors active:scale-[0.98] flex items-center gap-1"
            >
              <X className="w-4 h-4" /> {t('Decline')}
            </button>
          )}
          <button
            onClick={onDetails}
            className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
          >
            {t('Details')}
          </button>
        </div>
      )}
    </motion.div>
  );
};
