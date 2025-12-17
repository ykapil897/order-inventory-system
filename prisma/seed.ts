import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.create({
    data: {
      name: "Test Product2",
      inventory: {
        create: {
          availableStock: 10,
          reservedStock: 0,
        },
      },
    },
  });

  console.log(product);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
