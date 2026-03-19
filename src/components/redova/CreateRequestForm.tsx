import { useState, useEffect } from 'react';
import { Send, AlertTriangle, User, Phone, Coins } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { LocationSelector } from '@/components/redova/LocationSelector';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
type BloodTypeVal = typeof BLOOD_TYPES[number];
type UrgencyVal = 'CRITICAL' | 'URGENT' | 'STABLE';

interface CreateRequestFormProps {
  isDemo: boolean;
  donorBloodType?: string;
  donorCity?: string;
  donorLatitude?: number;
  donorLongitude?: number;
  onRequestCreated: (request: any) => void;
}

export const CreateRequestForm = ({ isDemo, donorBloodType, donorCity, donorLatitude, donorLongitude, onRequestCreated }: CreateRequestFormProps) => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const isHospital = profile?.role === 'hospital';
  const [bloodType, setBloodType] = useState<BloodTypeVal>((donorBloodType as BloodTypeVal) || 'O+');
  const [units, setUnits] = useState(1);
  const [urgency, setUrgency] = useState<UrgencyVal>('URGENT');
  const [condition, setCondition] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterMobile, setRequesterMobile] = useState('');
  const [zilla, setZilla] = useState('');
  const [upozilla, setUpozilla] = useState('');
  const [loading, setLoading] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);

  useEffect(() => {
    if (isDemo || isHospital || !user) return;
    const loadCredits = async () => {
      const { data } = await supabase.from('requester_credits' as any).select('balance').eq('user_id', user.id).maybeSingle();
      setCreditBalance((data as any)?.balance ?? 0);
    };
    loadCredits();
  }, [user, isDemo, isHospital]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalName.trim()) {
      toast.error(t('Please enter hospital name'));
      return;
    }
    if (!requesterName.trim()) {
      toast.error(t('Please enter your name'));
      return;
    }
    if (!requesterMobile.trim()) {
      toast.error(t('Please enter mobile number'));
      return;
    }
    if (!zilla || !upozilla) {
      toast.error(t('Please select Zilla and Upozilla'));
      return;
    }
    // Credit check for non-hospital users
    if (!isDemo && !isHospital && creditBalance !== null && creditBalance < 2) {
      toast.error(t('Insufficient credits! You need 2 credits per request. Please purchase more.'));
      return;
    }
    setLoading(true);

    const newRequest = {
      id: crypto.randomUUID(),
      blood_type: bloodType,
      units_needed: units,
      urgency,
      patient_condition: condition,
      hospital_name: hospitalName,
      hospital_id: crypto.randomUUID(),
      status: 'OPEN' as const,
      latitude: donorLatitude || 24.3745,
      longitude: donorLongitude || 88.6042,
      created_at: new Date().toISOString(),
      requester_name: requesterName,
      requester_mobile: requesterMobile,
      zilla,
      upozilla,
    };

    if (isDemo) {
      toast.success(`${t('Request Created')}! ${bloodType} - ${hospitalName}`);
      onRequestCreated(newRequest);
    } else {
      const { error } = await supabase.from('blood_requests').insert({
        blood_type: bloodType,
        units_needed: units,
        urgency,
        patient_condition: condition,
        hospital_name: hospitalName,
        hospital_id: newRequest.hospital_id,
        latitude: newRequest.latitude,
        longitude: newRequest.longitude,
        requester_name: requesterName,
        requester_mobile: requesterMobile,
        zilla,
        upozilla,
      } as any);
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      toast.success(`${t('Request Created')}! ${t('Matching donors will be notified.')}`);
      onRequestCreated(newRequest);
    }

    setCondition('');
    setHospitalName('');
    setRequesterName('');
    setRequesterMobile('');
    setUnits(1);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-4 shadow-surface space-y-3">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-warning" />
        {t('Create Blood Request')}
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <User className="w-3 h-3" /> {t('Your Name')} *
          </label>
          <input
            value={requesterName}
            onChange={e => setRequesterName(e.target.value)}
            placeholder={t('Enter your name')}
            required
            className="w-full bg-secondary text-foreground px-3 py-2 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Phone className="w-3 h-3" /> {t('Mobile Number')} *
          </label>
          <input
            value={requesterMobile}
            onChange={e => setRequesterMobile(e.target.value)}
            placeholder="01XXXXXXXXX"
            required
            type="tel"
            pattern="01[0-9]{9}"
            maxLength={11}
            className="w-full bg-secondary text-foreground px-3 py-2 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">{t('Hospital Name')} *</label>
        <input
          value={hospitalName}
          onChange={e => setHospitalName(e.target.value)}
          placeholder={t('Which hospital needs blood?')}
          required
          className="w-full bg-secondary text-foreground px-3 py-2 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <LocationSelector
        zilla={zilla}
        upozilla={upozilla}
        onZillaChange={setZilla}
        onUpozillaChange={setUpozilla}
      />

      <div>
        <label className="text-xs font-medium text-muted-foreground">{t('Blood Type Required')}</label>
        <div className="grid grid-cols-4 gap-1.5 mt-1">
          {BLOOD_TYPES.map(bt => (
            <button
              key={bt}
              type="button"
              onClick={() => setBloodType(bt)}
              className={`py-1.5 rounded-lg text-xs font-bold transition-colors ${
                bloodType === bt ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-primary/20'
              }`}
            >
              {bt}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t('Units Needed')}</label>
          <input type="number" min={1} max={10} value={units} onChange={e => setUnits(+e.target.value)} className="w-full bg-secondary text-foreground px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t('Urgency Level')}</label>
          <select value={urgency} onChange={e => setUrgency(e.target.value as UrgencyVal)} className="w-full bg-secondary text-foreground px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="CRITICAL">🔴 CRITICAL</option>
            <option value="URGENT">🟡 URGENT</option>
            <option value="STABLE">🟢 STABLE</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">{t('Patient Condition')}</label>
        <textarea
          value={condition}
          onChange={e => setCondition(e.target.value)}
          placeholder={t("Describe the patient's condition...")}
          rows={2}
          className="w-full bg-secondary text-foreground px-3 py-2 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      {/* Credit balance indicator for non-hospital users */}
      {!isHospital && creditBalance !== null && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${
          creditBalance < 2 ? 'bg-destructive/10 text-destructive' : creditBalance <= 3 ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
        }`}>
          <Coins className="w-3.5 h-3.5" />
          <span>{creditBalance} {t('credits remaining')} (2 per post)</span>
          {creditBalance < 2 && <span className="ml-auto text-[10px]">→ {t('Buy credits to post')}</span>}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || (!isDemo && !isHospital && creditBalance !== null && creditBalance < 2)}
        className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        {loading ? '...' : t('Broadcast Emergency')}
      </button>

      <p className="text-[10px] text-muted-foreground text-center">
        {t('Same blood group donors in your upozilla will be notified automatically.')}
      </p>
    </form>
  );
};
