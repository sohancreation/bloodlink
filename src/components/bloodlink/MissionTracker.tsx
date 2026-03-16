import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Route, Flag, CheckCircle2, Phone, X, Trophy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BloodTypeBadge } from './BloodTypeBadge';
import { Progress } from '@/components/ui/progress';

type MissionStatus = 'accepted' | 'departed' | 'on_the_way' | 'halfway' | 'almost_there' | 'arrived';

interface MissionTrackerProps {
  mission: {
    id: string;
    status: MissionStatus;
    request: any;
  };
  onUpdateStatus: (missionId: string, status: MissionStatus) => void;
  onCancel: (missionId: string) => void;
}

const STEPS: { key: MissionStatus; icon: any; labelKey: string }[] = [
  { key: 'accepted', icon: CheckCircle2, labelKey: 'মিশন গৃহীত' },
  { key: 'departed', icon: Navigation, labelKey: 'রওনা দিয়েছি' },
  { key: 'on_the_way', icon: Route, labelKey: 'পথে আছি' },
  { key: 'halfway', icon: MapPin, labelKey: 'মাঝপথে' },
  { key: 'almost_there', icon: Flag, labelKey: 'প্রায় পৌঁছে গেছি' },
  { key: 'arrived', icon: Trophy, labelKey: 'পৌঁছে গেছি!' },
];

export const MissionTracker = ({ mission, onUpdateStatus, onCancel }: MissionTrackerProps) => {
  const { t } = useLanguage();
  const currentIndex = STEPS.findIndex(s => s.key === mission.status);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;
  const nextStep = currentIndex < STEPS.length - 1 ? STEPS[currentIndex + 1] : null;
  const isComplete = mission.status === 'arrived';
  const req = mission.request;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="relative overflow-hidden rounded-2xl bg-card border-2 border-primary/30 shadow-surface"
    >
      {/* Gamified header */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <Navigation className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">{t('সক্রিয় মিশন')}</h3>
              <p className="text-xs text-muted-foreground">{req.hospital_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BloodTypeBadge type={req.blood_type} size="sm" />
            {!isComplete && (
              <button onClick={() => onCancel(mission.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Contact info */}
        {(req.requester_name || req.requester_mobile) && (
          <div className="bg-secondary/50 rounded-xl p-3 flex items-center gap-3">
            <Phone className="w-4 h-4 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              {req.requester_name && <p className="text-sm font-bold text-foreground truncate">{req.requester_name}</p>}
              {req.requester_mobile && (
                <a href={`tel:${req.requester_mobile}`} className="text-xs text-primary hover:underline">{req.requester_mobile}</a>
              )}
            </div>
            {req.upozilla && (
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full whitespace-nowrap">
                <MapPin className="w-3 h-3 inline -mt-0.5" /> {req.upozilla}{req.zilla ? `, ${req.zilla}` : ''}
              </span>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('অগ্রগতি')}</span>
            <span className="text-xs font-mono font-bold text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3 bg-secondary" />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between gap-1">
          {STEPS.map((step, i) => {
            const StepIcon = step.icon;
            const isDone = i <= currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <div key={step.key} className="flex flex-col items-center gap-1 flex-1">
                <motion.div
                  animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                    isDone
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-secondary text-muted-foreground'
                  } ${isCurrent ? 'ring-2 ring-primary/40 ring-offset-2 ring-offset-card' : ''}`}
                >
                  <StepIcon className="w-3.5 h-3.5" />
                </motion.div>
                <span className={`text-[9px] text-center leading-tight ${isDone ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                  {step.labelKey}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action button */}
        {nextStep && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onUpdateStatus(mission.id, nextStep.key)}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-md"
          >
            <nextStep.icon className="w-4 h-4" />
            {nextStep.labelKey}
          </motion.button>
        )}

        {isComplete && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-3 bg-success/10 rounded-xl border border-success/20"
          >
            <Trophy className="w-8 h-8 text-success mx-auto mb-1" />
            <p className="text-sm font-bold text-success">{t('মিশন সম্পন্ন!')}</p>
            <p className="text-xs text-muted-foreground">{t('ধন্যবাদ, আপনি একজন জীবন রক্ষাকারী! 🎉')}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
