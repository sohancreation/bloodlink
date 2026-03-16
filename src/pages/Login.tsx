import { useState } from 'react';
import bloodlinkLogo from '@/assets/bloodlink-logo.png';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, User, Phone, MapPin, Building2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SettingsBar } from '@/components/bloodlink/SettingsBar';
import { toast } from 'sonner';
import { LocationSelector } from '@/components/bloodlink/LocationSelector';

type UserRole = 'donor' | 'hospital' | 'admin';
type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ADMIN_EMAIL = 'sohan420rahman@gmail.com';

const Login = () => {
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('donor');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [zilla, setZilla] = useState('');
  const [upozilla, setUpozilla] = useState('');
  const [bloodType, setBloodType] = useState<BloodType>('O+');
  const [hospitalName, setHospitalName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (isLogin) {
        const userRole = await signIn(normalizedEmail, password);
        toast.success(t('Welcome back') + '!');
        if (userRole === 'donor') navigate('/donor');
        else if (userRole === 'hospital') navigate('/hospital');
        else navigate('/admin');
      } else {
        const metadata: Record<string, string> = {
          full_name: fullName,
          role,
        };
        if (role === 'donor') {
          metadata.blood_type = bloodType;
          metadata.city = zilla + (upozilla ? `, ${upozilla}` : '');
          metadata.phone = phone;
        } else if (role === 'hospital') {
          metadata.hospital_name = hospitalName;
          metadata.address = address;
          metadata.contact_number = contactNumber;
        }
        await signUp(normalizedEmail, password, metadata);
        toast.success(t('Create Account') + ' ✅');
        if (role === 'donor') navigate('/donor');
        else if (role === 'hospital') navigate('/hospital');
        else navigate('/admin');
      }
    } catch (err: any) {
      const isAdminBootstrapAttempt = isLogin && normalizedEmail === ADMIN_EMAIL;
      const isInvalidCredentials = (err?.message || '').toLowerCase().includes('invalid login');

      if (isAdminBootstrapAttempt && isInvalidCredentials) {
        try {
          await signUp(normalizedEmail, password, { full_name: 'Admin', role: 'admin' });
        } catch (signupErr: any) {
          const msg = (signupErr?.message || '').toLowerCase();
          if (!msg.includes('already') && !msg.includes('registered')) {
            toast.error(signupErr.message || 'Failed to create admin account');
            return;
          }
        }

        try {
          const adminRole = await signIn(normalizedEmail, password);
          if (adminRole === 'admin') {
            toast.success('Admin account ready. Logged in!');
            navigate('/admin');
            return;
          }
          toast.error('Admin role not assigned yet.');
          return;
        } catch (adminSignInErr: any) {
          toast.error(adminSignInErr.message || 'Invalid admin credentials');
          return;
        }
      }

      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-primary-foreground" style={{
              width: Math.random() * 100 + 20,
              height: Math.random() * 100 + 20,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3 + 0.05,
            }} />
          ))}
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-primary-foreground fill-current" />
          </div>
          <h2 className="text-display text-4xl text-primary-foreground mb-4">{t('Every drop counts')}</h2>
          <p className="text-primary-foreground/70 text-lg">{t('Join the network that connects donors to hospitals in minutes, not hours.')}</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <img src={bloodlinkLogo} alt="BloodLink" className="w-8 h-8 object-contain" />
              </div>
              <span className="font-bold text-lg text-foreground">BloodLink</span>
            </div>
            <SettingsBar />
          </div>

          <h1 className="text-display text-3xl text-foreground mb-2">
            {isLogin ? t('Welcome back') : t('Create account')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isLogin ? t('System Ready. Sign in to continue.') : t('Join the emergency blood response network.')}
          </p>

          {!isLogin && (
            <div className="flex gap-2 mb-6">
              {([{ key: 'donor', label: 'Donor / গ্রহীতা' }, { key: 'hospital', label: t('hospital') }] as { key: UserRole; label: string }[]).map(r => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    role === r.key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && role === 'donor' && (
              <>
                <InputField icon={User} placeholder={t('Full Name')} type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
                <InputField icon={Phone} placeholder={t('Phone Number')} type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                <LocationSelector zilla={zilla} upozilla={upozilla} onZillaChange={setZilla} onUpozillaChange={setUpozilla} />
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('Blood Type')}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {BLOOD_TYPES.map(bt => (
                      <button
                        key={bt}
                        type="button"
                        onClick={() => setBloodType(bt)}
                        className={`py-2 rounded-lg text-sm font-bold transition-colors ${
                          bloodType === bt
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground'
                        }`}
                      >
                        {bt}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            {!isLogin && role === 'hospital' && (
              <>
                <InputField icon={Building2} placeholder={t('Hospital Name')} type="text" value={hospitalName} onChange={e => setHospitalName(e.target.value)} required />
                <InputField icon={MapPin} placeholder={t('Address')} type="text" value={address} onChange={e => setAddress(e.target.value)} />
                <InputField icon={Phone} placeholder={t('Contact Number')} type="tel" value={contactNumber} onChange={e => setContactNumber(e.target.value)} />
              </>
            )}

            <InputField icon={Mail} placeholder={t('Email')} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <PasswordField
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t('Password')}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(prev => !prev)}
              required
              minLength={6}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-base hover:bg-primary/90 transition-colors active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? '...' : isLogin ? t('Sign In') : t('Create Account')}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            {isLogin ? t("Don't have an account?") : t('Already have an account?')}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold hover:underline">
              {isLogin ? t('Sign Up') : t('Sign In')}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

const InputField = ({ icon: Icon, ...props }: { icon: any } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <input
      {...props}
      className="w-full bg-secondary text-foreground pl-10 pr-4 py-3 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
    />
  </div>
);

const PasswordField = ({
  value,
  onChange,
  placeholder,
  showPassword,
  onTogglePassword,
  ...props
}: {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  showPassword: boolean;
  onTogglePassword: () => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'placeholder'>) => (
  <div className="relative">
    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <input
      {...props}
      type={showPassword ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-secondary text-foreground pl-10 pr-10 py-3 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
    />
    <button
      type="button"
      onClick={onTogglePassword}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  </div>
);

export default Login;
