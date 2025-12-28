import { useState } from "react";
import { adminPost } from "../api";
import { ToggleButton } from "../components/ToggleButton";

export default function DLQControls() {
  const [forceOrderDLQ, setForceOrderDLQ] = useState(false);
  const [forcePaymentDLQ, setForcePaymentDLQ] = useState(false);


  async function toggleOrderDLQ() {
    if (forceOrderDLQ) {
      await adminPost("/dlq/force/order/off");
    } else {
      await adminPost("/dlq/force/order/on");
    }
    setForceOrderDLQ(!forceOrderDLQ);
  }

  async function togglePaymentDLQ() {
    if (forcePaymentDLQ) {
      await adminPost("/dlq/force/payment/off");
    } else {
      await adminPost("/dlq/force/payment/on");
    }
    setForcePaymentDLQ(!forcePaymentDLQ);
  }


  return (
    <div className="card">
      <h3>Force DLQ (Demo)</h3>

      <ToggleButton
        label="Force Order DLQ"
        isOn={forceOrderDLQ}
        onToggle={toggleOrderDLQ}
        kind="danger"
      />

      <ToggleButton
        label="Force Payment DLQ"
        isOn={forcePaymentDLQ}
        onToggle={togglePaymentDLQ}
        kind="danger"
      />

    </div>
  );
}
