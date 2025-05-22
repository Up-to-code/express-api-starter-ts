import { prisma } from '../lib/prisma';
 
// Database - QA Pair Operations
async function findExactMatch(message: string) {
  return prisma.qAPair.findMany({
    where: {
      question: {
        equals: message,
        mode: 'insensitive',
      },
    },
    take: 1,
  });
}
export default findExactMatch;
