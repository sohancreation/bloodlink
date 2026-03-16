import { Globe, Moon, Sun } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export const SettingsBar = () => {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-bold hover:bg-accent transition-colors"
      >
        <Globe className="w-3.5 h-3.5" />
        {language === 'bn' ? 'EN' : 'বাং'}
      </button>
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-foreground hover:bg-accent transition-colors"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </div>
  );
};
