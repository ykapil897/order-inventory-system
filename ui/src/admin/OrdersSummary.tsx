import { useEffect, useState } from "react";
import { adminGet, adminPost } from "../api";

export default function OrdersSummary() {
  const [summary, setSummary] = useState<any>({});
  const [inventoryValue, setInventoryValue] = useState(50);
  const PRODUCT_ID = "kapil";

  useEffect(() => {
    const id = setInterval(async () => {
      setSummary(await adminGet("/orders/summary"));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  async function resetInventory() {
    await adminPost("/inventory/reset", {
      productId: PRODUCT_ID,
      available: inventoryValue,
    });
  }

  async function clearOrders() {
    await adminPost("/orders/clear");
  }

  async function clearIdempotency() {
    await adminPost("/idempotency/clear");
  }

  const completed =
    (summary.PAID || 0) + (summary.PAYMENT_FAILED || 0);

  return (
    <div className="card">
      <h3>Orders Summary</h3>

      <pre>{JSON.stringify(summary, null, 2)}</pre>
      <strong>Completed: {completed}</strong>

      <hr />

      <h4>Admin Reset Controls</h4>

      <div>
        <input
          type="number"
          value={inventoryValue}
          min={0}
          onChange={(e) => setInventoryValue(Number(e.target.value))}
        />
        <button onClick={resetInventory}>
          Reset Inventory
        </button>
      </div>

      <button onClick={clearOrders}>
        Clear All Orders
      </button>

      <button onClick={clearIdempotency}>
        Clear Idempotency Keys
      </button>
    </div>
  );
}
