import { useState, useEffect } from 'react';
import { X, User, Save, Mail, Phone, MapPin, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LocationSelector } from './LocationSelector';
import { BloodTypeBadge } from './BloodTypeBadge';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

interface ProfilePanelProps {
  open: boolean;
  onClose: () => void;
  donor: any;
  onProfileUpdated: () => void;
}

export const ProfilePanel = ({ open, onClose, donor, onProfileUpdated }: ProfilePanelProps) => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [city, setCity] = useState('');
  const [zilla, setZilla] = useState('');
  const [upozilla, setUpozilla] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFullName(profile?.full_name || user?.user_metadata?.full_name || '');
      setEmail(profile?.email || user?.email || '');
      setPhone(profile?.phone || '');
      setBloodType(donor?.blood_type || 'O+');
      setCity(donor?.city || '');
      setZilla(donor?.zilla || '');
      setUpozilla(donor?.upozilla || '');
      setIsAvailable(donor?.is_available ?? true);
    }
  }, [open, profile, user, donor]);

  const handleSave = async () => {
    if (!user) {
      toast.error('Please log in first');
      return;
    }
    setSaving(true);

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone } as any)
      .eq('id', user.id);

    if (profileError) {
      toast.error(profileError.message);
      setSaving(false);
      return;
    }

    // Update donor record
    if (donor?.id) {
      const { error: donorError } = await supabase
        .from('donors')
        .update({
          blood_type: bloodType,
          city,
          zilla,
          upozilla,
          is_available: isAvailable,
        } as any)
        .eq('id', donor.id);

      if (donorError) {
        toast.error(donorError.message);
        setSaving(false);
        return;
      }
    }

    toast.success(t('Profile updated successfully!'));
    setSaving(false);
    onProfileUpdated();
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-card rounded-2xl shadow-lg w-full max-w-md max-h-[85vh] overflow-hidden mx-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground">{t('My Profile')}</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[65vh] space-y-3">
            {/* Avatar area */}
            <div className="flex items-center gap-4 bg-secondary/50 rounded-xl p-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{fullName || 'User'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <BloodTypeBadge type={bloodType as any} size="sm" />
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isAvailable ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {isAvailable ? t('Available') : t('Unavailable')}
                  </span>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" /> {t('Full Name')}
              </label>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-secondary text-foreground px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3" /> {t('Email')}
              </label>
              <input
                value={email}
                readOnly
                className="w-full bg-secondary/50 text-muted-foreground px-3 py-2 rounded-xl text-sm cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3" /> {t('Phone Number')}
              </label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full bg-secondary text-foreground px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Blood Type */}
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Droplets className="w-3 h-3" /> {t('Blood Type')}
              </label>
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

            {/* City */}
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {t('City')}
              </label>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full bg-secondary text-foreground px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Zilla / Upozilla */}
            <LocationSelector
              zilla={zilla}
              upozilla={upozilla}
              onZillaChange={setZilla}
              onUpozillaChange={setUpozilla}
            />

            {/* Availability toggle */}
            <div className="flex items-center justify-between bg-secondary/50 rounded-xl p-3">
              <span className="text-sm font-medium text-foreground">{t('Available for donation')}</span>
              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className={`w-12 h-6 rounded-full transition-colors relative ${isAvailable ? 'bg-success' : 'bg-muted'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isAvailable ? 'left-[26px]' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? '...' : t('Save Changes')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
