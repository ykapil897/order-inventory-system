import { InventoryPanel } from "./InventoryPanel";
import { OrderPanel } from "./OrderPanel";
import OrdersSummary from "./admin/OrdersSummary";
import AdminControls from "./admin/AdminControls";
import DLQControls from "./admin/DLQControls";
import PaymentFailureRate from "./admin/PaymentFailureRate";
import DLQPanel from "./admin/DLQPanel";
import { MetricsPanel } from "./MetricsPanel";
import { LoadTestPanel } from "./LoadTestPanel";
import SystemResetPanel from "./admin/SystemResetPanel";

export default function Dashboard() {
  const PRODUCT_ID = "kapil";

  return (
    <div className="layout">
      {/* LEFT — OBSERVE */}
      <div className="left">
        <OrdersSummary />
        <InventoryPanel productId={PRODUCT_ID} />
        <OrderPanel productId={PRODUCT_ID} />
        <DLQPanel />
        <MetricsPanel />
      </div>

      {/* RIGHT — CONTROL */}
      <div className="right">
        <AdminControls />
        <DLQControls />
        <PaymentFailureRate />
        <LoadTestPanel />
        <SystemResetPanel />
      </div>
    </div>
  );
}
