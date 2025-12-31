import { Router } from "express";
import { redis } from "../redis";
import { exec } from "child_process";
import { prisma } from "../prisma";
import amqp from "amqplib";
import {
  QUEUE_ORDER_CREATED,
  QUEUE_ORDER_CONFIRMED,
  QUEUE_ORDER_DLQ,
  QUEUE_PAYMENT_DLQ,
} from "../queue";

const router = Router();

/**
 * POST /admin/load-test
 * Demo/Admin only
 */
router.post("/load-test", (req, res) => {
  const {
    vus = 20,
    iterations = 50,
    productId = "kapil",
    quantity = 1,
  } = req.body || {};

  // 🔒 HARD SAFETY LIMITS
  if (
    typeof vus !== "number" ||
    typeof iterations !== "number" ||
    typeof quantity !== "number"
  ) {
    return res.status(400).json({ error: "INVALID_TYPES" });
  }

  if (vus < 1 || vus > 200) {
    return res.status(400).json({ error: "VUS_OUT_OF_RANGE" });
  }

  if (iterations < 1 || iterations > 1000) {
    return res.status(400).json({ error: "ITERATIONS_OUT_OF_RANGE" });
  }

  if (quantity < 1 || quantity > 5) {
    return res.status(400).json({ error: "QUANTITY_OUT_OF_RANGE" });
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(productId)) {
    return res.status(400).json({ error: "INVALID_PRODUCT_ID" });
  }

  // ⚠️ FIXED SCRIPT — ONLY PARAMS CHANGE
  const cmd = `
    k6 run src/routes/load-test.js \
      --env VUS=${vus} \
      --env ITERATIONS=${iterations} \
      --env PRODUCT_ID=${productId} \
      --env QUANTITY=${quantity}
  `;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error("k6 execution error:", err);
      return;
    }
    if (stderr) {
      console.error(stderr);
    }
    console.log(stdout);
  });

  res.json({
    status: "LOAD_TEST_STARTED",
    params: { vus, iterations, productId, quantity },
  });
});

router.post("/worker/order/pause", async (_req, res) => {
  await redis.set("chaos:orderWorkerPaused", "true");
  res.json({ status: "order worker paused" });
});

router.post("/worker/order/resume", async (_req, res) => {
  await redis.set("chaos:orderWorkerPaused", "false");
  res.json({ status: "order worker resumed" });
});

router.post("/worker/payment/pause", async (_req, res) => {
  await redis.set("chaos:paymentWorkerPaused", "true");
  res.json({ status: "payment worker paused" });
});

router.post("/worker/payment/resume", async (_req, res) => {
  await redis.set("chaos:paymentWorkerPaused", "false");
  res.json({ status: "payment worker resumed" });
});

router.post("/api/read-only/on", async (_req, res) => {
  await redis.set("chaos:apiReadOnly", "true");
  res.json({ status: "api read-only enabled" });
});

router.post("/api/read-only/off", async (_req, res) => {
  await redis.set("chaos:apiReadOnly", "false");
  res.json({ status: "api read-only disabled" });
});

router.post("/payment/failure-rate", async (req, res) => {
  const { rate } = req.body;

  if (rate < 0 || rate > 1) {
    return res.status(400).json({ error: "rate must be 0–1" });
  }

  await redis.set("chaos:paymentFailureRate", String(rate));
  res.json({ paymentFailureRate: rate });
});

// ---- FORCE DLQ TOGGLES (DEMO ONLY) ----

router.post("/dlq/force/order/on", async (_req, res) => {
  await redis.set("chaos:forceOrderDLQ", "true");
  res.json({ status: "force order DLQ enabled" });
});

router.post("/dlq/force/order/off", async (_req, res) => {
  await redis.set("chaos:forceOrderDLQ", "false");
  res.json({ status: "force order DLQ disabled" });
});

router.post("/dlq/force/payment/on", async (_req, res) => {
  await redis.set("chaos:forcePaymentDLQ", "true");
  res.json({ status: "force payment DLQ enabled" });
});

router.post("/dlq/force/payment/off", async (_req, res) => {
  await redis.set("chaos:forcePaymentDLQ", "false");
  res.json({ status: "force payment DLQ disabled" });
});


router.get("/dlq", async (_req, res) => {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
  const ch = await conn.createChannel();

  const order = await ch.assertQueue(QUEUE_ORDER_DLQ, { durable: true });
  const payment = await ch.assertQueue(QUEUE_PAYMENT_DLQ, { durable: true });

  await ch.close();
  await conn.close();

  res.json({
    orderDLQ: order.messageCount,
    paymentDLQ: payment.messageCount,
  });
}); 

router.get("/orders/summary", async (_req, res) => {
  const result = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
  });

  const summary: any = {};
  for (const r of result) {
    summary[r.status] = r._count;
  }

  res.json(summary);
});

router.post("/inventory/reset", async (req, res) => {
  const { productId, available } = req.body;

  if (!productId || typeof available !== "number" || available < 0) {
    return res.status(400).json({ error: "INVALID_INPUT" });
  }

  await prisma.inventory.update({
    where: { productId },
    data: {
      availableStock: available,
      reservedStock: 0,
    },
  });

  // clear cache
  await redis.del(`inventory:${productId}`);

  res.json({
    status: "inventory reset",
    productId,
    available,
  });
});

router.post("/orders/clear", async (_req, res) => {
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});

  res.json({ status: "all orders cleared" });
});

router.post("/idempotency/clear", async (_req, res) => {
  await prisma.idempotencyKey.deleteMany({});
  res.json({ status: "idempotency keys cleared" });
});

router.post("/system/reset", async (req, res) => {
  const { productId, available } = req.body;

  if (!productId || typeof available !== "number" || available < 0) {
    return res.status(400).json({ error: "INVALID_INPUT" });
  }

  // 1️⃣ Reset inventory
  await prisma.inventory.update({
    where: { productId },
    data: {
      availableStock: available,
      reservedStock: 0,
    },
  });

  // 2️⃣ Clear orders (items first for FK safety)
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});

  // 3️⃣ Clear idempotency keys
  await prisma.idempotencyKey.deleteMany({});

  // 4️⃣ Clear cache
  await redis.del(`inventory:${productId}`);

  // 5️⃣ Purge all queues
  await purgeQueues();

  res.json({
    status: "SYSTEM_RESET_DONE",
    productId,
    available,
  });
});

async function purgeQueues() {
  const conn = await amqp.connect(
    process.env.RABBITMQ_URL || "amqp://localhost"
  );
  const ch = await conn.createChannel();

  const queues = [
    QUEUE_ORDER_CREATED,
    QUEUE_ORDER_CONFIRMED,
    QUEUE_ORDER_DLQ,
    QUEUE_PAYMENT_DLQ,
  ];

  for (const q of queues) {
    await ch.assertQueue(q, { durable: true });
    await ch.purgeQueue(q);
  }

  await ch.close();
  await conn.close();
}


export default router;
