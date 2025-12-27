import { useState } from "react";
import { adminPost } from "../api";

export default function DLQControls() {
  const [loading, setLoading] = useState(false);

  async function toggle(path: string) {
    setLoading(true);
    await adminPost(path);
    setLoading(false);
  }

  return (
    <div className="card">
      <h3>Force DLQ (Demo)</h3>

      <button disabled={loading} onClick={() => toggle("/dlq/force/order/on")}>
        Force Order DLQ ON
      </button>
      <button disabled={loading} onClick={() => toggle("/dlq/force/order/off")}>
        Force Order DLQ OFF
      </button>

      <button disabled={loading} onClick={() => toggle("/dlq/force/payment/on")}>
        Force Payment DLQ ON
      </button>
      <button disabled={loading} onClick={() => toggle("/dlq/force/payment/off")}>
        Force Payment DLQ OFF
      </button>
    </div>
  );
}
