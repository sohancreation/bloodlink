import { X, Heart, Bell, Clock, MapPin, CheckCircle, AlertTriangle, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { BloodTypeBadge } from './BloodTypeBadge';

type StatType = 'donations' | 'requests' | 'daysSince' | 'hospitals';

const isDefaultCoords = (lat?: number, lng?: number) =>
  typeof lat === 'number' && typeof lng === 'number' &&
  Math.abs(lat - 24.3745) < 0.0001 && Math.abs(lng - 88.6042) < 0.0001;

const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
};

interface StatDetailModalProps {
  type: StatType | null;
  onClose: () => void;
  donor: any;
  donations: any[];
  requests: any[];
  hospitals: any[];
  daysSince: string | number;
}

export const StatDetailModal = ({ type, onClose, donor, donations, requests, hospitals, daysSince }: StatDetailModalProps) => {
  const { t } = useLanguage();
  if (!type) return null;

  const titles: Record<StatType, string> = {
    donations: t('Total Donations'),
    requests: t('Active Requests'),
    daysSince: t('Days Since Donation'),
    hospitals: t('Nearby Hospitals'),
  };

  const icons: Record<StatType, any> = {
    donations: Heart,
    requests: Bell,
    daysSince: Clock,
    hospitals: MapPin,
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-card rounded-2xl shadow-lg w-full max-w-lg max-h-[80vh] overflow-hidden mx-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground">{titles[type]}</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
            {type === 'donations' && (
              <>
                <div className="bg-primary/5 rounded-xl p-4 text-center">
                  <p className="text-4xl font-bold text-primary">{donor?.donation_count || 0}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t('Total Donations')}</p>
                  {donor?.blood_type && <BloodTypeBadge type={donor.blood_type} size="lg" />}
                </div>
                {donations.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">{t('No donation history yet.')}</p>
                ) : (
                  donations.map((d: any) => (
                    <div key={d.id} className="bg-secondary/50 rounded-xl p-3 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${d.status === 'completed' ? 'bg-success/10' : 'bg-warning/10'}`}>
                        {d.status === 'completed' ? <CheckCircle className="w-4 h-4 text-success" /> : <Clock className="w-4 h-4 text-warning" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{d.hospital_name}</p>
                        <p className="text-xs text-muted-foreground">{d.blood_type} · {new Date(d.date).toLocaleDateString('bn-BD')}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${d.status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {t(d.status)}
                      </span>
                    </div>
                  ))
                )}
              </>
            )}

            {type === 'requests' && (
              <>
                <div className="bg-destructive/5 rounded-xl p-4 text-center">
                  <p className="text-4xl font-bold text-destructive">{requests.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t('Active Requests')}</p>
                </div>
                {requests.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No active requests.</p>
                ) : (
                  requests.map((r: any) => (
                    <div key={r.id} className="bg-secondary/50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <BloodTypeBadge type={r.blood_type} size="sm" />
                          <span className="text-sm font-semibold text-foreground">{r.hospital_name}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.urgency === 'CRITICAL' ? 'bg-destructive/10 text-destructive' :
                          r.urgency === 'URGENT' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                        }`}>{r.urgency}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.units_needed} {t('units')} · {new Date(r.created_at).toLocaleString('bn-BD')}</p>
                      {r.patient_condition && <p className="text-xs text-muted-foreground mt-1">{r.patient_condition}</p>}
                    </div>
                  ))
                )}
              </>
            )}

            {type === 'daysSince' && (
              <div className="space-y-4">
                <div className="bg-accent/10 rounded-xl p-6 text-center">
                  <p className="text-5xl font-bold text-foreground">{daysSince}</p>
                  <p className="text-sm text-muted-foreground mt-2">{t('Days Since Donation')}</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-semibold text-foreground">{t('Eligibility Status')}</p>
                  {typeof daysSince === 'number' && daysSince >= 56 ? (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('You are eligible to donate!')}</span>
                    </div>
                  ) : typeof daysSince === 'number' ? (
                    <div className="flex items-center gap-2 text-warning">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('Wait')} {56 - daysSince} {t('more days')}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('No donation recorded yet')}</p>
                  )}
                </div>
                <div className="bg-secondary/50 rounded-xl p-4 space-y-1">
                  <p className="text-sm font-semibold text-foreground">{t('Last Donation')}</p>
                  <p className="text-sm text-muted-foreground">
                    {donor?.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString('bn-BD') : '—'}
                  </p>
                </div>
              </div>
            )}

            {type === 'hospitals' && (
              <>
                <div className="bg-primary/5 rounded-xl p-4 text-center">
                  <p className="text-4xl font-bold text-primary">{hospitals.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t('Nearby Hospitals')}</p>
                </div>
                {hospitals.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">{t('No hospitals registered yet.')}</p>
                ) : (
                  hospitals
                    .map((h: any) => {
                      const donorHasRealCoords = donor && !isDefaultCoords(donor.latitude, donor.longitude);
                      const hospitalHasRealCoords = !isDefaultCoords(h.latitude, h.longitude);
                      return {
                        ...h,
                        distance: donorHasRealCoords && hospitalHasRealCoords
                          ? getDistanceKm(donor.latitude, donor.longitude, h.latitude, h.longitude)
                          : null,
                      };
                    })
                    .sort((a: any, b: any) => (a.distance ?? 999) - (b.distance ?? 999))
                    .map((h: any) => (
                      <div key={h.id} className="bg-secondary/50 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{h.name}</p>
                          <p className="text-xs text-muted-foreground">{h.address}</p>
                          {h.contact_number && (
                            <a href={`tel:${h.contact_number}`} className="text-xs text-primary mt-0.5 flex items-center gap-1 hover:underline">
                              <Phone className="w-3 h-3" /> {h.contact_number}
                            </a>
                          )}
                        </div>
                        {h.distance !== null && (
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-foreground">{h.distance} km</p>
                            <p className="text-[10px] text-muted-foreground">{t('Distance')}</p>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
