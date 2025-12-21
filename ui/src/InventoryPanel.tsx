import { useEffect, useState } from "react";
import { getInventory } from "./api";

export function InventoryPanel({ productId }: { productId: string }) {
  const [inventory, setInventory] = useState<any>(null);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const data = await getInventory(productId);
        setInventory(data);
      } catch {}
    }, 2000);

    return () => clearInterval(id);
  }, [productId]);

  if (!inventory) return <div>Loading inventory...</div>;

  return (
    <div>
      <h3>Inventory</h3>
      <p>Product: {productId}</p>
      <p>Available: {inventory.availableStock}</p>
      <p>Reserved: {inventory.reservedStock}</p>
    </div>
  );
}
