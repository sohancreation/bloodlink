import { motion } from 'framer-motion';
import bloodlinkLogo from '@/assets/bloodlink-logo.png';
import { Link } from 'react-router-dom';
import { Heart, Zap, MapPin, Clock, ArrowRight, Users, Building2, Activity } from 'lucide-react';
import { mockStats } from '@/data/mock-data';
import { useLanguage } from '@/contexts/LanguageContext';
import { SettingsBar } from '@/components/bloodlink/SettingsBar';

const Landing = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <img src={bloodlinkLogo} alt="BloodLink" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-bold text-lg text-foreground">BloodLink</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">{t('Features')}</a>
            <a href="#stats" className="hover:text-foreground transition-colors">{t('Impact')}</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">{t('Pricing')}</a>
            <a href="#how" className="hover:text-foreground transition-colors">{t('How It Works')}</a>
          </nav>
          <div className="flex items-center gap-3">
            <SettingsBar />
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t('Sign In')}
            </Link>
            <Link to="/login" className="bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors">
              {t('Get Started')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {t('Emergency Blood Response Network')}
            </div>
            <h1 className="text-display text-5xl md:text-7xl lg:text-8xl text-foreground mb-6">
              Minutes save lives.<br />
              <span className="text-primary">We manage the seconds.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              {t('AI-powered platform connecting hospitals, blood banks, and donors in real-time. Every second counts in a blood emergency.')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/hospital"
                className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold text-lg shadow-surface-lg hover:shadow-surface-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {t('Hospital Dashboard')} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/donor"
                className="w-full sm:w-auto bg-card text-foreground px-8 py-4 rounded-2xl font-bold text-lg shadow-surface border border-border hover:shadow-surface-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {t("I'm a Donor / Recipient")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, value: mockStats.totalDonors.toLocaleString(), label: t('Active Donors') },
              { icon: Building2, value: mockStats.totalHospitals.toString(), label: t('Hospitals Connected') },
              { icon: Activity, value: mockStats.avgResponseTime, label: t('Avg Response Time') },
              { icon: Heart, value: `${(mockStats.livesImpacted / 1000).toFixed(1)}K+`, label: t('Lives Impacted') },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-surface text-center"
              >
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-3" />
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-display text-3xl md:text-4xl text-foreground mb-3">{t('Built for emergencies')}</h2>
            <p className="text-muted-foreground">{t('Every feature designed to reduce response time')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: t('AI Matching'), desc: t('Instantly ranks donors by compatibility, proximity, and availability using a weighted algorithm.') },
              { icon: MapPin, title: t('Live Map Tracking'), desc: t('Visualize hospitals, donors, and active requests on an interactive real-time map.') },
              { icon: Clock, title: t('Instant Alerts'), desc: t('Compatible donors are notified immediately when a hospital creates an emergency request.') },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-card rounded-2xl p-6 shadow-surface"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-card">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-display text-3xl md:text-4xl text-foreground mb-3">{t('Simple, transparent pricing')}</h2>
            <p className="text-muted-foreground">{t('Donors are always free. Hospitals pay per fulfilled request.')}</p>
          </div>

          {/* Hospital Monthly Subscriptions */}
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 text-center">{t('For Hospitals — Monthly Plans')}</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Basic', credits: 30, price: 499, per: '৳16.6', popular: false },
              { name: 'Standard', credits: 75, price: 999, per: '৳13.3', popular: true },
              { name: 'Premium', credits: 200, price: 1999, per: '৳10.0', popular: false },
            ].map((pkg, i) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`rounded-2xl p-6 text-center relative ${pkg.popular ? 'bg-primary text-primary-foreground shadow-surface-lg scale-105' : 'bg-background shadow-surface border border-border'}`}
              >
                {pkg.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">{t('Most Popular')}</span>}
                <p className={`text-lg font-bold ${pkg.popular ? '' : 'text-foreground'}`}>{pkg.name}</p>
                <p className={`text-4xl font-black mt-2 ${pkg.popular ? '' : 'text-foreground'}`}>৳{pkg.price}<span className="text-base font-normal">/mo</span></p>
                <p className={`text-sm mt-1 ${pkg.popular ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{pkg.credits} {t('credits')}/month</p>
                <p className={`text-xs mt-1 ${pkg.popular ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{pkg.per}/{t('credit')}</p>
                <Link to={`/payment?plan=${pkg.name}`} className={`mt-4 block w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${pkg.popular ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                  {t('Subscribe Now')}
                </Link>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">{t('1 credit = 1 fulfilled blood request. Hospitals get 10 free credits on signup. Send money to 01706028192 via bKash/Nagad.')}</p>

          {/* Individual Pricing */}
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 mt-12 text-center">{t('For Individual Requesters (Grohita)')}</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Basic', credits: 5, price: 29, per: '৳5.8', popular: false },
              { name: 'Popular', credits: 15, price: 69, per: '৳4.6', popular: true },
              { name: 'Super Saver', credits: 35, price: 129, per: '৳3.7', popular: false },
            ].map((pkg, i) => (
              <motion.div
                key={`req-${pkg.name}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`rounded-2xl p-6 text-center relative ${pkg.popular ? 'bg-primary text-primary-foreground shadow-surface-lg scale-105' : 'bg-background shadow-surface border border-border'}`}
              >
                {pkg.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">{t('Most Popular')}</span>}
                <p className={`text-lg font-bold ${pkg.popular ? '' : 'text-foreground'}`}>{pkg.name}</p>
                <p className={`text-4xl font-black mt-2 ${pkg.popular ? '' : 'text-foreground'}`}>৳{pkg.price}</p>
                <p className={`text-sm mt-1 ${pkg.popular ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{pkg.credits} {t('requests')}</p>
                <p className={`text-xs mt-1 ${pkg.popular ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{pkg.per}/{t('request')}</p>
                <Link to="/login" className={`mt-4 block w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${pkg.popular ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                  {t('Get Started')}
                </Link>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">🎁 {t('১০টি রক্তের অনুরোধ বিনামূল্যে! সাইনআপেই পাবেন।')}</p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-display text-3xl md:text-4xl text-foreground mb-3">{t('How it works')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '০১', title: t('Request Blood'), desc: t('Hospital creates an emergency blood request with blood type, units, and urgency level.') },
              { step: '০২', title: t('AI Matches Donors'), desc: t('Our algorithm instantly finds the best donors based on type compatibility, distance, and eligibility.') },
              { step: '০৩', title: t('Donor Responds'), desc: t('Matched donors receive instant alerts and can accept the mission in one tap.') },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <span className="text-5xl font-bold text-primary/20">{s.step}</span>
                <h3 className="text-lg font-bold text-foreground mt-2 mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={bloodlinkLogo} alt="BloodLink" className="w-6 h-6 object-contain" />
            <span className="text-sm font-bold text-foreground">BloodLink</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('Emergency Blood Response Network · University Case Competition Prototype')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
