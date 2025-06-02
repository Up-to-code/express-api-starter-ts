/**
 * Calculate similarity between two strings using multiple algorithms
 * Returns a score between 0 and 100 (percentage)
 */

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;

  // Create matrix
  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[len2][len1];
}

/**
 * Calculate similarity percentage using Levenshtein distance
 */
function levenshteinSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 100;
  
  const distance = levenshteinDistance(str1, str2);
  return ((maxLength - distance) / maxLength) * 100;
}

/**
 * Calculate Jaccard similarity for word sets
 */
function jaccardSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  if (union.size === 0) return 100;
  return (intersection.size / union.size) * 100;
}

/**
 * Calculate cosine similarity using word frequency vectors
 */
function cosineSimilarity(str1: string, str2: string): number {
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  
  // Create word frequency maps
  const freq1: { [key: string]: number } = {};
  const freq2: { [key: string]: number } = {};
  
  words1.forEach(word => freq1[word] = (freq1[word] || 0) + 1);
  words2.forEach(word => freq2[word] = (freq2[word] || 0) + 1);
  
  // Get all unique words
  const allWords = new Set([...words1, ...words2]);
  
  // Calculate dot product and magnitudes
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  for (const word of allWords) {
    const f1 = freq1[word] || 0;
    const f2 = freq2[word] || 0;
    
    dotProduct += f1 * f2;
    magnitude1 += f1 * f1;
    magnitude2 += f2 * f2;
  }
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  return (dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2))) * 100;
}

/**
 * Calculate keyword overlap similarity
 */
function keywordSimilarity(str1: string, str2: string): number {
  // Extract keywords (words longer than 2 characters)
  const keywords1 = str1.toLowerCase().match(/\b\w{3,}\b/g) || [];
  const keywords2 = str2.toLowerCase().match(/\b\w{3,}\b/g) || [];
  
  if (keywords1.length === 0 && keywords2.length === 0) return 100;
  if (keywords1.length === 0 || keywords2.length === 0) return 0;
  
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return (intersection.size / union.size) * 100;
}

/**
 * Calculate overall similarity score using weighted combination of algorithms
 */
export function calculateSimilarity(userMessage: string, qaQuestion: string): number {
  // Normalize strings
  const msg1 = userMessage.trim().toLowerCase();
  const msg2 = qaQuestion.trim().toLowerCase();
  
  if (msg1 === msg2) return 100;
  if (msg1.length === 0 || msg2.length === 0) return 0;
  
  // Calculate different similarity scores
  const levenshtein = levenshteinSimilarity(msg1, msg2);
  const jaccard = jaccardSimilarity(msg1, msg2);
  const cosine = cosineSimilarity(msg1, msg2);
  const keyword = keywordSimilarity(msg1, msg2);
  
  // Weighted combination (adjust weights based on your needs)
  const weights = {
    levenshtein: 0.2,  // Character-level similarity
    jaccard: 0.3,      // Word-level similarity
    cosine: 0.3,       // Frequency-based similarity
    keyword: 0.2       // Keyword overlap
  };
  
  const weightedScore = 
    (levenshtein * weights.levenshtein) +
    (jaccard * weights.jaccard) +
    (cosine * weights.cosine) +
    (keyword * weights.keyword);
  
  return Math.round(weightedScore * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate similarity with additional context scoring
 */
export function calculateContextualSimilarity(
  userMessage: string, 
  qaQuestion: string, 
  qaAnswer: string, 
  qaTags: string[]
): number {
  // Base similarity score
  let score = calculateSimilarity(userMessage, qaQuestion);
  
  // Boost score if user message contains QA tags
  const userWords = userMessage.toLowerCase().split(/\s+/);
  const tagMatches = qaTags.filter(tag => 
    userWords.some(word => word.includes(tag.toLowerCase()) || tag.toLowerCase().includes(word))
  );
  
  if (tagMatches.length > 0) {
    const tagBoost = Math.min(tagMatches.length * 5, 15); // Max 15% boost
    score += tagBoost;
  }
  
  // Boost score if user message has words in common with answer
  const answerSimilarity = calculateSimilarity(userMessage, qaAnswer);
  if (answerSimilarity > 30) {
    score += Math.min(answerSimilarity * 0.1, 10); // Max 10% boost from answer similarity
  }
  
  return Math.min(score, 100); // Cap at 100%
}

export default calculateSimilarity;
