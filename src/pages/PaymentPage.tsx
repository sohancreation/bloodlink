import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Copy, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import RedovaLogo from '@/assets/redova-logo.png';

const PHONE_NUMBER = '01706028192';

const SUBSCRIPTION_PLANS = [
  { name: 'Basic', credits: 30, price: 499 },
  { name: 'Standard', credits: 75, price: 999 },
  { name: 'Premium', credits: 200, price: 1999 },
];

const PaymentPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPlan = searchParams.get('plan');

  const [selectedPlan, setSelectedPlan] = useState(
    SUBSCRIPTION_PLANS.find(p => p.name === preselectedPlan) || SUBSCRIPTION_PLANS[0]
  );
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [mobileNumber, setMobileNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyNumber = () => {
    navigator.clipboard.writeText(PHONE_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!mobileNumber.trim()) {
      toast.error(t('Please enter your mobile number'));
      return;
    }
    if (!transactionId.trim()) {
      toast.error(t('Please enter your Transaction ID'));
      return;
    }
    if (!user) {
      toast.error(t('Please sign in first'));
      navigate('/login');
      return;
    }

    setSubmitting(true);

    // Get hospital_id for this user
    const { data: hospital } = await supabase
      .from('hospitals')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!hospital) {
      toast.error(t('Hospital account not found. Please sign up as a hospital.'));
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from('hospital_subscriptions' as any).insert({
      hospital_id: hospital.id,
      plan_name: selectedPlan.name,
      credits_per_month: selectedPlan.credits,
      price_bdt: selectedPlan.price,
      payment_method: paymentMethod,
      payment_reference: `${transactionId.trim()} (From: ${mobileNumber.trim()})`,
      status: 'pending',
    } as any);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('Payment request submitted! Admin will verify and activate your subscription shortly.'));
      setMobileNumber('');
      setTransactionId('');
      navigate('/hospital');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/hospital" className="flex items-center gap-2">
            <img src={RedovaLogo} alt="Redova" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg text-foreground">Redova</span>
          </Link>
          <Link to="/hospital" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> {t('Back')}
          </Link>
        </div>
      </header>

      <div className="container mx-auto max-w-xl px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{t('Complete Your Payment')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('Monthly subscription for hospitals')}</p>
          </div>

          {/* Send Money Info */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-foreground">{t('Send Money To')}</h2>
            </div>
            <div className="bg-secondary rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">bKash / Nagad</p>
              <p className="text-3xl font-black text-foreground tracking-wider">{PHONE_NUMBER}</p>
              <p className="text-xs text-muted-foreground mt-1">(Send Money - Personal)</p>
              <button
                onClick={copyNumber}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? t('Copied!') : t('Copy Number')}
              </button>
            </div>
          </div>

          {/* Steps */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">{t('Steps')}</h3>
            <ol className="space-y-2 text-sm text-foreground">
              <li className="flex gap-2"><span className="text-primary font-bold">1.</span> {t('Open bKash/Nagad app')}</li>
              <li className="flex gap-2"><span className="text-primary font-bold">2.</span> {t('Select "Send Money"')}</li>
              <li className="flex gap-2"><span className="text-primary font-bold">3.</span> {t('Enter number:')} <span className="font-mono font-bold">{PHONE_NUMBER}</span></li>
              <li className="flex gap-2"><span className="text-primary font-bold">4.</span> {t('Enter amount for your plan')}</li>
              <li className="flex gap-2"><span className="text-primary font-bold">5.</span> {t('Submit & copy Transaction ID')}</li>
            </ol>
          </div>

          {/* Select Plan */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">{t('Select Plan')}</h3>
            <div className="grid grid-cols-3 gap-3">
              {SUBSCRIPTION_PLANS.map(plan => (
                <button
                  key={plan.name}
                  onClick={() => setSelectedPlan(plan)}
                  className={`rounded-xl p-3 text-center border transition-all ${
                    selectedPlan.name === plan.name
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <p className="text-xs font-bold text-foreground">{plan.name}</p>
                  <p className="text-xl font-black text-primary mt-1">৳{plan.price}</p>
                  <p className="text-[10px] text-muted-foreground">{plan.credits} {t('credits')}/mo</p>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method + Transaction ID */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('Payment Method')}</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="mt-1 w-full bg-secondary text-foreground rounded-xl px-3 py-2.5 text-sm border-none"
              >
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('Your Mobile Number')}</label>
              <input
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                placeholder={t('e.g. 01XXXXXXXXX')}
                className="mt-1 w-full bg-secondary text-foreground rounded-xl px-3 py-2.5 text-sm border-none placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('Transaction ID')}</label>
              <input
                value={transactionId}
                onChange={e => setTransactionId(e.target.value)}
                placeholder={t('Enter your Transaction ID')}
                className="mt-1 w-full bg-secondary text-foreground rounded-xl px-3 py-2.5 text-sm border-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !transactionId.trim() || !mobileNumber.trim()}
            className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-2xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t('Submitting...') : t('Submit Payment Request')}
          </button>
          <p className="text-center text-[11px] text-muted-foreground mt-3">
            {t('Admin will verify your payment and activate your subscription within a few hours.')}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentPage;
