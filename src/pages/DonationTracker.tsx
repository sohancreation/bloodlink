import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, Clock, CheckCircle, AlertTriangle, Activity, Droplets, Shield, Sparkles, Trophy, Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/redova/Sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

const DONATION_INTERVAL_DAYS = 90; // Minimum days between donations

const HEALTH_CONDITIONS = [
  { key: 'anemia', icon: '🩸', labelKey: 'রক্তশূন্যতা (Anemia)' },
  { key: 'diabetes', icon: '💉', labelKey: 'ডায়াবেটিস (Diabetes)' },
  { key: 'hypertension', icon: '❤️‍🩹', labelKey: 'উচ্চ রক্তচাপ (Hypertension)' },
  { key: 'heart_disease', icon: '🫀', labelKey: 'হৃদরোগ (Heart Disease)' },
  { key: 'hepatitis', icon: '🟡', labelKey: 'হেপাটাইটিস (Hepatitis)' },
  { key: 'hiv', icon: '🔴', labelKey: 'HIV/AIDS' },
  { key: 'thyroid', icon: '🦋', labelKey: 'থাইরয়েড (Thyroid)' },
  { key: 'asthma', icon: '🌬️', labelKey: 'অ্যাজমা (Asthma)' },
  { key: 'pregnancy', icon: '🤰', labelKey: 'গর্ভবতী (Pregnant)' },
  { key: 'recent_surgery', icon: '🏥', labelKey: 'সাম্প্রতিক অপারেশন (Recent Surgery)' },
  { key: 'medication', icon: '💊', labelKey: 'নিয়মিত ওষুধ সেবন (On Medication)' },
  { key: 'low_weight', icon: '⚖️', labelKey: 'কম ওজন (<50 kg)' },
];

const DonationTracker = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [donor, setDonor] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [markingDonation, setMarkingDonation] = useState(false);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const [donorRes, donationRes] = await Promise.all([
      supabase.from('donors').select('*').eq('user_id', user!.id).single(),
      supabase.from('donations').select('*').order('date', { ascending: false }),
    ]);
    if (donorRes.data) setDonor(donorRes.data);
    setDonations(donationRes.data || []);
    setLoading(false);
  };

  const lastDonationDate = donor?.last_donation_date
    ? new Date(donor.last_donation_date)
    : donations.length > 0
      ? new Date(donations[0].date)
      : null;

  const daysSince = lastDonationDate
    ? Math.floor((Date.now() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const daysRemaining = daysSince !== null ? Math.max(0, DONATION_INTERVAL_DAYS - daysSince) : 0;
  const canDonate = daysRemaining === 0;
  const progressPercent = daysSince !== null ? Math.min(100, (daysSince / DONATION_INTERVAL_DAYS) * 100) : 100;

  const nextDonationDate = lastDonationDate
    ? new Date(lastDonationDate.getTime() + DONATION_INTERVAL_DAYS * 24 * 60 * 60 * 1000)
    : null;

  const toggleCondition = (key: string) => {
    setSelectedConditions(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
    setAiAdvice(null);
  };

  const handleMarkDonation = async () => {
    if (!donor || !user) return;
    setMarkingDonation(true);

    const now = new Date().toISOString();

    // Insert donation record
    const { error: donationError } = await supabase.from('donations').insert({
      donor_id: donor.id,
      hospital_name: 'Self-reported',
      blood_type: donor.blood_type,
      status: 'completed',
    });

    if (donationError) {
      toast.error(donationError.message);
      setMarkingDonation(false);
      return;
    }

    // Update donor record
    await supabase.from('donors').update({
      last_donation_date: now,
      donation_count: (donor.donation_count || 0) + 1,
    } as any).eq('id', donor.id);

    toast.success('🎉 রক্তদান রেকর্ড করা হয়েছে! ধন্যবাদ!');
    setMarkingDonation(false);
    loadData();
  };

  const getAiAdvice = async () => {
    setAiLoading(true);
    try {
      const conditionLabels = selectedConditions.map(key =>
        HEALTH_CONDITIONS.find(c => c.key === key)?.labelKey || key
      );

      const { data, error } = await supabase.functions.invoke('blood-search', {
        body: {
          type: 'nearby',
          query: `I am a blood donor in Bangladesh. My last donation was ${daysSince !== null ? `${daysSince} days ago` : 'unknown'}. I have the following health conditions: ${conditionLabels.length > 0 ? conditionLabels.join(', ') : 'None'}. My blood type is ${donor?.blood_type || 'unknown'}. Based on Bangladesh Red Crescent Society and WHO guidelines, when can I donate blood again? Consider my health conditions carefully. Give specific advice in Bangla. Include: 1) Am I eligible now? 2) If not, when will I be eligible? 3) Any precautions based on my health conditions. 4) General tips for blood donors with my conditions.`,
        },
      });

      if (error) throw error;

      // Extract text from the response
      const results = data?.results;
      if (results && Array.isArray(results) && results.length > 0) {
        const summaryParts = results.map((r: any) => r.name || r.address || '').filter(Boolean);
        setAiAdvice(data?.summary || data?.tips || summaryParts.join('\n') || 'AI পরামর্শ পাওয়া যায়নি।');
      } else {
        setAiAdvice(data?.summary || data?.tips || 'আপনার স্বাস্থ্য তথ্যের ভিত্তিতে পরামর্শ: সাধারণত রক্তদানের মধ্যে ৯০ দিন অপেক্ষা করতে হয়। আপনার নির্দিষ্ট স্বাস্থ্য সমস্যা থাকলে ডাক্তারের পরামর্শ নিন।');
      }
    } catch (err: any) {
      setAiAdvice('AI পরামর্শ পেতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    }
    setAiLoading(false);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-[60px_1fr] gap-4 p-4 h-screen bg-background">
        <Sidebar />
        <div className="flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>
      </div>
    );
  }

  const completedDonations = donations.filter(d => d.status === 'completed').length;

  return (
    <div className="grid grid-cols-[60px_1fr] gap-4 p-4 h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col gap-4 overflow-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Droplets className="w-6 h-6 text-primary" />
            {t('রক্তদান ট্র্যাকার')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('আপনার রক্তদানের ইতিহাস ও যোগ্যতা ট্র্যাক করুন')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Eligibility Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 shadow-surface space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${canDonate ? 'bg-success/10' : 'bg-warning/10'}`}>
                {canDonate ? <CheckCircle className="w-6 h-6 text-success" /> : <Clock className="w-6 h-6 text-warning" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {canDonate ? t('আপনি রক্তদানের যোগ্য! ✅') : t('এখনো অপেক্ষা করুন ⏳')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {daysSince !== null
                    ? `${t('শেষ রক্তদানের')} ${daysSince} ${t('দিন আগে')}`
                    : t('কোনো রক্তদান রেকর্ড নেই')}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t('শেষ রক্তদান')}</span>
                <span>{canDonate ? '🏆 ' + t('যোগ্য!') : `${daysRemaining} ${t('দিন বাকি')}`}</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{lastDonationDate ? lastDonationDate.toLocaleDateString('bn-BD') : '—'}</span>
                <span>{nextDonationDate ? nextDonationDate.toLocaleDateString('bn-BD') : '—'}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-secondary rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-primary">{completedDonations}</p>
                <p className="text-xs text-muted-foreground">{t('মোট রক্তদান')}</p>
              </div>
              <div className="bg-secondary rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{daysSince ?? '—'}</p>
                <p className="text-xs text-muted-foreground">{t('দিন হয়েছে')}</p>
              </div>
              <div className="bg-secondary rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{daysRemaining}</p>
                <p className="text-xs text-muted-foreground">{t('দিন বাকি')}</p>
              </div>
            </div>

            {/* Mark donation button */}
            <button
              onClick={handleMarkDonation}
              disabled={markingDonation}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {markingDonation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Heart className="w-4 h-4" />
              )}
              {t('আজ রক্তদান করেছি ✓')}
            </button>
          </motion.div>

          {/* Health Conditions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-6 shadow-surface space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{t('স্বাস্থ্য তথ্য')}</h2>
                <p className="text-sm text-muted-foreground">{t('আপনার স্বাস্থ্য সমস্যা নির্বাচন করুন')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1">
              {HEALTH_CONDITIONS.map(condition => {
                const isSelected = selectedConditions.includes(condition.key);
                return (
                  <button
                    key={condition.key}
                    onClick={() => toggleCondition(condition.key)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                      isSelected
                        ? 'bg-destructive/10 text-destructive ring-1 ring-destructive/30'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    <span className="text-base">{condition.icon}</span>
                    <span className="leading-tight">{condition.labelKey}</span>
                  </button>
                );
              })}
            </div>

            {/* AI Advice button */}
            <button
              onClick={getAiAdvice}
              disabled={aiLoading}
              className="w-full bg-accent text-accent-foreground py-3 rounded-xl font-bold text-sm hover:bg-accent/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {aiLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {aiLoading ? t('AI বিশ্লেষণ করছে...') : t('AI পরামর্শ নিন')}
            </button>
          </motion.div>
        </div>

        {/* AI Advice Panel */}
        <AnimatePresence>
          {aiAdvice && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-card border border-primary/20 rounded-2xl p-5 shadow-surface space-y-3"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">{t('AI স্বাস্থ্য পরামর্শ')}</h3>
              </div>
              <div className="text-sm text-foreground whitespace-pre-line leading-relaxed bg-secondary/50 rounded-xl p-4">
                {aiAdvice}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {t('এটি AI-জনিত পরামর্শ। চূড়ান্ত সিদ্ধান্তের জন্য ডাক্তারের পরামর্শ নিন।')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Donation History Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-surface space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">{t('রক্তদানের ইতিহাস')}</h2>
          </div>

          {donations.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">{t('এখনো কোনো রক্তদান রেকর্ড হয়নি')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('উপরের বাটনে ক্লিক করে আপনার রক্তদান রেকর্ড করুন')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {donations.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 bg-secondary/50 rounded-xl p-4"
                >
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${d.status === 'completed' ? 'bg-success/10' : 'bg-warning/10'}`}>
                      {d.status === 'completed' ? (
                        <Trophy className="w-5 h-5 text-success" />
                      ) : (
                        <Clock className="w-5 h-5 text-warning" />
                      )}
                    </div>
                    {i < donations.length - 1 && (
                      <div className="absolute top-10 left-1/2 w-0.5 h-6 bg-border -translate-x-1/2" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{d.hospital_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.blood_type} · {new Date(d.date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${d.status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {d.status === 'completed' ? '✅ সম্পন্ন' : '⏳ মুলতুবি'}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DonationTracker;
