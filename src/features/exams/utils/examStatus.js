/**
 * Status automation: suggest status based on examDate.
 * - Past date -> Completed
 * - Today -> Ongoing
 * - Future -> Scheduled
 */

export const EXAM_STATUSES = ['Scheduled', 'Ongoing', 'Completed'];

/**
 * @param {string} examDate - YYYY-MM-DD
 * @returns {'Scheduled'|'Ongoing'|'Completed'}
 */
export function suggestExamStatus(examDate) {
  if (!examDate) return 'Scheduled';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(examDate);
  exam.setHours(0, 0, 0, 0);
  if (exam < today) return 'Completed';
  if (exam.getTime() === today.getTime()) return 'Ongoing';
  return 'Scheduled';
}
