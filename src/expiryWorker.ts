import { prisma } from "./prisma";

const EXPIRY_MINUTES = 5;
const CHECK_INTERVAL_MS = 60_000;

async function expireOrders() {
  const expiryTime = new Date(
    Date.now() - EXPIRY_MINUTES * 60 * 1000
  );

  // 1️⃣ Find expired orders
  const expiredOrders = await prisma.order.findMany({
    where: {
      status: {
        in: ["PENDING", "CONFIRMED"],
      },
      createdAt: {
        lt: expiryTime,
      },
    },
    include: {
      items: true,
    },
  });

  for (const order of expiredOrders) {
    await prisma.$transaction(async (tx) => {
      // 2️⃣ Re-check status inside transaction (idempotency)
      const freshOrder = await tx.order.findUnique({
        where: { id: order.id },
      });

      if (
        !freshOrder ||
        !["PENDING", "CONFIRMED"].includes(freshOrder.status)
      ) {
        return;
      }

      // 3️⃣ Release inventory
      for (const item of order.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            reservedStock: { decrement: item.quantity },
            availableStock: { increment: item.quantity },
          },
        });
      }

      // 4️⃣ Mark order expired
      await tx.order.update({
        where: { id: order.id },
        data: { status: "EXPIRED" },
      });
    });

    console.log(`Order ${order.id} expired and inventory released`);
  }
}

async function startExpiryWorker() {
  console.log("Expiry worker started");

  // Run immediately, then every minute
  await expireOrders();
  setInterval(expireOrders, CHECK_INTERVAL_MS);
}

startExpiryWorker();
