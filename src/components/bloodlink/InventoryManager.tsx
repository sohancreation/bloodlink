import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Save, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BloodTypeBadge } from './BloodTypeBadge';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

interface InventoryManagerProps {
  inventory: any[];
  hospitalId: string;
  isDemo: boolean;
  onUpdated: () => void;
}

export const InventoryManager = ({ inventory, hospitalId, isDemo, onUpdated }: InventoryManagerProps) => {
  const { t } = useLanguage();
  const [units, setUnits] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initial: Record<string, number> = {};
    BLOOD_TYPES.forEach(bt => {
      const item = inventory.find(i => i.blood_type === bt);
      initial[bt] = item?.units_available ?? 0;
    });
    setUnits(initial);
    setChanged(new Set());
  }, [inventory]);

  const updateUnits = (bt: string, delta: number) => {
    setUnits(prev => ({ ...prev, [bt]: Math.max(0, (prev[bt] || 0) + delta) }));
    setChanged(prev => new Set(prev).add(bt));
  };

  const setUnitsDirect = (bt: string, val: number) => {
    setUnits(prev => ({ ...prev, [bt]: Math.max(0, val) }));
    setChanged(prev => new Set(prev).add(bt));
  };

  const handleSave = async () => {
    if (changed.size === 0) return;
    setSaving(true);

    if (isDemo) {
      setTimeout(() => {
        toast.success(t('Inventory updated') + ' ✅');
        setSaving(false);
        setChanged(new Set());
      }, 500);
      return;
    }

    try {
      for (const bt of changed) {
        const existing = inventory.find(i => i.blood_type === bt);
        if (existing) {
          await supabase.from('blood_inventory').update({ units_available: units[bt] }).eq('id', existing.id);
        } else {
          await supabase.from('blood_inventory').insert({
            hospital_id: hospitalId,
            blood_type: bt as any,
            units_available: units[bt],
          });
        }
      }
      toast.success(t('Inventory updated') + ' ✅');
      setChanged(new Set());
      onUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Error saving inventory');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-surface overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('Blood Inventory Management')}</h2>
        <button
          onClick={handleSave}
          disabled={changed.size === 0 || saving}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-primary/90 transition-all active:scale-[0.98]"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t('Save')}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5">
        {BLOOD_TYPES.map(bt => {
          const val = units[bt] || 0;
          const isLow = val > 0 && val <= 2;
          const isEmpty = val === 0;
          const isChanged = changed.has(bt);

          return (
            <motion.div
              key={bt}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border p-4 text-center transition-colors ${isChanged ? 'border-primary/40 bg-primary/5' : 'border-border bg-secondary/30'}`}
            >
              <div className="flex justify-center mb-2">
                <BloodTypeBadge type={bt} />
              </div>
              <p className="text-lg font-extrabold text-foreground mb-1">{bt}</p>

              <div className="flex items-center justify-center gap-2 mt-3">
                <button
                  onClick={() => updateUnits(bt, -1)}
                  disabled={val <= 0}
                  className="w-8 h-8 rounded-lg bg-secondary hover:bg-destructive/10 hover:text-destructive flex items-center justify-center text-foreground transition-colors disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <input
                  type="number"
                  min={0}
                  value={val}
                  onChange={e => setUnitsDirect(bt, parseInt(e.target.value) || 0)}
                  className={`w-14 text-center text-xl font-bold bg-transparent border-b-2 focus:outline-none ${isEmpty ? 'text-primary border-primary/30' : isLow ? 'text-warning border-warning/30' : 'text-foreground border-border'}`}
                />

                <button
                  onClick={() => updateUnits(bt, 1)}
                  className="w-8 h-8 rounded-lg bg-secondary hover:bg-success/10 hover:text-success flex items-center justify-center text-foreground transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <p className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${isEmpty ? 'text-primary' : isLow ? 'text-warning' : 'text-success'}`}>
                {isEmpty ? t('Out of Stock') : isLow ? t('Low') : t('OK')}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
