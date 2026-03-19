import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'bn' | 'en';

const translations = {
  // Landing
  'Emergency Blood Response Network': { bn: 'জরুরি রক্ত সরবরাহ নেটওয়ার্ক' },
  'Minutes save lives.': { bn: 'মিনিটে জীবন বাঁচে।' },
  'We manage the seconds.': { bn: 'আমরা সেকেন্ড সামলাই।' },
  'AI-powered platform connecting hospitals, blood banks, and donors in real-time. Every second counts in a blood emergency.': { bn: 'এআই-চালিত প্ল্যাটফর্ম যা হাসপাতাল, ব্লাড ব্যাংক এবং রক্তদাতাদের রিয়েল-টাইমে সংযুক্ত করে। রক্তের জরুরি অবস্থায় প্রতিটি সেকেন্ড গুরুত্বপূর্ণ।' },
  'Hospital Dashboard': { bn: 'হাসপাতাল ড্যাশবোর্ড' },
  "I'm a Donor / Recipient": { bn: 'আমি রক্তদাতা/গ্রহীতা' },
  'Features': { bn: 'বৈশিষ্ট্য' },
  'Impact': { bn: 'প্রভাব' },
  'How It Works': { bn: 'কিভাবে কাজ করে' },
  'Sign In': { bn: 'সাইন ইন' },
  'Get Started': { bn: 'শুরু করুন' },
  'Active Donors': { bn: 'সক্রিয় রক্তদাতা' },
  'Hospitals Connected': { bn: 'সংযুক্ত হাসপাতাল' },
  'Avg Response Time': { bn: 'গড় প্রতিক্রিয়া সময়' },
  'Lives Impacted': { bn: 'প্রভাবিত জীবন' },
  'Built for emergencies': { bn: 'জরুরি অবস্থার জন্য তৈরি' },
  'Every feature designed to reduce response time': { bn: 'প্রতিক্রিয়া সময় কমাতে প্রতিটি বৈশিষ্ট্য ডিজাইন করা হয়েছে' },
  'AI Matching': { bn: 'এআই ম্যাচিং' },
  'Instantly ranks donors by compatibility, proximity, and availability using a weighted algorithm.': { bn: 'ওয়েটেড অ্যালগরিদম ব্যবহার করে সামঞ্জস্যতা, নৈকট্য এবং প্রাপ্যতার ভিত্তিতে রক্তদাতাদের তাৎক্ষণিক র‍্যাংকিং।' },
  'Live Map Tracking': { bn: 'লাইভ ম্যাপ ট্র্যাকিং' },
  'Visualize hospitals, donors, and active requests on an interactive real-time map.': { bn: 'ইন্টারেক্টিভ রিয়েল-টাইম ম্যাপে হাসপাতাল, রক্তদাতা এবং সক্রিয় অনুরোধ দেখুন।' },
  'Instant Alerts': { bn: 'তাৎক্ষণিক সতর্কতা' },
  'Compatible donors are notified immediately when a hospital creates an emergency request.': { bn: 'হাসপাতাল জরুরি অনুরোধ তৈরি করলে সামঞ্জস্যপূর্ণ রক্তদাতাদের তাৎক্ষণিক বিজ্ঞপ্তি দেওয়া হয়।' },
  'How it works': { bn: 'কিভাবে কাজ করে' },
  'Request Blood': { bn: 'রক্তের অনুরোধ' },
  'Hospital creates an emergency blood request with blood type, units, and urgency level.': { bn: 'হাসপাতাল রক্তের গ্রুপ, ইউনিট এবং জরুরি স্তর সহ জরুরি রক্তের অনুরোধ তৈরি করে।' },
  'AI Matches Donors': { bn: 'এআই রক্তদাতা ম্যাচ করে' },
  'Our algorithm instantly finds the best donors based on type compatibility, distance, and eligibility.': { bn: 'আমাদের অ্যালগরিদম তাৎক্ষণিকভাবে সামঞ্জস্যতা, দূরত্ব এবং যোগ্যতার ভিত্তিতে সেরা রক্তদাতা খুঁজে বের করে।' },
  'Donor Responds': { bn: 'রক্তদাতা সাড়া দেয়' },
  'Matched donors receive instant alerts and can accept the mission in one tap.': { bn: 'ম্যাচড রক্তদাতারা তাৎক্ষণিক সতর্কতা পায় এবং এক ট্যাপে মিশন গ্রহণ করতে পারে।' },
  'Emergency Blood Response Network · University Case Competition Prototype': { bn: 'জরুরি রক্ত সরবরাহ নেটওয়ার্ক · বিশ্ববিদ্যালয় কেস প্রতিযোগিতা প্রোটোটাইপ' },

  // Login
  'Welcome back': { bn: 'আবার স্বাগতম' },
  'Create account': { bn: 'অ্যাকাউন্ট তৈরি করুন' },
  'System Ready. Sign in to continue.': { bn: 'সিস্টেম প্রস্তুত। চালিয়ে যেতে সাইন ইন করুন।' },
  'Join the emergency blood response network.': { bn: 'জরুরি রক্ত সরবরাহ নেটওয়ার্কে যোগ দিন।' },
  'Every drop counts': { bn: 'প্রতিটি ফোঁটা গুরুত্বপূর্ণ' },
  'Join the network that connects donors to hospitals in minutes, not hours.': { bn: 'মিনিটের মধ্যে রক্তদাতাদের হাসপাতালে সংযুক্ত করে এমন নেটওয়ার্কে যোগ দিন।' },
  'donor / recipient': { bn: 'রক্তদাতা/গ্রহীতা' },
  'hospital': { bn: 'হাসপাতাল' },
  'admin': { bn: 'অ্যাডমিন' },
  'Full Name': { bn: 'পুরো নাম' },
  'Phone Number': { bn: 'ফোন নম্বর' },
  'City': { bn: 'শহর' },
  'Blood Type': { bn: 'রক্তের গ্রুপ' },
  'Hospital Name': { bn: 'হাসপাতালের নাম' },
  'Address': { bn: 'ঠিকানা' },
  'Contact Number': { bn: 'যোগাযোগ নম্বর' },
  'Email': { bn: 'ইমেইল' },
  'Password': { bn: 'পাসওয়ার্ড' },
  'Sign in as:': { bn: 'হিসেবে সাইন ইন:' },
  'Create Account': { bn: 'অ্যাকাউন্ট তৈরি করুন' },
  "Don't have an account?": { bn: 'অ্যাকাউন্ট নেই?' },
  'Already have an account?': { bn: 'ইতিমধ্যে অ্যাকাউন্ট আছে?' },
  'Sign Up': { bn: 'সাইন আপ' },

  // Donor Dashboard
  'Donor Dashboard': { bn: 'রক্তদাতা ড্যাশবোর্ড' },
  'active requests nearby.': { bn: 'টি সক্রিয় অনুরোধ কাছাকাছি।' },
  'System Ready.': { bn: 'সিস্টেম প্রস্তুত।' },
  'Total Donations': { bn: 'মোট রক্তদান' },
  'Active Requests': { bn: 'সক্রিয় অনুরোধ' },
  'Days Since Donation': { bn: 'রক্তদানের পর দিন' },
  'Nearby Hospitals': { bn: 'কাছাকাছি হাসপাতাল' },
  'requests': { bn: 'অনুরোধ' },
  'history': { bn: 'ইতিহাস' },
  'map': { bn: 'ম্যাপ' },
  'Requests': { bn: 'অনুরোধ' },
  'Accept Mission': { bn: 'মিশন গ্রহণ করুন' },
  'Details': { bn: 'বিস্তারিত' },
  'Required': { bn: 'প্রয়োজন' },
  'units': { bn: 'ইউনিট' },

  // Hospital Dashboard
  'Hospital Control Room': { bn: 'হাসপাতাল নিয়ন্ত্রণ কক্ষ' },
  'active requests': { bn: 'সক্রিয় অনুরোধ' },
  'Run Demo Simulation': { bn: 'ডেমো সিমুলেশন চালান' },
  'Simulating...': { bn: 'সিমুলেট হচ্ছে...' },
  'Fulfilled Today': { bn: 'আজ পূরণ হয়েছে' },
  'Blood Units': { bn: 'রক্তের ইউনিট' },
  'Donors Nearby': { bn: 'কাছাকাছি রক্তদাতা' },
  'overview': { bn: 'সংক্ষিপ্ত বিবরণ' },
  'inventory': { bn: 'মজুদ' },
  '+ New Request': { bn: '+ নতুন অনুরোধ' },
  'Blood Type Required': { bn: 'রক্তের গ্রুপ প্রয়োজন' },
  'Units Needed': { bn: 'ইউনিট প্রয়োজন' },
  'Urgency Level': { bn: 'জরুরি স্তর' },
  'Patient Condition': { bn: 'রোগীর অবস্থা' },
  "Describe the patient's condition...": { bn: 'রোগীর অবস্থা বর্ণনা করুন...' },
  'Broadcast Emergency': { bn: 'জরুরি সম্প্রচার' },
  'New Emergency Request': { bn: 'নতুন জরুরি অনুরোধ' },
  'Live Matches': { bn: 'লাইভ ম্যাচ' },
  'Select a request to see donor matches': { bn: 'ডোনার ম্যাচ দেখতে একটি অনুরোধ নির্বাচন করুন' },
  'Expiry': { bn: 'মেয়াদ' },
  'Units': { bn: 'ইউনিট' },
  'Status': { bn: 'অবস্থা' },
  'Out of Stock': { bn: 'স্টক নেই' },
  'Low': { bn: 'কম' },
  'Expiring Soon': { bn: 'শীঘ্রই মেয়াদ শেষ' },
  'OK': { bn: 'ঠিক আছে' },

  // Admin Dashboard
  'Admin Panel': { bn: 'অ্যাডমিন প্যানেল' },
  'BloodLink · System Overview': { bn: 'ব্লাডলিংক · সিস্টেম ওভারভিউ' },
  'Total Donors': { bn: 'মোট রক্তদাতা' },
  'Hospitals': { bn: 'হাসপাতাল' },
  'Lives Impacted_short': { bn: 'প্রভাবিত জীবন' },
  'Avg Response': { bn: 'গড় প্রতিক্রিয়া' },
  'Donor Distribution': { bn: 'রক্তদাতা বিতরণ' },
  'Recent Requests': { bn: 'সাম্প্রতিক অনুরোধ' },
  'Registered Hospitals': { bn: 'নিবন্ধিত হাসপাতাল' },
  'Recent Donors': { bn: 'সাম্প্রতিক রক্তদাতা' },

  // Sidebar
  'Home': { bn: 'হোম' },
  'Donor / Recipient': { bn: 'রক্তদাতা/গ্রহীতা' },
  'Hospital': { bn: 'হাসপাতাল' },
  'Admin': { bn: 'অ্যাডমিন' },

  // Common
  '+2 today': { bn: '+২ আজ' },
  'completed': { bn: 'সম্পন্ন' },
  'pending': { bn: 'মুলতুবি' },

  // ETA
  'Emergency Blood Response Timer': { bn: 'জরুরি রক্ত সরবরাহ টাইমার' },
  'Donor Distance': { bn: 'ডোনার দূরত্ব' },
  'Preparation Time': { bn: 'প্রস্তুতির সময়' },
  'Travel Time': { bn: 'যাতায়াত সময়' },
  'minutes': { bn: 'মিনিট' },
  'Estimated Response Time': { bn: 'আনুমানিক সাড়া দেওয়ার সময়' },
  'Distance': { bn: 'দূরত্ব' },
  'Prep': { bn: 'প্রস্তুতি' },
  'Travel': { bn: 'যাতায়াত' },
  'Declined': { bn: 'প্রত্যাখ্যাত' },
  'Decline': { bn: 'প্রত্যাখ্যান' },

  // Donor Search & Services
  'Search Blood': { bn: 'রক্ত খুঁজুন' },
  'Nearby Services': { bn: 'কাছাকাছি সেবা' },
  'AI Search': { bn: 'AI সার্চ' },
  '+ Request': { bn: '+ অনুরোধ' },
  'Zilla': { bn: 'জেলা' },
  'Upozilla': { bn: 'উপজেলা' },
  'e.g. Rajshahi': { bn: 'যেমন: রাজশাহী' },
  'e.g. Paba': { bn: 'যেমন: পবা' },
  'Additional Details': { bn: 'অতিরিক্ত তথ্য' },
  'Any extra info...': { bn: 'অতিরিক্ত তথ্য...' },
  'Search': { bn: 'খুঁজুন' },
  'Searching with AI...': { bn: 'AI দিয়ে খুঁজছে...' },
  'Tips': { bn: 'পরামর্শ' },
  'Service Type': { bn: 'সেবার ধরন' },
  'All': { bn: 'সব' },
  'Pharmacy': { bn: 'ফার্মেসি' },
  'Doctor': { bn: 'ডাক্তার' },
  'Ambulance': { bn: 'অ্যাম্বুলেন্স' },
  'Blood Bank': { bn: 'ব্লাড ব্যাংক' },
  'Create Blood Request': { bn: 'রক্তের অনুরোধ তৈরি করুন' },
  'Which hospital needs blood?': { bn: 'কোন হাসপাতালে রক্ত দরকার?' },
  'Request Created': { bn: 'অনুরোধ তৈরি হয়েছে' },
  'Please enter hospital name': { bn: 'হাসপাতালের নাম লিখুন' },
  'Your Name': { bn: 'আপনার নাম' },
  'Enter your name': { bn: 'আপনার নাম লিখুন' },
  'Mobile Number': { bn: 'মোবাইল নম্বর' },
  'Please enter your name': { bn: 'আপনার নাম লিখুন' },
  'Please enter mobile number': { bn: 'মোবাইল নম্বর লিখুন' },
  'Please select Zilla and Upozilla': { bn: 'জেলা ও উপজেলা নির্বাচন করুন' },
  'Matching donors will be notified.': { bn: 'ম্যাচিং রক্তদাতাদের জানানো হবে।' },
  'Same blood group donors in your upozilla will be notified automatically.': { bn: 'আপনার উপজেলার একই রক্তের গ্রুপের রক্তদাতাদের স্বয়ংক্রিয়ভাবে জানানো হবে।' },
  'Notifications': { bn: 'বিজ্ঞপ্তি' },
  'Mark all read': { bn: 'সব পড়া হয়েছে' },
  'No notifications yet': { bn: 'এখনো কোনো বিজ্ঞপ্তি নেই' },
  'Blood Needed': { bn: 'রক্ত দরকার' },
  'Select Zilla': { bn: 'জেলা নির্বাচন করুন' },
  'Select Upozilla': { bn: 'উপজেলা নির্বাচন করুন' },
  'My Profile': { bn: 'আমার প্রোফাইল' },
  'Save Changes': { bn: 'পরিবর্তন সংরক্ষণ করুন' },
  'Profile updated successfully!': { bn: 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' },
  'Available': { bn: 'উপলব্ধ' },
  'Unavailable': { bn: 'অনুপলব্ধ' },
  'Available for donation': { bn: 'রক্তদানের জন্য উপলব্ধ' },
  'Eligibility Status': { bn: 'যোগ্যতার অবস্থা' },
  'You are eligible to donate!': { bn: 'আপনি রক্তদানের যোগ্য!' },
  'Wait': { bn: 'অপেক্ষা করুন' },
  'more days': { bn: 'আরো দিন' },
  'No donation recorded yet': { bn: 'এখনো কোনো রক্তদান রেকর্ড হয়নি' },
  'Last Donation': { bn: 'শেষ রক্তদান' },
  'No donation history yet.': { bn: 'এখনো কোনো রক্তদানের ইতিহাস নেই।' },
  'No hospitals registered yet.': { bn: 'এখনো কোনো হাসপাতাল নিবন্ধিত হয়নি।' },
  'সক্রিয় মিশন': { bn: 'সক্রিয় মিশন' },
  'মিশন গৃহীত': { bn: 'মিশন গৃহীত' },
  'প্রত্যাখ্যান করা হয়েছে': { bn: 'প্রত্যাখ্যান করা হয়েছে' },
  'অগ্রগতি': { bn: 'অগ্রগতি' },
  'মিশন সম্পন্ন!': { bn: 'মিশন সম্পন্ন!' },
  'ধন্যবাদ, আপনি একজন জীবন রক্ষাকারী! 🎉': { bn: 'ধন্যবাদ, আপনি একজন জীবন রক্ষাকারী! 🎉' },
  'বিস্তারিত তথ্য': { bn: 'বিস্তারিত তথ্য' },
  'যোগাযোগ তথ্য': { bn: 'যোগাযোগ তথ্য' },
  'যোগাযোগ তথ্য পাওয়া যায়নি': { bn: 'যোগাযোগ তথ্য পাওয়া যায়নি' },
  'রক্তদান ট্র্যাকার': { bn: 'রক্তদান ট্র্যাকার' },
  'আপনার রক্তদানের ইতিহাস ও যোগ্যতা ট্র্যাক করুন': { bn: 'আপনার রক্তদানের ইতিহাস ও যোগ্যতা ট্র্যাক করুন' },
  'আপনি রক্তদানের যোগ্য! ✅': { bn: 'আপনি রক্তদানের যোগ্য! ✅' },
  'এখনো অপেক্ষা করুন ⏳': { bn: 'এখনো অপেক্ষা করুন ⏳' },
  'শেষ রক্তদানের': { bn: 'শেষ রক্তদানের' },
  'দিন আগে': { bn: 'দিন আগে' },
  'কোনো রক্তদান রেকর্ড নেই': { bn: 'কোনো রক্তদান রেকর্ড নেই' },
  'শেষ রক্তদান': { bn: 'শেষ রক্তদান' },
  'যোগ্য!': { bn: 'যোগ্য!' },
  'দিন বাকি': { bn: 'দিন বাকি' },
  'মোট রক্তদান': { bn: 'মোট রক্তদান' },
  'দিন হয়েছে': { bn: 'দিন হয়েছে' },
  'আজ রক্তদান করেছি ✓': { bn: 'আজ রক্তদান করেছি ✓' },
  'স্বাস্থ্য তথ্য': { bn: 'স্বাস্থ্য তথ্য' },
  'আপনার স্বাস্থ্য সমস্যা নির্বাচন করুন': { bn: 'আপনার স্বাস্থ্য সমস্যা নির্বাচন করুন' },
  'AI বিশ্লেষণ করছে...': { bn: 'AI বিশ্লেষণ করছে...' },
  'AI পরামর্শ নিন': { bn: 'AI পরামর্শ নিন' },
  'AI স্বাস্থ্য পরামর্শ': { bn: 'AI স্বাস্থ্য পরামর্শ' },
  'এটি AI-জনিত পরামর্শ। চূড়ান্ত সিদ্ধান্তের জন্য ডাক্তারের পরামর্শ নিন।': { bn: 'এটি AI-জনিত পরামর্শ। চূড়ান্ত সিদ্ধান্তের জন্য ডাক্তারের পরামর্শ নিন।' },
  'রক্তদানের ইতিহাস': { bn: 'রক্তদানের ইতিহাস' },
  'এখনো কোনো রক্তদান রেকর্ড হয়নি': { bn: 'এখনো কোনো রক্তদান রেকর্ড হয়নি' },
  'উপরের বাটনে ক্লিক করে আপনার রক্তদান রেকর্ড করুন': { bn: 'উপরের বাটনে ক্লিক করে আপনার রক্তদান রেকর্ড করুন' },
} as const;

type TranslationKey = keyof typeof translations;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'bn',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('bn');

  const t = (key: string): string => {
    if (language === 'en') return key;
    const entry = translations[key as TranslationKey];
    return entry?.bn || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
