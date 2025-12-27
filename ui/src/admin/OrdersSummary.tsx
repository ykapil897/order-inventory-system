import { useEffect, useState } from "react";
import { adminGet } from "../api";

export default function OrdersSummary() {
  const [summary, setSummary] = useState<any>({});

  useEffect(() => {
    const id = setInterval(async () => {
      setSummary(await adminGet("/orders/summary"));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const completed =
    (summary.PAID || 0) + (summary.PAYMENT_FAILED || 0);

  return (
    <div className="card">
      <h3>Orders Summary</h3>
      <pre>{JSON.stringify(summary, null, 2)}</pre>
      <strong>Completed: {completed}</strong>
    </div>
  );
}
