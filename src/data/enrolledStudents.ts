/**
 * Stand-in for a real enrollment lookup (e.g. a Laravel endpoint hitting the
 * school's student information system). Any ID in this list "verifies"
 * successfully at registration; anything else is rejected.
 */
export const ENROLLED_STUDENT_IDS = [
  "S-2024-0001",
  "S-2024-0002",
  "S-2024-0147",
  "S-2025-0098",
  "S-2025-0212",
];

export function isEnrolledStudentId(id: string): boolean {
  return ENROLLED_STUDENT_IDS.includes(id.trim().toUpperCase());
}
