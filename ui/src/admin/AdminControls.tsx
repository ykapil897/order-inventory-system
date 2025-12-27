import { useState } from "react";
import { adminPost } from "../api";

export default function AdminControls() {
  const [loading, setLoading] = useState(false);

  async function action(path: string) {
    setLoading(true);
    await adminPost(path);
    setLoading(false);
  }

  return (
    <div className="card">
      <h3>System Controls</h3>

      <button disabled={loading} onClick={() => action("/worker/order/pause")}>
        Pause Order Worker
      </button>
      <button disabled={loading} onClick={() => action("/worker/order/resume")}>
        Resume Order Worker
      </button>

      <button disabled={loading} onClick={() => action("/worker/payment/pause")}>
        Pause Payment Worker
      </button>
      <button disabled={loading} onClick={() => action("/worker/payment/resume")}>
        Resume Payment Worker
      </button>

      <button disabled={loading} onClick={() => action("/api/read-only/on")}>
        API Read-Only ON
      </button>
      <button disabled={loading} onClick={() => action("/api/read-only/off")}>
        API Read-Only OFF
      </button>
    </div>
  );
}
