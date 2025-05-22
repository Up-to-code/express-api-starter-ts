import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

async function findMatchByFullMessage(message: string, limit: number) {
  return await prisma.qAPair.findMany({
    where: {
      question: {
        contains: message,
        mode: Prisma.QueryMode.insensitive,
      },
    },
    take: limit,
  });
}
export { findMatchByFullMessage }