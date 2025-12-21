import { Router } from "express";
import { redis } from "../redis";

const router = Router();

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
