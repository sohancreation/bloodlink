import { useLanguage } from '@/contexts/LanguageContext';
import { ZILLA_LIST, getUpozillas } from '@/data/bd-locations';

interface LocationSelectorProps {
  zilla: string;
  upozilla: string;
  onZillaChange: (zilla: string) => void;
  onUpozillaChange: (upozilla: string) => void;
  className?: string;
}

export const LocationSelector = ({ zilla, upozilla, onZillaChange, onUpozillaChange, className = '' }: LocationSelectorProps) => {
  const { t } = useLanguage();
  const upozillas = getUpozillas(zilla);

  const handleZillaChange = (val: string) => {
    onZillaChange(val);
    onUpozillaChange(''); // reset upozilla on zilla change
  };

  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      <div>
        <label className="text-xs font-medium text-muted-foreground">{t('Zilla')}</label>
        <select
          value={zilla}
          onChange={e => handleZillaChange(e.target.value)}
          className="w-full bg-secondary text-foreground px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t('Select Zilla')}</option>
          {ZILLA_LIST.map(z => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">{t('Upozilla')}</label>
        <select
          value={upozilla}
          onChange={e => onUpozillaChange(e.target.value)}
          disabled={!zilla}
          className="w-full bg-secondary text-foreground px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          <option value="">{t('Select Upozilla')}</option>
          {upozillas.map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
