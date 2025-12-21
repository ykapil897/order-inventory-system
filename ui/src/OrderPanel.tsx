import { useEffect, useState } from "react";
import { createOrder, getOrder } from "./api";

const TERMINAL_STATES = ["PAID", "PAYMENT_FAILED", "EXPIRED"];

export function OrderPanel({ productId }: { productId: string }) {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function placeOrder() {
    const res = await createOrder({
      userId: "user-1",
      items: [{ productId, quantity: 1 }],
    });
    setOrderId(res.orderId);
    setStatus(res.status);
  }

  useEffect(() => {
    if (!orderId) return;

    const id = setInterval(async () => {
      const order = await getOrder(orderId);
      setStatus(order.status);

      if (TERMINAL_STATES.includes(order.status)) {
        clearInterval(id);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [orderId]);

  return (
    <div>
      <h3>Order</h3>
      <button onClick={placeOrder}>Place Order</button>

      {orderId && (
        <>
          <p>Order ID: {orderId}</p>
          <p>Status: {status}</p>
        </>
      )}
    </div>
  );
}
