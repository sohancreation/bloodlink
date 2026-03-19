import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Activity, Heart, TrendingUp, Clock, Coins, ShieldCheck, X, User, Trash2, Gift, Search, Bell, CreditCard, LogOut, Shield } from 'lucide-react';
import { SettingsBar } from '@/components/redova/SettingsBar';
import { BloodTypeBadge } from '@/components/redova/BloodTypeBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import RedovaLogo from '@/assets/redova-logo.png';

type Tab = 'overview' | 'users' | 'hospitals' | 'payments';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  const [donors, setDonors] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [hospitalCredits, setHospitalCredits] = useState<any[]>([]);
  const [requesterCredits, setRequesterCredits] = useState<any[]>([]);
  const [creditRequests, setCreditRequests] = useState<any[]>([]);
  const [requesterPurchaseRequests, setRequesterPurchaseRequests] = useState<any[]>([]);
  const [subscriptionRequests, setSubscriptionRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [giftCredits, setGiftCredits] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const [donorRes, hospRes, reqRes, profRes, hcRes, rcRes, crRes, rprRes, subRes] = await Promise.all([
      supabase.from('donors').select('*'),
      supabase.from('hospitals').select('*'),
      supabase.from('blood_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*'),
      supabase.from('hospital_credits').select('*'),
      supabase.from('requester_credits').select('*'),
      supabase.from('credit_purchase_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('requester_purchase_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('hospital_subscriptions').select('*').order('created_at', { ascending: false }),
    ]);
    setDonors(donorRes.data || []);
    setHospitals(hospRes.data || []);
    setRequests(reqRes.data || []);
    setProfiles(profRes.data || []);
    setHospitalCredits(hcRes.data || []);
    setRequesterCredits((rcRes.data as any[]) || []);
    setCreditRequests(crRes.data || []);
    setRequesterPurchaseRequests((rprRes.data as any[]) || []);
    setSubscriptionRequests((subRes.data as any[]) || []);
    setLoading(false);
  };

  const getProfile = (userId: string) => profiles.find(p => p.id === userId);
  const getHospitalCredit = (hospitalId: string) => hospitalCredits.find(c => c.hospital_id === hospitalId)?.balance || 0;
  const getRequesterCredit = (userId: string) => requesterCredits.find((c: any) => c.user_id === userId)?.balance || 0;

  const handleDeleteUser = async (userId: string, role: string) => {
    if (!confirm('Are you sure you want to delete this account? This cannot be undone.')) return;
    try {
      if (role === 'donor') {
        const donor = donors.find(d => d.user_id === userId);
        if (donor) {
          await supabase.from('requester_credits').delete().eq('user_id', userId);
          await supabase.from('requester_credit_transactions').delete().eq('user_id', userId);
          await supabase.from('donors').delete().eq('user_id', userId);
        }
      } else if (role === 'hospital') {
        const hosp = hospitals.find(h => h.user_id === userId);
        if (hosp) {
          await supabase.from('hospital_credits').delete().eq('hospital_id', hosp.id);
          await supabase.from('credit_transactions').delete().eq('hospital_id', hosp.id);
          await supabase.from('hospitals').delete().eq('user_id', userId);
        }
      }
      await supabase.from('user_roles').delete().eq('user_id', userId);
      await supabase.from('notifications').delete().eq('user_id', userId);
      await supabase.from('profiles').delete().eq('id', userId);
      toast.success('Account deleted successfully');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleGiveCredits = async (userId: string, type: 'donor' | 'hospital', hospitalId?: string) => {
    const amount = giftCredits[userId] || 0;
    if (amount <= 0) { toast.error('Enter a valid credit amount'); return; }

    try {
      if (type === 'hospital' && hospitalId) {
        const existing = hospitalCredits.find(c => c.hospital_id === hospitalId);
        if (existing) {
          await supabase.from('hospital_credits').update({ balance: existing.balance + amount }).eq('hospital_id', hospitalId);
        } else {
          await supabase.from('hospital_credits').insert({ hospital_id: hospitalId, balance: amount });
        }
        await supabase.from('credit_transactions').insert({
          hospital_id: hospitalId, amount, type: 'purchase' as const,
          description: `Admin gifted ${amount} credits`,
        });
      } else {
        const existing = requesterCredits.find((c: any) => c.user_id === userId);
        if (existing) {
          await supabase.from('requester_credits').update({ balance: (existing as any).balance + amount }).eq('user_id', userId);
        } else {
          await supabase.from('requester_credits').insert({ user_id: userId, balance: amount } as any);
        }
        await supabase.from('requester_credit_transactions').insert({
          user_id: userId, amount, type: 'purchase' as const,
          description: `Admin gifted ${amount} credits`,
        } as any);
      }

      // Send notification
      await supabase.from('notifications').insert({
        user_id: userId,
        title: '🎁 Credits Received!',
        message: `Admin has gifted you ${amount} credits. Your updated balance is ready.`,
        blood_type: 'O+',
      } as any);

      toast.success(`${amount} credits gifted!`);
      setGiftCredits(prev => ({ ...prev, [userId]: 0 }));
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to give credits');
    }
  };

  const handleApproveCredit = async (cr: any) => {
    const { data: pkg } = await supabase.from('credit_packages').select('*').eq('id', cr.package_id).single();
    if (!pkg) { toast.error('Package not found'); return; }

    const existing = hospitalCredits.find(c => c.hospital_id === cr.hospital_id);
    if (existing) {
      await supabase.from('hospital_credits').update({ balance: existing.balance + pkg.credits }).eq('hospital_id', cr.hospital_id);
    } else {
      await supabase.from('hospital_credits').insert({ hospital_id: cr.hospital_id, balance: pkg.credits });
    }
    await supabase.from('credit_transactions').insert({
      hospital_id: cr.hospital_id, amount: pkg.credits, type: 'purchase' as const,
      description: `${pkg.name} (৳${pkg.price_bdt}) approved - ${cr.payment_method}: ${cr.payment_reference}`,
    });
    await supabase.from('credit_purchase_requests').update({ status: 'approved' }).eq('id', cr.id);

    // Notify hospital
    const hosp = hospitals.find(h => h.id === cr.hospital_id);
    if (hosp) {
      await supabase.from('notifications').insert({
        user_id: hosp.user_id,
        title: '✅ Payment Approved!',
        message: `Your credit purchase of ${pkg.credits} credits (${pkg.name}) has been approved! Credits added to your balance.`,
        blood_type: 'O+',
      } as any);
    }

    toast.success(`Approved! ${pkg.credits} credits added.`);
    loadData();
  };

  const handleRejectCredit = async (cr: any) => {
    await supabase.from('credit_purchase_requests').update({ status: 'rejected' }).eq('id', cr.id);
    const hosp = hospitals.find(h => h.id === cr.hospital_id);
    if (hosp) {
      await supabase.from('notifications').insert({
        user_id: hosp.user_id,
        title: '❌ Payment Rejected',
        message: `Your credit purchase request (${cr.payment_method}: ${cr.payment_reference}) has been rejected. Please contact support.`,
        blood_type: 'O+',
      } as any);
    }
    toast.success('Request rejected.');
    loadData();
  };

  const handleApproveRequesterCredit = async (pr: any) => {
    const { data: pkg } = await supabase.from('requester_credit_packages').select('*').eq('id', pr.package_id).single();
    if (!pkg) { toast.error('Package not found'); return; }
    const p = pkg as any;

    const existing = requesterCredits.find((c: any) => c.user_id === pr.user_id);
    if (existing) {
      await supabase.from('requester_credits').update({ balance: (existing as any).balance + p.credits }).eq('user_id', pr.user_id);
    } else {
      await supabase.from('requester_credits').insert({ user_id: pr.user_id, balance: p.credits } as any);
    }
    await supabase.from('requester_credit_transactions').insert({
      user_id: pr.user_id, amount: p.credits, type: 'purchase' as const,
      description: `${p.name} (৳${p.price_bdt}) approved - ${pr.payment_method}: ${pr.payment_reference}`,
    } as any);
    await supabase.from('requester_purchase_requests').update({ status: 'approved' }).eq('id', pr.id);

    // Notify user
    await supabase.from('notifications').insert({
      user_id: pr.user_id,
      title: '✅ Payment Approved!',
      message: `Your credit purchase of ${p.credits} credits (${p.name}) has been approved! Credits added to your balance.`,
      blood_type: 'O+',
    } as any);

    toast.success(`Approved! ${p.credits} credits added.`);
    loadData();
  };

  const handleRejectRequesterCredit = async (pr: any) => {
    await supabase.from('requester_purchase_requests').update({ status: 'rejected' }).eq('id', pr.id);
    await supabase.from('notifications').insert({
      user_id: pr.user_id,
      title: '❌ Payment Rejected',
      message: `Your credit purchase request (${pr.payment_method}: ${pr.payment_reference}) has been rejected.`,
      blood_type: 'O+',
    } as any);
    toast.success('Request rejected.');
    loadData();
  };

  const handleApproveSubscription = async (sub: any) => {
    const existing = hospitalCredits.find(c => c.hospital_id === sub.hospital_id);
    if (existing) {
      await supabase.from('hospital_credits').update({ balance: existing.balance + sub.credits_per_month }).eq('hospital_id', sub.hospital_id);
    } else {
      await supabase.from('hospital_credits').insert({ hospital_id: sub.hospital_id, balance: sub.credits_per_month });
    }
    await supabase.from('credit_transactions').insert({
      hospital_id: sub.hospital_id, amount: sub.credits_per_month, type: 'purchase' as const,
      description: `${sub.plan_name} subscription (৳${sub.price_bdt}/mo) approved`,
    });
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    await supabase.from('hospital_subscriptions').update({
      status: 'active', starts_at: now.toISOString(), expires_at: expiresAt.toISOString(),
    }).eq('id', sub.id);

    const hosp = hospitals.find(h => h.id === sub.hospital_id);
    if (hosp) {
      await supabase.from('notifications').insert({
        user_id: hosp.user_id,
        title: '✅ Subscription Approved!',
        message: `Your ${sub.plan_name} subscription has been activated! ${sub.credits_per_month} credits added.`,
        blood_type: 'O+',
      } as any);
    }
    toast.success(`Approved! ${sub.credits_per_month} credits added.`);
    loadData();
  };

  const handleRejectSubscription = async (sub: any) => {
    await supabase.from('hospital_subscriptions').update({ status: 'cancelled' }).eq('id', sub.id);
    const hosp = hospitals.find(h => h.id === sub.hospital_id);
    if (hosp) {
      await supabase.from('notifications').insert({
        user_id: hosp.user_id,
        title: '❌ Subscription Rejected',
        message: `Your ${sub.plan_name} subscription request has been rejected.`,
        blood_type: 'O+',
      } as any);
    }
    toast.success('Subscription rejected.');
    loadData();
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin-login');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-background"><div className="animate-pulse text-muted-foreground">Loading Admin Panel...</div></div>;
  }

  const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'users', label: 'Users / Donors / Recipients', icon: Users },
    { key: 'hospitals', label: 'Hospitals', icon: Building2 },
    { key: 'payments', label: 'Payments', icon: CreditCard },
  ];

  const donorProfiles = profiles.filter(p => p.role === 'donor');
  const hospitalProfiles = profiles.filter(p => p.role === 'hospital');
  const filteredDonors = donorProfiles.filter(p =>
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredHospitals = hospitals.filter(h =>
    h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingHospitalCR = creditRequests.filter(cr => cr.status === 'pending');
  const pendingRequesterCR = requesterPurchaseRequests.filter(pr => pr.status === 'pending');
  const pendingSubs = subscriptionRequests.filter(s => s.status === 'pending');
  const totalPending = pendingHospitalCR.length + pendingRequesterCR.length + pendingSubs.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-card border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={RedovaLogo} alt="Redova" className="w-8 h-8 rounded-lg object-contain" />
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Admin Panel
            </h1>
            <p className="text-xs text-muted-foreground">{profile?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SettingsBar />
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 text-sm font-medium transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6 flex gap-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.key === 'payments' && totalPending > 0 && (
                <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">{totalPending}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Search */}
        {(tab === 'users' || tab === 'hospitals') && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${tab}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-card text-foreground pl-10 pr-4 py-3 rounded-xl text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Users, label: 'Total Donors / Recipients', value: donorProfiles.length, color: 'text-primary' },
                { icon: Building2, label: 'Total Hospitals', value: hospitalProfiles.length, color: 'text-info' },
                { icon: Activity, label: 'Active Requests', value: requests.filter(r => r.status === 'OPEN').length, color: 'text-warning' },
                { icon: CreditCard, label: 'Pending Payments', value: totalPending, color: 'text-destructive' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl p-5 border border-border">
                  <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl p-5 border border-border">
                <h3 className="text-sm font-bold text-foreground mb-4">Recent Blood Requests</h3>
                <div className="space-y-2">
                  {requests.slice(0, 8).map(r => (
                    <div key={r.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <BloodTypeBadge type={r.blood_type} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{r.hospital_name || r.requester_name}</p>
                          <p className="text-[11px] text-muted-foreground">{r.zilla} {r.upozilla}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.urgency === 'CRITICAL' ? 'bg-destructive/10 text-destructive' :
                        r.urgency === 'URGENT' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                      }`}>{r.urgency}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl p-5 border border-border">
                <h3 className="text-sm font-bold text-foreground mb-4">Credit Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                    <span className="text-sm text-muted-foreground">Total Hospital Credits</span>
                    <span className="text-lg font-bold text-foreground">{hospitalCredits.reduce((s, c) => s + c.balance, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                    <span className="text-sm text-muted-foreground">Total User Credits</span>
                    <span className="text-lg font-bold text-foreground">{requesterCredits.reduce((s: number, c: any) => s + (c.balance || 0), 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-warning/10">
                    <span className="text-sm text-warning">Pending Approvals</span>
                    <span className="text-lg font-bold text-warning">{totalPending}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {tab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">All Donors / Recipients / Users ({filteredDonors.length})</h2>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="text-left p-3 text-muted-foreground font-medium">Name</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Email</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Blood Type</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Location</th>
                      <th className="text-center p-3 text-muted-foreground font-medium">Credits</th>
                      <th className="text-center p-3 text-muted-foreground font-medium">Gift Credits</th>
                      <th className="text-center p-3 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonors.map(p => {
                      const donor = donors.find(d => d.user_id === p.id);
                      const credits = getRequesterCredit(p.id);
                      return (
                        <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/20">
                          <td className="p-3 font-medium text-foreground">{p.full_name || '—'}</td>
                          <td className="p-3 text-muted-foreground">{p.email}</td>
                          <td className="p-3">{donor ? <BloodTypeBadge type={donor.blood_type} size="sm" /> : '—'}</td>
                          <td className="p-3 text-muted-foreground">{donor?.zilla || donor?.city || '—'}</td>
                          <td className="p-3 text-center">
                            <span className="font-bold text-foreground bg-primary/10 px-2 py-1 rounded-lg">{credits}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1 justify-center">
                              <input
                                type="number"
                                min="1"
                                placeholder="0"
                                value={giftCredits[p.id] || ''}
                                onChange={e => setGiftCredits(prev => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))}
                                className="w-16 bg-secondary text-foreground px-2 py-1 rounded-lg text-sm text-center"
                              />
                              <button onClick={() => handleGiveCredits(p.id, 'donor')} className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20" title="Gift Credits">
                                <Gift className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <button onClick={() => handleDeleteUser(p.id, 'donor')} className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20" title="Delete Account">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredDonors.length === 0 && (
                      <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No users found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* HOSPITALS TAB */}
        {tab === 'hospitals' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">All Hospitals ({filteredHospitals.length})</h2>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="text-left p-3 text-muted-foreground font-medium">Name</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Address</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Contact</th>
                      <th className="text-center p-3 text-muted-foreground font-medium">Credits</th>
                      <th className="text-center p-3 text-muted-foreground font-medium">Gift Credits</th>
                      <th className="text-center p-3 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHospitals.map(h => {
                      const credits = getHospitalCredit(h.id);
                      return (
                        <tr key={h.id} className="border-b border-border/50 hover:bg-secondary/20">
                          <td className="p-3 font-medium text-foreground">{h.name}</td>
                          <td className="p-3 text-muted-foreground">{h.address}</td>
                          <td className="p-3 text-muted-foreground">{h.contact_number || '—'}</td>
                          <td className="p-3 text-center">
                            <span className="font-bold text-foreground bg-primary/10 px-2 py-1 rounded-lg">{credits}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1 justify-center">
                              <input
                                type="number"
                                min="1"
                                placeholder="0"
                                value={giftCredits[h.user_id] || ''}
                                onChange={e => setGiftCredits(prev => ({ ...prev, [h.user_id]: parseInt(e.target.value) || 0 }))}
                                className="w-16 bg-secondary text-foreground px-2 py-1 rounded-lg text-sm text-center"
                              />
                              <button onClick={() => handleGiveCredits(h.user_id, 'hospital', h.id)} className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20" title="Gift Credits">
                                <Gift className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <button onClick={() => handleDeleteUser(h.user_id, 'hospital')} className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20" title="Delete Account">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredHospitals.length === 0 && (
                      <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No hospitals found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENTS TAB */}
        {tab === 'payments' && (
          <div className="space-y-6">
            {/* Hospital Credit Purchases */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> Hospital Credit Purchases
                {pendingHospitalCR.length > 0 && <span className="bg-warning/10 text-warning text-xs font-bold px-2 py-0.5 rounded-full">{pendingHospitalCR.length} pending</span>}
              </h3>
              {creditRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No purchase requests yet.</p>
              ) : (
                <div className="space-y-2">
                  {creditRequests.map(cr => {
                    const hosp = hospitals.find(h => h.id === cr.hospital_id);
                    return (
                      <div key={cr.id} className={`flex items-center gap-3 p-3 rounded-xl border ${cr.status === 'pending' ? 'border-warning/30 bg-warning/5' : cr.status === 'approved' ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{hosp?.name || 'Hospital'}</p>
                          <p className="text-[11px] text-muted-foreground">{cr.payment_method} · {cr.payment_reference} · {new Date(cr.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cr.status === 'approved' ? 'bg-success/10 text-success' : cr.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                          {cr.status}
                        </span>
                        {cr.status === 'pending' && (
                          <div className="flex gap-1">
                            <button onClick={() => handleApproveCredit(cr)} className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20"><ShieldCheck className="w-4 h-4" /></button>
                            <button onClick={() => handleRejectCredit(cr)} className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"><X className="w-4 h-4" /></button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Individual Credit Purchases */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-info" /> Individual Credit Purchases
                {pendingRequesterCR.length > 0 && <span className="bg-warning/10 text-warning text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequesterCR.length} pending</span>}
              </h3>
              {requesterPurchaseRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No purchase requests yet.</p>
              ) : (
                <div className="space-y-2">
                  {requesterPurchaseRequests.map(pr => {
                    const prof = getProfile(pr.user_id);
                    return (
                      <div key={pr.id} className={`flex items-center gap-3 p-3 rounded-xl border ${pr.status === 'pending' ? 'border-warning/30 bg-warning/5' : pr.status === 'approved' ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{prof?.full_name || pr.user_id?.slice(0, 8)}</p>
                          <p className="text-[11px] text-muted-foreground">{pr.payment_method} · {pr.payment_reference} · {new Date(pr.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pr.status === 'approved' ? 'bg-success/10 text-success' : pr.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                          {pr.status}
                        </span>
                        {pr.status === 'pending' && (
                          <div className="flex gap-1">
                            <button onClick={() => handleApproveRequesterCredit(pr)} className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20"><ShieldCheck className="w-4 h-4" /></button>
                            <button onClick={() => handleRejectRequesterCredit(pr)} className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"><X className="w-4 h-4" /></button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Subscription Requests */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Coins className="w-4 h-4 text-primary" /> Hospital Subscriptions
                {pendingSubs.length > 0 && <span className="bg-warning/10 text-warning text-xs font-bold px-2 py-0.5 rounded-full">{pendingSubs.length} pending</span>}
              </h3>
              {subscriptionRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No subscription requests yet.</p>
              ) : (
                <div className="space-y-2">
                  {subscriptionRequests.map(sub => {
                    const hosp = hospitals.find(h => h.id === sub.hospital_id);
                    return (
                      <div key={sub.id} className={`flex items-center gap-3 p-3 rounded-xl border ${sub.status === 'pending' ? 'border-warning/30 bg-warning/5' : sub.status === 'active' ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{hosp?.name || 'Hospital'} — {sub.plan_name}</p>
                          <p className="text-[11px] text-muted-foreground">৳{sub.price_bdt}/mo · {sub.credits_per_month} credits · {sub.payment_method}: {sub.payment_reference}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sub.status === 'active' ? 'bg-success/10 text-success' : sub.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                          {sub.status}
                        </span>
                        {sub.status === 'pending' && (
                          <div className="flex gap-1">
                            <button onClick={() => handleApproveSubscription(sub)} className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20"><ShieldCheck className="w-4 h-4" /></button>
                            <button onClick={() => handleRejectSubscription(sub)} className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"><X className="w-4 h-4" /></button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
