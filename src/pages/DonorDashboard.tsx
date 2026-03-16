import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bell, MapPin, Clock, CheckCircle, Search, PlusCircle, Hospital, User, Navigation, Coins } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/bloodlink/Sidebar';
import { MobileBottomNav } from '@/components/bloodlink/MobileBottomNav';
import { DashboardHeader } from '@/components/bloodlink/DashboardHeader';
import { EmergencyRequestCard } from '@/components/bloodlink/EmergencyRequestCard';
import { MissionTracker } from '@/components/bloodlink/MissionTracker';
import { MapView } from '@/components/bloodlink/MapView';
import { StatCard } from '@/components/bloodlink/StatCard';
import { BloodTypeBadge } from '@/components/bloodlink/BloodTypeBadge';
import { SettingsBar } from '@/components/bloodlink/SettingsBar';
import { BloodSearchPanel } from '@/components/bloodlink/BloodSearchPanel';
import { CreateRequestForm } from '@/components/bloodlink/CreateRequestForm';
import { NotificationBell } from '@/components/bloodlink/NotificationBell';
import { RequesterCreditBadge } from '@/components/bloodlink/RequesterCreditBadge';
import { RequesterCreditManager } from '@/components/bloodlink/RequesterCreditManager';
import { HealthAdBanner } from '@/components/bloodlink/HealthAdBanner';

import { StatDetailModal } from '@/components/bloodlink/StatDetailModal';
import { ProfilePanel } from '@/components/bloodlink/ProfilePanel';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { mockDonors, mockRequests, mockHospitals, mockDonations } from '@/data/mock-data';
import { calculateETA } from '@/lib/matching';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type TabKey = 'requests' | 'search' | 'create' | 'credits' | 'history' | 'map';
type StatType = 'donations' | 'requests' | 'daysSince' | 'hospitals';

const routeToTab: Record<string, TabKey> = {
  '/donor': 'requests',
  '/donor/search': 'search',
  '/donor/create': 'create',
  '/donor/credits': 'credits',
  '/donor/history': 'history',
  '/donor/map': 'map',
};

const DonorDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab: TabKey = routeToTab[location.pathname] || 'requests';
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const [donor, setDonor] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [activeMissions, setActiveMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [requesterBalance, setRequesterBalance] = useState<number>(10);
  const [statModal, setStatModal] = useState<StatType | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [detailsRequest, setDetailsRequest] = useState<any>(null);
  const gpsWatchRef = useRef<number | null>(null);
  const [myLiveLocation, setMyLiveLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      loadData();
    } else {
      setIsDemo(true);
      const d = mockDonors[0];
      setDonor({ id: d.id, blood_type: d.bloodType, city: d.city, latitude: d.latitude, longitude: d.longitude, last_donation_date: d.lastDonationDate, is_available: d.isAvailable, donation_count: d.donationCount, user_id: 'demo' });
      setRequests(mockRequests.filter(r => r.status === 'OPEN').map(r => ({ id: r.id, blood_type: r.bloodType, hospital_name: r.hospitalName, units_needed: r.unitsNeeded, urgency: r.urgency, status: r.status, patient_condition: r.patientCondition, latitude: r.latitude, longitude: r.longitude, hospital_id: r.hospitalId, created_at: r.createdAt, requester_name: 'রোগীর অভিভাবক', requester_mobile: '+880171234567', upozilla: 'Rajshahi Sadar', zilla: 'Rajshahi', _isMock: true })));
      setHospitals(mockHospitals.map(h => ({ id: h.id, name: h.name, address: h.address, latitude: h.latitude, longitude: h.longitude, contact_number: h.phone })));
      setDonations(mockDonations.map(d => ({ id: d.id, hospital_name: d.hospitalName, blood_type: d.bloodType, date: d.date, status: d.status })));
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    const [donorRes, reqRes, hospRes, donationRes, missionRes, creditRes] = await Promise.all([
      supabase.from('donors').select('*').eq('user_id', user!.id).single(),
      supabase.from('blood_requests').select('*').eq('status', 'OPEN').order('created_at', { ascending: false }),
      supabase.from('hospitals').select('*'),
      supabase.from('donations').select('*').order('date', { ascending: false }),
      supabase.from('missions' as any).select('*').eq('donor_user_id', user!.id).neq('status', 'arrived').order('created_at', { ascending: false }),
      supabase.from('requester_credits' as any).select('balance').eq('user_id', user!.id).maybeSingle(),
    ]);
    setRequesterBalance((creditRes.data as any)?.balance ?? 10);
    let usingMockRequests = false;
    if (donorRes.data) {
      setDonor(donorRes.data);
    } else {
      const d = mockDonors[0];
      setDonor({ id: d.id, blood_type: d.bloodType, city: d.city, latitude: d.latitude, longitude: d.longitude, last_donation_date: d.lastDonationDate, is_available: d.isAvailable, donation_count: d.donationCount, user_id: user!.id });
      setIsDemo(true);
    }
    if (reqRes.data?.length) {
      setRequests(reqRes.data);
    } else {
      usingMockRequests = true;
      setRequests(mockRequests.filter(r => r.status === 'OPEN').map(r => ({ id: r.id, blood_type: r.bloodType, hospital_name: r.hospitalName, units_needed: r.unitsNeeded, urgency: r.urgency, status: r.status, patient_condition: r.patientCondition, latitude: r.latitude, longitude: r.longitude, hospital_id: r.hospitalId, created_at: r.createdAt, requester_name: 'রোগীর অভিভাবক', requester_mobile: '+880171234567', upozilla: 'Rajshahi Sadar', zilla: 'Rajshahi', _isMock: true })));
    }
    setHospitals(hospRes.data?.length ? hospRes.data : mockHospitals.map(h => ({ id: h.id, name: h.name, address: h.address, latitude: h.latitude, longitude: h.longitude, contact_number: h.phone })));
    setDonations(donationRes.data?.length ? donationRes.data : mockDonations.map(d => ({ id: d.id, hospital_name: d.hospitalName, blood_type: d.bloodType, date: d.date, status: d.status })));
    
    // Load active missions with their request data
    if ((missionRes.data as any[])?.length) {
      const missions = (missionRes.data as any[]);
      const requestIds = missions.map((m: any) => m.request_id);
      const { data: missionRequests } = await supabase.from('blood_requests').select('*').in('id', requestIds);
      const reqMap = new Map((missionRequests || []).map((r: any) => [r.id, r]));
      setActiveMissions(missions.map((m: any) => ({ ...m, request: reqMap.get(m.request_id) || {} })));
    } else {
      setActiveMissions([]);
    }
    setLoading(false);
  };

  // GPS tracking for active missions
  useEffect(() => {
    if (activeMissions.length === 0 || !donor || !user) {
      // Stop tracking
      if (gpsWatchRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
        gpsWatchRef.current = null;
      }
      // Clean up live location records
      if (user && donor) {
        supabase.from('donor_live_locations' as any).delete().eq('user_id', user.id).then(() => {});
      }
      setMyLiveLocation(null);
      return;
    }

    if (!navigator.geolocation) return;

    const updateLocation = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setMyLiveLocation({ lat: latitude, lng: longitude });
      
      // Upsert live location for each active mission
      activeMissions.forEach(async (m) => {
        if (m.id.startsWith('demo-')) return;
        await supabase.from('donor_live_locations' as any).upsert({
          donor_id: donor.id,
          mission_id: m.id,
          user_id: user.id,
          latitude,
          longitude,
          status: m.status,
        } as any, { onConflict: 'donor_id,mission_id' });
      });
    };

    gpsWatchRef.current = navigator.geolocation.watchPosition(
      updateLocation,
      (err) => console.warn('GPS error:', err.message),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    return () => {
      if (gpsWatchRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
        gpsWatchRef.current = null;
      }
    };
  }, [activeMissions.length, donor?.id, user?.id]);

  const handleAccept = async (request: any) => {
    if (!donor) return;
    // Treat mock data requests as demo mode (mock IDs aren't valid UUIDs)
    const isMockRequest = request._isMock || isDemo;
    if (isMockRequest) {
      toast.success(`🎯 ${t('মিশন গৃহীত')}! → ${request.hospital_name}`);
      setActiveMissions(prev => [...prev, { id: `demo-${Date.now()}`, status: 'accepted', request, donor_user_id: user?.id || 'demo' }]);
      setRequests(prev => prev.filter(r => r.id !== request.id));
      return;
    }
    // Insert mission
    const { data: mission, error } = await supabase.from('missions' as any).insert({
      donor_id: donor.id,
      request_id: request.id,
      donor_user_id: user!.id,
      status: 'accepted',
    } as any).select().single();

    if (error) {
      toast.error(error.message);
    } else {
      // Also insert donation record
      await supabase.from('donations').insert({
        donor_id: donor.id,
        request_id: request.id,
        hospital_name: request.hospital_name,
        blood_type: request.blood_type,
        status: 'pending',
      });
      toast.success(`🎯 ${t('মিশন গৃহীত')}! → ${request.hospital_name}`);
      loadData();
    }
  };

  const handleDecline = (request: any) => {
    toast(`❌ ${t('প্রত্যাখ্যান করা হয়েছে')} — ${request.hospital_name}`, { description: request.blood_type });
    setRequests(prev => prev.filter(r => r.id !== request.id));
  };

  const handleMissionUpdate = async (missionId: string, status: string) => {
    const isDemoMission = missionId.startsWith('demo-') || isDemo;
    const stepLabels: Record<string, string> = {
      departed: '🚀 রওনা দিয়েছি!',
      on_the_way: '🛣️ পথে আছি!',
      halfway: '📍 মাঝপথে!',
      almost_there: '🏁 প্রায় পৌঁছে গেছি!',
      arrived: '🏆 পৌঁছে গেছি! মিশন সম্পন্ন!',
    };
    if (isDemoMission) {
      setActiveMissions(prev => prev.map(m => m.id === missionId ? { ...m, status } : m));
      toast.success(stepLabels[status] || status);
      if (status === 'arrived') {
        setTimeout(() => setActiveMissions(prev => prev.filter(m => m.id !== missionId)), 3000);
      }
      return;
    }
    const { error } = await supabase.from('missions' as any).update({ status } as any).eq('id', missionId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(stepLabels[status] || status);
      loadData();
    }
  };

  const handleMissionCancel = async (missionId: string) => {
    const isDemoMission = missionId.startsWith('demo-') || isDemo;
    if (isDemoMission) {
      setActiveMissions(prev => prev.filter(m => m.id !== missionId));
      toast('মিশন বাতিল করা হয়েছে');
      return;
    }
    await supabase.from('missions' as any).delete().eq('id', missionId);
    toast('মিশন বাতিল করা হয়েছে');
    loadData();
  };

  const handleRequestCreated = (newReq: any) => {
    setRequests(prev => [newReq, ...prev]);
    navigate('/donor');
  };

  const getDistanceToRequest = (req: any) => {
    if (!donor) return 0;
    const R = 6371;
    const dLat = (req.latitude - donor.latitude) * Math.PI / 180;
    const dLng = (req.longitude - donor.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(donor.latitude * Math.PI / 180) * Math.cos(req.latitude * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
  };

  if (authLoading || loading) {
    return <div className="flex items-center justify-center h-screen bg-background"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  }

  const openRequests = requests.filter(r => !activeMissions.some(m => m.request_id === r.id));
  
  // Fix: use actual donations count, not donor.donation_count which may be stale
  const completedDonations = donations.filter(d => d.status === 'completed').length;
  const totalDonations = completedDonations || donor?.donation_count || 0;
  
  // Fix: use latest donation date from records if donor.last_donation_date is missing
  const lastDonation = donor?.last_donation_date
    ? new Date(donor.last_donation_date)
    : donations.length > 0
      ? new Date(donations[0].date)
      : null;
  const daysSince = lastDonation
    ? Math.floor((Date.now() - lastDonation.getTime()) / (1000 * 60 * 60 * 24))
    : '—';
  const displayName = user?.user_metadata?.full_name || (isDemo ? 'Arif Rahman' : 'Donor');

  const isDefaultCoords = (lat?: number, lng?: number) =>
    typeof lat === 'number' && typeof lng === 'number' &&
    Math.abs(lat - 24.3745) < 0.0001 && Math.abs(lng - 88.6042) < 0.0001;

  const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const donorArea = (donor?.upozilla || donor?.zilla || donor?.city || '').toLowerCase();
  const donorHasRealCoords = donor && !isDefaultCoords(donor.latitude, donor.longitude);

  const nearbyHospitals = hospitals.filter((h: any) => {
    const searchableText = `${h.name ?? ''} ${h.address ?? ''}`.toLowerCase();
    if (donorArea && searchableText.includes(donorArea)) return true;
    const hospitalHasRealCoords = !isDefaultCoords(h.latitude, h.longitude);
    if (!donorHasRealCoords || !hospitalHasRealCoords) return false;
    return getDistanceKm(donor.latitude, donor.longitude, h.latitude, h.longitude) <= 30;
  });

  const tabs = [
    { key: 'requests' as const, path: '/donor', label: `${t('Requests')} (${openRequests.length})`, icon: Bell },
    { key: 'search' as const, path: '/donor/search', label: t('AI Search'), icon: Search },
    { key: 'create' as const, path: '/donor/create', label: t('+ Request'), icon: PlusCircle },
    { key: 'credits' as const, path: '/donor/credits', label: t('Credits'), icon: Coins },
    { key: 'history' as const, path: '/donor/history', label: t('history'), icon: Clock },
    { key: 'map' as const, path: '/donor/map', label: t('map'), icon: MapPin },
  ];

  return (
    <div className="flex min-h-screen md:h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block w-[60px] shrink-0 p-4 pr-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 md:overflow-hidden overflow-auto pb-20 md:pb-4">
        <DashboardHeader subtitle={`${t('System Ready.')} ${openRequests.length} ${t('active requests nearby.')}`}>
          <RequesterCreditBadge isDemo={isDemo} />
          <NotificationBell />
          <SettingsBar />
          <BloodTypeBadge type={donor?.blood_type || 'O+'} size="lg" />
          <button
            onClick={() => setProfileOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">{donor?.city}</p>
            </div>
          </button>
        </DashboardHeader>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <StatCard icon={Heart} label={t('Total Donations')} value={totalDonations} delay={0} onClick={() => setStatModal('donations')} />
          <StatCard icon={Bell} label={t('Active Requests')} value={openRequests.length} delay={0.1} onClick={() => setStatModal('requests')} />
          <StatCard icon={Clock} label={t('Days Since Donation')} value={daysSince} delay={0.2} onClick={() => setStatModal('daysSince')} />
          <StatCard icon={Coins} label={t('Remaining Credits')} value={requesterBalance} delay={0.3} onClick={() => navigate('/donor/credits')} />
        </div>

        {/* Desktop tab bar */}
        <div className="hidden md:flex gap-1 bg-secondary p-1 rounded-xl w-fit overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => navigate(tab.path)} className={`px-3 py-2 rounded-lg text-sm font-bold capitalize transition-colors flex items-center gap-1.5 whitespace-nowrap ${activeTab === tab.key ? 'bg-card text-foreground shadow-surface' : 'text-muted-foreground hover:text-foreground'}`}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 md:overflow-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'requests' && (
              <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Active Missions */}
                {activeMissions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('সক্রিয় মিশন')} ({activeMissions.length})</h2>
                    </div>
                    {activeMissions.map(m => (
                      <MissionTracker
                        key={m.id}
                        mission={m}
                        onUpdateStatus={handleMissionUpdate}
                        onCancel={handleMissionCancel}
                      />
                    ))}
                  </div>
                )}

                {/* Open Requests */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {openRequests.length === 0 && activeMissions.length === 0 && <p className="text-muted-foreground col-span-2 text-center py-10">No active requests right now.</p>}
                  {openRequests.map(req => {
                    const dist = getDistanceToRequest(req);
                    const eta = calculateETA(dist);
                    return (
                      <EmergencyRequestCard
                        key={req.id}
                        request={req}
                        onAccept={() => handleAccept(req)}
                        onDecline={() => handleDecline(req)}
                        onDetails={() => setDetailsRequest(req)}
                        eta={eta}
                        distance={dist}
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'search' && (
              <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl">
                <BloodSearchPanel defaultBloodType={donor?.blood_type} />
              </motion.div>
            )}

            {activeTab === 'create' && (
              <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-lg">
                <CreateRequestForm
                  isDemo={isDemo}
                  donorBloodType={donor?.blood_type}
                  donorCity={donor?.city}
                  donorLatitude={donor?.latitude}
                  donorLongitude={donor?.longitude}
                  onRequestCreated={handleRequestCreated}
                />
              </motion.div>
            )}

            {activeTab === 'credits' && (
              <motion.div key="credits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-lg space-y-4">
                <RequesterCreditManager isDemo={isDemo} />
                <HealthAdBanner />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {donations.length === 0 && <p className="text-muted-foreground text-center py-10">No donation history yet.</p>}
                {donations.map(d => (
                  <div key={d.id} className="bg-card rounded-xl p-4 shadow-surface flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${d.status === 'completed' ? 'bg-success/10' : 'bg-warning/10'}`}>
                      {d.status === 'completed' ? <CheckCircle className="w-5 h-5 text-success" /> : <Clock className="w-5 h-5 text-warning" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{d.hospital_name}</p>
                      <p className="text-xs text-muted-foreground">{d.blood_type} · {new Date(d.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${d.status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{t(d.status)}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'map' && (
              <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <MapView
                  hospitals={hospitals.map(h => ({ id: h.id, name: h.name, address: h.address, latitude: h.latitude, longitude: h.longitude }))}
                  donors={donor ? [{ id: donor.id, fullName: displayName, bloodType: donor.blood_type, latitude: myLiveLocation?.lat || donor.latitude, longitude: myLiveLocation?.lng || donor.longitude, isAvailable: true }] : []}
                  requests={openRequests.map(r => ({ id: r.id, bloodType: r.blood_type, hospitalName: r.hospital_name, urgency: r.urgency, latitude: r.latitude, longitude: r.longitude }))}
                  showLiveTracking={activeMissions.length > 0}
                  className="h-[500px]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stat Detail Modal */}
      <StatDetailModal
        type={statModal}
        onClose={() => setStatModal(null)}
        donor={donor}
        donations={donations}
        requests={openRequests}
        hospitals={nearbyHospitals}
        daysSince={daysSince}
      />

      {/* Profile Panel */}
      <ProfilePanel
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        donor={donor}
        onProfileUpdated={loadData}
      />

      {/* Details Dialog */}
      <Dialog open={!!detailsRequest} onOpenChange={() => setDetailsRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{detailsRequest?.blood_type} — {detailsRequest?.hospital_name}</DialogTitle>
            <DialogDescription>{t('বিস্তারিত তথ্য')}</DialogDescription>
          </DialogHeader>
          {detailsRequest && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">{t('Blood Type')}</p>
                  <p className="font-bold text-foreground">{detailsRequest.blood_type}</p>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">{t('units')}</p>
                  <p className="font-bold text-foreground">{detailsRequest.units_needed}</p>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">{t('Urgency')}</p>
                  <p className="font-bold text-foreground">{detailsRequest.urgency}</p>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">{t('Status')}</p>
                  <p className="font-bold text-foreground">{detailsRequest.status}</p>
                </div>
              </div>
              {detailsRequest.patient_condition && (
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-muted-foreground text-xs mb-1">{t('Patient Condition')}</p>
                  <p className="text-sm text-foreground">{detailsRequest.patient_condition}</p>
                </div>
              )}
              {/* Contact Info */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-2">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">{t('যোগাযোগ তথ্য')}</p>
                {detailsRequest.requester_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-medium text-foreground">{detailsRequest.requester_name}</span>
                  </div>
                )}
                {detailsRequest.requester_mobile && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-primary shrink-0">📞</span>
                    <a href={`tel:${detailsRequest.requester_mobile}`} className="text-primary hover:underline font-medium">{detailsRequest.requester_mobile}</a>
                  </div>
                )}
                {(detailsRequest.upozilla || detailsRequest.zilla) && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-foreground">{[detailsRequest.upozilla, detailsRequest.zilla].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {!detailsRequest.requester_name && !detailsRequest.requester_mobile && !detailsRequest.upozilla && !detailsRequest.zilla && (
                  <p className="text-xs text-muted-foreground">{t('যোগাযোগ তথ্য পাওয়া যায়নি')}</p>
                )}
              </div>
              <button
                onClick={() => { handleAccept(detailsRequest); setDetailsRequest(null); }}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                {t('Accept Mission')}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
};

export default DonorDashboard;
