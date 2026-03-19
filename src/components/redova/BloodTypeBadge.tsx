import { BLOOD_TYPE_COLORS } from '@/data/mock-data';
import { BloodType } from '@/types/Redova';

interface BloodTypeBadgeProps {
  type: BloodType;
  size?: 'sm' | 'md' | 'lg';
}

export const BloodTypeBadge = ({ type, size = 'md' }: BloodTypeBadgeProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };

  return (
    <div className={`${sizeClasses[size]} ${BLOOD_TYPE_COLORS[type]} rounded-full flex items-center justify-center font-bold shadow-surface`}>
      {type}
    </div>
  );
};
