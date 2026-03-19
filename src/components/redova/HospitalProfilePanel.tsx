import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Phone, MapPin, Mail, Save, Loader2, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LocationSelector } from './LocationSelector';

interface HospitalProfilePanelProps {
  open: boolean;
  onClose: () => void;
  hospital: any;
  onProfileUpdated: () => void;
}

export const HospitalProfilePanel = ({ open, onClose, hospital, onProfileUpdated }: HospitalProfilePanelProps) => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [zilla, setZilla] = useState('');
  const [upozilla, setUpozilla] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && hospital) {
      setName(hospital.name || '');
      setAddress(hospital.address || '');
      setContactNumber(hospital.contact_number || '');
      setZilla(hospital.zilla || '');
      setUpozilla(hospital.upozilla || '');
    }
    if (open && profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || '');
    }
    if (open && user) {
      setEmail(prev => prev || user.email || '');
    }
  }, [open, hospital, profile, user]);

  const handleSave = async () => {
    if (!user || !hospital) return;
    setSaving(true);

    try {
      // Update hospital record
      const { error: hospError } = await supabase.from('hospitals').update({
        name,
        address,
        contact_number: contactNumber,
      }).eq('id', hospital.id);

      if (hospError) throw hospError;

      // Update profile
      const { error: profileError } = await supabase.from('profiles').update({
        full_name: fullName,
      }).eq('id', user.id);

      if (profileError) throw profileError;

      toast.success(t('Profile updated') + ' ✅');
      onProfileUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-card rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 pb-4 border-b border-border shrink-0">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{t('Hospital Profile')}</h2>
                    <p className="text-xs text-muted-foreground">{t('Manage your hospital details')}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Contact Person Name */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> {t('Contact Person')}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-secondary text-foreground px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={t('Full Name')}
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {t('Email')}
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full bg-secondary/50 text-muted-foreground px-4 py-3 rounded-xl text-sm cursor-not-allowed"
                />
              </div>

              {/* Hospital Name */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> {t('Hospital Name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-secondary text-foreground px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={t('Hospital Name')}
                />
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {t('Address')}
                </label>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-secondary text-foreground px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={2}
                  placeholder={t('Hospital address')}
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> {t('Contact Number')}
                </label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  className="w-full bg-secondary text-foreground px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="01XXXXXXXXX"
                />
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {t('Location')}
                </label>
                <LocationSelector
                  zilla={zilla}
                  upozilla={upozilla}
                  onZillaChange={setZilla}
                  onUpozillaChange={setUpozilla}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 border-t border-border shrink-0">
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('Save Changes')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
