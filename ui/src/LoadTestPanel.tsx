import { useState } from "react";

export function LoadTestPanel() {
  const [vus, setVus] = useState(20);
  const [iterations, setIterations] = useState(50);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<string | null>(null);

  async function runLoadTest() {
    setStatus("Running...");

    const res = await fetch("http://localhost:3232/admin/load-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vus,
        iterations,
        productId: "kapil",
        quantity,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(`Error: ${data.error}`);
    } else {
      setStatus("Load test started");
    }
  }

  return (
    <div>
      <h3>Load Testing (Admin)</h3>

      <label>
        VUs:
        <input
          type="number"
          value={vus}
          onChange={(e) => setVus(Number(e.target.value))}
        />
      </label>

      <br />

      <label>
        Iterations:
        <input
          type="number"
          value={iterations}
          onChange={(e) => setIterations(Number(e.target.value))}
        />
      </label>

      <br />

      <label>
        Quantity per order:
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </label>

      <br />

      <button onClick={runLoadTest}>
        Run Load Test
      </button>

      {status && <p>{status}</p>}
    </div>
  );
}
