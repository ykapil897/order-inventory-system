import AdminControls from "./AdminControls";
import PaymentFailureRate from "./PaymentFailureRate";
import DLQPanel from "./DLQPanel";
import OrdersSummary from "./OrdersSummary";
import { MetricsPanel } from "../MetricsPanel";
import { LoadTestPanel } from "../LoadTestPanel";
import DLQControls from "./DLQControls";

export default function AdminDashboard() {
  return (
    <div className="grid">
      <LoadTestPanel />
      <OrdersSummary />
      <AdminControls />
      <PaymentFailureRate />
      <DLQControls />
      <DLQPanel />
      <MetricsPanel />
    </div>
  );
}
