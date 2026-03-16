import { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface RequesterCreditBadgeProps {
  isDemo?: boolean;
}

export const RequesterCreditBadge = ({ isDemo }: RequesterCreditBadgeProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (isDemo) {
      setBalance(10);
      return;
    }
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('requester_credits' as any)
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();
      setBalance((data as any)?.balance ?? null);
    };
    load();
  }, [user, isDemo]);

  if (balance === null) return null;

  const isLow = balance <= 1;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
      isLow ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
    }`}>
      <Coins className="w-3.5 h-3.5" />
      <span>{balance}</span>
      <span className="hidden sm:inline">{t('Credits')}</span>
    </div>
  );
};
