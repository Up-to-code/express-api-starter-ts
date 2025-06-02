import { extractKeywords } from '../utils/helpers';
import { logWithTimestamp } from '../utils/logger';
import { calculateContextualSimilarity } from './calculateSimilarity';
import { prisma } from '../lib/prisma';
import findExactMatch from './findExactMatch';
import { findMatchByFullMessage } from './findMatchByFullMessage';
import { findMatchByKeywords } from './findMatchByKeywords';

interface QAPairWithSimilarity {
  id: string;
  question: string;
  answer: string;
  category: string;
  language: string;
  tags: string[];
  priority: number;
  similarity: number;
}

async function findRelevantQAPairs(message: string, limit = 5): Promise<QAPairWithSimilarity[]> {
  try {
    logWithTimestamp(`Finding relevant QA pairs for: "${message}"`, 'info');

    // First try exact match
    const exactMatches = await findExactMatch(message);
    if (exactMatches.length > 0) {
      // Add 100% similarity for exact matches
      return exactMatches.map(qa => ({
        ...qa,
        similarity: 100
      }));
    }

    // Get all active QA pairs for similarity calculation
    const allQAPairs = await prisma.qAPair.findMany({
      where: { isActive: true },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    if (allQAPairs.length === 0) {
      logWithTimestamp('No active QA pairs found in database', 'error');
      return [];
    }

    // Calculate similarity for each QA pair
    const qaPairsWithSimilarity: QAPairWithSimilarity[] = allQAPairs.map(qa => {
      const similarity = calculateContextualSimilarity(
        message,
        qa.question,
        qa.answer,
        qa.tags
      );

      return {
        id: qa.id,
        question: qa.question,
        answer: qa.answer,
        category: qa.category,
        language: qa.language,
        tags: qa.tags,
        priority: qa.priority,
        similarity: similarity
      };
    });

    // Sort by similarity score (highest first), then by priority
    const sortedQAPairs = qaPairsWithSimilarity
      .filter(qa => qa.similarity > 20) // Only include pairs with >20% similarity
      .sort((a, b) => {
        // First sort by similarity
        if (b.similarity !== a.similarity) {
          return b.similarity - a.similarity;
        }
        // Then by priority if similarity is equal
        return b.priority - a.priority;
      })
      .slice(0, limit);

    logWithTimestamp(
      `Found ${sortedQAPairs.length} relevant QA pairs. Best match: ${sortedQAPairs[0]?.similarity.toFixed(1)}%`,
      'info'
    );

    return sortedQAPairs;

  } catch (error: any) {
    logWithTimestamp(`Error finding QA pairs: ${error.message}`, 'error');

    // Fallback to original method
    try {
      const keywords = extractKeywords(message, 2);
      if (keywords.length === 0) {
        const fallbackResults = await findMatchByFullMessage(message, limit);
        return fallbackResults.map(qa => ({ ...qa, similarity: 50 })); // Assign default similarity
      }
      const fallbackResults = await findMatchByKeywords(keywords, limit);
      return fallbackResults.map(qa => ({ ...qa, similarity: 50 })); // Assign default similarity
    } catch (fallbackError: any) {
      logWithTimestamp(`Fallback method also failed: ${fallbackError.message}`, 'error');
      return [];
    }
  }
}

export default findRelevantQAPairs;
export type { QAPairWithSimilarity };