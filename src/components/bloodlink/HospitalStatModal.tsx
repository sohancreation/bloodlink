import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MapPin, Droplets, Users, CheckCircle, AlertTriangle, Package } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BloodTypeBadge } from './BloodTypeBadge';

type ModalType = 'requests' | 'fulfilled' | 'units' | 'donors' | null;

interface HospitalStatModalProps {
  type: ModalType;
  onClose: () => void;
  donors: any[];
  requests: any[];
  inventory: any[];
  hospitalUpozilla?: string;
  hospitalZilla?: string;
}

export const HospitalStatModal = ({ type, onClose, donors, requests, inventory, hospitalUpozilla, hospitalZilla }: HospitalStatModalProps) => {
  const { t } = useLanguage();
  if (!type) return null;

  const titles: Record<string, { icon: any; title: string }> = {
    requests: { icon: AlertTriangle, title: t('Active Requests') },
    fulfilled: { icon: CheckCircle, title: t('Fulfilled Today') },
    units: { icon: Package, title: t('Blood Units') },
    donors: { icon: Users, title: t('Donors Nearby') },
  };

  const { icon: Icon, title } = titles[type];

  // Filter donors by same upozilla
  const nearbyDonors = donors.filter(d => {
    if (hospitalUpozilla && d.upozilla) return d.upozilla === hospitalUpozilla;
    if (hospitalZilla && d.zilla) return d.zilla === hospitalZilla;
    return d.is_available;
  });

  // Group donors by blood type
  const donorsByBloodType: Record<string, any[]> = {};
  const targetDonors = type === 'donors' ? nearbyDonors : donors.filter(d => d.is_available);
  targetDonors.forEach(d => {
    const bt = d.blood_type || 'Unknown';
    if (!donorsByBloodType[bt]) donorsByBloodType[bt] = [];
    donorsByBloodType[bt].push(d);
  });

  const openRequests = requests.filter(r => r.status === 'OPEN');
  const fulfilledRequests = requests.filter(r => r.status === 'FULFILLED');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground">{title}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {/* Active Requests */}
            {type === 'requests' && (
              openRequests.length === 0
                ? <p className="text-muted-foreground text-center py-6">{t('No active requests')}</p>
                : openRequests.map(r => (
                  <div key={r.id} className="bg-secondary/50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BloodTypeBadge type={r.blood_type} />
                        <span className="font-bold text-foreground">{r.units_needed} {t('units')}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.urgency === 'CRITICAL' ? 'bg-primary/10 text-primary' : r.urgency === 'URGENT' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                        {r.urgency}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.hospital_name}</p>
                    {r.patient_condition && <p className="text-xs text-muted-foreground/70">{r.patient_condition}</p>}
                  </div>
                ))
            )}

            {/* Fulfilled */}
            {type === 'fulfilled' && (
              fulfilledRequests.length === 0
                ? <p className="text-muted-foreground text-center py-6">{t('No fulfilled requests today')}</p>
                : fulfilledRequests.map(r => (
                  <div key={r.id} className="bg-success/5 border border-success/20 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <BloodTypeBadge type={r.blood_type} />
                        <span className="font-bold text-foreground">{r.units_needed} {t('units')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{r.hospital_name}</p>
                    </div>
                  </div>
                ))
            )}

            {/* Blood Units Summary */}
            {type === 'units' && (
              <div className="space-y-3">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => {
                  const items = inventory.filter(i => i.blood_type === bt);
                  const total = items.reduce((s: number, i: any) => s + (i.units_available || 0), 0);
                  return (
                    <div key={bt} className="flex items-center justify-between bg-secondary/50 rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        <BloodTypeBadge type={bt as any} />
                        <span className="text-sm font-medium text-foreground">{bt}</span>
                      </div>
                      <span className={`text-lg font-bold ${total === 0 ? 'text-primary' : total <= 2 ? 'text-warning' : 'text-foreground'}`}>
                        {total} {t('units')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Donors Nearby - Grouped by blood type */}
            {type === 'donors' && (
              Object.keys(donorsByBloodType).length === 0
                ? <p className="text-muted-foreground text-center py-6">{t('No donors found nearby')}</p>
                : Object.entries(donorsByBloodType).sort(([a], [b]) => a.localeCompare(b)).map(([bt, btDonors]) => (
                  <div key={bt}>
                    <div className="flex items-center gap-2 mb-2">
                      <BloodTypeBadge type={bt as any} />
                      <span className="text-sm font-bold text-foreground">{bt}</span>
                      <span className="text-xs text-muted-foreground">({btDonors.length})</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      {btDonors.map((d: any) => (
                        <div key={d.id} className="bg-secondary/50 rounded-xl p-3 flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">{d.full_name || d.city || 'Donor'}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {(d.upozilla || d.zilla) && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {[d.upozilla, d.zilla].filter(Boolean).join(', ')}
                                </span>
                              )}
                              {d.city && !d.upozilla && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {d.city}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {d.phone && (
                              <a href={`tel:${d.phone}`} className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors">
                                <Phone className="w-3.5 h-3.5" />
                                {d.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
