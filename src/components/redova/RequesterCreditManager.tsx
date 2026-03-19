import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Send, Clock, CheckCircle, XCircle, ShoppingCart, X, Phone, Hash, Copy, CheckCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface RequesterCreditManagerProps {
  isDemo?: boolean;
}

const PAYMENT_NUMBER = '01706028192';

export const RequesterCreditManager = ({ isDemo }: RequesterCreditManagerProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [balance, setBalance] = useState(10);
  const [packages, setPackages] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Popup state
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [mobileNumber, setMobileNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAll();
  }, [user, isDemo]);

  const loadAll = async () => {
    setLoading(true);
    if (isDemo || !user) {
      setBalance(10);
      setPackages([
        { id: '1', name: 'Basic', credits: 5, price_bdt: 29 },
        { id: '2', name: 'Popular', credits: 15, price_bdt: 69 },
        { id: '3', name: 'Super Saver', credits: 35, price_bdt: 129 },
      ]);
      setTransactions([{ id: '1', amount: 10, type: 'signup_bonus', description: 'Welcome bonus', created_at: new Date().toISOString() }]);
      setLoading(false);
      return;
    }
    const [credRes, pkgRes, txRes, prRes] = await Promise.all([
      supabase.from('requester_credits').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('requester_credit_packages').select('*').eq('is_active', true),
      supabase.from('requester_credit_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('requester_purchase_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    setBalance((credRes.data as any)?.balance ?? 0);
    setPackages((pkgRes.data as any[]) || []);
    setTransactions((txRes.data as any[]) || []);
    setPurchaseRequests((prRes.data as any[]) || []);
    setLoading(false);
  };

  const copyNumber = () => {
    navigator.clipboard.writeText(PAYMENT_NUMBER);
    setCopied(true);
    toast.success('Number copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPurchase = async () => {
    if (!mobileNumber.trim() || mobileNumber.trim().length < 11) {
      toast.error('Please enter a valid mobile number');
      return;
    }
    if (!transactionId.trim()) {
      toast.error('Please enter the transaction ID');
      return;
    }
    if (!selectedPkg) return;

    setSubmitting(true);
    const paymentReference = `${transactionId.trim()} (From: ${mobileNumber.trim()})`;

    if (isDemo || !user) {
      toast.success(`Purchase request submitted! ${selectedPkg.credits} credits`);
      closePopup();
      setSubmitting(false);
      return;
    }

    await supabase.from('requester_purchase_requests').insert({
      user_id: user.id,
      package_id: selectedPkg.id,
      payment_method: paymentMethod,
      payment_reference: paymentReference,
    } as any);

    toast.success('Purchase request submitted! Admin will approve shortly.');
    closePopup();
    setSubmitting(false);
    loadAll();
  };

  const closePopup = () => {
    setSelectedPkg(null);
    setMobileNumber('');
    setTransactionId('');
    setPaymentMethod('bKash');
  };

  if (loading) {
    return <div className="bg-card rounded-2xl p-6 shadow-surface animate-pulse h-40" />;
  }

  return (
    <div className="space-y-4">
      {/* Balance */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 shadow-surface">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Coins className="w-4 h-4 text-primary" /> {t('Your Credits')}
          </h3>
          <span className={`text-2xl font-black ${balance <= 1 ? 'text-warning' : 'text-primary'}`}>{balance}</span>
        </div>
        {balance <= 1 && (
          <p className="text-xs text-warning bg-warning/10 rounded-lg p-2">
            ⚠️ {t('Low credits! Purchase more to continue posting blood requests.')}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          {t('2 credits = 1 blood request post. You got 10 free credits on signup.')}
        </p>
      </motion.div>

      {/* Packages */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-5 shadow-surface">
        <h3 className="text-sm font-bold text-foreground mb-3">{t('Credit Packages')}</h3>
        <div className="grid grid-cols-3 gap-2">
          {packages.map(pkg => (
            <div key={pkg.id} className="rounded-xl p-3 text-center border border-border hover:border-primary/50 transition-colors">
              <p className="text-lg font-black text-foreground">৳{pkg.price_bdt}</p>
              <p className="text-xs text-primary font-bold">{pkg.credits} {t('Credits')}</p>
              <p className="text-[10px] text-muted-foreground mb-2">৳{(pkg.price_bdt / pkg.credits).toFixed(1)}/{t('each')}</p>
              <button
                onClick={() => setSelectedPkg(pkg)}
                className="w-full bg-primary text-primary-foreground py-1.5 rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
              >
                <ShoppingCart className="w-3 h-3" /> Buy Now
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Purchase Popup */}
      <AnimatePresence>
        {selectedPkg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) closePopup(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="bg-primary/5 border-b border-border p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Buy {selectedPkg.credits} Credits</h3>
                  <p className="text-xs text-muted-foreground">৳{selectedPkg.price_bdt} — {selectedPkg.name} Package</p>
                </div>
                <button onClick={closePopup} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Payment Instructions */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="text-xs font-bold text-primary mb-2">📱 Send Money To:</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-card rounded-lg px-3 py-2 border border-border">
                      <p className="text-lg font-black text-foreground tracking-wider">{PAYMENT_NUMBER}</p>
                    </div>
                    <button
                      onClick={copyNumber}
                      className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      title="Copy number"
                    >
                      {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Send <span className="font-bold text-foreground">৳{selectedPkg.price_bdt}</span> via bKash / Nagad / Bank Transfer to the number above, then fill in the details below.
                  </p>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['bKash', 'Nagad', 'Bank'].map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                          paymentMethod === method
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Your Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={e => setMobileNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      maxLength={15}
                      className="w-full bg-secondary text-foreground pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Transaction ID</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value)}
                      placeholder="e.g. TXN123456789"
                      maxLength={50}
                      className="w-full bg-secondary text-foreground pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitPurchase}
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Submitting...' : 'Submit Purchase Request'}
                </button>

                <p className="text-[10px] text-muted-foreground text-center">
                  Admin will verify your payment and add credits to your account. You'll receive a notification once approved.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Requests */}
      {purchaseRequests.filter(pr => pr.status === 'pending').length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl p-5 shadow-surface">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-warning" /> {t('Pending Requests')}
          </h3>
          {purchaseRequests.filter(pr => pr.status === 'pending').map(pr => (
            <div key={pr.id} className="flex items-center gap-3 p-2 rounded-lg bg-warning/5 border border-warning/20 mb-2">
              <Coins className="w-4 h-4 text-warning" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{pr.payment_method}: {pr.payment_reference}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(pr.created_at).toLocaleDateString()}</p>
              </div>
              <span className="text-[10px] font-bold text-warning px-2 py-0.5 rounded-full bg-warning/10">{t('Pending')}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Transaction History */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl p-5 shadow-surface">
        <h3 className="text-sm font-bold text-foreground mb-3">{t('Transaction History')}</h3>
        <div className="space-y-2">
          {transactions.length === 0 && <p className="text-xs text-muted-foreground">{t('No transactions yet.')}</p>}
          {transactions.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
              {tx.amount > 0 ? (
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{tx.description}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs font-bold ${tx.amount > 0 ? 'text-success' : 'text-destructive'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
