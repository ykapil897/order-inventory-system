import { useEffect, useState } from "react";

export function MetricsPanel() {
  const [metrics, setMetrics] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchMetrics() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("http://localhost:3232/metrics");

      if (!res.ok) {
        throw new Error(`Failed to fetch metrics: ${res.status}`);
      }

      const text = await res.text();
      setMetrics(text);
    } catch (err: any) {
      setError(err.message || "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  }

  // Poll every 5 seconds (SAFE interval)
  useEffect(() => {
    fetchMetrics();
    const id = setInterval(fetchMetrics, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ marginTop: 20 }}>
      <h3>System Metrics</h3>

      {loading && <p>Loading metrics...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <pre
        style={{
          maxHeight: "300px",
          overflow: "auto",
          background: "#111",
          color: "#0f0",
          padding: "10px",
          fontSize: "12px",
          borderRadius: "4px",
        }}
      >
        {metrics || "No metrics yet"}
      </pre>
    </div>
  );
}
