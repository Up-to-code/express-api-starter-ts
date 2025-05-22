import { extractKeywords } from '../utils/helpers';
import { logWithTimestamp } from '../utils/logger';
import findExactMatch from './findExactMatch';

import { findMatchByFullMessage } from './findMatchByFullMessage';
import { findMatchByKeywords } from './findMatchByKeywords';

async function findRelevantQAPairs(message: string, limit = 5) {
  try {
    // First try exact match
    const exactMatches = await findExactMatch(message);
    if (exactMatches.length > 0) {
      return exactMatches;
    }
  
    // Extract keywords
    const keywords = extractKeywords(message, 2);
  
    if (keywords.length === 0) {
      // If no keywords, try contains match on whole message
      return await findMatchByFullMessage(message, limit);
    }
  
    // Find QA pairs using keywords
    return await findMatchByKeywords(keywords, limit);
  } catch (error: any) {
    logWithTimestamp(`Error finding QA pairs: ${error.message}`, 'error');
    return [];
  }
}

export default findRelevantQAPairs;