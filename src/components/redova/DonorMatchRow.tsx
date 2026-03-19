import { motion } from 'framer-motion';
import { DonorMatch } from '@/types/Redova';
import { BloodTypeBadge } from './BloodTypeBadge';
import { MapPin, Clock, Timer } from 'lucide-react';

interface DonorMatchRowProps {
  match: DonorMatch;
  rank: number;
  onSelect?: () => void;
}

export const DonorMatchRow = ({ match, rank, onSelect }: DonorMatchRowProps) => {
  const daysSince = Math.floor((Date.now() - new Date(match.donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.1 }}
      onClick={onSelect}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/60 transition-colors cursor-pointer group"
    >
      <span className="text-xs font-bold text-muted-foreground w-5">#{rank + 1}</span>
      <BloodTypeBadge type={match.donor.bloodType} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-card-foreground truncate">{match.donor.fullName}</p>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{match.distance} km</span>
          <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{daysSince}d ago</span>
        </div>
      </div>
      <div className="text-right space-y-0.5">
        <span className="text-xs font-mono-tabular font-bold text-primary">{(match.score * 100).toFixed(0)}%</span>
        <div className="flex items-center gap-0.5 text-[10px] font-bold text-info">
          <Timer className="w-3 h-3" />
          <span>{match.eta.totalMinutes} min</span>
        </div>
      </div>
    </motion.div>
  );
};
