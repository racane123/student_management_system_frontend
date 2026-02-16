/**
 * src/features/subjects/utils/generateSubjectCode.js
 * Generates subject code from name: first 3-4 letters uppercase + sequence (e.g. SUB-MATH-01, SUB-ENG-01).
 */

/**
 * Takes the first 3-4 letters of the subject name, converts to uppercase, and appends a sequence number.
 * Uses 4 letters when the word has 4+ chars (e.g. "Math" -> MATH), otherwise 3 (e.g. "Art" -> ART).
 * @param {string} name - Subject name (e.g. "Mathematics", "English")
 * @param {number} [sequence=1] - Optional sequence number (zero-padded to 2 digits)
 * @returns {string} - e.g. "SUB-MATH-01", "SUB-ENG-01"
 */
export function generateSubjectCode(name, sequence = 1) {
  const trimmed = (name ?? '').toString().trim();
  if (!trimmed) return '';

  const alphaOnly = trimmed.replace(/\s+/g, '').replace(/[^a-zA-Z]/g, '');
  const len = Math.min(alphaOnly.length >= 4 ? 4 : 3, alphaOnly.length);
  const prefix = alphaOnly.slice(0, len).toUpperCase();
  if (!prefix) return '';

  const seq = Math.max(1, Math.floor(Number(sequence)) || 1);
  const padded = String(seq).padStart(2, '0');
  return `SUB-${prefix}-${padded}`;
}

export default generateSubjectCode;
