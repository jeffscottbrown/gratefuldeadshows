/**
 * Band filter toggle: Grateful Dead | Dead & Company | Both
 */

export type BandSelection = 'gd' | 'dac' | 'both';

interface Props {
  value: BandSelection;
  onChange: (v: BandSelection) => void;
}

const OPTIONS: { value: BandSelection; label: string }[] = [
  { value: 'both', label: 'Both' },
  { value: 'gd',   label: 'Grateful Dead' },
  { value: 'dac',  label: 'Dead & Company' },
];

export default function BandFilter({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-lg border border-dead-border overflow-hidden text-sm">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 transition-colors ${
            value === opt.value
              ? 'bg-dead-gold text-black font-semibold'
              : 'bg-dead-card text-gray-400 hover:text-white hover:bg-dead-card-hover'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
