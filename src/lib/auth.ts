import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { Polar } from "@polar-sh/sdk";
import { env } from "@/env";
import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import { db } from "@/server/db";

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
});

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "177d2af3-1e86-4419-817b-64cfcb474463",
              slug: "small",
            },
            {
              productId: "d2b019f4-96bf-4fd5-9f9a-fb44cdcfa959",
              slug: "medium",
            },
            {
              productId: "0d311723-32cb-4979-9dcb-b0b64c8bd3e9",
              slug: "large",
            },
          ],
          successUrl: "/dashboard",
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          secret: env.POLAR_WEBHOOK_SECRET,
          onOrderPaid: async (order) => {
            const externalCustomerId = order.data.customer.externalId;

            if (!externalCustomerId) {
              console.error("No external customer ID found.");
              throw new Error("No external customer id found.");
            }

            const productId = order.data.productId;

            let creditsToAdd = 0;

            switch (productId) {
              case "177d2af3-1e86-4419-817b-64cfcb474463":
                creditsToAdd = 50;
                break;
              case "d2b019f4-96bf-4fd5-9f9a-fb44cdcfa959":
                creditsToAdd = 200;
                break;
              case "0d311723-32cb-4979-9dcb-b0b64c8bd3e9":
                creditsToAdd = 400;
                break;
            }

            await db.user.update({
              where: { id: externalCustomerId },
              data: {
                credits: {
                  increment: creditsToAdd,
                },
              },
            });
          },
        }),
      ],
    }),
  ],
});
