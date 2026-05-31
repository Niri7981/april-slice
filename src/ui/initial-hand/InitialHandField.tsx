export type InitialHandFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  list?: string;
  min?: string;
  placeholder?: string;
  step?: string;
  type?: string;
};

export function InitialHandField({
  label,
  list,
  min,
  onChange,
  placeholder,
  step,
  type,
  value,
}: InitialHandFieldProps) {
  return (
    <label className="initial-hand-field">
      <span>{label}</span>
      <input
        min={min}
        list={list}
        placeholder={placeholder}
        step={step}
        type={type ?? "text"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
