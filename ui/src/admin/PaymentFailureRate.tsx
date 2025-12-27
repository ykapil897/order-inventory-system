import { useState } from "react";
import { adminPost } from "../api";

export default function PaymentFailureRate() {
  const [rate, setRate] = useState(0.2);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await adminPost("/payment/failure-rate", { rate });
    setSaving(false);
  }

  return (
    <div className="card">
      <h3>Payment Failure Rate</h3>

      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={rate}
        onChange={(e) => setRate(Number(e.target.value))}
      />
      <div>{Math.round(rate * 100)}%</div>

      <button onClick={save} disabled={saving}>
        Apply
      </button>
    </div>
  );
}
