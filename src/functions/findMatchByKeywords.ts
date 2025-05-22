import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

async function findMatchByKeywords(keywords: string[], limit: number) {
    return await prisma.qAPair.findMany({
      where: {
        OR: [
          // Try with all keywords together
          {
            AND: keywords.map((keyword) => ({
              question: {
                contains: keyword,
                mode: Prisma.QueryMode.insensitive,
              },
            })),
          },
          // Try with individual keywords
          ...keywords.map((keyword) => ({
            question: {
              contains: keyword,
              mode: Prisma.QueryMode.insensitive,
            },
          })),
        ],
      },
      take: limit,
    });
  }


  export { findMatchByKeywords }