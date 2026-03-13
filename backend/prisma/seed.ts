import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.upsert({
    where: { id: "demo-restaurant" },
    update: {},
    create: {
      id: "demo-restaurant",
      name: "Demo Bistro",
      timezone: "America/New_York"
    }
  });

  const staff = await prisma.staff.createMany({
    data: [
      { name: "Avery Chen", role: "Server", restaurantId: restaurant.id },
      { name: "Liam Patel", role: "Cashier", restaurantId: restaurant.id },
      { name: "Sofia Martinez", role: "Server", restaurantId: restaurant.id }
    ],
    skipDuplicates: true
  });

  const menuItems = await prisma.menuItem.createMany({
    data: [
      { name: "Truffle Burger", category: "Entree", price: 18.5, cost: 7.2, restaurantId: restaurant.id },
      { name: "Spicy Tuna Roll", category: "Sushi", price: 14.0, cost: 5.1, restaurantId: restaurant.id },
      { name: "House Lemonade", category: "Beverage", price: 5.0, cost: 0.9, restaurantId: restaurant.id }
    ],
    skipDuplicates: true
  });

  console.log({ restaurant, staff, menuItems });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
