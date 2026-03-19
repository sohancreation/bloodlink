import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, ShoppingCart, History, CheckCircle, Clock, AlertTriangle, CreditCard, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const SUBSCRIPTION_PLANS = [
  { name: 'Basic', credits: 30, price: 499 },
  { name: 'Standard', credits: 75, price: 999 },
  { name: 'Premium', credits: 200, price: 1999 },
];

interface CreditManagerProps {
  hospitalId: string | null;
  isDemo?: boolean;
}

export const CreditManager = ({ hospitalId, isDemo }: CreditManagerProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [packages, setPackages] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bKash');

  useEffect(() => {
    loadAll();
  }, [hospitalId, isDemo]);

  const loadAll = async () => {
    if (isDemo || !hospitalId) {
      setBalance(5);
      setPackages([
        { id: '1', name: 'Starter', credits: 10, price_bdt: 99 },
        { id: '2', name: 'Standard', credits: 30, price_bdt: 249 },
        { id: '3', name: 'Premium', credits: 75, price_bdt: 499 },
      ]);
      setTransactions([{ id: '1', amount: 5, type: 'signup_bonus', description: 'Welcome bonus: 5 free credits', created_at: new Date().toISOString() }]);
      setLoading(false);
      return;
    }

    const [credRes, pkgRes, txRes, prRes, subRes] = await Promise.all([
      supabase.from('hospital_credits').select('balance').eq('hospital_id', hospitalId).single(),
      supabase.from('credit_packages').select('*').eq('is_active', true).order('price_bdt'),
      supabase.from('credit_transactions').select('*').eq('hospital_id', hospitalId).order('created_at', { ascending: false }).limit(20),
      supabase.from('credit_purchase_requests').select('*').eq('hospital_id', hospitalId).order('created_at', { ascending: false }).limit(10),
      supabase.from('hospital_subscriptions' as any).select('*').eq('hospital_id', hospitalId).eq('status', 'active').order('created_at', { ascending: false }).limit(1),
    ]);
    setBalance(credRes.data?.balance ?? 0);
    setPackages(pkgRes.data || []);
    setTransactions(txRes.data || []);
    setPurchaseRequests(prRes.data || []);
    setActiveSubscription((subRes.data as any[])?.[0] || null);
    setLoading(false);
  };

  const handlePurchase = async (pkg: any) => {
    if (isDemo) {
      toast.info(t('Sign in to purchase credits'));
      return;
    }
    if (!paymentRef.trim()) {
      toast.error(t('Please enter your payment reference / transaction ID'));
      return;
    }
    const { error } = await supabase.from('credit_purchase_requests').insert({
      hospital_id: hospitalId!,
      package_id: pkg.id,
      payment_method: paymentMethod,
      payment_reference: paymentRef.trim(),
    });
    if (error) { toast.error(error.message); return; }
    toast.success(t('Purchase request submitted! Admin will approve shortly.'));
    setBuyingId(null);
    setPaymentRef('');
    loadAll();
  };

  if (loading) return <div className="text-muted-foreground text-sm animate-pulse p-4">Loading credits...</div>;

  const isLow = balance <= 2;

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl p-6 border ${isLow ? 'bg-destructive/5 border-destructive/20' : 'bg-success/5 border-success/20'}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLow ? 'bg-destructive/10' : 'bg-success/10'}`}>
            <Coins className={`w-5 h-5 ${isLow ? 'text-destructive' : 'text-success'}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t('Available Credits')}</p>
            <p className={`text-3xl font-black ${isLow ? 'text-destructive' : 'text-success'}`}>{balance}</p>
          </div>
        </div>
        {isLow && (
          <p className="text-xs text-destructive flex items-center gap-1 mt-2">
            <AlertTriangle className="w-3 h-3" /> {t('Low credits! Purchase more to continue fulfilling requests.')}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground mt-2">{t('1 credit is deducted per fulfilled blood request')}</p>
      </motion.div>

      {/* Monthly Plans */}
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
          <Crown className="w-3.5 h-3.5" /> {t('Monthly Subscription Plans')}
        </h3>
        {activeSubscription && (
          <div className="mb-3 p-3 rounded-xl bg-success/5 border border-success/20 flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-success" />
            <div>
              <p className="text-xs font-bold text-foreground">{t('Active')}: {activeSubscription.plan_name}</p>
              <p className="text-[10px] text-muted-foreground">{activeSubscription.credits_per_month} {t('credits')}/mo · ৳{activeSubscription.price_bdt}/mo</p>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {SUBSCRIPTION_PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all"
            >
              <p className="font-bold text-foreground">{plan.name}</p>
              <p className="text-2xl font-black text-primary mt-1">৳{plan.price}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
              <p className="text-xs text-muted-foreground">{plan.credits} {t('credits')}/month</p>
              <button
                onClick={() => {
                  if (isDemo) { toast.info(t('Sign in to subscribe')); return; }
                  navigate(`/payment?plan=${plan.name}`);
                }}
                className="mt-3 w-full bg-primary text-primary-foreground text-xs font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
              >
                <CreditCard className="w-3 h-3" /> {t('Subscribe')}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* One-time Credit Packages */}
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
          <ShoppingCart className="w-3.5 h-3.5" /> {t('One-time Credit Packages')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-card rounded-xl border p-4 transition-all ${buyingId === pkg.id ? 'border-primary ring-1 ring-primary/20' : 'border-border hover:border-primary/30'}`}
            >
              <p className="font-bold text-foreground">{pkg.name}</p>
              <p className="text-2xl font-black text-primary mt-1">৳{pkg.price_bdt}</p>
              <p className="text-xs text-muted-foreground">{pkg.credits} {t('Credits')}</p>
              <p className="text-[10px] text-muted-foreground mt-1">৳{(pkg.price_bdt / pkg.credits).toFixed(1)}/{t('credit')}</p>

              {buyingId === pkg.id ? (
                <div className="mt-3 space-y-2">
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full text-xs bg-secondary rounded-lg px-2 py-1.5 border-none text-foreground">
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Bank">Bank Transfer</option>
                  </select>
                  <input
                    value={paymentRef}
                    onChange={e => setPaymentRef(e.target.value)}
                    placeholder={t('Transaction ID')}
                    className="w-full text-xs bg-secondary rounded-lg px-2 py-1.5 border-none text-foreground placeholder:text-muted-foreground"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handlePurchase(pkg)} className="flex-1 bg-primary text-primary-foreground text-xs font-bold py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
                      {t('Submit')}
                    </button>
                    <button onClick={() => { setBuyingId(null); setPaymentRef(''); }} className="text-xs text-muted-foreground hover:text-foreground">
                      {t('Cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setBuyingId(pkg.id)} className="mt-3 w-full bg-secondary text-foreground text-xs font-bold py-2 rounded-lg hover:bg-secondary/80 transition-colors flex items-center justify-center gap-1">
                  <CreditCard className="w-3 h-3" /> {t('Purchase')}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pending Requests */}
      {purchaseRequests.filter(pr => pr.status === 'pending').length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> {t('Pending Purchases')}
          </h3>
          <div className="space-y-2">
            {purchaseRequests.filter(pr => pr.status === 'pending').map(pr => (
              <div key={pr.id} className="flex items-center gap-3 bg-warning/5 border border-warning/20 rounded-xl p-3">
                <Clock className="w-4 h-4 text-warning" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">{pr.payment_method} · {pr.payment_reference}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(pr.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-[10px] font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-full">{t('Pending')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
          <History className="w-3.5 h-3.5" /> {t('Transaction History')}
        </h3>
        <div className="space-y-2 max-h-60 overflow-auto">
          {transactions.length === 0 && <p className="text-xs text-muted-foreground">{t('No transactions yet.')}</p>}
          {transactions.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                {tx.amount > 0 ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <Coins className="w-3.5 h-3.5 text-destructive" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{tx.description}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs font-black ${tx.amount > 0 ? 'text-success' : 'text-destructive'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
