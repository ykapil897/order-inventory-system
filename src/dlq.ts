import amqp from "amqplib";

export async function sendToDLQ(
  channel: amqp.Channel,
  dlqName: string,
  msg: amqp.ConsumeMessage
) {
  await channel.assertQueue(dlqName, { durable: true });

  channel.sendToQueue(
    dlqName,
    msg.content,
    {
      headers: msg.properties.headers,
      persistent: true,
    }
  );
}
