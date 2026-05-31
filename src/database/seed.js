require("dotenv").config();

const prisma = require("../config/prisma");
const { hashPassword } = require("../utils/password");

const roles = [
  ["SUPER_ADMIN", "Full platform owner"],
  ["ADMIN", "Operations administrator"],
  ["CUSTOMER", "Customer"],
  ["CAPTAIN", "Trip captain"],
  ["AGENT_VENDOR", "Agent vendor"],
  ["HOTEL_VENDOR", "Hotel vendor"],
  ["TRAVEL_VENDOR", "Travel package vendor"],
  ["VEHICLE_VENDOR", "Vehicle rental vendor"]
];

const main = async () => {
  for (const [name, description] of roles) {
    await prisma.role.upsert({
      where: { name },
      create: { name, description },
      update: { description }
    });
  }

  const superAdminRole = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } });

  await prisma.user.upsert({
    where: { phoneNumber: process.env.SUPER_ADMIN_PHONE || "9999999999" },
    create: {
      phoneNumber: process.env.SUPER_ADMIN_PHONE || "9999999999",
      email: process.env.SUPER_ADMIN_EMAIL || "admin@rangstone.com",
      password: await hashPassword(process.env.SUPER_ADMIN_PASSWORD || "ChangeMe123!"),
      firstName: process.env.SUPER_ADMIN_FIRST_NAME || "Super",
      lastName: process.env.SUPER_ADMIN_LAST_NAME || "Admin",
      roleId: superAdminRole.id,
      isNewUser: false,
      profileRequired: false
    },
    update: {
      email: process.env.SUPER_ADMIN_EMAIL || "admin@rangstone.com",
      password: await hashPassword(process.env.SUPER_ADMIN_PASSWORD || "ChangeMe123!"),
      roleId: superAdminRole.id,
      isNewUser: false,
      profileRequired: false
    }
  });

  console.log("Seed completed: roles and super admin are ready.");
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
