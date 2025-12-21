import { InventoryPanel } from "./InventoryPanel";
import { OrderPanel } from "./OrderPanel";

export default function App() {
  const PRODUCT_ID = "kapil";

  return (
    <div style={{ padding: 20 }}>
      <h2>Order & Inventory System</h2>
      <InventoryPanel productId={PRODUCT_ID} />
      <hr />
      <OrderPanel productId={PRODUCT_ID} />
    </div>
  );
}
