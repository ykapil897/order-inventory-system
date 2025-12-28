type ToggleButtonProps = {
  label: string;
  isOn: boolean;
  onToggle: () => Promise<void>;
  kind?: "danger" | "warn" | "info";
};

export function ToggleButton({
  label,
  isOn,
  onToggle,
  kind = "info",
}: ToggleButtonProps) {
  return (
    <button
      className={`toggle ${isOn ? "on" : "off"} ${kind}`}
      onClick={onToggle}
      title={`Click to turn ${isOn ? "OFF" : "ON"}`}
    >
      <span className="label">{label}</span>
      <span className="state">{isOn ? "ON" : "OFF"}</span>
    </button>
  );
}
