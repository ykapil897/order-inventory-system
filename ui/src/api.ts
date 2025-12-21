const BASE_URL = "http://localhost:3232";

export async function getInventory(productId: string) {
  const res = await fetch(`${BASE_URL}/inventory/${productId}`);
  if (!res.ok) throw new Error("Inventory fetch failed");
  return res.json();
}

export async function createOrder(payload: {
  userId: string;
  items: { productId: string; quantity: number }[];
}) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Order creation failed");
  return res.json();
}

export async function getOrder(orderId: string) {
  const res = await fetch(`${BASE_URL}/orders/${orderId}`);
  if (!res.ok) throw new Error("Order fetch failed");
  return res.json();
}
