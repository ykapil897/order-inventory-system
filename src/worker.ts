import amqp from "amqplib";
import { prisma } from "./prisma";
import { QUEUE_ORDER_CREATED } from "./queue";
import { logger } from './logger';
import { publishOrderConfirmed } from "./publisher";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

async function startWorker() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE_ORDER_CREATED, { durable: true });
  channel.prefetch(1);

  console.log("Worker started. Waiting for messages...");

  channel.consume(QUEUE_ORDER_CREATED, async (msg) => {
    if (!msg) return;

    const { orderId } = JSON.parse(msg.content.toString());

    try {
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

      channel.ack(msg);
      logger.info({ orderId }, 'order_confirmed');
    } catch (err) {
      
      logger.error(
        { orderId, err },
        'worker_failed_retrying'
      );

      channel.nack(msg, false, true); // retry
    }
  });
}

startWorker();
