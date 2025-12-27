import { InventoryPanel } from "./InventoryPanel";
import { OrderPanel } from "./OrderPanel";
import { MetricsPanel } from "./MetricsPanel";
import { LoadTestPanel } from "./LoadTestPanel";

export default function App() {
  const PRODUCT_ID = "kapil";

  return (
    <div style={{ padding: 20 }}>
      <h2>Order & Inventory System</h2>

      <InventoryPanel productId={PRODUCT_ID} />
      <OrderPanel productId={PRODUCT_ID} />

      <hr />

      <MetricsPanel />
      <LoadTestPanel />
    </div>
  );
}
