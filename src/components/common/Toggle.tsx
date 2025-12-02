import type { ReactNode } from 'react';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * Generic toggle switch component
 */
function Toggle({ label, checked, onChange }: ToggleProps): ReactNode {
  return (
    <label className="toggle">
      <span className="toggle__label">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="toggle__input"
      />
      <span className="toggle__slider" />
    </label>
  );
}

export default Toggle;
