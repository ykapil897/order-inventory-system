import AdminControls from "./AdminControls";
import PaymentFailureRate from "./PaymentFailureRate";
import DLQPanel from "./DLQPanel";
import OrdersSummary from "./OrdersSummary";
import { MetricsPanel } from "../MetricsPanel";
import { LoadTestPanel } from "../LoadTestPanel";

export default function AdminDashboard() {
  return (
    <div className="grid">
      <LoadTestPanel />
      <OrdersSummary />
      <AdminControls />
      <PaymentFailureRate />
      <DLQPanel />
      <MetricsPanel />
    </div>
  );
}
