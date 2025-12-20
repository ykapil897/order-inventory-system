import { Router } from "express";
import { getInventory } from "../inventoryService";

const router = Router();

router.get("/:productId", async (req, res) => {
  const { productId } = req.params;

  const inventory = await getInventory(productId);
  if (!inventory) {
    return res.status(404).json({ error: "NOT_FOUND" });
  }

  res.json(inventory);
});

export default router;
