import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Package, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { Sidebar } from '@/components/redova/Sidebar';
import { MobileBottomNav } from '@/components/redova/MobileBottomNav';
import { DashboardHeader } from '@/components/redova/DashboardHeader';
import { StatCard } from '@/components/redova/StatCard';
import { MapView } from '@/components/redova/MapView';
import { EmergencyRequestCard } from '@/components/redova/EmergencyRequestCard';
import { DonorMatchRow } from '@/components/redova/DonorMatchRow';
import { ETABreakdown } from '@/components/redova/ETABreakdown';
import { SettingsBar } from '@/components/redova/SettingsBar';
import { HospitalStatModal } from '@/components/redova/HospitalStatModal';
import { HospitalProfilePanel } from '@/components/redova/HospitalProfilePanel';
import { InventoryManager } from '@/components/redova/InventoryManager';
import { LocationSelector } from '@/components/redova/LocationSelector';
import { AIMatchAnalysis } from '@/components/redova/AIMatchAnalysis';
import { CreditBadge } from '@/components/redova/CreditBadge';
import { CreditManager } from '@/components/redova/CreditManager';
import { URGENCY_CONFIG, mockDonors, mockRequests, mockHospitals, mockInventory } from '@/data/mock-data';
import { findDonorMatches } from '@/lib/matching';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type BloodTypeVal = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
type UrgencyVal = 'CRITICAL' | 'URGENT' | 'STABLE';
const BLOOD_TYPES: BloodTypeVal[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const toDbRequest = (r: any) => ({ id: r.id, hospital_id: r.hospitalId, blood_type: r.bloodType, units_needed: r.unitsNeeded, urgency: r.urgency, status: r.status, patient_condition: r.patientCondition, hospital_name: r.hospitalName, latitude: r.latitude, longitude: r.longitude, created_at: r.createdAt });
const toDbDonor = (d: any) => ({ id: d.id, blood_type: d.bloodType, city: d.city, latitude: d.latitude, longitude: d.longitude, last_donation_date: d.lastDonationDate, is_available: d.isAvailable, donation_count: d.donationCount, user_id: 'mock' });
const toDbHospital = (h: any) => ({ id: h.id, name: h.name, address: h.address, contact_number: h.phone, latitude: h.latitude, longitude: h.longitude, user_id: 'mock' });
const toDbInventory = (i: any) => ({ id: i.id, hospital_id: i.hospitalId, blood_type: i.bloodType, units_available: i.unitsAvailable, expiry_date: i.expiryDate });

const HospitalDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'create' | 'credits'>('overview');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [statModal, setStatModal] = useState<'requests' | 'fulfilled' | 'units' | 'donors' | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const [hospital, setHospital] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [donorProfiles, setDonorProfiles] = useState<Record<string, any>>({});
  const [allHospitals, setAllHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // Create request form state
  const [newBloodType, setNewBloodType] = useState<BloodTypeVal>('O-');
  const [newUnits, setNewUnits] = useState(1);
  const [newUrgency, setNewUrgency] = useState<UrgencyVal>('CRITICAL');
  const [newCondition, setNewCondition] = useState('');
  const [newHospitalName, setNewHospitalName] = useState('');
  const [newZilla, setNewZilla] = useState('');
  const [newUpozilla, setNewUpozilla] = useState('');
  const [newContact, setNewContact] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      loadData();
    } else {
      setIsDemo(true);
      const h = mockHospitals[0];
      setHospital(toDbHospital(h));
      setRequests(mockRequests.map(toDbRequest));
      setInventory(mockInventory.map(toDbInventory));
      setDonors(mockDonors.map(toDbDonor));
      setAllHospitals(mockHospitals.map(toDbHospital));
      setSelectedRequestId(mockRequests[0].id);
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    const [hospRes, reqRes, invRes, donorRes, allHospRes, profilesRes] = await Promise.all([
      supabase.from('hospitals').select('*').eq('user_id', user!.id).single(),
      supabase.from('blood_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('blood_inventory').select('*'),
      supabase.from('donors').select('*'),
      supabase.from('hospitals').select('*'),
      supabase.from('profiles').select('*'),
    ]);

    if (hospRes.data) {
      setHospital(hospRes.data);
      setNewHospitalName(hospRes.data.name || '');
      setNewContact(hospRes.data.contact_number || '');
    } else {
      setIsDemo(true);
      setHospital(toDbHospital(mockHospitals[0]));
    }

    // Build profile lookup for donor contact info
    if (profilesRes.data) {
      const map: Record<string, any> = {};
      profilesRes.data.forEach(p => { map[p.id] = p; });
      setDonorProfiles(map);
    }

    setRequests(reqRes.data?.length ? reqRes.data : mockRequests.map(toDbRequest));
    setInventory(invRes.data?.length ? invRes.data : mockInventory.map(toDbInventory));
    setDonors(donorRes.data?.length ? donorRes.data : mockDonors.map(toDbDonor));
    setAllHospitals(allHospRes.data?.length ? allHospRes.data : mockHospitals.map(toDbHospital));

    const reqs = reqRes.data?.length ? reqRes.data : mockRequests.map(toDbRequest);
    if (reqs.length > 0) setSelectedRequestId(reqs[0].id);
    setLoading(false);
  };

  const selectedRequest = requests.find(r => r.id === selectedRequestId);

  // Enrich donors with profile data (phone, name)
  const enrichedDonors = donors.map(d => {
    const profile = donorProfiles[d.user_id];
    return { ...d, full_name: profile?.full_name || d.city || 'Donor', phone: profile?.phone || '' };
  });

  const matchDonors = donors.map(d => ({
    id: d.id, fullName: d.city || 'Donor', email: '', phone: '',
    bloodType: d.blood_type as any, city: d.city, latitude: d.latitude, longitude: d.longitude,
    lastDonationDate: d.last_donation_date || new Date(0).toISOString(),
    isAvailable: d.is_available, donationCount: d.donation_count,
  }));

  const matchRequest = selectedRequest ? {
    id: selectedRequest.id, hospitalId: selectedRequest.hospital_id,
    bloodType: selectedRequest.blood_type as any, unitsNeeded: selectedRequest.units_needed,
    urgency: selectedRequest.urgency as any, status: selectedRequest.status as any,
    patientCondition: selectedRequest.patient_condition || '',
    hospitalName: selectedRequest.hospital_name, latitude: selectedRequest.latitude,
    longitude: selectedRequest.longitude, createdAt: selectedRequest.created_at,
  } : null;

  const matches = matchRequest ? findDonorMatches(matchDonors, matchRequest) : [];

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital) return;
    const hospName = newHospitalName || hospital.name;

    if (isDemo) {
      toast.success(t('Broadcast Emergency') + ' ✅ (Demo)');
      const newReq = { id: `demo-${Date.now()}`, hospital_id: hospital.id, blood_type: newBloodType, units_needed: newUnits, urgency: newUrgency, status: 'OPEN', patient_condition: newCondition, hospital_name: hospName, latitude: hospital.latitude, longitude: hospital.longitude, created_at: new Date().toISOString(), zilla: newZilla, upozilla: newUpozilla };
      setRequests(prev => [newReq, ...prev]);
      setActiveTab('overview');
      return;
    }

    const { error } = await supabase.from('blood_requests').insert({
      hospital_id: hospital.id, blood_type: newBloodType, units_needed: newUnits,
      urgency: newUrgency, patient_condition: newCondition, hospital_name: hospName,
      latitude: hospital.latitude, longitude: hospital.longitude,
      zilla: newZilla, upozilla: newUpozilla,
    });
    if (error) { toast.error(error.message); }
    else { toast.success(t('Broadcast Emergency') + ' ✅'); setActiveTab('overview'); loadData(); }
  };


  if (authLoading || loading) {
    return <div className="flex items-center justify-center h-screen bg-background"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  }

  const myRequests = isDemo ? requests : requests.filter(r => r.hospital_id === hospital?.id);
  const openRequests = myRequests.filter(r => r.status === 'OPEN');
  const myInventory = isDemo ? inventory : inventory.filter(i => i.hospital_id === hospital?.id);

  return (
    <div className="flex min-h-screen md:h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block w-[60px] shrink-0 p-4 pr-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-3 sm:gap-4 p-3 sm:p-4 md:overflow-hidden overflow-auto pb-20 md:pb-4">
        <div className="md:col-span-8 flex flex-col gap-3 sm:gap-4 md:overflow-hidden">
          <DashboardHeader subtitle={`${hospital?.name} · ${openRequests.length} ${t('active requests')}`}>
            <SettingsBar />
            <CreditBadge hospitalId={hospital?.id} isDemo={isDemo} onClick={() => setActiveTab('credits')} />
            <button onClick={() => setProfileOpen(true)} className="bg-foreground text-background px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:opacity-90 transition-all active:scale-[0.98] flex items-center gap-2">
              <Building2 className="w-4 h-4" /> <span className="hidden sm:inline">{t('Hospital Profile')}</span><span className="sm:hidden">{t('Profile')}</span>
            </button>
          </DashboardHeader>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <StatCard icon={AlertTriangle} label={t('Active Requests')} value={openRequests.length} delay={0} onClick={() => setStatModal('requests')} />
            <StatCard icon={CheckCircle} label={t('Fulfilled Today')} value={myRequests.filter(r => r.status === 'FULFILLED').length} delay={0.1} onClick={() => setStatModal('fulfilled')} />
            <StatCard icon={Package} label={t('Blood Units')} value={myInventory.reduce((s, i) => s + (i.units_available || 0), 0)} delay={0.2} onClick={() => setStatModal('units')} />
            <StatCard icon={Users} label={t('Donors / Recipients Nearby')} value={donors.filter(d => d.is_available).length} delay={0.3} onClick={() => setStatModal('donors')} />
          </div>

          <div className="flex gap-1 bg-secondary p-1 rounded-xl w-full sm:w-fit overflow-x-auto">
            {(['overview', 'inventory', 'create', 'credits'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-card text-foreground shadow-surface' : 'text-muted-foreground hover:text-foreground'}`}>
                {tab === 'create' ? t('+ New') : tab === 'inventory' ? t('Inventory') : tab === 'credits' ? t('Credits') : t(tab)}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <MapView
                    hospitals={allHospitals.map(h => ({ id: h.id, name: h.name, address: h.address, latitude: h.latitude, longitude: h.longitude }))}
                    donors={matchDonors.map(d => ({ id: d.id, fullName: d.fullName || d.city || 'Donor', bloodType: d.bloodType, latitude: d.latitude, longitude: d.longitude, isAvailable: d.isAvailable }))}
                    requests={requests.filter(r => r.status === 'OPEN').map(r => ({ id: r.id, bloodType: r.blood_type, hospitalName: r.hospital_name, urgency: r.urgency, latitude: r.latitude, longitude: r.longitude }))}
                    showLiveTracking={true}
                    className="h-72"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {myRequests.map(req => (
                      <div key={req.id} onClick={() => setSelectedRequestId(req.id)} className="cursor-pointer">
                        <EmergencyRequestCard request={req} compact />
                      </div>
                    ))}
                    {myRequests.length === 0 && <p className="text-muted-foreground col-span-2 text-center py-6">No requests yet. Create one!</p>}
                  </div>
                </motion.div>
              )}

              {activeTab === 'inventory' && (
                <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <InventoryManager
                    inventory={myInventory}
                    hospitalId={hospital?.id || ''}
                    isDemo={isDemo}
                    onUpdated={loadData}
                  />
                </motion.div>
              )}

              {activeTab === 'credits' && (
                <motion.div key="credits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <CreditManager hospitalId={hospital?.id} isDemo={isDemo} />
                </motion.div>
              )}


              {activeTab === 'create' && (
                <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="bg-card rounded-2xl shadow-surface p-6 max-w-lg">
                    <h2 className="text-lg font-bold text-foreground mb-4">{t('New Emergency Request')}</h2>
                    <form onSubmit={handleCreateRequest} className="space-y-4">
                      {/* Hospital Name */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('Hospital Name')}</label>
                        <input
                          type="text"
                          value={newHospitalName}
                          onChange={e => setNewHospitalName(e.target.value)}
                          placeholder={hospital?.name || t('Hospital Name')}
                          className="w-full bg-secondary text-foreground px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>

                      {/* Contact Number */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('Contact Number')}</label>
                        <input
                          type="tel"
                          value={newContact}
                          onChange={e => setNewContact(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full bg-secondary text-foreground px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>

                      {/* Location */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('Location')}</label>
                        <LocationSelector
                          zilla={newZilla}
                          upozilla={newUpozilla}
                          onZillaChange={setNewZilla}
                          onUpozillaChange={setNewUpozilla}
                        />
                      </div>

                      {/* Blood Type */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('Blood Type Required')}</label>
                        <div className="grid grid-cols-4 gap-2">
                          {BLOOD_TYPES.map(bt => (
                            <button key={bt} type="button" onClick={() => setNewBloodType(bt)} className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${newBloodType === bt ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground'}`}>{bt}</button>
                          ))}
                        </div>
                      </div>

                      {/* Units */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('Units Needed')}</label>
                        <input type="number" value={newUnits} onChange={e => setNewUnits(Number(e.target.value))} min={1} className="w-full bg-secondary text-foreground px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>

                      {/* Urgency */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('Urgency Level')}</label>
                        <div className="flex gap-2">
                          {(['CRITICAL', 'URGENT', 'STABLE'] as UrgencyVal[]).map(u => (
                            <button key={u} type="button" onClick={() => setNewUrgency(u)} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-colors ${newUrgency === u ? URGENCY_CONFIG[u].className : 'bg-secondary text-muted-foreground'}`}>{u}</button>
                          ))}
                        </div>
                      </div>

                      {/* Condition */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('Patient Condition')}</label>
                        <textarea value={newCondition} onChange={e => setNewCondition(e.target.value)} className="w-full bg-secondary text-foreground px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" rows={3} placeholder={t("Describe the patient's condition...")} />
                      </div>

                      <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors active:scale-[0.98]">{t('Broadcast Emergency')}</button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <aside className="hidden md:flex md:col-span-4 flex-col gap-4 overflow-hidden">
          <div className="bg-card rounded-2xl shadow-surface p-5 flex-1 overflow-auto">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
              {selectedRequest ? `${t('Live Matches')} — ${selectedRequest.blood_type}` : t('Live Matches')}
            </h2>
            {matches.length > 0 ? (
              <div className="space-y-1">
                {matches.map((match, i) => (
                  <DonorMatchRow key={match.donor.id} match={match} rank={i} onSelect={() => toast.info(`${match.donor.fullName} — ${match.distance} km — ETA: ${match.eta.totalMinutes} min`)} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('Select a request to see donor matches')}</p>
            )}
          </div>

          {matches.length > 0 && matchRequest && (
            <AIMatchAnalysis
              request={matchRequest}
              donors={matchDonors}
              matches={matches}
            />
          )}

          {matches.length > 0 && (
            <ETABreakdown eta={matches[0].eta} distance={matches[0].distance} donorName={matches[0].donor.fullName} />
          )}

          <button onClick={() => setActiveTab('create')} className="w-full py-4 bg-foreground text-background rounded-2xl font-bold text-lg shadow-surface-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> {t('Broadcast Emergency')}
          </button>
        </aside>
      </div>

      {/* Stat Detail Modal */}
      <HospitalStatModal
        type={statModal}
        onClose={() => setStatModal(null)}
        donors={enrichedDonors}
        requests={myRequests}
        inventory={myInventory}
        hospitalUpozilla={hospital?.upozilla}
        hospitalZilla={hospital?.zilla}
      />

      {/* Hospital Profile Panel */}
      <HospitalProfilePanel
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        hospital={hospital}
        onProfileUpdated={loadData}
      />

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
};

export default HospitalDashboard;
