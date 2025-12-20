import express from "express";
import ordersRouter from "./routes/orders";
import inventoryRouter from "./routes/inventory";
import pinoHttp from 'pino-http';
import { logger } from './logger';
import { randomUUID } from 'crypto';
import { httpDuration, register } from './metrics';
import adminRouter from "./routes/admin";

const app = express();

app.use(express.json());

app.use(
  pinoHttp({
    logger,
    genReqId: () => randomUUID(),
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  })
);

app.use((req, res, next) => {
  const end = httpDuration.startTimer();

  res.on('finish', () => {
    end({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
    });
  });

  next();
});

app.use("/orders", ordersRouter);
app.use("/inventory", inventoryRouter);
app.use("/admin/chaos", adminRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

const PORT = 3232;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
