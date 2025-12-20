import { Router } from "express";
import { z } from "zod";
import { reserveInventoryAndCreateOrder } from "../reserveOrder";
import { publishOrderCreated } from "../publisher";
import { redis } from "../redis";
import { prisma } from "../prisma";
import { chaosState } from "../chaos";

const router = Router();

const orderSchema = z.object({
  userId: z.string(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

router.post("/", async (req, res) => {
  
  if (chaosState.apiReadOnly) {
    return res
      .status(503)
      .json({ error: "SERVICE_UNAVAILABLE (CHAOS MODE)" });
  }

  try {
    
    const idempotencyKey = req.header("Idempotency-Key"); 
    
    if (!idempotencyKey) {
      return res.status(400).json({ error: "IDEMPOTENCY_KEY_REQUIRED" });
    }
    
    // Check if already processed
    const existing = await prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });
    
    if (existing) {
      return res.status(200).json({
        orderId: existing.orderId,
        status: "PENDING",
      });
    }
    
    // 1️⃣ Validate request
    const parsed = orderSchema.parse(req.body);
    
    req.log.info(
      { userId: parsed.userId },
      'order_request_received'
    );

    // 2️⃣ Call transaction logic (Phase 2)
    const result = await reserveInventoryAndCreateOrder(
      parsed.userId,
      parsed.items
    );

    req.log.info(
      { orderId: result.orderId },
      'order_created_pending'
    );

    await prisma.idempotencyKey.create({
      data: {
        key: idempotencyKey,
        orderId: result.orderId,
      },
    });

    // ✅ Cache invalidation AFTER commit
    for (const item of parsed.items) {
      await redis.del(`inventory:${item.productId}`);
    }

    // Phase 4 async event (AFTER commit)
    await publishOrderCreated(result.orderId);

    return res.status(201).json(result);
  } catch (err: any) {
    if (err.message === "OUT_OF_STOCK" || err.message === "INVENTORY_NOT_FOUND") {
      
      req.log.warn(
        { items: req.body.items },
        'order_out_of_stock'
      );
      
      return res.status(409).json({ error: "OUT_OF_STOCK" });
    }

    if (err.name === "ZodError") {
      return res.status(400).json({ error: "INVALID_REQUEST" });
    }

    console.error(err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
