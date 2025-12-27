import { Router } from "express";
import { redis } from "../redis";
import { exec } from "child_process";

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
    k6 run load-test.js \
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

export default router;
