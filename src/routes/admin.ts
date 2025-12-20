import { Router } from "express";
import { chaosState } from "../chaos";

const router = Router();

router.post("/worker/order/pause", (_req, res) => {
  chaosState.orderWorkerPaused = true;
  res.json({ status: "order worker paused" });
});

router.post("/worker/order/resume", (_req, res) => {
  chaosState.orderWorkerPaused = false;
  res.json({ status: "order worker resumed" });
});

router.post("/worker/payment/pause", (_req, res) => {
  chaosState.paymentWorkerPaused = true;
  res.json({ status: "payment worker paused" });
});

router.post("/worker/payment/resume", (_req, res) => {
  chaosState.paymentWorkerPaused = false;
  res.json({ status: "payment worker resumed" });
});

router.post("/payment/failure-rate", (req, res) => {
  const { rate } = req.body;

  if (rate < 0 || rate > 1) {
    return res.status(400).json({ error: "rate must be 0–1" });
  }

  chaosState.paymentFailureRate = rate;
  res.json({ paymentFailureRate: rate });
});

router.post("/api/read-only/on", (_req, res) => {
  chaosState.apiReadOnly = true;
  res.json({ status: "api read-only enabled" });
});

router.post("/api/read-only/off", (_req, res) => {
  chaosState.apiReadOnly = false;
  res.json({ status: "api read-only disabled" });
});

export default router;
