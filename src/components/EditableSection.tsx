"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Save, Loader2, CheckCircle2 } from "lucide-react";
import { updateAssetFields } from "@/app/actions/assets";

export type FieldDef = {
  label: string;
  dbCol: string;
  value: string;
  mono?: boolean;
  colSpan?: number;
};

interface EditableSectionProps {
  title: string;
  assetId: string;
  fields: FieldDef[];
  cols?: number;
  onSaved?: () => void;
}

const inputCls =
  "w-full rounded-md border border-border bg-cream2 px-2.5 py-[7px] text-xs text-text outline-none transition-all placeholder:text-muted/50 focus:border-navy focus:bg-white";
const monoInputCls = inputCls + " font-mono text-[11px]";

export function EditableSection({ title, assetId, fields, cols = 4, onSaved }: EditableSectionProps) {
  const initial = useRef<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const init: Record<string, string> = {};
    for (const f of fields) {
      init[f.dbCol] = f.value === "—" ? "" : f.value;
    }
    initial.current = init;
    setValues(init);
  }, [fields]);

  const dirty = Object.keys(values).some(
    k => (values[k] ?? "") !== (initial.current[k] ?? ""),
  );

  const handleChange = useCallback((dbCol: string, v: string) => {
    setValues(prev => ({ ...prev, [dbCol]: v }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const patch: Record<string, string | null> = {};
      for (const [k, v] of Object.entries(values)) {
        if ((v ?? "") !== (initial.current[k] ?? "")) {
          patch[k] = v.trim() || "—";
        }
      }
      if (Object.keys(patch).length > 0) {
        await updateAssetFields(assetId, patch);
        initial.current = { ...values };
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        onSaved?.();
      }
    } catch (err) {
      alert("Error al guardar: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-gold after:h-px after:flex-1 after:bg-border">
        {title}
      </div>
      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {fields.map(f => (
          <div key={f.dbCol} className="flex flex-col gap-0.5" style={f.colSpan ? { gridColumn: `span ${f.colSpan}` } : undefined}>
            <label className="text-[9px] font-semibold uppercase tracking-wider text-muted">{f.label}</label>
            <input
              value={values[f.dbCol] ?? ""}
              onChange={e => handleChange(f.dbCol, e.target.value)}
              placeholder="—"
              className={f.mono ? monoInputCls : inputCls}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={handleSave}
          className="flex items-center gap-1.5 rounded-md bg-navy px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-navy3 disabled:opacity-40"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <CheckCircle2 size={13} /> : <Save size={13} />}
          {saving ? "Guardando..." : saved ? "Guardado" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
