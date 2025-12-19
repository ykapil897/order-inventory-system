import client from 'prom-client';

export const register = new client.Registry();

client.collectDefaultMetrics({ register });

export const httpDuration = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request latency',
  labelNames: ['method', 'route', 'status'],
  buckets: [50, 100, 200, 500, 1000],
});

register.registerMetric(httpDuration);
