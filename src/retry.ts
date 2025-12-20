import amqp from "amqplib";

export function getRetryCount(msg: amqp.ConsumeMessage): number {
  return Number(msg.properties.headers?.["x-retry-count"] || 0);
}

export function incrementRetryHeaders(msg: amqp.ConsumeMessage) {
  return {
    headers: {
      ...msg.properties.headers,
      "x-retry-count": getRetryCount(msg) + 1,
    },
    persistent: true,
  };
}
