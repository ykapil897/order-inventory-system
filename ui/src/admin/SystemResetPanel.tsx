import { useState } from "react";
import { adminPost } from "../api";

export default function SystemResetPanel() {
  const [available, setAvailable] = useState(50);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const PRODUCT_ID = "kapil";

  const canReset = confirmText === "RESET" && !loading;

  async function resetSystem() {
    if (!canReset) return;

    setLoading(true);
    try {
      await adminPost("/system/reset", {
        productId: PRODUCT_ID,
        available,
      });
      setConfirmText("");
    } finally {
      setLoading(false);
    }
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

      <label style={{ marginTop: 10, display: "block" }}>
        Type <strong>RESET</strong> to confirm:
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="RESET"
          style={{ width: "100%", marginTop: 6 }}
        />
      </label>

      <button
        onClick={resetSystem}
        disabled={!canReset}
        style={{
          marginTop: 12,
          background: canReset ? "#dc2626" : "#fca5a5",
          color: "white",
          width: "100%",
          cursor: canReset ? "pointer" : "not-allowed",
        }}
      >
        {loading ? "Resetting..." : "Reset System"}
      </button>
    </div>
  );
}
