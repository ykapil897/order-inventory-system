import { InventoryPanel } from "./InventoryPanel";
import { OrderPanel } from "./OrderPanel";
import AdminDashboard from "./admin/AdminDashboard";

export default function Dashboard() {
  const PRODUCT_ID = "kapil";

  return (
    <div style={{ padding: 20 }}>
      <h2>Order & Inventory System</h2>

      {/* USER FLOW */}
      <div className="grid">
        <InventoryPanel productId={PRODUCT_ID} />
        <OrderPanel productId={PRODUCT_ID} />
      </div>

      <hr style={{ margin: "24px 0" }} />

      {/* ADMIN / OBSERVABILITY */}
      <AdminDashboard />
    </div>
  );
}
