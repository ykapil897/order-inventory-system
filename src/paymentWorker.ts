import amqp from "amqplib";
import { prisma } from "./prisma";
import { QUEUE_ORDER_CONFIRMED } from "./queue";

import { getRetryCount, incrementRetryHeaders } from "./retry";
import { sendToDLQ } from "./dlq";
import { QUEUE_PAYMENT_DLQ } from "./queue";

import { chaosState } from "./chaos";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

// 80% success
const PAYMENT_SUCCESS_RATE = 0.8;

// 5 Max Retries
const MAX_RETRIES = 5;

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
  await channel.assertQueue(QUEUE_PAYMENT_DLQ, { durable: true });
  channel.prefetch(1);

  console.log("Payment worker started");

  channel.consume(QUEUE_ORDER_CONFIRMED, async (msg) => {
    if (!msg) return;

    const message = msg;

    if (chaosState.paymentWorkerPaused) {
        console.warn("Payment worker paused (chaos mode)");
        channel.nack(message, false, true);
        return;
    }

    const { orderId } = JSON.parse(message.content.toString());

    try {
      // Simulate payment delay
    //   throw new Error("FORCED_PAYMENT_FAILURE"); // For testing retry and DLQ

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

        // This can cause you to redeploy the whole program to change the success rate
        // const paymentSuccess = Math.random() < PAYMENT_SUCCESS_RATE; 

        // This allows changing the failure rate at runtime via chaos state
        const paymentSuccess = Math.random() >= chaosState.paymentFailureRate;

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

      channel.ack(message);
      console.log(`Payment processed for order ${orderId}`);
    } catch (err) {
    //   console.error("Payment worker error:", err);
    //   channel.nack(message, false, true); // retry

        const retryCount = getRetryCount(message);

        if (retryCount >= MAX_RETRIES) {
            // console.error("Order moved to DLQ", { orderId, err });
            console.error("Order moved to DLQ", {
                orderId,
                retries: retryCount,
                err,
            });

            await sendToDLQ(channel, QUEUE_PAYMENT_DLQ, message);
            channel.ack(message);
            return;
        }

        const delayMs = retryCount * 3000;

        setTimeout(() => {
            channel.sendToQueue(
            QUEUE_ORDER_CONFIRMED,
            message.content,
            incrementRetryHeaders(message)
            );
            channel.ack(message);
        }, delayMs);
    }
  });
}

startPaymentWorker();
