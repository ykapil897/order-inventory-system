import amqp from "amqplib";
import { QUEUE_ORDER_CREATED } from "./queue";
import { QUEUE_ORDER_CONFIRMED } from "./queue";

let channel: amqp.Channel | null = null;
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

async function getChannel() {
  if (!channel) {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_ORDER_CREATED, { durable: true });
  }
  return channel;
}

export async function publishOrderCreated(orderId: string) {
  const ch = await getChannel();
  ch.sendToQueue(
    QUEUE_ORDER_CREATED,
    Buffer.from(JSON.stringify({ orderId })),
    { persistent: true }
  );
}

export async function publishOrderConfirmed(orderId: string) {
  const ch = await getChannel();
  ch.sendToQueue(
    QUEUE_ORDER_CONFIRMED,
    Buffer.from(JSON.stringify({ orderId })),
    { persistent: true }
  );
}