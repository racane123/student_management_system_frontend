/**
 * src/features/results/utils/gradingConstants.js
 * Grading scale: A–F based on percentage.
 * Grade and Status (Passed/Failed) computed from marks, totalMarks, passingMarks.
 */

/**
 * Standard letter grade scale by percentage (inclusive lower bound).
 * Order matters: checked from highest to lowest.
 */
export const GRADE_SCALE = [
  { grade: 'A', minPercent: 90, maxPercent: 100, color: 'purple' },
  { grade: 'B', minPercent: 80, maxPercent: 89, color: 'blue' },
  { grade: 'C', minPercent: 70, maxPercent: 79, color: 'teal' },
  { grade: 'D', minPercent: 60, maxPercent: 69, color: 'amber' },
  { grade: 'F', minPercent: 0, maxPercent: 59, color: 'red' },
];

/**
 * Calculate percentage from marks and total.
 * @param {number} marksObtained
 * @param {number} totalMarks
 * @returns {number} 0–100 or NaN if invalid
 */
export function calculatePercentage(marksObtained, totalMarks) {
  if (totalMarks == null || totalMarks <= 0) return NaN;
  const marks = Number(marksObtained);
  if (Number.isNaN(marks) || marks < 0) return NaN;
  return Math.min(100, Math.max(0, (marks / totalMarks) * 100));
}

/**
 * Calculate grade letter (A–F) from percentage.
 * @param {number} percentage
 * @returns {{ grade: string, color: string }}
 */
export function calculateGradeFromPercentage(percentage) {
  if (percentage == null || Number.isNaN(percentage)) {
    return { grade: '—', color: 'gray' };
  }
  const pct = Number(percentage);
  for (const item of GRADE_SCALE) {
    if (pct >= item.minPercent && pct <= item.maxPercent) {
      return { grade: item.grade, color: item.color };
    }
  }
  return { grade: 'F', color: 'red' };
}

/**
 * Calculate grade and status from marks, totalMarks, passingMarks.
 * @param {number} marksObtained
 * @param {number} totalMarks
 * @param {number} passingMarks
 * @returns {{ percentage: number, grade: string, status: 'Passed'|'Failed', color: string }}
 */
export function calculateGrade(marksObtained, totalMarks, passingMarks) {
  const percentage = calculatePercentage(marksObtained, totalMarks);
  const { grade, color } = calculateGradeFromPercentage(percentage);
  const status =
    Number.isNaN(percentage) || passingMarks == null
      ? '—'
      : (marksObtained ?? 0) >= passingMarks
        ? 'Passed'
        : 'Failed';
  return { percentage, grade, status, color };
}
