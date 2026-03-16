import { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface CreditBadgeProps {
  hospitalId: string | null;
  isDemo?: boolean;
  onClick?: () => void;
}

export const CreditBadge = ({ hospitalId, isDemo, onClick }: CreditBadgeProps) => {
  const [balance, setBalance] = useState<number | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (isDemo || !hospitalId) {
      setBalance(5);
      return;
    }
    const fetch = async () => {
      const { data } = await supabase
        .from('hospital_credits')
        .select('balance')
        .eq('hospital_id', hospitalId)
        .single();
      setBalance(data?.balance ?? 0);
    };
    fetch();
  }, [hospitalId, isDemo]);

  if (balance === null) return null;

  const isLow = balance <= 2;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
        isLow
          ? 'bg-destructive/10 text-destructive border border-destructive/20'
          : 'bg-success/10 text-success border border-success/20'
      }`}
    >
      <Coins className="w-3.5 h-3.5" />
      <span>{balance}</span>
      <span className="hidden sm:inline">{t('Credits')}</span>
    </button>
  );
};
