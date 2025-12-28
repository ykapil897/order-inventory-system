import { useState } from "react";
import { adminPost } from "../api";

export default function SystemResetPanel() {
  const [available, setAvailable] = useState(50);
  const [loading, setLoading] = useState(false);
  const PRODUCT_ID = "kapil";

  async function resetSystem() {
    setLoading(true);
    await adminPost("/system/reset", {
      productId: PRODUCT_ID,
      available,
    });
    setLoading(false);
  }

  return (
    <div className="card danger">
      <h3>System Reset</h3>

      <p style={{ fontSize: 12, color: "#991b1b" }}>
        Clears all orders, idempotency keys, and resets inventory.
      </p>

      <label>
        Available stock after reset:
        <input
          type="number"
          min={0}
          value={available}
          onChange={(e) => setAvailable(Number(e.target.value))}
          style={{ width: "100%", marginTop: 6 }}
        />
      </label>

      <button
        onClick={resetSystem}
        disabled={loading}
        style={{
          marginTop: 12,
          background: "#dc2626",
          color: "white",
          width: "100%",
        }}
      >
        {loading ? "Resetting..." : "Reset System"}
      </button>
    </div>
  );
}
