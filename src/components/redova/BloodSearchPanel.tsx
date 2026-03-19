import { useState } from 'react';
import { Search, Droplets, MapPin, Loader2, Phone, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LocationSelector } from './LocationSelector';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

interface SearchResult {
  name: string;
  type?: string;
  bloodGroup?: string;
  location?: string;
  address?: string;
  phone?: string;
  distance?: string;
  source?: string;
  available?: boolean;
  rating?: string;
  openNow?: boolean;
  services?: string;
}

interface BloodSearchPanelProps {
  defaultBloodType?: string;
}

export const BloodSearchPanel = ({ defaultBloodType }: BloodSearchPanelProps) => {
  const { t } = useLanguage();
  const [searchType, setSearchType] = useState<'blood' | 'nearby'>('blood');
  const [bloodGroup, setBloodGroup] = useState(defaultBloodType || 'O+');
  const [zilla, setZilla] = useState('');
  const [upozilla, setUpozilla] = useState('');
  const [query, setQuery] = useState('');
  const [nearbyType, setNearbyType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [summary, setSummary] = useState('');
  const [tips, setTips] = useState<string[]>([]);

  const handleSearch = async () => {
    setLoading(true);
    setResults([]);
    setSummary('');
    setTips([]);

    try {
      const body = searchType === 'blood'
        ? { type: 'blood', bloodGroup, zilla, upozilla, query }
        : { type: 'nearby', zilla, upozilla, query: nearbyType };

      const { data, error } = await supabase.functions.invoke('blood-search', { body });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResults(data.results || []);
      setSummary(data.summary || '');
      setTips(data.tips || []);
    } catch (err: any) {
      toast.error(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search type tabs */}
      <div className="flex gap-1 bg-secondary p-1 rounded-xl">
        <button
          onClick={() => setSearchType('blood')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-colors ${
            searchType === 'blood' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Droplets className="w-4 h-4" />
          {t('Search Blood')}
        </button>
        <button
          onClick={() => setSearchType('nearby')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-colors ${
            searchType === 'nearby' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Navigation className="w-4 h-4" />
          {t('Nearby Services')}
        </button>
      </div>

      {/* Search form */}
      <div className="bg-card rounded-2xl p-4 shadow-surface space-y-3">
        {searchType === 'blood' && (
          <>
            <label className="text-xs font-medium text-muted-foreground">{t('Blood Type')}</label>
            <div className="grid grid-cols-4 gap-1.5">
              {BLOOD_TYPES.map(bt => (
                <button
                  key={bt}
                  onClick={() => setBloodGroup(bt)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    bloodGroup === bt ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-primary/20'
                  }`}
                >
                  {bt}
                </button>
              ))}
            </div>
          </>
        )}

        {searchType === 'nearby' && (
          <>
            <label className="text-xs font-medium text-muted-foreground">{t('Service Type')}</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { value: 'all', label: t('All') },
                { value: 'hospital', label: t('Hospitals') },
                { value: 'pharmacy', label: t('Pharmacy') },
                { value: 'doctor', label: t('Doctor') },
                { value: 'ambulance', label: t('Ambulance') },
                { value: 'blood_bank', label: t('Blood Bank') },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setNearbyType(opt.value)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    nearbyType === opt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-primary/20'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}

        <LocationSelector zilla={zilla} upozilla={upozilla} onZillaChange={setZilla} onUpozillaChange={setUpozilla} />

        {searchType === 'blood' && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t('Additional Details')}</label>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('Any extra info...')}
              className="w-full bg-secondary text-foreground px-3 py-2 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? t('Searching with AI...') : t('Search')}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {summary && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <p className="text-sm text-foreground">{summary}</p>
          </motion.div>
        )}

        {results.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {results.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl p-3 shadow-surface flex items-start gap-3"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  r.available === false ? 'bg-destructive/10' : 'bg-success/10'
                }`}>
                  {searchType === 'blood' ? (
                    <Droplets className={`w-5 h-5 ${r.available === false ? 'text-destructive' : 'text-success'}`} />
                  ) : (
                    <MapPin className="w-5 h-5 text-info" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">{r.name}</p>
                    {r.bloodGroup && (
                      <span className="text-xs font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">{r.bloodGroup}</span>
                    )}
                    {(r.source === 'demo' || r.source === 'ai-knowledge') && (
                      <span className="text-[10px] bg-info/10 text-info px-1 rounded">AI তথ্য</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{r.location || r.address}</p>
                  {r.services && <p className="text-xs text-muted-foreground mt-0.5">{r.services}</p>}
                  <div className="flex items-center gap-3 mt-1">
                    {r.phone && (
                      <a href={`tel:${r.phone}`} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                        <Phone className="w-3 h-3" />{r.phone}
                      </a>
                    )}
                    {r.distance && <span className="text-xs text-muted-foreground">{r.distance}</span>}
                    {r.rating && <span className="text-xs text-warning">⭐ {r.rating}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {tips && tips.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-secondary rounded-xl p-3 space-y-1">
            <p className="text-xs font-bold text-foreground">{t('Tips')}</p>
            {tips.map((tip, i) => (
              <p key={i} className="text-xs text-muted-foreground">• {tip}</p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
