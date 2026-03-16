import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Send, Loader2, ShieldAlert, Stethoscope, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/bloodlink/Sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const COMMON_CONDITIONS = [
  'কেটে গেছে / রক্তপাত',
  'পুড়ে গেছে',
  'হাড় ভেঙেছে / মচকে গেছে',
  'শ্বাসকষ্ট',
  'বুকে ব্যথা',
  'জ্বর / মাথাব্যথা',
  'বমি / ডায়রিয়া',
  'সাপে কামড়েছে',
  'বিদ্যুতে শক লেগেছে',
  'পানিতে ডুবেছে',
  'অজ্ঞান হয়ে গেছে',
  'এলার্জি / ফুলে গেছে',
];

const FirstAid = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [condition, setCondition] = useState('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState('');

  const handleSearch = async () => {
    const query = condition.trim();
    if (!query) {
      toast.error('রোগের ধরন লিখুন');
      return;
    }
    setLoading(true);
    setAdvice('');

    try {
      const { data, error } = await supabase.functions.invoke('first-aid', {
        body: { condition: query },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAdvice(data.advice || 'কোনো পরামর্শ পাওয়া যায়নি।');
    } catch (err: any) {
      toast.error(err.message || 'AI পরামর্শ নিতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-[60px_1fr] gap-4 p-4 h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/donor')} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-primary" />
              {t('প্রাথমিক চিকিৎসা')}
            </h1>
            <p className="text-sm text-muted-foreground">{t('জরুরি প্রাথমিক পরামর্শ — AI সাহায্যে')}</p>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 flex items-start gap-3"
        >
          <ShieldAlert className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-destructive">{t('⚠️ গুরুত্বপূর্ণ সতর্কতা')}</p>
            <p className="text-xs text-destructive/80 mt-1 leading-relaxed">
              {t('এটি শুধুমাত্র প্রাথমিক চিকিৎসার পরামর্শ। এটি কোনোভাবেই ডাক্তারের বিকল্প নয়। গুরুতর অবস্থায় অবশ্যই নিকটতম হাসপাতালে যান বা জরুরি সেবায় কল করুন (999)।')}
            </p>
          </div>
        </motion.div>

        <div className="flex-1 overflow-auto space-y-4">
          {/* Input */}
          <div className="bg-card rounded-2xl p-4 shadow-surface space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-foreground">{t('রোগের ধরন বা সমস্যা লিখুন')}</h3>
            <textarea
              value={condition}
              onChange={e => setCondition(e.target.value)}
              placeholder="যেমন: হাত কেটে রক্ত পড়ছে, জ্বর ১০৩°F, সাপে কামড়েছে..."
              className="w-full bg-secondary rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[80px]"
              rows={3}
            />

            {/* Quick select chips */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CONDITIONS.map(c => (
                <button
                  key={c}
                  onClick={() => setCondition(c)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                    condition === c
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-primary/10'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              onClick={handleSearch}
              disabled={loading || !condition.trim()}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? t('AI বিশ্লেষণ করছে...') : t('প্রাথমিক চিকিৎসা জানুন')}
            </button>
          </div>

          {/* AI Response */}
          <AnimatePresence mode="wait">
            {advice && (
              <motion.div
                key="advice"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl space-y-3"
              >
                <div className="bg-card rounded-2xl p-5 shadow-surface">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Stethoscope className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{t('AI প্রাথমিক চিকিৎসা পরামর্শ')}</h3>
                  </div>
                  <div className="prose prose-sm max-w-none text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground [&_li]:text-foreground [&_p]:text-foreground [&_ul]:text-foreground [&_ol]:text-foreground">
                    <ReactMarkdown>{advice}</ReactMarkdown>
                  </div>
                </div>

                {/* Bottom disclaimer */}
                <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  <p className="text-xs text-warning leading-relaxed">
                    {t('মনে রাখবেন: এটি শুধুমাত্র প্রাথমিক পরামর্শ। যত দ্রুত সম্ভব ডাক্তারের কাছে যান। জরুরি সেবা: 999')}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FirstAid;
