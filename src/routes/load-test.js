import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: Number(__ENV.VUS || 20),
  iterations: Number(__ENV.ITERATIONS || 50),
};

const PRODUCT_ID = __ENV.PRODUCT_ID || "kapil";
const QUANTITY = Number(__ENV.QUANTITY || 1);
const BASE_URL = "http://localhost:3232";

export default function () {
  const payload = JSON.stringify({
    userId: `user-${__VU}`,
    items: [
      {
        productId: PRODUCT_ID,
        quantity: QUANTITY,
      },
    ],
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": `k6-${__VU}-${__ITER}`,
    },
  };

  const res = http.post(`${BASE_URL}/orders`, payload, params);

  check(res, {
    "status is 201 or 409": (r) =>
      r.status === 201 || r.status === 409,
  });

  sleep(0.05);
}
