import { prisma } from "./prisma";
import { redis } from "./redis";

const INVENTORY_TTL = 15; // seconds

export async function getInventory(productId: string) {
  const cacheKey = `inventory:${productId}`;

  // 1️⃣ Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2️⃣ Read DB (source of truth)
  const inventory = await prisma.inventory.findUnique({
    where: { productId },
    select: {
      availableStock: true,
      reservedStock: true,
    },
  });

  if (!inventory) {
    return null;
  }

  // 3️⃣ Populate cache
  await redis.set(
    cacheKey,
    JSON.stringify(inventory),
    "EX",
    INVENTORY_TTL
  );

  return inventory;
}
