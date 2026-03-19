import { useState } from 'react';
import { Search, MapPin, Loader2, Phone, Hospital, Pill, Stethoscope, Ambulance, Building, Star, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LocationSelector } from './LocationSelector';

interface ServiceResult {
  name: string;
  type?: string;
  address?: string;
  phone?: string;
  distance?: string;
  rating?: string;
  openNow?: boolean;
  services?: string;
  source?: string;
}

interface NearbyServicesPanelProps {
  defaultZilla?: string;
}

const SERVICE_TYPES = [
  { value: 'hospital', label: 'Hospitals', icon: Hospital, color: 'text-info', bg: 'bg-info/10' },
  { value: 'pharmacy', label: 'Pharmacy', icon: Pill, color: 'text-success', bg: 'bg-success/10' },
  { value: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'text-primary', bg: 'bg-primary/10' },
  { value: 'ambulance', label: 'Ambulance', icon: Ambulance, color: 'text-destructive', bg: 'bg-destructive/10' },
  { value: 'blood_bank', label: 'Blood Bank', icon: Building, color: 'text-warning', bg: 'bg-warning/10' },
] as const;

export const NearbyServicesPanel = ({ defaultZilla }: NearbyServicesPanelProps) => {
  const { t } = useLanguage();
  const [serviceType, setServiceType] = useState('hospital');
  const [zilla, setZilla] = useState(defaultZilla || '');
  const [upozilla, setUpozilla] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ServiceResult[]>([]);
  const [summary, setSummary] = useState('');

  const handleSearch = async () => {
    if (!zilla.trim()) {
      toast.error(t('Please enter a Zilla'));
      return;
    }
    setLoading(true);
    setResults([]);
    setSummary('');

    try {
      const { data, error } = await supabase.functions.invoke('blood-search', {
        body: { type: 'nearby', zilla, upozilla, query: serviceType },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResults(data.results || []);
      setSummary(data.summary || '');
    } catch (err: any) {
      toast.error(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const currentSvc = SERVICE_TYPES.find(s => s.value === serviceType) || SERVICE_TYPES[0];

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-4 shadow-surface space-y-4">
        <h3 className="text-sm font-bold text-foreground">{t('Find Nearby Services')}</h3>

        {/* Service type grid */}
        <div className="grid grid-cols-5 gap-1.5">
          {SERVICE_TYPES.map(svc => (
            <button
              key={svc.value}
              onClick={() => { setServiceType(svc.value); setResults([]); setSummary(''); }}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all ${
                serviceType === svc.value
                  ? 'bg-primary text-primary-foreground shadow-sm scale-[1.02]'
                  : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-primary/10'
              }`}
            >
              <svc.icon className="w-5 h-5" />
              {t(svc.label)}
            </button>
          ))}
        </div>

        {/* Location inputs */}
        <LocationSelector zilla={zilla} upozilla={upozilla} onZillaChange={setZilla} onUpozillaChange={setUpozilla} />

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? t('Searching with AI...') : `${t('Search')} ${t(currentSvc.label)}`}
        </button>
      </div>

      {/* Category header */}
      {results.length > 0 && (
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${currentSvc.bg} flex items-center justify-center`}>
            <currentSvc.icon className={`w-4 h-4 ${currentSvc.color}`} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">{t(currentSvc.label)}</h4>
            <p className="text-xs text-muted-foreground">{results.length} {t('results found')} — {zilla}{upozilla ? `, ${upozilla}` : ''}</p>
          </div>
        </div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {summary && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <p className="text-sm text-foreground leading-relaxed">{summary}</p>
          </motion.div>
        )}

        {results.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {results.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card rounded-xl p-4 shadow-surface hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${currentSvc.bg} flex items-center justify-center shrink-0`}>
                    <currentSvc.icon className={`w-5 h-5 ${currentSvc.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{r.name}</p>
                        {r.address && (
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{r.address}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {r.openNow !== undefined && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            r.openNow ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                          }`}>
                            <Clock className="w-2.5 h-2.5" />
                            {r.openNow ? t('Open') : t('Closed')}
                          </span>
                        )}
                        {(r.source === 'demo' || r.source === 'ai-knowledge') && (
                          <span className="text-[10px] bg-info/10 text-info px-1.5 py-0.5 rounded-full">AI তথ্য</span>
                        )}
                      </div>
                    </div>

                    {/* Services */}
                    {r.services && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {r.services.split(',').slice(0, 4).map((s, j) => (
                          <span key={j} className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                            {s.trim()}
                          </span>
                        ))}
                        {r.services.split(',').length > 4 && (
                          <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                            +{r.services.split(',').length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer: phone, distance, rating */}
                    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/50">
                      {r.phone && (
                        <a href={`tel:${r.phone}`} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                          <Phone className="w-3 h-3" />{r.phone}
                        </a>
                      )}
                      {r.distance && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{r.distance}
                        </span>
                      )}
                      {r.rating && (
                        <span className="text-xs text-warning flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-current" />{r.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
