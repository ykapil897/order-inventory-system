import { redis } from "./redis";

export async function isOrderWorkerPaused(): Promise<boolean> {
  return (await redis.get("chaos:orderWorkerPaused")) === "true";
}

export async function isPaymentWorkerPaused(): Promise<boolean> {
  return (await redis.get("chaos:paymentWorkerPaused")) === "true";
}

export async function isApiReadOnly(): Promise<boolean> {
  return (await redis.get("chaos:apiReadOnly")) === "true";
}

export async function getPaymentFailureRate(): Promise<number> {
  const val = await redis.get("chaos:paymentFailureRate");
  return val ? Number(val) : 0.2; // default 20%
}
