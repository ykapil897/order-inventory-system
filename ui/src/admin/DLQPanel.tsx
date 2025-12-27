import { useEffect, useState } from "react";
import { adminGet } from "../api";

export default function DLQPanel() {
  const [dlq, setDlq] = useState({ orderDLQ: 0, paymentDLQ: 0 });

  useEffect(() => {
    const id = setInterval(async () => {
      setDlq(await adminGet("/dlq"));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="card">
      <h3>Dead Letter Queues</h3>
      <p>Order DLQ: {dlq.orderDLQ}</p>
      <p>Payment DLQ: {dlq.paymentDLQ}</p>
    </div>
  );
}
