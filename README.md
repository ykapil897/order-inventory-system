<!-- <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Order–Inventory System</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.6;
      margin: 40px;
      color: #222;
    }
    h1, h2, h3 {
      color: #1a1a1a;
    }
    code, pre {
      background: #f6f8fa;
      padding: 8px;
      border-radius: 4px;
      display: block;
      overflow-x: auto;
    }
    ul {
      margin-left: 20px;
    }
    .box {
      border: 1px solid #ddd;
      padding: 16px;
      margin: 16px 0;
      border-radius: 6px;
      background: #fafafa;
    }
    .ok {
      color: green;
      font-weight: bold;
    }
  </style>
</head> -->
<body>

<h1>📦 Distributed Order & Inventory System</h1>

<p>
A <strong>production-grade backend system</strong> that demonstrates:
</p>

<ul>
  <li>Strong consistency for inventory</li>
  <li>Idempotent order creation</li>
  <li>Asynchronous processing with workers</li>
  <li>Failure handling (retries, DLQ, chaos testing)</li>
  <li>Observability (logs, metrics)</li>
  <li>Load testing with k6</li>
  <li>UI for visualization and demos</li>
</ul>

<hr />

<h2>🧠 System Design (High Level)</h2>

<pre>
Client / UI
    |
    |  POST /orders
    v
API (Express)
    |
    |  Prisma Transaction
    |  - SELECT ... FOR UPDATE
    |  - Reserve Inventory
    |  - Create Order (PENDING)
    |
    v
PostgreSQL  <---- Redis (cache, chaos flags)
    |
    v
RabbitMQ (order_created)
    |
    v
Order Worker
    |
    |  PENDING -> CONFIRMED
    v
RabbitMQ (order_confirmed)
    |
    v
Payment Worker
    |
    |  CONFIRMED -> PAID / PAYMENT_FAILED
    |  (release inventory on failure)
    v
PostgreSQL
</pre>

<p>
<strong>Key rule:</strong>  
Database protects correctness.  
Workers provide reliability.  
Redis improves performance and control.  
UI provides visibility.
</p>

<hr />

<h2>🧱 Architecture Properties</h2>

<ul>
  <li class="ok">✔ No overselling (row-level locking)</li>
  <li class="ok">✔ Idempotent API</li>
  <li class="ok">✔ Async, retry-safe workers</li>
  <li class="ok">✔ DLQ for poison messages</li>
  <li class="ok">✔ Chaos engineering support</li>
  <li class="ok">✔ Load testing & metrics</li>
</ul>

<hr />

<h2>📁 Repository Structure (Simplified)</h2>

<pre>
order-inventory-system/
├── docker-compose.yml
├── Dockerfile
├── prisma/
│   └── schema.prisma
├── src/              (Backend)
│   ├── server.ts
│   ├── worker.ts
│   ├── paymentWorker.ts
│   ├── expiryWorker.ts
│   ├── routes/
│   │   ├── orders.ts
│   │   ├── inventory.ts
│   │   └── admin.ts
│   └── ...
└── ui/               (Frontend)
    ├── src/
    │   ├── InventoryPanel.tsx
    │   ├── OrderPanel.tsx
    │   ├── LoadTestPanel.tsx
    │   └── MetricsPanel.tsx
</pre>

<hr />

<h2>🚀 How to Run (Docker)</h2>

<h3>1️⃣ Start Backend + Infra</h3>

<pre>
docker compose up --build
</pre>

Services started:
<ul>
  <li>PostgreSQL</li>
  <li>Redis</li>
  <li>RabbitMQ</li>
  <li>API</li>
  <li>Order Worker</li>
  <li>Payment Worker</li>
  <li>Expiry Worker</li>
</ul>

<h3>2️⃣ Start UI</h3>

<pre>
cd ui
npm install
npm run dev
</pre>

Open:
<pre>http://localhost:5173</pre>

<hr />

<h2>📡 Core API Endpoints</h2>

<h3>Orders</h3>

<pre>
POST /orders
Headers:
  Idempotency-Key: any-unique-key

Body:
{
  "userId": "user-1",
  "items": [
    { "productId": "kapil", "quantity": 1 }
  ]
}
</pre>

<h3>Inventory</h3>

<pre>
GET /inventory/:productId
</pre>

<h3>Order Status</h3>

<pre>
GET /orders/:orderId
</pre>

<hr />

<h2>🧪 Admin / Demo Endpoints</h2>

<h3>Load Test</h3>

<pre>
POST /admin/load-test
{
  "vus": 20,
  "iterations": 50,
  "productId": "kapil",
  "quantity": 1
}
</pre>

<h3>Worker Control (Chaos)</h3>

<pre>
POST /admin/worker/order/pause
POST /admin/worker/order/resume

POST /admin/worker/payment/pause
POST /admin/worker/payment/resume
</pre>

<h3>Payment Failure Rate</h3>

<pre>
POST /admin/payment/failure-rate
{
  "rate": 0.7
}
</pre>

<h3>API Read-Only Mode</h3>

<pre>
POST /admin/api/read-only/on
POST /admin/api/read-only/off
</pre>

<hr />

<h2>📊 Metrics & Observability</h2>

<h3>Metrics</h3>

<pre>
GET /metrics
</pre>

<p>
Exposes Prometheus-compatible metrics:
</p>

<ul>
  <li>HTTP latency histograms</li>
  <li>Request counts by route/status</li>
  <li>Node.js CPU / memory / event loop</li>
</ul>

<p>
<strong>Important:</strong> Metrics show <em>system health</em>, not business outcomes.
</p>

<h3>Logs</h3>

<pre>
docker compose logs -f api
docker compose logs -f worker
docker compose logs -f payment-worker
</pre>

<hr />

<h2>✅ What Success Looks Like</h2>

After load testing, verify:

<ul>
  <li>Orders move through: PENDING → CONFIRMED → PAID / PAYMENT_FAILED</li>
  <li>No orders stuck indefinitely</li>
  <li>Inventory invariant holds:
    <pre>availableStock + reservedStock = initialStock</pre>
  </li>
  <li>No API crashes (no HTTP 500s)</li>
  <li>DLQ size is visible and explainable</li>
</ul>

<hr />

<h2>🎯 What This Project Demonstrates</h2>

<ul>
  <li>Correct handling of concurrency</li>
  <li>Async reliability patterns</li>
  <li>Graceful degradation under failure</li>
  <li>Operational visibility</li>
  <li>Production-ready thinking</li>
</ul>

<hr />

<h2>📈 Load Capacity & Throughput Estimation</h2>

<p>
This system was tested using <strong>k6</strong> under controlled limits to
measure <strong>safe, sustainable load</strong> rather than raw peak numbers.
</p>

<h3>🔬 Test Configuration</h3>

<pre>
Virtual Users (VUs): 20
Iterations: 50
Total Order Requests: 1000
Quantity per Order: 1
</pre>

<p>
Each iteration performs:
</p>

<ul>
  <li><code>POST /orders</code> (transactional, row-locked)</li>
  <li>Async order confirmation via worker</li>
  <li>Async payment processing (success/failure)</li>
</ul>

<hr />

<h3>⏱ Observed API Throughput</h3>

<p>
From Prometheus metrics:
</p>

<pre>
http_request_duration_ms (POST /orders)
Average latency ≈ 60–80 ms
</pre>

<p>
This gives a conservative per-instance throughput:
</p>

<pre>
1 / 0.08 sec ≈ 12.5 requests/sec
</pre>

<p>
Rounded down for safety:
</p>

<pre>
≈ 10 orders/sec per API instance
</pre>

<hr />

<h3>📦 Inventory Safety Constraint</h3>

<p>
Inventory updates use:
</p>

<ul>
  <li><code>SELECT ... FOR UPDATE</code></li>
  <li>Single-row locking per product</li>
</ul>

<p>
This means:
</p>

<ul>
  <li>Throughput scales by <strong>number of distinct products</strong></li>
  <li>Single product = serialized reservations</li>
</ul>

<p>
Example:
</p>

<pre>
10 products × 10 orders/sec ≈ 100 orders/sec
</pre>

<hr />

<h3>🧵 Worker Throughput</h3>

<ul>
  <li>Order worker: ~50–100 confirmations/sec (light DB work)</li>
  <li>Payment worker: ~5–10/sec (intentional delay simulation)</li>
</ul>

<p>
Workers are horizontally scalable:
</p>

<pre>
Throughput ≈ workers × per-worker capacity
</pre>

<hr />

<h3>🚀 Scaled Capacity (Realistic Projection)</h3>

<table border="1" cellpadding="8" cellspacing="0">
  <tr>
    <th>Component</th>
    <th>Estimate</th>
  </tr>
  <tr>
    <td>API instances</td>
    <td>5</td>
  </tr>
  <tr>
    <td>Products</td>
    <td>10</td>
  </tr>
  <tr>
    <td>Orders / sec</td>
    <td>~500</td>
  </tr>
</table>

<p>
<strong>Key assumption:</strong> Inventory contention distributed across products.
</p>

<hr />

<h3>🛑 What Limits Throughput</h3>

<ul>
  <li>PostgreSQL row locks (by design, for correctness)</li>
  <li>Payment delay (simulated external dependency)</li>
  <li>Single-node RabbitMQ (demo setup)</li>
</ul>

<p>
These are <strong>correct trade-offs</strong>, not weaknesses.
</p>

<hr />

<h3>✅ What This Proves</h3>

<ul>
  <li>System handles concurrent writes safely</li>
  <li>No overselling under load</li>
  <li>Failures do not corrupt state</li>
  <li>Capacity is predictable and explainable</li>
</ul>

<p class="ok">
This is how real systems are evaluated — not by raw TPS, but by correctness under load.
</p>


<p class="ok">
This is not a toy CRUD app — it is a real distributed system.
</p>

<hr />

<h2>📌 Notes</h2>

<ul>
  <li>Authentication intentionally omitted (focus on system design)</li>
  <li>Outbox pattern discussed but not implemented (documented trade-off)</li>
  <li>Chaos endpoints are demo-only</li>
</ul>

<hr />

<p><strong>Author:</strong> Kapil</p>

</body>
</html>
