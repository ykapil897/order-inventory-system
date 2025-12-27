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

const ADMIN_BASE = "http://localhost:3232/admin";

export async function adminPost(path: string, body?: any) {
  const res = await fetch(`${ADMIN_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Admin POST failed");
  }

  return res.json();
}

export async function adminGet(path: string) {
  const res = await fetch(`${ADMIN_BASE}${path}`);
  if (!res.ok) {
    throw new Error("Admin GET failed");
  }
  return res.json();
}

