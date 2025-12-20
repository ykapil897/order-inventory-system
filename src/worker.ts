import amqp from "amqplib";
import { prisma } from "./prisma";
import { QUEUE_ORDER_CREATED } from "./queue";
import { logger } from './logger';
import { publishOrderConfirmed } from "./publisher";

import { getRetryCount, incrementRetryHeaders } from "./retry";
import { sendToDLQ } from "./dlq";
import { QUEUE_ORDER_DLQ } from "./queue";

const MAX_RETRIES = 5;
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";


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

async function startWorker() {
  // const connection = await amqp.connect(RABBITMQ_URL); // This will not work if the rabbitmq server is not started or nto accepting any TCP connections
  
  const connection = await connectWithRetry(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE_ORDER_CREATED, { durable: true });
  await channel.assertQueue(QUEUE_ORDER_DLQ, { durable: true });
  channel.prefetch(1);

  console.log("Worker started. Waiting for messages...");

  channel.consume(QUEUE_ORDER_CREATED, async (msg) => {
    if (!msg) return;

    const message = msg;
    const { orderId } = JSON.parse(message.content.toString());

    try {
      throw new Error("FORCED_ORDER_WORKER_FAILURE"); // For testing retry and DLQ

      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
        });

        if (!order || order.status !== "PENDING") {
          return;
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status: "CONFIRMED" },
        });
      });

      await publishOrderConfirmed(orderId);

      channel.ack(message);
      logger.info({ orderId }, 'order_confirmed');
    } catch (err) {
      
      // logger.error(
      //   { orderId, err },
      //   'worker_failed_retrying'
      // );

      // channel.nack(message, false, true); // retry

      const retryCount = getRetryCount(message);

      if (retryCount >= MAX_RETRIES) {
        // console.error("Order moved to DLQ", { orderId, err });
        console.error("Order moved to DLQ", {
          orderId,
          retries: retryCount,
          err,
        });

        await sendToDLQ(channel, QUEUE_ORDER_DLQ, message);
        channel.ack(message);
        return;
      }

      const delayMs = retryCount * 3000;

      setTimeout(() => {
        channel.sendToQueue(
          QUEUE_ORDER_CREATED,
          message.content,
          incrementRetryHeaders(message)
        );
        channel.ack(message);
      }, delayMs);
    }
  });
}

startWorker();
