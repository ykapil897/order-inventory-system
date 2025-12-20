import { prisma } from "./prisma";
import { randomUUID } from "crypto";

type OrderItemInput = {
  productId: string;
  quantity: number;
};

export async function reserveInventoryAndCreateOrder(
  userId: string,
  items: OrderItemInput[]
) {
  return prisma.$transaction(async (tx) => {
    const orderId = randomUUID();

    for (const item of items) {
      // 1️⃣ Lock inventory row
      const inventory = await tx.$queryRaw<
        { available_stock: number }[]
      >`
        SELECT "availableStock" AS available_stock
        FROM "Inventory"
        WHERE "productId" = ${item.productId}
        FOR UPDATE
      `;

      if (inventory.length === 0) {
        throw new Error("INVENTORY_NOT_FOUND");
      }

      if (inventory[0].available_stock < item.quantity) {
        throw new Error("OUT_OF_STOCK");
      }

      // 2️⃣ Update inventory
      await tx.inventory.update({
        where: { productId: item.productId },
        data: {
          availableStock: { decrement: item.quantity },
          reservedStock: { increment: item.quantity },
        },
      });
    }

    // 3️⃣ Create order
    await tx.order.create({
      data: {
        id: orderId,
        userId,
        status: "PENDING",
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        },
      },
    });

    return { orderId, status: "PENDING" };
  });
}
