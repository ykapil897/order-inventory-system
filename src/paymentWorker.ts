import amqp from "amqplib";
import { prisma } from "./prisma";
import { QUEUE_ORDER_CONFIRMED } from "./queue";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

// 80% success
const PAYMENT_SUCCESS_RATE = 0.8;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

 // Retry logic for RabbitMQ connection
async function connectWithRetry(url: string, retries = 10) {
  for (let i = 0; i < retries; i++) {
    try {
      return await amqp.connect(url);
    } catch (err) {
      console.error(
        `RabbitMQ connection failed (attempt ${i + 1}/${retries}). Retrying...`
      );
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw new Error("Could not connect to RabbitMQ after retries");
}



async function startPaymentWorker() {
//   const connection = await amqp.connect(RABBITMQ_URL); // This will not work if the rabbitmq server is not started or nto accepting any TCP connections

  const connection = await connectWithRetry(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE_ORDER_CONFIRMED, { durable: true });
  channel.prefetch(1);

  console.log("Payment worker started");

  channel.consume(QUEUE_ORDER_CONFIRMED, async (msg) => {
    if (!msg) return;

    const { orderId } = JSON.parse(msg.content.toString());

    try {
      // Simulate payment delay
      await sleep(1000 + Math.random() * 2000);

      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        // Idempotency guard
        if (!order || order.status !== "CONFIRMED") {
          return;
        }

        const paymentSuccess = Math.random() < PAYMENT_SUCCESS_RATE;

        if (paymentSuccess) {
          await tx.order.update({
            where: { id: orderId },
            data: { status: "PAID" },
          });
        } else {
          // Release inventory
          for (const item of order.items) {
            await tx.inventory.update({
              where: { productId: item.productId },
              data: {
                reservedStock: { decrement: item.quantity },
                availableStock: { increment: item.quantity },
              },
            });
          }

          await tx.order.update({
            where: { id: orderId },
            data: { status: "PAYMENT_FAILED" },
          });
        }
      });

      channel.ack(msg);
      console.log(`Payment processed for order ${orderId}`);
    } catch (err) {
      console.error("Payment worker error:", err);
      channel.nack(msg, false, true); // retry
    }
  });
}

startPaymentWorker();
