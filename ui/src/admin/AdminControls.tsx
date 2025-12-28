import { useState } from "react";
import { adminPost } from "../api";
import { ToggleButton } from "../components/ToggleButton";

export default function AdminControls() {
  const [apiReadOnly, setApiReadOnly] = useState(false);
  const [orderWorkerPaused, setOrderWorkerPaused] = useState(false);
  const [paymentWorkerPaused, setPaymentWorkerPaused] = useState(false);

  async function toggleApiReadOnly() {
    if (apiReadOnly) {
      await adminPost("/api/read-only/off");
    } else {
      await adminPost("/api/read-only/on");
    }
    setApiReadOnly(!apiReadOnly);
  }

  async function toggleOrderWorker() {
    if (orderWorkerPaused) {
      await adminPost("/worker/order/resume");
    } else {
      await adminPost("/worker/order/pause");
    }
    setOrderWorkerPaused(!orderWorkerPaused);
  }

  async function togglePaymentWorker() {
    if (paymentWorkerPaused) {
      await adminPost("/worker/payment/resume");
    } else {
      await adminPost("/worker/payment/pause");
    }
    setPaymentWorkerPaused(!paymentWorkerPaused);
  }

  return (
    <div className="card">
      <h3>System Controls</h3>

      <ToggleButton
        label="Order Worker Paused"
        isOn={orderWorkerPaused}
        onToggle={toggleOrderWorker}
        kind="warn"
      />

      <ToggleButton
        label="Payment Worker Paused"
        isOn={paymentWorkerPaused}
        onToggle={togglePaymentWorker}
        kind="warn"
      />

      <ToggleButton
        label="API Read-Only Mode"
        isOn={apiReadOnly}
        onToggle={toggleApiReadOnly}
        kind="warn"
      />
    </div>
  );
}
