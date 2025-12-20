import { reserveInventoryAndCreateOrder } from "./reserveOrder";

async function test() {
  try {
    const result = await reserveInventoryAndCreateOrder("user-1", [
      {
        productId: "d2b2d7d8-6af8-48c1-b58b-3778460e67d0",
        quantity: 2,
      },
    ]);

    console.log("SUCCESS:", result);
  } catch (err: any) {
    console.error("ERROR:", err.message);
  }
}

test();
